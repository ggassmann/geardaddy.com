import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

import { ICalculatedItemLine } from 'src/data/ICalculatedItemLine';
import { IItemTheme } from '../Theme';

interface IItemBoxCalculatedSection {
  calculatedItem: ICalculatedItemLine[];
}

export const ItemBoxCalculatedSection = ({ calculatedItem }: IItemBoxCalculatedSection) => {
  const originSlots: string[] = [];
  const slots = calculatedItem.map((x) => x.changeSlot).reduce((prev, current, index, array) => {
    if(!prev.includes(current)) {
      return [...prev, current]
    } else {
      return prev;
    }
  }, originSlots);
  return (
    <div css={css`
      padding: 6px;
    `}>
      {slots.map((slotName) => (
        <React.Fragment key={slotName}>
          <div
            css={(theme: IItemTheme) => `
              color: ${theme.propertyFontColor}
            `}
          >
            {slotName}
          </div>
          {calculatedItem.filter((line) => line.changeSlot === slotName).map((line, lineIndex) => (
            <span key={`${line.changeStatName}${line.changeSlot}`}>
              <span
                css={css`
                  color: ${line.positive ? 'rgba(51, 255, 119, 1)' : 'rgba(221, 0, 34, 1)'};
                `}
              >
                {line.changeAbsolute > 0 && '+'}{line.changeAbsolute}
                {' '}
                {line.changeStatName}
                {' '}
                ({line.changeRelative}%)
              </span>
              {lineIndex < calculatedItem.length - 1 && <br /> || ''}
            </span>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}