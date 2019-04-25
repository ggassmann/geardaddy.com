import { IPublicItem } from "./IPublicItem";
import { ICalculatedItemLine } from "./ICalculatedItemLine";

export interface IDisplayedItem {
  id: string;
  baseItem: IPublicItem;
  calculatedItem: ICalculatedItemLine[];
  price: string;
}