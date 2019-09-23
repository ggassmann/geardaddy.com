import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router';
import uuidv4 from 'uuid/v4';

import { Container } from '../components/Grid';
import { Input } from '../components/Input/Input';
import { IQuery } from 'src/data/IQuery';
import { Button } from '../components/Button';
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
  const [queryInfo, setQueryInfo] = React.useState<IQuery>({id});
  const [queryLoaded, setQueryLoaded] = React.useState<boolean>(false);
  React.useEffect(() => {
    (async () => {
      setQueryLoaded(false);
      setQueryInfo((await (await fetch(`http://localhost:${window.API_PORT}/api/query/single/${id}`)).json()).value);
      setQueryLoaded(true);
    })();
  }, [id]);

  const submitQuery = async () => {
    const submitResults = (await (await fetch(`http://localhost:${window.API_PORT}/api/query/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queryInfo
      })
    })).json());

    console.log(submitResults);
  }

  console.log(queryInfo);

  if(!queryLoaded) {
    return null;
  }
  
  return (
    <Container>
      <div>Query Name</div>
      <Input
        value={queryInfo.name || ''}
        onChange={(e) => setQueryInfo(Object.assign({}, queryInfo, {name: e.target.value}))}
      />
      <Button
        onClick={submitQuery}
      >
        {queryInfo.new &&
          'Create New Query and Start'
        ||
          'Update Query and Start'
        }
      </Button>
    </Container>
  )
}