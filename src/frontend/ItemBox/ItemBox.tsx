import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming';

import { IDisplayedItem } from 'src/data/IDisplayedItem';
import { RareItemTheme, ItemTheme, IItemTheme, UniqueItemTheme } from '../Theme';
import { ItemBoxSeparator } from './ItemBoxSeparator';
import { ItemBoxModSection } from './ItemBoxModSection';
import { ItemBoxCalculatedSection } from './ItemBoxCalculatedSection';

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
    <ThemeProvider
      theme={
        ThemeMap[item.baseItem.frameType] || ItemTheme
      }
      key={item.id}
    >
      <div
        css={(theme: IItemTheme) => ({
          backgroundColor: theme.backgroundColor,
          border: `2px solid ${theme.separatorColor}`,
          margin: '10px',
          width: '500px',
        })}
      >
        <h3
          css={(theme: IItemTheme) => ({
            color: theme.headerColor
          })}
        >
          {item.baseItem.name}
          <br />
          {item.baseItem.typeLine}
        </h3>
        <ItemBoxSeparator />
        <ItemBoxModSection mods={item.baseItem.implicitMods} />
        <ItemBoxSeparator />
        <ItemBoxModSection mods={item.baseItem.explicitMods} />
        <ItemBoxSeparator />
        <ItemBoxCalculatedSection calculatedItem={item.calculatedItem} />
        {console.log(item)}
      </div>
    </ThemeProvider >
  )
}