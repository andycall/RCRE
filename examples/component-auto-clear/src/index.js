import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, addEventListener} from 'rcre';

import "./styles.css";
import {Input} from "./components/Input";

function App() {
  return (
    <div className="App">
      <RCREProvider>
        <Container
          model={'test'}
          data={{
            hideUserName: false
          }}
        >
          <p>Component Will AutoClear When destroy</p>
          <div>
            <ES>{({$data}, context) => {
              if ($data.hideUserName) {
                return null;
              }

              return <Input name={'username'} clearWhenDestory={true} />
            }}</ES>
            <ES>{({$data}, context) => (
              <button onClick={event => context.trigger.execTask('$this', {
                hideUserName: !$data.hideUserName
              })}>{$data.hideUserName ? 'show' : 'hide'}</button>
            )}</ES>
          </div>


          <p>State Value</p>
          <ES>{({$data}) => (
            <div>{JSON.stringify($data)}</div>
          )}</ES>
        </Container>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
