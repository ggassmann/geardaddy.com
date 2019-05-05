import * as React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

React;

const OptionsCogContainer = styled(Link)`
  flex: 0;
  margin: 0.5rem;

  svg {
    transition: transform 0.3s;
    transform: rotate(0deg) scale(0.9);
  }

  &:hover svg {
    transition: transform 0.15s;
    transform: rotate(30deg) scale(1); 
  }
`;

const HeaderComponent = styled.div`
  position: fixed;
  height: 3rem;
  background-color: white;
  border-bottom: 1px solid black;
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 10000;

  h1 {
    font-size: 2rem;
    line-height: 3rem;
    margin: 0 0.75rem;
    padding: 0;
    flex-shrink: 1;
  }
`;

export const Header = () => {
  return (
    <HeaderComponent>
      <h1><Link to='/'>Gear Daddy</Link></h1>
      <OptionsCogContainer to='/settings'>
        <FontAwesomeIcon icon='cog' size='2x'/>
      </OptionsCogContainer>
    </HeaderComponent>
  )
}