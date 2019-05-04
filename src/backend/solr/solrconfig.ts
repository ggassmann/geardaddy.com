import fs from 'fs';
import util from 'util';
import path from 'path';

import solrConfigPath from './solrconfig/solrconfig.xml';
import schemaConfigPath from './solrconfig/schema.xml';
import stopwordsConfigPath from './solrconfig/stopwords.txt';
import synonymsConfigPath from './solrconfig/synonyms.txt';
import { SolrFieldConfig } from 'src/data/SolrFieldConfig';

const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);
const fsMkdir = util.promisify(fs.mkdir);

export const setupSolrConfig = async () => {
  try {
    await fsMkdir(path.resolve(__dirname, 'solr-8.0.0/server/solr/solr-item/'));
  } catch(e) {
    if(e.code !== 'EEXIST') {
      throw e;
    }
  }
  await Promise.all([
    (async () => {
      const solrConfigBuffer = await fsReadFile(path.resolve(__dirname, solrConfigPath));
      await fsWriteFile(path.resolve(__dirname, 'solr-8.0.0/server/solr/solr-item/solrconfig.xml'), solrConfigBuffer, {encoding:'utf8',flag:'w'});
    })(),
    (async () => {
      const stopwordsConfigBuffer = await fsReadFile(path.resolve(__dirname, stopwordsConfigPath));
      await fsWriteFile(path.resolve(__dirname, 'solr-8.0.0/server/solr/solr-item/stopwords.txt'), stopwordsConfigBuffer), {encoding:'utf8',flag:'w'};
    })(),
    (async () => {
      const synonymsConfigBuffer = await fsReadFile(path.resolve(__dirname, synonymsConfigPath));
      await fsWriteFile(path.resolve(__dirname, 'solr-8.0.0/server/solr/solr-item/synonyms.txt'), synonymsConfigBuffer, {encoding:'utf8',flag:'w'});
    })(),
    (async () => {
      const solrSchemaBuffer = await fsReadFile(path.resolve(__dirname, schemaConfigPath));
      let solrSchemaString = solrSchemaBuffer.toString();
      let fieldConfig = '';
      SolrFieldConfig.forEach((configField, configFieldIndex) => {
        fieldConfig += `<field name="${
          configField.name
        }" type="${
          configField.type
        }" indexed="${
          configField.indexed || false
        }" multiValued="${
          configField.multiValued || false
        }" required="${
          configField.required || false
        }" stored="${
          configField.stored || false
        }"/>\n${
          configFieldIndex === SolrFieldConfig.length - 1 && '' || '  '
        }`;
      })
      solrSchemaString = solrSchemaString.replace(/\<REPLACE_ME_THROUGH_JAVASCRIPT_BACKEND\/\>/, fieldConfig);
      await fsWriteFile(path.resolve(__dirname, 'solr-8.0.0/server/solr/solr-item/schema.xml'), solrSchemaString, {encoding:'utf8',flag:'w'});
    })(),
  ]);
}