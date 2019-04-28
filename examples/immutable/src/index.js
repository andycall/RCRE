import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, createReduxStore, addEventListener} from 'rcre';
import Counter from './components/Counter';

import "./styles.css";

const store = createReduxStore();

addEventListener('RCRE_SET_DATA', (action, state, prevState) => {
  let name = action.payload.name;
  let value = action.payload.value;
  console.log('Container RCRE_SET_DATA action: name:' + name + ', value: ' + value);

  if (!prevState) {
    return;
  }

  console.log('container equals: ', state.$rcre.container.test === prevState.$rcre.container.test);
  console.log('root equals: ', state.$rcre.container.test.root === prevState.$rcre.container.test.root);
  console.log('A equals: ', state.$rcre.container.test.root.A === prevState.$rcre.container.test.root.A);
  console.log('a equals: ', state.$rcre.container.test.root.A.a === prevState.$rcre.container.test.root.A.a);
  console.log('count equals: ', state.$rcre.container.test.root.A.a.count === prevState.$rcre.container.test.root.A.a.count);
});

function App() {
  return (
    <div className="App">
      <RCREProvider store={store}>
        <Container
          model={'test'}
          data={{
            root: {
              A: {
                a: {
                  count: 0
                }
              }
            }
          }}
        >
          <p>The Immutable test</p>
          <ES name={'root.A.a.count'}>
            {({$value, $name}, context) => (
              <Counter
                value={$value}
                onIncrement={() => {
                  context.container.$setData($name, $value + 1)
                }}
                onDecrement={() => {
                  context.container.$setData($name, $value - 1)
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
