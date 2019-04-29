import React from 'react';
import {ES} from 'rcre';
import {Input} from 'antd';

export const ESInput = (props) => (
  <ES {...props}>{({$value, $name}, context) => (
    <Input
      value={$value || ''}
      onChange={event => context.container.$setData($name, event.target.value)}
      style={{width: 200}}
    />
  )}</ES>
);