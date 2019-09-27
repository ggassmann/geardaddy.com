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

export type IPublicItemSubCategories = 
  'ring' | 'amulet' | 'belt' | 'quiver' |
  'chest' | 'gloves' | 'boots' | 'helmet' |
  'bow' | 'twoaxe' | 'twosword' | 'twomace' | 'staff' | 'warstaff' |
  'onesword' | 'onemace' | 'oneaxe' | 'claw' | 'wand' | 'dagger' | 'runedagger';

export type IPublicItemCategory = 'weapons' | 'armour' | 'accessories' | 'jewels' | 'maps' | '';