import * as React from 'react';
/** @jsx jsx */
import { css as style, jsx, keyframes } from '@emotion/core'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export interface ISpinnerProps {
  size: string;
  margin: string;
}

export const Spinner = ({size, margin}: ISpinnerProps) => {
  return (
    <div css={style`
      border: calc(${size} * .17) solid #f3f3f3;
      border-top: calc(${size} * .17) solid #3498db;
      width: calc(${size} * .8 - ${margin});
      height: calc(${size} * .8 - ${margin});
      border-radius: 50%;
      margin: ${margin};
      animation ${spin} 2s linear infinite;
      pointer-events: none;
    `}/>
  )
}