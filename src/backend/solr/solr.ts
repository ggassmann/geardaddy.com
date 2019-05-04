import path from 'path';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

import { settingsdb } from '../db';
import { cores } from './cores';
import { setupSolrConfig } from './solrconfig';
import { ISolrItem } from 'src/data/ISolrItem';

export const getSolrAddress = async () => {
  return `http://localhost:${(await settingsdb).get('solr.port').value()}/solr/`;
}

export const startSolr = async () => {
  return new Promise(async (resolve, reject) => {
    await setupSolrConfig();
    const solr = spawn(path.resolve(__dirname, 'solr-8.0.0/bin/solr.cmd'), ['start', '-port', (await settingsdb).get('solr.port').value()], {
      env: Object.assign(
        process.env,
        {
          JAVA_HOME: path.resolve(__dirname, 'jre8'),
        }
      ),
      shell: true,
    });
    solr.stdout.on('data', async (chunk) => {
      if(chunk.toString().startsWith('Started Solr server')) {
        const initialItemCoreStatus = await cores.getCoreStatus('solr-item');
        if(Object.keys(initialItemCoreStatus).length === 0) {
          await cores.createCore('solr-item', 'solr-item', 'solrconfig.xml', 'schema.xml', 'data');
        }
        console.log('started solr');
        resolve();
      }
    });
    solr.stderr.on('data', (chunk) => {
      console.log(chunk.toString().trimEnd());
    });
  })
}

export const killSolr = async () => {
  return await new Promise((resolve, reject) => {
    const solr = spawn(path.resolve(__dirname, 'solr-8.0.0/bin/solr.cmd'), ['stop', '-all'], {
      env: Object.assign(
        process.env,
        {
          JAVA_HOME: path.resolve(__dirname, 'jre8'),
        }
      ),
      shell: true,
    });
    solr.stdout.on('data', (chunk) => {
      console.log(chunk.toString());
    });
    solr.stderr.on('data', (chunk) => {
      console.log(chunk.toString());
    });
    solr.on('close', (code, signal) => {
      console.log('solr exited', code, signal);
      resolve();
    });
  });
}

export const submitItemToSolr = async (item: ISolrItem) => {
  const submitResponse = await fetch(`${await getSolrAddress()}solr-item/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      add: {doc: item, commitWithin: 1000, overwrite: true},
    }),
  });
  console.log(await submitResponse.json());
}