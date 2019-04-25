import { FrameType } from "./FrameType";

export interface ISolrItem {
  //non-filtering info
  name: string;
  typeLine: string;
  icon: string;
  category: string;
  flavourText: string;

  //basic info
  ivl: number;
  league: string;
  links: string;
  frameType: FrameType;
  
  //json info
  properties: string;

  //filtering properties
  attacksPerSecond: number;
  weaponRange: number;

  //mods
  implicitMods: string[];
  explicitMods: string[];
}