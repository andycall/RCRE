import React from 'react';
import {Input} from 'antd';
import {ES} from 'rcre';

export const ESInput = (props) => (
  <ES name={props.name} debounce={props.debounce} disabled={props.disabled}>{({$data, $name, $value}, context) => (
    <Input
      style={{width: 200, marginRight: 20}}
      value={$value || ''}
      disabled={props.disabled}
      placeholder={'enter username'}
      onBlur={props.onBlur}
      onChange={event => context.container.$setData($name, event.target.value)}
    />
  )}</ES>
);