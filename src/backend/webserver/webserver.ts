import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { readFile } from 'fs';

import { settingsdb, itemsdb, querydb } from '../db';
import { IDisplayedItem } from 'src/data/IDisplayedItem';
import { FrameType } from '../../data/FrameType';
import { settingListeners } from '../settings/settings';
import { IQuery } from 'src/data/IQuery';

const init = async (app: express.Express) => {
  app.use(bodyParser.json());
  const sendReact = (req: express.Request, res: express.Response) => {
    readFile(path.resolve(__dirname, 'frontend/index.html'), async (err, data) => {
      if (err) {
        console.error(err);
        res.send(500);
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send(
          data.toString() + `<script>window.API_PORT=${await (await settingsdb).get('server.port').value()}</script>`
        );
      }
    })
  }
  app.get('/', sendReact);
  app.use(express.static(path.resolve(__dirname, 'frontend')));
  app.get('/api/setting/:path/:value', async (req, res) => {
    try {
      const listeners = settingListeners.filter((x) => x.path === req.params.path);
      const results = await Promise.all(listeners.map(async (listener) => await listener.func(req.params.value)));
      const failures = results.filter((result) => !result.success);
      if (failures.length > 0) {
        res.send({ success: false, errors: failures.map((failure) => failure.message) });
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
      (await itemsdb).get('items')
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
  });
  app.get('/api/query/all', async (req, res) => {
    const queries = await (await querydb).get('queries').value();
    const queryIds = Object.keys(queries);
    const queryPreviews: IQuery[] = queryIds.map((queryId) => ({
      id: queryId,
      name: queries[queryId].name,
    }))
    res.send(queryPreviews);
  });
  app.get('/api/query/single/:id', async (req, res) => {
    const targetQuery = (await querydb).get('queries').find((query: IQuery) => query.id === req.params.id).value();
    res.send({
      success: true,
      value: (targetQuery || {id: req.params.id, new: true}),
    });
  });
  app.post('/api/query/update/:id', async (req, res) => {
    console.log(req.body.query);
    if(req.body.query.new) {
      delete req.body.query.new;
    }

    if(await (await querydb).get('queries').value() === undefined) {
      await (await querydb).set('queries', {}).commit();
    }
    
    await (await querydb).get('queries').set(req.body.query.id, req.body.query).commit();
    
    res.send((await querydb).get('queries').value());
    (await querydb).write();
  });
  app.get('*', sendReact);
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