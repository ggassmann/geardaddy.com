import * as React from 'react';
import styled, {css} from 'styled-components';
React;

export interface IInputProps {
  value: any;
  before?: () => any,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

const InputContainer = styled.div`
  margin: 2px 10px;
  height: 1.4rem;
  display: flex;
`;

const InputElementContainer = styled.label`
  display: block;
  background-color: rgba(245, 245, 245, 1);
  border-bottom: 1px solid black;
  display: flex;
  flex-shrink: 1;
  flex-basis: 500px;
`;

const InputAddonContainer = styled.div`
  flex: 0;
`;

const InputElement = styled.input<IInputProps>`
  border: transparent;
  padding: 0.2rem;
  background: none;
  width: 100%;
`;

export const Input = ({ value, before, onChange }: IInputProps) => {
  return (
    <InputContainer>
      <InputElementContainer>
        {before && 
          <InputAddonContainer>
            {before()}
          </InputAddonContainer>
        }
        <InputElement
          value={value || ''}
          onChange={onChange}
          before={before}
        />
      </InputElementContainer>
    </InputContainer>
  )
}