import '@babel/polyfill';
import 'source-map-support/register';
import path from 'path';
import express from 'express';
import _ from 'lodash';
import util from 'util';

import { IPublicItem } from '../data/IPublicItem';
import { ONE_HAND_WEAPONS } from '../data/WeaponCategories';
import { IDisplayedItem } from '../data/IDisplayedItem';
import { itemdb, settingsdb } from './db';
import { FrameType } from '../data/FrameType';
import { getNextPublicStashData } from './publicstashtab';
import { buildItems, PathOfBuildingLimiter, getBuild } from './pathofbuilding';
import { readFile } from 'fs';


(async () => {
  const app = express();
  const db = await itemdb;

  PathOfBuildingLimiter.updateSettings({
    maxConcurrent: await (await settingsdb).get('performance.pathofbuilding.processcount').value(),
  });
  app.get('/', (req, res) => {
    readFile(path.resolve(__dirname, 'frontend/index.html'), async (err, data) => {
      if (err) {
        console.error(err);
        res.send(500);
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send(
          data.toString().replace(
            '<body>',
            `<body><script>window.API_PORT=${await (await settingsdb).get('server.port').value()}</script>`
          )
        );
      }
    })
  });
  app.use(express.static(path.resolve(__dirname, 'frontend')));
  app.get('/api/setting/:path/:value', async (req, res) => {
    try {
      await db.set(req.params.path, req.params.value).write();
      res.send({ success: true });
    } catch (e) {
      res.send({ success: false, error: e });
    }
  });
  app.get('/api/setting/:path', async (req, res) => {
    try {
      console.log(req.params.path);
      const value = await (await settingsdb).get(req.params.path).value();
      console.log(value);
      res.send({ success: true, value });
    } catch (e) {
      res.send({ success: false, error: e });
    }
  });
  app.get('/api/items', (req, res) => {
    res.send(
      db.get('items')
        .filter((item: IDisplayedItem) => (
          item.baseItem.frameType === FrameType.rare
        ))
        .orderBy((item: IDisplayedItem) => {
          const averageHitLine = item.calculatedItem.find((calculatedLine) => {
            return calculatedLine.changeStatName.trim() === 'Total DPS'
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
  app.listen(
    await (await settingsdb).get('server.port').value(),
    '127.0.0.1',
    async (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`server started on ${await (await settingsdb).get('server.port').value()}`);
      }
    }
  );

  const build = await getBuild('test');

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
    const itemChunks = _.chunk(items, (await settingsdb).get('performance.pathofbuilding.processcount').value() * 2);
    for (let i = 0; i < itemChunks.length; i++) {
      await db.get(
        'items'
      ).push(
        ...await buildItems(itemChunks[i], build)
      ).write();
      console.log('wrote items');
    }
    await db.set('nextChangeId', stashData.next_change_id).write();
    tick();
  }
  tick();
})();