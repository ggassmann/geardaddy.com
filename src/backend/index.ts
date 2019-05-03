import '@babel/polyfill';
import 'source-map-support/register';
import _ from 'lodash';
import numeral from 'numeral';
import temp from 'temp';

temp.track();

import { ONE_HAND_WEAPONS } from '../data/WeaponCategories';
import { legacyItemsDB, settingsdb } from './db';
import { getNextPublicStashData, startPublicStashBuilder } from './publicstashtab';
import { buildItem, PathOfBuildingLimiter, getBuild, PathOfBuildingItemBatcher, InitPathOfBuildingSettingsListeners } from './pathofbuilding';
import { downloadSolr, startSolr, killSolr, downloadJava } from './solr/solr';
import { webserver } from './webserver/webserver';

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

  const db = await legacyItemsDB;

  PathOfBuildingLimiter.updateSettings({
    maxConcurrent: await (await settingsdb).get('performance.pathofbuilding.processcount').value(),
  });

  await downloadJava();
  await downloadSolr();
  await startSolr();

  const build = await getBuild('test');

  let itemsBuilt = 0;
  let timeStart = new Date();
  const tick = async () => {
    const stashData = await getNextPublicStashData();
    for (let stashIndex = 0; stashIndex < stashData.stashes.length; stashIndex++) {
      const stash = stashData.stashes[stashIndex];
      let items = stash.items;
      items = items.filter((item) => item.identified);
      items = items.filter((item) => {
        if (item.category.weapons) {
          return ONE_HAND_WEAPONS.find((weaponCategory) => {
            const firstCatLine = item.category.weapons![0] || undefined;
            const secondCatLine = item.category.weapons![1] || undefined;
            return weaponCategory[0] == firstCatLine && weaponCategory[1] == secondCatLine;
          });
        }
        return false;
      });
      let itemsBuiltFromThisResponse = 0;
      if (items.length === 0) {
        await db.set('nextChangeId', stashData.next_change_id).write();
        tick();
      }
      for (let i = 0; i < items.length; i++) {
        buildItem(stash, items[i], build).then(async (item) => {
          PathOfBuildingItemBatcher.add(item);
          itemsBuilt++;
          itemsBuiltFromThisResponse++;

          const itemsPerSecond = 1 / ((new Date().getTime() - timeStart.getTime()) / itemsBuilt / 1000);
          if (itemsBuilt % 10 === 0) {
            console.log(numeral(itemsPerSecond).format('0,0.00'), `items per second (${itemsBuilt} total)`);
          }

          if (itemsBuiltFromThisResponse === items.length && stashIndex === stashData.stashes.length - 1) {
            await db.set('nextChangeId', stashData.next_change_id).write();
            tick();
          }
        })
      }
    }
  }
  startPublicStashBuilder();
})();