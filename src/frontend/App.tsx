import * as React from 'react';
import { Helmet } from 'react-helmet';
import './FontAwesomeLibrary';
import { SettingInput } from './components/Input/SettingInput';
import styled from 'styled-components';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';

import { Header } from './Header';
import { LinkButton } from './components/Button';
import { Container, Row } from './components/Grid';

import { IDisplayedItem } from '../data/IDisplayedItem';
import { Global } from './Theme';
import { ItemBox } from './components/ItemBox/ItemBox';
import PageQueryEdit, { IPageQueryMatchProps } from './pages/PageQueryEdit';
import { IQuery } from 'src/data/IQuery';
import { QueryPreview } from './components/QueryPreview';
import PageQueryResults from 'src/frontend/pages/PageQueryResults';

const AppContainer = styled.div`
  padding-top: 3.25rem;
`;

export const App = () => {
  const [queries, setQueries] = React.useState<IQuery[]>([]);
  React.useEffect(() => {
    (async () => {
      setQueries(await (await fetch(`http://localhost:${window.API_PORT}/api/query/all`)).json());
    })();
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
            <Route exact path='/'/>
            <Route>
              <Container>
                <Link to='/'>Back to Home</Link>
              </Container>
            </Route>
          </Switch>
          <Switch>
            <Route path='/settings'>
              <Container>
                <SettingInput path='filesystem.pathofbuilding.lua_path' />
                <SettingInput path='filesystem.pathofbuilding.builds_path' />
                <SettingInput path='performance.pathofbuilding.processcount' />
                <SettingInput path='server.port' />
                <SettingInput path='solr.port' />
              </Container>
            </Route>
            <Route exact path='/'>
              <Container>
                <Row>
                  <LinkButton to='/query/edit/new'>Create new query</LinkButton>
                </Row>
                <br/><br/>
                <Row>
                  {queries.map((query) => (
                    <QueryPreview query={query} key={query.id}/>
                  ))}
                </Row>
              </Container>
            </Route>
            <Route
              path='/query/edit/:id'
              render={({match}: IPageQueryMatchProps) => <PageQueryEdit id={match.params.id}/>}
            />
            <Route
              path='/query/:id'
              render={({match}: IPageQueryMatchProps) => <PageQueryResults id={match.params.id}/>}
            />
          </Switch>
        </AppContainer>
      </BrowserRouter>
    </>
  )
}