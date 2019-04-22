import { IPublicItemCategory } from "./IPublicItemCategory";
import { IPublicItemProperty } from "./IPublicItemProperties";

export interface IPublicItem {
  typeLine: string;
  name: string;
  category: IPublicItemCategory;

  craftedMods: string[];
  implicitMods: string[];
  explicitMods: string[];

  properties: IPublicItemProperty[];
}