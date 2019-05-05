import * as React from 'react';

import { IDisplayedItem } from 'src/data/IDisplayedItem';
import { RareItemTheme, ItemTheme, IItemTheme, UniqueItemTheme } from '../../Theme';
import { ItemBoxSeparator } from './ItemBoxSeparator';
import { ItemBoxModSection } from './ItemBoxModSection';
import { ItemBoxCalculatedSection } from './ItemBoxCalculatedSection';
import { IPublicItemProperty } from 'src/data/IPublicItemProperties';

export interface IItemBoxProps {
  item: IDisplayedItem,
}

const ThemeMap = [
  ItemTheme,
  ItemTheme,
  RareItemTheme,
  UniqueItemTheme,
]

export const ItemBox = ({ item }: IItemBoxProps) => {
  return (
    <div>
      <h3>
        {item.baseItem.name}
        <br />
        {item.baseItem.typeLine}
      </h3>
      <ItemBoxSeparator />
      <p>
        {item.baseItem.properties && JSON.parse(item.baseItem.properties).map((property: IPublicItemProperty, propertyIndex: number) => (
          <React.Fragment key={property.type}>
            {property.name}{property.values.length > 0 && ':'} {property.values.map((value) => value[0]).join(' ')}
            {propertyIndex < item.baseItem.properties.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
      <ItemBoxSeparator />
      <ItemBoxModSection mods={item.baseItem.implicitMods} />
      <ItemBoxSeparator />
      <ItemBoxModSection mods={item.baseItem.explicitMods} />
      <ItemBoxSeparator />
      <ItemBoxCalculatedSection calculatedItem={item.calculatedItem} />
      <ItemBoxSeparator />
      <p>
        {item.price}
      </p>
      {console.log(item)}
    </div>
  )
}