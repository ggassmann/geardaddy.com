import * as React from 'react';

interface IItemBoxModSection {
  mods: string[];
}

export const ItemBoxModSection = ({ mods }: IItemBoxModSection) => {
  return (
    <p>
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