import * as React from 'react';

import { Input } from './Input';
import { Spinner } from './Spinner';
import { Checkmark } from './Checkmark';

export interface ISettingInputProps {
  path: string;
}

export const SettingInput = ({ path }: ISettingInputProps) => {
  const [content, setContent] = React.useState('');
  const [fetchingContent, setFetchingContent] = React.useState(true);
  const [groupingInput, setGroupingInput] = React.useState(false);
  const [pushingContent, setPushingContent] = React.useState(false);
  const [groupingInputTimeout, setGroupingInputTimeout] = React.useState<number|null>(null);

  React.useEffect(
    () => {
      (async () => {
        setFetchingContent(true);
        setContent((
          await (
            await (
              fetch(`http://localhost:${window.API_PORT}/api/setting/${path}`)
            )
          ).json()
        ).value);
        setFetchingContent(false);
      })()
    },
    []
  );
  let before = () => <Checkmark size='1.2rem' margin='0.1rem'/>;
  if(fetchingContent || groupingInput || pushingContent) {
    before = () => <Spinner size='1.2rem' margin='0.1rem'/>;
  }
  return (
    <div>
      <div>
        {path}
      </div>
      <Input
        value={content} 
        before={before}
        onChange={(e) => {
          const value = e.target.value;
          setContent(value);
          setGroupingInput(true);
          if(groupingInputTimeout) {
            clearTimeout(groupingInputTimeout);
          }
          setGroupingInputTimeout(setTimeout(async () => {
            setPushingContent(true);
            setGroupingInput(false);
            const results = await (
              await (
                fetch(encodeURI(`http://localhost:${window.API_PORT}/api/setting/${path}/${value}`))
              )
            ).json()
            console.log(results);
            setPushingContent(false);
          }, 1000) as unknown as number)
        }}
      />
    </div>
  )
}