import React from 'react';
import {Select} from 'antd';
import {ES} from 'rcre';

export const ESSelect = (props) => (
  <ES name={props.name} defaultValue={props.defaultValue}>{({$name, $value}, context) => (
    <Select
      allowClear={true}
      style={{width: '60%', display: 'inline-block'}}
      value={$value}
      onChange={val => context.container.$setData($name, val)}
    >
      {props.options.map(op => (
        <Select.Option key={op.label} value={op.value}>{op.value}</Select.Option>
      ))}
    </Select>
  )}</ES>
);