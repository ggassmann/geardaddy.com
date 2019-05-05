import * as React from 'react';
import { Helmet } from 'react-helmet';
import './FontAwesomeLibrary';

import { IDisplayedItem } from '../data/IDisplayedItem';
import { Global } from './Theme';
import { ItemBox } from './components/ItemBox/ItemBox';
import { SettingInput } from './components/Input/SettingInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Header } from './Header';
import styled from 'styled-components';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

const AppContainer = styled.div`
  padding-top: 3.25rem;
`;

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
      <BrowserRouter>
        <Header/>
        <AppContainer>
          <Switch>
            <Route path='/settings'>
              <SettingInput path='filesystem.pathofbuilding.lua_path' />
              <SettingInput path='filesystem.pathofbuilding.builds_path' />
              <SettingInput path='performance.pathofbuilding.processcount' />
              <SettingInput path='server.port' />
              <SettingInput path='solr.port' />
              {items.map((item) => (
                <ItemBox item={item} key={item.id} />
              ))}
            </Route>
          </Switch>
        </AppContainer>
      </BrowserRouter>
    </>
  )
}