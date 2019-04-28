import React from 'react';
import {ES} from 'rcre';

export const Input = (props) => (
  <ES {...props}>{({$value, $name}, context) => (
    <input value={$value} onChange={event => context.container.$setData($name, event.target.value)} />
  )}</ES>
);