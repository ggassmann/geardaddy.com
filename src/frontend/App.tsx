import * as React from 'react';
import { Helmet } from 'react-helmet';

import { IDisplayedItem } from '../data/IDisplayedItem';
import { Global } from './Theme';
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
      <h1>Gear Daddy</h1>
      <SettingInput path='filesystem.pathofbuilding.lua_path' />
      <SettingInput path='filesystem.pathofbuilding.builds_path' />
      <SettingInput path='performance.pathofbuilding.processcount' />
      <SettingInput path='server.port' />
      <SettingInput path='solr.port' />
      {items.map((item) => (
        <ItemBox item={item} key={item.id} />
      ))}
    </>
  )
}