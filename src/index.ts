import '@babel/polyfill';
import 'source-map-support/register';
import { spawn } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import fs from 'fs';
import express from 'express';
import { db as dbAsync } from './db';

import { IPublicStashResponse } from './data/IPublicStashResponse';
import { IPublicItem } from './data/IPublicItem';
import { IPublicStash } from './data/IPublicStash';
import { ONE_HAND_WEAPONS } from './data/WeaponCategories';
import { IDisplayedItem } from './data/IDisplayedItem';

const PathOfBuildingLUAPath = "C:\\ProgramData\\Path of Building"
const PathOfBuildingBuildsPath = "C:\\Users\\gigimoi\\Documents\\Path of Building\\Builds";
const PathOfBuildingBuildName = "(4,000k) Purifying Flame Trapper.xml";
const PathOfBuildingBuildXML = fs.readFileSync(`${PathOfBuildingBuildsPath}/${PathOfBuildingBuildName}`).toString();

const LUAJitPath = path.resolve(__dirname, 'include/luajit.exe');
const TestItemPath = path.resolve(__dirname, 'lua/TestItem.lua');

(async () => {
  const app = express();
  const db = await dbAsync;

  app.use(express.static(path.resolve(__dirname, 'frontend')));
  app.get('/api/items', (req, res) => {
    res.send(
      db.get('items')
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
  app.listen(8080, '127.0.0.1');

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
        const firstCatLine = weapon.category.weapons![0] || 'x';
        const secondCatLine = weapon.category.weapons![1] || 'x';
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
      `Implicits: ${weapon.implicitMods.length}`,
      ...(weapon.implicitMods || []),
      ...(weapon.explicitMods || []),
    ].join('\n');
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
      outputString.split('\n').forEach((chunk: string) => {
        const chunkInfo = chunk.split('|');
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
        });
      });
    })
    MockItemProcess.stderr.on('data', (chunk) => {
      console.log(chunk.toString());
    })
    MockItemProcess.on('close', (code) => {
      console.log('Exited with code', code);
      db.get('items').push(displayItem).write();
    })
  })
})();