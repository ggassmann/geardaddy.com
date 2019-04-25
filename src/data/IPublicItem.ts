import { IPublicItemCategory } from "./IPublicItemCategory";
import { IPublicItemProperty } from "./IPublicItemProperties";
import { FrameType } from "./FrameType";

export interface IPublicItem {
  typeLine: string;
  name: string;
  id: string;
  category: IPublicItemCategory;
  identified: number;

  craftedMods: string[];
  implicitMods: string[];
  explicitMods: string[];

  frameType: FrameType;

  properties: IPublicItemProperty[];

  note: string;
}