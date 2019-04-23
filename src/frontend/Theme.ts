export interface IItemTheme {
  backgroundColor: string,
  fontColor: string,
  propertyFontColor: string,
  modFontColor: string,
  headerColor: string,
  separatorColor: string,
}

export const ItemTheme: IItemTheme = {
  backgroundColor: 'rgba(15, 15, 15, 1)',
  fontColor: 'rgba(255, 255, 255, 0.925)',
  propertyFontColor: 'rgba(255, 255, 255, 0.825)',
  modFontColor: 'rgba(136, 136, 255, 0.925)',
  headerColor: 'rgba(255, 255, 255, 0.975)',
  separatorColor: 'rgba(200, 200, 200, 0.8)',
}

export const RareItemTheme = (ancestorTheme: IItemTheme) => ({
  ...ItemTheme,
  fontColor: 'rgba(255, 255, 119, 0.925)',
  headerColor: 'rgba(255, 255, 119, 0.975)',
  separatorColor: 'rgba(255, 255, 119, 0.8)',
});

export const UniqueItemTheme = (ancestorTheme: IItemTheme) => ({
  ...ItemTheme,
  fontColor: 'rgba(175, 96, 37, 0.925)',
  headerColor: 'rgba(175, 96, 37, 0.975)',
  separatorColor: 'rgba(175, 96, 37, 0.8)',
});