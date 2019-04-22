import '@babel/polyfill';
import { spawn } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import fs from 'fs';

import { IPublicStashResponse } from './data/IPublicStashResponse';
import { IPublicItem } from './data/IPublicItem';
import { IPublicStash } from './data/IPublicStash';
import { ONE_HAND_WEAPONS } from './data/WeaponCategories';

const PathOfBuildingPath = "C:\\Program Files (x86)\\Path of Building\\Path Of Building.exe";
const PathOfBuildingLUAPath = "C:\\ProgramData\\Path of Building"
const PathOfBuildingBuildsPath = "C:\\Users\\gigimoi\\Documents\\Path of Building\\Builds";
const PathOfBuildingBuildName = "(4,000k) Purifying Flame Trapper.xml";
const PathOfBuildingBuildXML = fs.readFileSync(`${PathOfBuildingBuildsPath}/${PathOfBuildingBuildName}`).toString();

const LUAJitPath = path.resolve(__dirname, 'include/luajit.exe');
const TestItemPath = path.resolve(__dirname, 'lua/TestItem.lua');
const LUAFolder = path.resolve(__dirname, 'lua/');

(async () => {
  const poeData: IPublicStashResponse = await (await fetch('http://www.pathofexile.com/api/public-stash-tabs')).json();
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
  oneHandWeapons.slice(0, 1).forEach((weapon) => {
    const weaponQualityProperty = weapon.properties.find((property) => property.name === 'Quality');
    let weaponQuality = 20;
    if (weaponQualityProperty) {
      weaponQuality = Math.max(20, parseInt(
        weaponQualityProperty.values[0][0].substring(1, weaponQualityProperty.values[0][0].length - 1)
      ));
    }
    const PathOfBuildingObject = [
      weapon.name,
      weapon.typeLine,
      `Crafted: ${weapon.craftedMods && weapon.craftedMods.length > 0 || false}`,
      `Quality: ${weaponQuality}`,
      `Implicits: ${weapon.implicitMods.length}`,
      ...weapon.implicitMods,
      ...weapon.explicitMods,
    ].join('\n');
    const MockItemProcess = spawn(
      LUAJitPath,
      [
        TestItemPath,
        PathOfBuildingBuildXML,
        PathOfBuildingObject
      ],
      {
        cwd: PathOfBuildingLUAPath
      }
    );
    MockItemProcess.stdout.on('data', (chunk) => {
      console.log(chunk.toString());
    })
    MockItemProcess.stderr.on('data', (chunk) => {
      console.log(chunk.toString());
    })
    MockItemProcess.on('close', (code) => {
      console.log('Exited with code', code);
    })
  })
})();