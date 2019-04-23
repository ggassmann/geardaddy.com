import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming'

import { IDisplayedItem } from '../data/IDisplayedItem';
import { ItemTheme } from './Theme';
import { ItemBox } from './ItemBox/ItemBox';

export const App = () => {
  const [items, setItems] = React.useState<IDisplayedItem[]>([]);
  React.useEffect(() => {
    (async () => {
      setItems(await (await fetch('http://localhost:8080/api/items')).json());
    })();
    return () => {
      console.log('test');
    }
  }, []);
  return (
    <ThemeProvider theme={ItemTheme}>
      {items.map((item) => (
        <ItemBox item={item} key={item.id} />
      ))}
    </ThemeProvider>
  )
}