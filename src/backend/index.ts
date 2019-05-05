import '@babel/polyfill';
import 'source-map-support/register';
import _ from 'lodash';
import numeral from 'numeral';
import temp from 'temp';

temp.track();

import { ONE_HAND_WEAPONS } from '../data/WeaponCategories';
import { itemsdb, settingsdb } from './db';
import { startPublicStashBuilder } from './publicstashtab';
import { PathOfBuildingLimiter, getBuild, PathOfBuildingItemBatcher, InitPathOfBuildingSettingsListeners, BuildCalculatedItemFromSolrItem } from './pathofbuilding';
import { startSolr, killSolr, getSolrItemPage } from './solr/solr';
import { webserver } from './webserver/webserver';
import { downloadJava, downloadSolr } from './solr/download';
import { IDisplayedItem } from 'src/data/IDisplayedItem';
import { ISolrItem } from 'src/data/ISolrItem';
import { ICalculatedItemLine } from 'src/data/ICalculatedItemLine';

(async () => {
  const shutdown = async () => {
    console.log('Shutting down');
    temp.cleanup();
    await killSolr();
    console.log('Shutdown complete, exitting');
    process.exit();
  }
  process.on('SIGINT', shutdown);
  process.on('SIGHUP', shutdown);
  process.on('SIGTERM', shutdown);

  InitPathOfBuildingSettingsListeners();
  webserver.start();

  const db = await itemsdb;

  PathOfBuildingLimiter.updateSettings({
    maxConcurrent: await (await settingsdb).get('performance.pathofbuilding.processcount').value(),
  });

  await downloadJava();
  await downloadSolr();
  await startSolr();

  const build = await getBuild('test');

  startPublicStashBuilder();
  let passedIds: string[] = [];
  while (true) {
    const solrItems: ISolrItem[] = await getSolrItemPage(passedIds);
    const builtItems: ICalculatedItemLine[][] = await Promise.all(
      solrItems.map(
        async (solrItem) => await BuildCalculatedItemFromSolrItem(solrItem, build)
      )
    );
    await Promise.all(builtItems.map(async (_item, index) => {
      const newItem: IDisplayedItem = {
        id: solrItems[index].id,
        baseItem: solrItems[index],
        calculatedItem: builtItems[index],
        price: '',
      };
      console.log('returning batcher');
      return await PathOfBuildingItemBatcher.add(newItem).then(() => {
        passedIds.push(newItem.id);
        console.log('pushed id to passed id', newItem.id);
      });
    }));
  }
})();