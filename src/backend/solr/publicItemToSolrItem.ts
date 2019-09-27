import { IPublicItem } from "src/data/IPublicItem";
import { ISolrItem } from "src/data/ISolrItem";

export const publicItemToSolrItem = (item: IPublicItem): ISolrItem => {
  const categoryPropertyOne = item.extended.category;
  const categoryPropertyTwo = (item.extended.subcategories || []).join(' ');
  const itemCategoryString = categoryPropertyOne + (categoryPropertyTwo && `|${categoryPropertyTwo}` || '');
  let attacksPerSecond = 0;
  let weaponRange = 0;
  if (item.properties) {
    let attacksPerSecondProperty = item.properties.find((property) => property.name === 'Attacks per Second');
    if (attacksPerSecondProperty) {
      attacksPerSecond = attacksPerSecondProperty.values[0][0];
    }
    let weaponRangeProperty = item.properties.find((property) => property.name === 'Weapon Range');
    if (weaponRangeProperty) {
      weaponRange = weaponRangeProperty.values[0][0];
    }
  }

  return {
    id: item.id,
    name: item.name,
    typeLine: item.typeLine,
    icon: item.icon,
    category: itemCategoryString,
    flavourText: item.flavourText && item.flavourText.join('\r') || undefined,
    frameType: parseInt(item.frameType as unknown as string),
    ilvl: item.ilvl,
    properties: JSON.stringify(item.properties),

    craftedMods: item.craftedMods || [],
    explicitMods: item.explicitMods || [],
    implicitMods: item.implicitMods || [],

    league: item.league,
    links: 'R',

    attacksPerSecond: attacksPerSecond,
    weaponRange: weaponRange,
  }
}