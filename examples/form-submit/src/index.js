import React from "react";
import ReactDOM from "react-dom";
import {Form} from 'antd';
import {RCREProvider, Container, RCREForm, RCREFormItem, ES} from 'rcre';
import {ESInput} from './components/Input';
import "./styles.css";
import "antd/dist/antd.css";

const FormItem = Form.Item;

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
            <RCREForm
              name={'demo'}
              onSubmit={event => {
                context.trigger.execTask('submitForm', {});
              }}
            >{({$form, $handleSubmit}) => (
              <Form onSubmit={$handleSubmit}>
                <h3>Example Form</h3>
                <RCREFormItem required={true}>{({valid, errmsg}) => {
                  console.log(valid, errmsg);
                  return (
                    <FormItem
                      required={true}
                      help={errmsg}
                      validateStatus={valid ? 'success' : 'error'}
                      label={'UserName'}
                    >
                      <ESInput name={'username'}/>
                    </FormItem>
                  )
                }}</RCREFormItem>
                <button type={'submit'}>Submit</button>
              </Form>
            )}</RCREForm>
          )}</ES>
        </Container>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
