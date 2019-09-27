import '@babel/polyfill';
import 'source-map-support/register';
import _ from 'lodash';
import temp from 'temp';

temp.track();

import { itemsdb, settingsdb } from './db';
import { startPublicStashBuilder } from './publicstashtab';
import {
  PathOfBuildingLimiter,
  InitPathOfBuildingSettingsListeners,
  InitPathOfBuidlingBuildWatcher
} from './pathofbuilding';
import { startSolr, killSolr } from './solr/solr';
import { webserver } from './webserver/webserver';
import { downloadJava, downloadSolr } from './solr/download';
import { startQueryRunner } from 'src/backend/queryrunner';

(async () => {
  const shutdown = async (noExit: boolean = false) => {
    console.log('Shutting down');
    temp.cleanup();
    await killSolr();
    console.log('Shutdown complete, exitting');
    if(noExit) {
      process.exit();
    }
  }
  process.on('SIGINT', () => shutdown());
  process.on('SIGHUP', () => shutdown());
  process.on('SIGTERM', () => shutdown());

  InitPathOfBuildingSettingsListeners();
  InitPathOfBuidlingBuildWatcher();
  webserver.start();

  PathOfBuildingLimiter.updateSettings({
    maxConcurrent: await (await settingsdb).get('performance.pathofbuilding.processcount').value(),
  });

  await downloadJava();
  await downloadSolr();
  await killSolr();
  await startSolr();

  startPublicStashBuilder();
  startQueryRunner();
})();