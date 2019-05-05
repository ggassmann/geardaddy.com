import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Button = styled.button`
  display: inline-block;
  background-color: #2196f3;
  color: #fff;
  border-radius: 0.4rem;
  border: none;
  padding: 0.5rem;
  font-size: 1.25rem;
  text-decoration: none;

  box-shadow: 0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12);

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    background-color: #1976d2;
  }

  &:active {
    box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
    background-color: #2497f5;
  }
`;

export const LinkButton = Button.withComponent(Link);