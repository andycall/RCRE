import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, createReduxStore} from 'rcre';
import {Button} from 'antd';

import "./styles.css";
import "antd/dist/antd.css";
import {ESInput} from "./components/Input";
import {showNotice} from "./tasks/showNotice";
import {asyncRequest} from "./tasks/async";

const store = createReduxStore();

function App() {
  return (
    <div className="App">
      <RCREProvider store={store}>
        <h2>The task group is able to execute a series of tasks continuously.</h2>
        <p>Task can be async or sync, if a task is async, task group will waiting for the task to be resolved</p>
        <p>anything pure function can be a task, this demo shows how to write a custom async task</p>


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
                }, {
                  name: 'showNotice',
                  func: showNotice
                }, {
                  name: 'asyncRequest',
                  func: asyncRequest
                }],
                groups: [{
                  name: 'passValueAndNotice',
                  steps: ['sendValueToDemo2', 'asyncRequest', 'showNotice']
                }]
              }}
            >
              <span>UserName: </span>
              <ESInput name={'username'}/>
              <div>demo1 state value: <ES>{({$data}) => <span>{JSON.stringify($data)}</span>}</ES></div>

              <ES>{({$data}, {trigger}) => (
                <Button onClick={event => trigger.execTask('passValueAndNotice', {
                  username: ({$data}) => $data.username
                })}>send username to demo2</Button>
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
              <ESInput name={'username'} />
              <div>demo1 state value: <ES>{({$data}) => <span>{JSON.stringify($data)}</span>}</ES></div>
              <ES>{({$data}, context) => (
                <Button onClick={event => context.trigger.execTask('sendValueToDemo1', {
                  username: ({$data}) => $data.username
                })}>send username to demo1</Button>
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
