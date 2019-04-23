import Bottleneck from "bottleneck";
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { IDisplayedItem } from "src/data/IDisplayedItem";
import { IPublicItem } from "src/data/IPublicItem";
import { db as dbAsync } from "./db";
import { ICalculatedItemLine } from "src/data/ICalculatedItemLine";
import { ONE_HAND_WEAPONS } from "src/data/WeaponCategories";

const LUAJitPath = path.resolve(__dirname, 'include/luajit.exe');
const TestItemPath = path.resolve(__dirname, 'lua/TestItem.lua');

const PathOfBuildingLUAPath = "C:\\Users\\ggassmann\\Downloads\\pob"
const PathOfBuildingBuildsPath = "C:\\Users\\ggassmann\\Downloads\\pob\\Builds";
const PathOfBuildingBuildName = "build3.xml";
const PathOfBuildingBuildXML = fs.readFileSync(`${PathOfBuildingBuildsPath}/${PathOfBuildingBuildName}`).toString();

export const PathOfBuildingLimiter = new Bottleneck({
  maxConcurrent: 4,
});

export const GetPathOfBuildingItem = (item: IPublicItem) => {
  const itemQualityProperty = item.properties.find((property) => property.name === 'Quality');
  let itemQuality = 20;
  if (itemQualityProperty) {
    itemQuality = Math.max(20, parseInt(
      itemQualityProperty.values[0][0].substring(1, itemQualityProperty.values[0][0].length - 1)
    ));
  }
  return [
    item.name,
    item.typeLine,
    `Crafted: ${item.craftedMods && item.craftedMods.length > 0 || false}`,
    `Quality: ${itemQuality}`,
    `Implicits: ${item.implicitMods && item.implicitMods.length || 0}`,
    ...(item.implicitMods || []),
    ...(item.explicitMods || []),
  ].join('\n');
}

export const GetCalculatedItemStats = async (item: IPublicItem): Promise<ICalculatedItemLine[]> => {
  return await new Promise((resolveCalculatedItem, rejectCalculatedItem) => {
    PathOfBuildingLimiter.schedule(() => new Promise((resolveBottleneck, rejectBottleneck) => {
      const MockItemProcess = spawn(
        LUAJitPath,
        [
          TestItemPath,
          PathOfBuildingBuildXML,
          GetPathOfBuildingItem(item)
        ],
        {
          cwd: PathOfBuildingLUAPath
        }
      );
      const calculatedItem: ICalculatedItemLine[] = [];
      MockItemProcess.stdout.on('data', (output) => {
        const outputString = output.toString().trim();
        let currentChunk: string;
        outputString.split('\n').forEach((chunk: string) => {
          const chunkInfo = chunk.split('|');
          if(chunkInfo[0] === 'SLOT') {
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
      })
      MockItemProcess.stderr.on('data', (chunk) => {
        console.log(chunk.toString());
      })
      MockItemProcess.on('close', (code) => {
        console.log('Exited with code', code);
        resolveBottleneck();
        resolveCalculatedItem(calculatedItem);
      })
    }));
  });
}

export const buildItems = async (items: IPublicItem[]) => {
  return await Promise.all(items.map(async (item) => {
    const displayedWeapon: IDisplayedItem = {
      id: item.id,
      baseItem: item,
      calculatedItem: await GetCalculatedItemStats(item),
    }
    return displayedWeapon;
  }));
}