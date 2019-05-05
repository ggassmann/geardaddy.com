import * as React from 'react';
React;
import * as ReactDOM from 'react-dom';
import '@babel/polyfill';

import { App } from './App';

const element = document.createElement('div');
element.id = 'react-root';
document.body.appendChild(element);
ReactDOM.render(<App />, element);