import express from 'express';
import path from 'path';
import { readFile } from 'fs';

import { settingsdb, legacyItemsDB } from '../db';
import { IDisplayedItem } from 'src/data/IDisplayedItem';
import { FrameType } from '../../data/FrameType';
import { settingListeners } from '../settings/settings';

const init = async (app: express.Express) => {
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
  app.get('/api/items', async (req, res) => {
    res.send(
      (await legacyItemsDB).get('items')
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
  });
}

const start = async () => {
  const app = express();

  init(app);

  app.listen(
    await (await settingsdb).get('server.port').value(),
    '127.0.0.1',
    async (err: Error) => {
      if (err) {
        console.error('Error starting server', err);
      } else {
        console.log(`server started on ${await (await settingsdb).get('server.port').value()}`);
      }
    }
  );
}

export const webserver = {
  start,
}