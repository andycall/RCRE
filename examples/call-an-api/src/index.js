import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, DataCustomer} from 'rcre';

import "./styles.css";

DataCustomer.errorHandler = (error) => {
  console.error('request failed', error);
};

function App() {
  return (
    <div>
      <RCREProvider>
        <Container
          model={'test'}
          task={{
            tasks: [{
              name: 'getUserRepo',
              mode: 'request',
              config: {
                url: ({$data}) => `https://api.github.com/repos/${$data.user_repo}`,
                method: 'GET',
                export: {
                  userName: ({$output}) => $output.owner.login,
                  star: ({$output}) => $output.stargazers_count
                }
              }
            }]
          }}
        >
          <p>Github Repo Star</p>
          <ES name={'user_repo'}>{({$value, $name}, context) => (
            <input
              value={$value || ''}
              placeholder={'user/repo'}
              onChange={event =>
                context.container.$setData($name, event.target.value)
              }
            />
          )}</ES>
          <ES type={'button'}>{({$value, $name}, context) => (
            <button onClick={event => context.trigger.execTask('getUserRepo', {})}>search</button>
          )}</ES>

          <ES>{({$data}) => {
            if ($data.$loading) {
              return <div>loading...</div>;
            }

            if ($data.$error) {
              return <div style={{color: 'red'}}>{$data.$error.message}</div>
            }

            return (
              <ul>
                <li>UserName: {$data.userName}</li>
                <li>Star: {$data.star}</li>
              </ul>
            )
          }}</ES>
        </Container>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
