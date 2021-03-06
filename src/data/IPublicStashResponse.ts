import { IPublicStash } from "./IPublicStash";

export interface IPublicStashResponse {
  next_change_id: string;
  stashes: IPublicStash[];
  error?: {code: number, message: string};
}