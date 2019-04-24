import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

export interface ICheckmarkProps {
  size: string;
  margin: string;
}

export const Checkmark = ({size, margin}: ICheckmarkProps) => {
  return (
    <div css={{
      display: 'inline-block',
      transform: 'rotate(45deg)',
      width: `calc(${size} * .4 - ${margin})`,
      height: `calc(${size} * .8 - ${margin})`,
      marginLeft: `calc(${size} * .4)`,
      borderBottom: `calc(${size} * .2) solid rgba(20, 230, 20, 1)`,
      borderRight: `calc(${size} * .2) solid rgba(20, 230, 20, 1)`,
    }}/>
  )
}