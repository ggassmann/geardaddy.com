import '@babel/polyfill';
import 'source-map-support/register';
import { spawn } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import fs from 'fs';
import express from 'express';
import Bottleneck from "bottleneck";

import { IPublicStashResponse } from './data/IPublicStashResponse';
import { IPublicItem } from './data/IPublicItem';
import { IPublicStash } from './data/IPublicStash';
import { ONE_HAND_WEAPONS } from './data/WeaponCategories';
import { IDisplayedItem } from './data/IDisplayedItem';
import { db as dbAsync } from './db';
import { FrameType } from './data/FrameType';

const PathOfBuildingLUAPath = "C:\\ProgramData\\Path of Building"
const PathOfBuildingBuildsPath = "C:\\Users\\gigimoi\\Documents\\Path of Building\\Builds";
const PathOfBuildingBuildName = "(4,000k) Purifying Flame Trapper.xml";
const PathOfBuildingBuildXML = fs.readFileSync(`${PathOfBuildingBuildsPath}/${PathOfBuildingBuildName}`).toString();

const LUAJitPath = path.resolve(__dirname, 'include/luajit.exe');
const TestItemPath = path.resolve(__dirname, 'lua/TestItem.lua');

(async () => {
  const app = express();
  const db = await dbAsync;

  const PathOfBuildingLimiter = new Bottleneck({
    maxConcurrent: 4,
  });

  app.use(express.static(path.resolve(__dirname, 'frontend')));
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
  app.listen(9090, '127.0.0.1');

  setInterval(() => {
    if (PathOfBuildingLimiter.queued() <= 16) {
      buildItems();
    }
  }, 1000);

  const buildItems = async () => {
    let poeDataEndpoint = 'http://www.pathofexile.com/api/public-stash-tabs';
    if (db.get('nextChangeId').value()) {
      poeDataEndpoint += `?id=${db.get('nextChangeId').value()}`;
    }

    const poeData: IPublicStashResponse = await (await fetch(poeDataEndpoint)).json();
    db.set('nextChangeId', poeData.next_change_id).write();
    const items: IPublicItem[] = poeData.stashes.filter(
      (stash) => stash.public
    ).reduce((prev: IPublicItem[], current: IPublicStash, index, array): IPublicItem[] => {
      return [...prev, ...current.items];
    }, []);
    const weapons = items.filter((item) => item.category.weapons);
    const oneHandWeapons = weapons.filter((weapon) => {
      if (weapon.category.weapons) {
        return ONE_HAND_WEAPONS.find((weaponCategory) => {
          const firstCatLine = weapon.category.weapons![0] || undefined;
          const secondCatLine = weapon.category.weapons![1] || undefined;
          return weaponCategory[0] == firstCatLine && weaponCategory[1] == secondCatLine;
        });
      }
      return false;
    });
    oneHandWeapons.forEach((weapon) => {
      const weaponQualityProperty = weapon.properties.find((property) => property.name === 'Quality');
      let weaponQuality = 20;
      if (weaponQualityProperty) {
        weaponQuality = Math.max(20, parseInt(
          weaponQualityProperty.values[0][0].substring(1, weaponQualityProperty.values[0][0].length - 1)
        ));
      }
      const PathOfBuildingItem = [
        weapon.name,
        weapon.typeLine,
        `Crafted: ${weapon.craftedMods && weapon.craftedMods.length > 0 || false}`,
        `Quality: ${weaponQuality}`,
        `Implicits: ${weapon.implicitMods && weapon.implicitMods.length || 0}`,
        ...(weapon.implicitMods || []),
        ...(weapon.explicitMods || []),
      ].join('\n');
      PathOfBuildingLimiter.schedule(() => new Promise((resolve, reject) => {
        const MockItemProcess = spawn(
          LUAJitPath,
          [
            TestItemPath,
            PathOfBuildingBuildXML,
            PathOfBuildingItem
          ],
          {
            cwd: PathOfBuildingLUAPath
          }
        );
        const displayItem: IDisplayedItem = {
          id: weapon.id,
          baseItem: weapon,
          calculatedItem: [],
        }
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
              displayItem.calculatedItem.push({
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
          const identicalItem = db.get('items').find((item: IDisplayedItem) => item.id === displayItem.id).value();
          if(identicalItem) {
            console.log('found identical item');
            db.get('items').update(`id=${identicalItem.id}`, (item: IDisplayedItem) => displayItem);
          } else {
            db.get('items').push(displayItem).write();
          }
          resolve();
        })
      }));
    })
  }
})();