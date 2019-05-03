import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming'
import { Helmet } from 'react-helmet';

import { IDisplayedItem } from '../data/IDisplayedItem';
import { ItemTheme, Global } from './Theme';
import { ItemBox } from './components/ItemBox/ItemBox';
import { SettingInput } from './components/Input/SettingInput';

export const App = () => {
  const [items, setItems] = React.useState<IDisplayedItem[]>([]);
  React.useEffect(() => {
    (async () => {
      setItems(await (await fetch(`http://localhost:${window.API_PORT}/api/items`)).json());
    })();
    return () => {
      console.log('test');
    }
  }, []);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Gear Daddy</title>
      </Helmet>
      <Global />
      <SettingInput path='filesystem.pathofbuilding.lua_path' />
      <SettingInput path='filesystem.pathofbuilding.builds_path' />
      <SettingInput path='performance.pathofbuilding.processcount' />
      <SettingInput path='server.port' />
      <SettingInput path='solr.port' />
      <ThemeProvider theme={ItemTheme}>
        {items.map((item) => (
          <ItemBox item={item} key={item.id} />
        ))}
      </ThemeProvider>
    </>
  )
}