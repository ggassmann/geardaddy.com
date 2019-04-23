import '@babel/polyfill';
import 'source-map-support/register';
import path from 'path';
import express from 'express';
import _ from 'lodash';

import { IPublicItem } from '../data/IPublicItem';
import { ONE_HAND_WEAPONS } from '../data/WeaponCategories';
import { IDisplayedItem } from '../data/IDisplayedItem';
import { db as dbAsync } from './db';
import { FrameType } from '../data/FrameType';
import { getNextPublicStashData } from './publicstashtab';
import { buildItems, PathOfBuildingLimiter } from './pathofbuilding';


(async () => {
  const app = express();
  const db = await dbAsync;

  PathOfBuildingLimiter.updateSettings({
    maxConcurrent: await db.get('settings.performance.pathofbuilding.processcount').value(),
  });

  app.use(express.static(path.resolve(__dirname, 'frontend')));
  app.get('/api/items', (req, res) => {
    res.send(
      db.get('items')
        .filter((item: IDisplayedItem) => (
          item.baseItem.frameType === FrameType.rare
        ))
        .orderBy((item: IDisplayedItem) => {
          const averageHitLine = item.calculatedItem.find((calculatedLine) => {
            return calculatedLine.changeStatName.trim() === 'Average Hit'
          });
          if (!averageHitLine) {
            return -1000000000;
          } else {
            return averageHitLine.changeAbsolute;
          }
        }, 'desc')
        .slice(0, 10)
        .value()
    );
  })
  app.listen(9090, '127.0.0.1');

  const tick = async () => {
    const stashData = await getNextPublicStashData();
    let items: IPublicItem[] = stashData.getItems();
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
    await Promise.all(
      _.chunk(
        items, 
        db.get('settings.performance.pathofbuilding.processcount').value() * 2
      ).map(async (items) => {
        const builtItems = await buildItems(items);
        await db.get('items').push(...builtItems).write();
        console.log('wrote items');
      })
    );
    await db.set('nextChangeId', stashData.next_change_id).write();
    tick();
  }
  tick();
})();