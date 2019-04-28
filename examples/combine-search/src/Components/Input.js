import React from 'react';
import {Input} from 'antd';
import {ES} from 'rcre';

export const ESInput = (props) => (
  <ES name={props.name} debounce={500}>{({$data, $name, $value}, context) => (
    <Input
      style={{width: 200, marginRight: 20}}
      value={$value || ''}
      placeholder={'enter username'}
      onChange={event => context.container.$setData($name, event.target.value)}
    />
  )}</ES>
);