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
        <h2>Task can do anything, it is designed to handle specific interactions, data passing and processing</h2>

        <p>The following built-in tasks provided by RCRE are used to accomplish the following tasks.</p>
        <ul>
          <li>Send value to a container</li>
          <li>Send A HTTP request</li>
        </ul>

        <div className={'container-inherit'}>
          <h3>This demo shows how to send value to a sibling container without parent container</h3>
          <div className={'demo1'}>
            <div>demo 1 Container</div>
            <Container
              model={'demo1'}
              task={{
                tasks: [{
                  mode: 'pass',
                  name: 'sendValueToDemo2',
                  config: {
                    model: 'demo2',
                    assign: {
                      username: ({$trigger}) => $trigger.sendValueToDemo2.username
                    }
                  }
                }]
              }}
            >
              <span>UserName: </span>
              <Input name={'username'}/>
              <div>demo1 state value: <ES>{({$data}) => <span>{JSON.stringify($data)}</span>}</ES></div>

              <ES>{({$data}, context) => (
                <button onClick={event => context.trigger.execTask('sendValueToDemo2', {
                  username: ({$data}) => $data.username
                })}>send username to demo2</button>
              )}</ES>

            </Container>
          </div>
          <div className={'demo2'}>
            <Container
              model={'demo2'}
              task={{
                tasks: [{
                  mode: 'pass',
                  name: 'sendValueToDemo1',
                  config: {
                    model: 'demo1',
                    assign: {
                      username: ({$trigger}) => $trigger.sendValueToDemo1.username
                    }
                  }
                }]
              }}
            >
              <span>UserName: </span>
              <Input name={'username'} />
              <div>demo1 state value: <ES>{({$data}) => <span>{JSON.stringify($data)}</span>}</ES></div>
              <ES>{({$data}, context) => (
                <button onClick={event => context.trigger.execTask('sendValueToDemo1', {
                  username: ({$data}) => $data.username
                })}>send username to demo1</button>
              )}</ES>
            </Container>
          </div>
        </div>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
