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
  const [buildsList, setBuildsList] = React.useState<string[]>([]);
  const [optionsLoaded, setOptionsLoaded] = React.useState<boolean>(false);
  React.useEffect(() => {
    (async () => {
      setOptionsLoaded(false);
      setQueryInfo((await (await fetch(`http://localhost:${window.API_PORT}/api/query/single/${id}`)).json()).value);
      setBuildsList((await (await fetch(`http://localhost:${window.API_PORT}/api/builds/all`)).json()).value);
      setOptionsLoaded(true);
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

  if(!optionsLoaded) {
    return null;
  }
  
  return (
    <Container>
      <div>Query Name</div>
      <Input
        value={queryInfo.name || ''}
        onChange={(e) => setQueryInfo(Object.assign({}, queryInfo, {name: e.target.value}))}
      />
      <select
        value={queryInfo.build || 'no_build_selected'}
        onChange={(e) => setQueryInfo(Object.assign({}, queryInfo, {build: e.target.value}))}
      >
        <option value={'no_build_selected'}>Select a Build</option>
        {buildsList.map((build) => (
          <option key={build} value={build}>
            {build}
          </option>
        ))}
      </select>
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