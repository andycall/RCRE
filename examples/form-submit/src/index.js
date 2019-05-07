import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, Form, FormItem, ES} from 'rcre';
import {ESInput} from './components/Input';

import "./styles.css";

function App() {
  return (
    <div className="App">
      <RCREProvider>
        <Container
          model={'test'}
          data={{
            count: 0
          }}
          task={{
            tasks: [{
              name: 'submitForm',
              mode: 'request',
              config: {
                url: '/test',
                method: 'POST',
                data: {
                  username: ({$data}) => $data.username
                }
              }
            }]
          }}
        >
          <ES>{({$data}, context) => (
            <Form
              name={'demo'}
              onSubmit={event => {
                context.trigger.execTask('submitForm', {});
              }}
            >
              <h3>Example Form</h3>
              <FormItem required={true}>
                <span>UserName: </span>
                <ESInput name={'username'}/>
              </FormItem>
              <button type={'submit'}>Submit</button>
            </Form>
          )}</ES>
        </Container>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
