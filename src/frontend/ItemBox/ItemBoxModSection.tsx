import * as React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

import { IItemTheme } from '../Theme';

interface IItemBoxModSection {
  mods: string[];
}

export const ItemBoxModSection = ({ mods }: IItemBoxModSection) => {
  return (
    <p
      css={(theme: IItemTheme) => ({
        color: theme.modFontColor,
        padding: '2px 8px',
        textAlign: 'center',
        margin: '4px',
      })}
    >
      {mods && mods.map((mod, modIndex) => (
        <span key={`${mod}${modIndex}`}>
          {mod}
          {modIndex < mods.length - 1 &&
            <br />
            ||
            ''
          }
        </span>
      ))}
    </p>
  )
}