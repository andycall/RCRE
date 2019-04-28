import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, addEventListener} from 'rcre';
import Counter from './components/Counter';

import "./styles.css";

// Add redux middleware to log actions
addEventListener('RCRE_SET_DATA', (action) => {
  let name = action.payload.name;
  let value = action.payload.value;
  console.log('Container RCRE_SET_DATA action: name:' + name + ', value: ' + value);
});

function App() {
  return (
    <div className="App">
      <RCREProvider>
        <Container
          model={'test'}
          data={{
            count: 0
          }}
        >
          <p>The Async Example</p>
          <ES>
            {({$data}, context) => (
              <Counter
                value={$data.count}
                onIncrement={() => {
                  context.container.$setData('count', $data.count + 1)
                }}
                onDecrement={() => {
                  context.container.$setData('count', $data.count - 1)
                }}
              />
            )}
          </ES>
        </Container>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
