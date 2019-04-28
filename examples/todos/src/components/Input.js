import React from 'react';
import {ES} from 'rcre';

export const Input = props => (
  // Use debounce prop to temporary cache input's value for 500 second
  <ES name={props.name}
      debounce={100}>
    {(runTime, context) => {
      return <input
        value={runTime.$value}
        onChange={event => context.container.$setData(runTime.$name, event.target.value)}
      />
    }}
  </ES>
);