export type IPublicItemWeapons = (
  ['bow'] |
  ['onesword'] |
  ['dagger'] |
  ['wand'] |
  ['claw'] |
  ['onemace'] |
  ['sceptre', 'onemace'] |
  ['onesword'] |
  ['oneaxe']
);

export interface IPublicItemCategory {
  weapons?: IPublicItemWeapons;
}