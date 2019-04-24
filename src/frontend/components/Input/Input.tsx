import * as React from 'react';
React;
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

export interface IInputProps {
  value: any;
  before: () => any,
  beforeSize: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

export const Input = ({ value, before, beforeSize, onChange }: IInputProps) => {
  return (
    <div css={{
      width: '500px',
      margin: '2px 10px',
      position: 'relative',
      height: '1.4rem',
    }}>
      {before && 
        <div css={{
          position: 'relative',
          zIndex: 600,
          pointerEvents: 'none',
        }}>
          {before()}
        </div>
      }
      <input
        value={value || ''}
        onChange={onChange}
        css={{
          border: 'transparent',
          borderBottom: '1px solid black',
          backgroundColor: 'rgba(245, 245, 245, 1)',
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: 500,
          padding: '0.2rem',
          paddingLeft: `${beforeSize || 0}`,
        }}
      />
    </div>
  )
}