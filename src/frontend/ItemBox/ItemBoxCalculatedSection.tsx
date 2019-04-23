import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

import { ICalculatedItemLine } from 'src/data/ICalculatedItemLine';

interface IItemBoxCalculatedSection {
  calculatedItem: ICalculatedItemLine[];
}

export const ItemBoxCalculatedSection = ({ calculatedItem }: IItemBoxCalculatedSection) => (
  <div css={css`
    padding: 6px;
  `}>
    {calculatedItem.map((line, lineIndex) => (
      <span key={line.changeStatName}>
        <span
          css={css`
            color: ${line.positive ? 'rgba(51, 255, 119, 1)' : 'rgba(221, 0, 34, 1)'};
          `}
        >
          {line.changeAbsolute}
          {' '}
          {line.changeStatName}
          {' '}
          ({line.changeRelative}%)
        </span>
        {lineIndex < calculatedItem.length - 1 && <br /> || ''}
      </span>
    ))}
  </div>
)