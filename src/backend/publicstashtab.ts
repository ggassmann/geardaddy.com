import fetch from 'node-fetch';

import { db as dbAsync } from "./db";
import { IPublicStashResponse } from "src/data/IPublicStashResponse";
import { IPublicStash } from 'src/data/IPublicStash';
import { IPublicItem } from 'src/data/IPublicItem';

export class PublicStashData implements IPublicStashResponse {
  public next_change_id: string = '';
  public stashes: IPublicStash[] = [];

  public getItems = () => {
    return this.stashes.reduce((prev: IPublicItem[], current: IPublicStash, _index, _array): IPublicItem[] => {
      return [...prev, ...current.items];
    }, []);
  }
}

export const getNextPublicStashData = async () => {
  const db = await dbAsync;
  let poeDataEndpoint = 'http://www.pathofexile.com/api/public-stash-tabs';
  if (db.get('nextChangeId').value()) {
    poeDataEndpoint += `?id=${db.get('nextChangeId').value()}`;
  }
  const poeData: IPublicStashResponse = await (await fetch(poeDataEndpoint)).json();

  if(poeData.error) {
    console.error('Error fetching public stash tabs. Code:', poeData.error.code, 'Message:', poeData.error.message, 'Trying again in 5 seconds');
    return await new Promise((resolve, reject) => {
      setTimeout(async () => {
        resolve(await getNextPublicStashData());
      }, 5000)
    })
  }
  
  poeData.stashes = poeData.stashes.filter(
    (stash) => stash.public
  );
  
  return Object.assign(new PublicStashData, poeData);
}