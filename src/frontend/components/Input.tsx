import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

export interface IInputProps {
  value: any;
}

export const Input = ({ value }: IInputProps) => {
  return (
    <input value={value} />
  )
}