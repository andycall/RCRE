import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, createReduxStore} from 'rcre';

import "./styles.css";
import {Input} from "./components/Input";

const store = createReduxStore();

function App() {
  return (
    <div className="App">
      <RCREProvider store={store}>
        <h2>There are two ways to make cross container assignment</h2>

        <ul>
          <li>Use Container Inherit</li>
          <li>Use Pass Task</li>
        </ul>

        <div className={'container-inherit'}>
          <h3>Use Container Inherit to communicate between parent and child container</h3>
          <Container model={'root'} data={{username: 'the root name'}}>
            <div>the value of root container <ES>{({$data}) => <span>{JSON.stringify($data)}</span>}</ES></div>

            <div className={'demo1'}>
              <div>demo 1 Container</div>
              <Container
                model={'demo1'}
                props={{
                  username: ({$parent}) => $parent.username.toUpperCase()
                }}
              >
                <div>Child container can use <b>props</b> property to inherit value from parent container</div>
                <span>UserName: </span>
                <Input name={'username'}/>

                <div>Components in the same container will share the same name</div>
                <Input name={'username'}/>
                <div>demo1 state value: <ES>{({$data}) => <span>{JSON.stringify($data)}</span>}</ES></div>
              </Container>
            </div>
            <div className={'demo2'}>
              <div>demo 2 Container</div>
              <Container
                model={'demo2'}
                data={{username: ''}}
                props={{
                  username: ({$parent}) => $parent.username
                }}
                export={{
                  username: ({$data}) => $data.username
                }}
              >
                <div>Child container can use <b>export</b> property to send child value to parent</div>
                <div>When using both export and props, child will always keep sync with parent</div>
                <span>UserName: </span>
                <Input name={'username'} />
                <div>demo1 state value: <ES>{({$data}) => <span>{JSON.stringify($data)}</span>}</ES></div>
              </Container>
            </div>
          </Container>
        </div>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
