import * as React from 'react';
React;
import styled, { css, keyframes } from 'styled-components';

import { SettingAddonContainer } from './SettingAddonContainer';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export interface ISpinnerProps {
  size: string;
  margin: string;
}

export const SpinnerElement = styled.div<ISpinnerProps>`
  ${({size, margin}) => css`
    border: calc(${size} * .17) solid #f3f3f3;
    border-top: calc(${size} * .17) solid #3498db;
    width: calc(${size} * .8 - ${margin});
    height: calc(${size} * .8 - ${margin});
    border-radius: 50%;
    margin: ${margin};
    animation ${spin} 0.7s linear infinite;
    pointer-events: none;
  `}
`;

export const Spinner = (props: ISpinnerProps) => <SettingAddonContainer><SpinnerElement {...props}/></SettingAddonContainer>