import '@babel/polyfill';
import 'source-map-support/register';
import path from 'path';
import express from 'express';
import _ from 'lodash';
import util from 'util';
import numeral from 'numeral';


import { readFile } from 'fs';
import fs from 'fs';
import recursiveReaddir from 'recursive-readdir';
const fsAccess = util.promisify(fs.access);
const fsReaddir = util.promisify<string, string[]>(recursiveReaddir);

import { IPublicItem } from '../data/IPublicItem';
import { ONE_HAND_WEAPONS } from '../data/WeaponCategories';
import { IDisplayedItem } from '../data/IDisplayedItem';
import { itemdb, settingsdb } from './db';
import { FrameType } from '../data/FrameType';
import { getNextPublicStashData } from './publicstashtab';
import { buildItem, PathOfBuildingLimiter, getBuild, PathOfBuildingItemBatcher } from './pathofbuilding';

(async () => {
  const app = express();
  const db = await itemdb;

  PathOfBuildingLimiter.updateSettings({
    maxConcurrent: await (await settingsdb).get('performance.pathofbuilding.processcount').value(),
  });

  const settingListeners: {path: string, func: (value: any) => Promise<{success: boolean, message?: string, error?: Error}>}[] = [];
  const addSettingListener = (path: string, func: (value: any) => Promise<{success: boolean, message?: string, error?: Error}>) => {
    settingListeners.push({
      path, func
    });
  }
  addSettingListener('performance.pathofbuilding.processcount', async (value) => {
    PathOfBuildingLimiter.updateSettings({
      maxConcurrent: value,
    });
    return {
      success: true,
    }
  });

  addSettingListener('filesystem.pathofbuilding.lua_path', async (value) => {
    try {
      await fsAccess(path.resolve(value, 'Launch.lua'));
      await fsAccess(path.resolve(value, 'Modules/Build.lua'));
      return {
        success: true,
      }
    } catch (e) {
      return {
        success: false,
        error: e,
        message: e.toString(),
      }
    }
  });

  addSettingListener('filesystem.pathofbuilding.builds_path', async (value) => {
    try {
      await fsAccess(value);
      let contents: string[] = await fsReaddir(value);
      let builds = contents.filter((file) => file.endsWith('.xml'));
      if(builds.length === 0) {
        throw new Error('No builds found');
      }
      return {
        success: true,
      }
    } catch (e) {
      return {
        success: false,
        error: e,
        message: e.toString(),
      }
    }
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
      const listeners = settingListeners.filter((x) => x.path === req.params.path);
      const results = await Promise.all(listeners.map(async (listener) => await listener.func(req.params.value)));
      const failures = results.filter((result) => !result.success);
      if(failures.length > 0) {
        res.send({success: false, errors: failures.map((failure) => failure.message)});
      } else {
        await (await settingsdb).set(req.params.path, req.params.value).write();
        res.send({ success: true });
      }
    } catch (e) {
      res.send({ success: false, error: e });
    }
  });
  app.get('/api/setting/:path', async (req, res) => {
    try {
      const value = await (await settingsdb).get(req.params.path).value();
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

  let itemsBuilt = 0;
  let timeStart = new Date();
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
    let itemsBuiltFromThisResponse = 0;
    if(items.length === 0) {
      await db.set('nextChangeId', stashData.next_change_id).write();
      tick();
    }
    for(let i = 0; i < items.length; i++) {
      buildItem(items[i], build).then(async (item) => {
        PathOfBuildingItemBatcher.add(item);
        itemsBuilt++;
        itemsBuiltFromThisResponse++;

        const itemsPerSecond = 1 / ((new Date().getTime() - timeStart.getTime()) / itemsBuilt / 1000);
        if(itemsBuilt % 10 === 0) {
          console.log(numeral(itemsPerSecond).format('0,0.00'), `items per second (${itemsBuilt} total)`);
        }

        if(itemsBuiltFromThisResponse === items.length) {
          await db.set('nextChangeId', stashData.next_change_id).write();
          tick();
        }
      })
    }
  }
  tick();
})();