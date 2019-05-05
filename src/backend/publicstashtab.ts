import fetch from 'node-fetch';
import Bottleneck from 'bottleneck';

import { itemsdb as dbAsync } from "./db";
import { IPublicStashResponse } from "src/data/IPublicStashResponse";
import { IPublicStash } from 'src/data/IPublicStash';
import { FrameType } from 'src/data/FrameType';
import { publicItemToSolrItem } from './solr/publicItemToSolrItem';
import { submitItemsToSolr } from './solr/solr';
import { ISolrItem } from 'src/data/ISolrItem';

export class PublicStashData implements IPublicStashResponse {
  public error?: { code: number; message: string; } = undefined;
  public next_change_id: string = '';
  public stashes: IPublicStash[] = [];
}

const PublicStashTabLimiter = new Bottleneck({
  minTime: 2000,
  maxConcurrent: 1,
});

export const getNextPublicStashData = async (): Promise<PublicStashData> => {
  const db = await dbAsync;
  let poeDataEndpoint = 'https://www.pathofexile.com/api/public-stash-tabs';
  if (db.get('nextChangeId').value()) {
    poeDataEndpoint += `?id=${db.get('nextChangeId').value()}`;
  }

  const poeData: IPublicStashResponse = await PublicStashTabLimiter.schedule(async () => {
    console.log('fetching');
    return await (await fetch(poeDataEndpoint)).json();
  })

  if (poeData.error) {
    console.error('Error fetching public stash tabs. Code:', poeData.error.code, 'Message:', poeData.error.message, 'Trying again in 15 seconds');
    return await new Promise((resolve, reject) => {
      setTimeout(async () => {
        resolve(await getNextPublicStashData());
      }, 15000)
    })
  }

  poeData.stashes = poeData.stashes.filter(
    (stash) => stash.public
  );

  return Object.assign(new PublicStashData, poeData);
}

const solrBatcher = new Bottleneck.Batcher({
  maxTime: 40000,
  maxSize: 150,
})
solrBatcher.on('batch', submitItemsToSolr);

const tickPublicStashBuilder = async () => {
  const stashData = await getNextPublicStashData();
  let items = stashData.stashes.map((stash) => stash.items).reduce((prevItems, currentItems, currentIndex, arr) => {
    return [...prevItems, ...currentItems];
  }, []);
  items = items.filter((item) => item.frameType === FrameType.rare);
  items = items.filter((item) => item.identified);
  items.forEach((item) => {
    const solrItem = publicItemToSolrItem(item);
    solrBatcher.add(solrItem);
  });
  await (await dbAsync).set('nextChangeId', stashData.next_change_id).write();
  tickPublicStashBuilder();
}

export const startPublicStashBuilder = async () => {
  tickPublicStashBuilder();
}