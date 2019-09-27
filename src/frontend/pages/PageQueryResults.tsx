import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router';
import uuidv4 from 'uuid/v4';

import { Container } from '../components/Grid';
import { Input } from '../components/Input/Input';
import { IQuery } from 'src/data/IQuery';
import { Button } from '../components/Button';
import { IDisplayedItem } from 'src/data/IDisplayedItem';
import { ItemBox } from 'src/frontend/components/ItemBox/ItemBox';
import { Link } from 'react-router-dom';
React;

export interface IPageQueryProps {
  id: string;
}
export interface IPageQueryMatchProps extends RouteComponentProps<IPageQueryProps> {}

export default ({id}: IPageQueryProps) => {
  if(id === 'new') {
    const newId = uuidv4();
    return <Redirect to={`/query/edit/${newId}`}/>
  }
  const [itemResults, setItemResults] = React.useState<IDisplayedItem[]>([]);
  const [itemResultsLoaded, setItemResultsLoaded] = React.useState<boolean>();
  const [queryInfo, setQueryInfo] = React.useState<IQuery>({id});
  React.useEffect(() => {
    (async () => {
      setItemResultsLoaded(false);
      setQueryInfo((await (await fetch(`http://localhost:${window.API_PORT}/api/query/single/${id}`)).json()).value);
      setItemResults((await (await fetch(`http://localhost:${window.API_PORT}/api/query/items/${id}`)).json()).value);
      setItemResultsLoaded(true);
    })();
  }, [id]);

  if(!itemResultsLoaded) {
    return null;
  }

  return (
    <Container>
      <h1>{queryInfo.name}</h1>
      <Link to={`/query/edit/${queryInfo.id}`}>
        Edit Query Parameters
      </Link>
      {itemResults.map((item) => (
        <ItemBox item={item} key={item.id} />
      ))}
    </Container>
  )
}