import { IPublicItem } from "./IPublicItem";

export interface IPublicStash {
  id: string;
  public: boolean;
  accountName: string | null;
  lastCharacterName: string | null;
  stash: string | null;
  stashType: 'PremiumStash';
  league: string;
  items: IPublicItem[];
}