import { ICalculatedItemLine } from "./ICalculatedItemLine";
import { ISolrItem } from "./ISolrItem";

export interface IDisplayedItem {
  id: string;
  baseItem: ISolrItem;
  calculatedItem: ICalculatedItemLine[];
  price: string;
}