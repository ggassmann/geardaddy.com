import Bottleneck from "bottleneck";
import path from 'path';
import util from 'util';
import { spawn } from 'child_process';
import fs from 'fs';
import recursiveReaddir from 'recursive-readdir';
const fsReadFile = util.promisify(fs.readFile);
const fsAccess = util.promisify(fs.access);
const fsReaddir = util.promisify<string, string[]>(recursiveReaddir);

import { IDisplayedItem } from "src/data/IDisplayedItem";
import { ICalculatedItemLine } from "src/data/ICalculatedItemLine";
import { settingsdb, itemsdb } from "./db";
import { getRarityFromFrameType } from "../data/FrameType";
import { addSettingListener } from "./settings/settings";
import { ISolrItem } from "src/data/ISolrItem";
import { IPublicItemProperty } from "src/data/IPublicItemProperties";

const LUAJitPath = path.resolve(__dirname, 'include/luajit.exe');
const TestItemPath = path.resolve(__dirname, 'lua/TestItem.lua');

export const PathOfBuildingLimiter = new Bottleneck({
  maxConcurrent: 4,
});

export const PathOfBuildingItemBatcher = new Bottleneck.Batcher({
  maxTime: 5000,
  maxSize: 3,
});
PathOfBuildingItemBatcher.on('batch', async (items: IDisplayedItem[]) => {
  for (let i = 0; i < items.length; i++) {
    await (await itemsdb).get('items').push(items[i]).write();
  };
});

export const InitPathOfBuildingSettingsListeners = () => {
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
      if (builds.length === 0) {
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
}

export const GetPathOfBuildingItemFromSolrItem = (item: ISolrItem) => {
  const itemQualityProperty = item.properties &&
    JSON.parse(item.properties).find((property: IPublicItemProperty) => property.name === 'Quality')
    || undefined;
  let itemQuality = 20;
  if (itemQualityProperty) {
    itemQuality = Math.max(20, parseInt(
      itemQualityProperty.values[0][0].substring(1, itemQualityProperty.values[0][0].length - 1)
    ));
  }
  return [
    `Rarity: ${getRarityFromFrameType(item.frameType)}`,
    item.name,
    item.typeLine,
    `Crafted: ${item.craftedMods && item.craftedMods.length > 0 || false}`,
    `Quality: ${itemQuality}`,
    `Implicits: ${item.implicitMods && item.implicitMods.length || 0}`,
    ...(item.implicitMods || []),
    ...(item.explicitMods || []),
  ].join('\n');
}

export const BuildCalculatedItemFromSolrItem = async (item: ISolrItem, build: string): Promise<ICalculatedItemLine[]> => {
  return await new Promise((resolveCalculatedItem, rejectCalculatedItem) => {
    PathOfBuildingLimiter.schedule(() => new Promise(async (resolveBottleneck, rejectBottleneck) => {
      const pobItem = GetPathOfBuildingItemFromSolrItem(item);
      const MockItemProcess = spawn(
        LUAJitPath,
        [
          TestItemPath,
          build,
          pobItem,
        ],
        {
          cwd: (await settingsdb).get('filesystem.pathofbuilding.lua_path').value(),
          timeout: (await settingsdb).get('performance.pathofbuilding.timeout').value(),
        }
      );
      const calculatedItem: ICalculatedItemLine[] = [];
      let collectedOut = '';
      MockItemProcess.stdout.on('data', (output) => {
        try {
          const outputString = output.toString().trim();
          collectedOut += outputString;
          let currentChunk: string;
          outputString.split('\n').forEach((chunk: string) => {
            const chunkInfo = chunk.split('|');
            if (chunkInfo[0] === 'SLOT') {
              currentChunk = chunkInfo[1].replace(/.+Equippingthisitemin(.+)willgiveyou.+/gm, '$1');
            } else {
              const changeInfo = chunkInfo[1];
              const positive = chunkInfo[0] === 'true';
              const changeAbsolute = parseFloat(changeInfo.split(' ')[0]);
              const changeRelative = parseFloat(changeInfo.replace(/(.+\(|%\))/, ''));
              const changeStatName = changeInfo.replace(/(-|\+)([^ ]+ )(.*?)(\(.+\n|\n|\(.+$|$)/gm, '$3');
              calculatedItem.push({
                positive,
                changeAbsolute,
                changeRelative,
                changeStatName,
                changeSlot: currentChunk,
              });
            }
          });
        } catch (e) {
          console.error('Error processing lua output chunk', collectedOut);
        }
      })
      MockItemProcess.stderr.on('data', (chunk) => {
        console.log(chunk.toString());
      })
      const processTimeout = setTimeout(() => {
        console.log('Failed to process item before timeout', item, pobItem, collectedOut);
      }, 15000)
      MockItemProcess.on('close', (code) => {
        if (code !== 0) {
          rejectBottleneck(code);
          rejectCalculatedItem(code);
        }
        resolveBottleneck();
        resolveCalculatedItem(calculatedItem);
        clearTimeout(processTimeout);
      })
    }));
  });
}

export const getBuild = async (name: string) => {
  const basePath = (await settingsdb).get('filesystem.pathofbuilding.builds_path').value();
  const targetPath = `${path.resolve(
    basePath,
    `${name}.xml`
  )}`;
  const build = (await fsReadFile(targetPath)).toString();
  return build;
}