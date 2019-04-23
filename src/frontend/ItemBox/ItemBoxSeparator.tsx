import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

import { IItemTheme } from '../Theme';

export const ItemBoxSeparator = () => (
  <hr css={(theme: IItemTheme) => ({
    borderColor: theme.separatorColor,
    margin: '0px 2px',
  })} />
)