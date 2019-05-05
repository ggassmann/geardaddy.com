import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
React;

import { IQuery } from 'src/data/IQuery';

interface IQueryPreviewProps {
  query: IQuery,
}

const QueryPreviewComponent = styled(Link)`
  width: 220px;
  height: 220px;
  display: block;

  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  transform: translateY(0);

  &:hover {
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    transform: translateY(-0.3rem);
    transition: 0.15s;
  }

  h1 {
    padding: 4px;
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.6);
  }
`;

export const QueryPreview = ({query}: IQueryPreviewProps) => {
  return (
    <QueryPreviewComponent to={`/query/${query.id}`}>
      <h1>{query.name}</h1>
    </QueryPreviewComponent>
  )
}