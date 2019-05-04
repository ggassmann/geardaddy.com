interface ISolrItemFieldConfig {
  name: string;
  type: string;
  indexed?: boolean;
  stored?: boolean;
  required?: boolean;
  multiValued?: boolean;
}

//See ISolrItem

export const SolrFieldConfig: ISolrItemFieldConfig[] = [
  {name: 'name', type:'string', indexed: true, required: true, stored: true},
  {name: 'typeLine', type:'string', indexed: true, required: true, stored: true},
  {name: 'icon', type:'string', indexed: true, required: true, stored: true},
  {name: 'category', type:'string', indexed: true, required: true, stored: true},
  {name: 'flavourText', type:'string', indexed: true, required: false, stored: true},
  {name: 'id', type:'string', indexed: true, required: true, stored: true},
  
  {name: 'ilvl', type:'pint', indexed: true, required: false, stored: true},
  {name: 'league', type:'string', indexed: true, required: true, stored: true},
  {name: 'links', type:'string', indexed: true, required: true, stored: true},
  {name: 'frameType', type:'string', indexed: true, required: true, stored: true},
  
  {name: 'properties', type:'string', indexed: true, required: false, stored: true},

  {name: 'attacksPerSecond', type:'pfloat', indexed: true, required: false, stored: true},
  {name: 'weaponRange', type:'pint', indexed: true, required: false, stored: true},
  
  {name: 'implicitMods', type:'strings', indexed: true, required: false, stored: true, multiValued: true},
  {name: 'explicitMods', type:'strings', indexed: true, required: false, stored: true, multiValued: true},
  {name: 'craftedMods', type:'strings', indexed: true, required: false, stored: true, multiValued: true},
]