import * as React from 'react';
React;
import styled, { css } from 'styled-components';
import { SettingAddonContainer } from './SettingAddonContainer';

export interface ICheckmarkProps {
  size: string;
  margin: string;
}

const CheckmarkElement = styled.div<ICheckmarkProps>`
  ${({size, margin}) => css`
    display: inline-block;
    transform: rotate(45deg);
    width: calc(${size} * .4 - ${margin});
    height: calc(${size} * .8 - ${margin});
    margin-left: calc(${size} * .4);
    border-bottom: calc(${size} * .2) solid rgba(20, 230, 20, 1);
    border-right: calc(${size} * .2) solid rgba(20, 230, 20, 1);
  `}
`;

export const Checkmark = (props: ICheckmarkProps) => <SettingAddonContainer><CheckmarkElement {...props}/></SettingAddonContainer>