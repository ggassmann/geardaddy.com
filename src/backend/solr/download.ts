
import tar from 'tar';
import util from 'util';
import http from 'http';
import https from 'https';
import fs, { mkdir } from 'fs';
import temp from 'temp';
import unzipper from 'unzipper';
import path from 'path';

const solrDownloadLocation = 'http://apache.mirrors.ionfish.org/lucene/solr/8.0.0/solr-8.0.0.tgz';
const javaDownloadLocation = 'https://d3pxv6yz143wms.cloudfront.net/8.212.04.2/amazon-corretto-8.212.04.2-windows-x64-jre.zip';

export const downloadJava = async () => {
  try {
    await util.promisify(fs.access)(path.resolve(__dirname, 'jre8/bin/java.exe'))
    console.log('java already present, not downloading');
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('downloading java');
      const downloadPath = await new Promise<string>((resolve, reject) => {
        temp.mkdir('geardaddy-java', (err, dir) => {
          const downloadPath: string = path.resolve(dir, "amazon-corretto-8.212.04.2-windows-x64-jre.zip");
          const file = fs.createWriteStream(downloadPath);
          const request = https.get(javaDownloadLocation, function (response) {
            response.pipe(file, {
              end: true,
            });
          });
          request.on('close', () => {
            resolve(downloadPath)
          });
        })
      });
      await fs.createReadStream(downloadPath).pipe(unzipper.Extract({ path: path.resolve(__dirname) }));
      temp.cleanup();
      console.log('java downloaded');
    } else {
      console.log('An unkown error occured, is java inaccessible?');
    }
  }
}

export const downloadSolr = async () => {
  try {
    await util.promisify(fs.access)(path.resolve(__dirname, 'solr-8.0.0/bin/solr'))
    console.log('solr already present, not downloading');
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('downloading solr');
      const downloadPath = await new Promise<string>((resolve, reject) => {
        temp.mkdir('geardaddy-solr', (err, dir) => {
          const downloadPath: string = path.resolve(dir, "solr-8.0.0.tgz");
          const file = fs.createWriteStream(downloadPath);
          const request = http.get(solrDownloadLocation, function (response) {
            response.pipe(file, {
              end: true,
            });
          });
          request.on('close', () => {
            resolve(downloadPath)
          });
        })
      });
      await tar.extract({ file: downloadPath, C: path.resolve(__dirname) });
      temp.cleanup();
      console.log('solr downloaded');
    }
  }
}