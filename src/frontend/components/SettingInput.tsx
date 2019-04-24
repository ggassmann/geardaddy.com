import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

import { Input } from './Input';

export interface ISettingInputProps {
  path: string;
}

export const SettingInput = ({ path }: ISettingInputProps) => {
  const [content, setContent] = React.useState('');
  React.useEffect(
    () => {
      (async () => {
        setContent((
          await (
            await (
              fetch(`http://localhost:${window.API_PORT}/api/setting/${path}`)
            )
          ).json()
        ).value);
      })()
    },
    []
  );
  return (
    <div>
      <div>
        {path}
      </div>
      <Input value={content} />
    </div>
  )
}