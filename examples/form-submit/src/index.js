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
              onSubmit={(event, data) => {
                console.log(data);
                event.preventDefault();
                context.trigger.execTask('submitForm', data);
              }}
            >{({$form, $handleSubmit}) => (
              <Form onSubmit={$handleSubmit}>
                <h3>Example Form</h3>
                <RCREFormItem
                  required={true}
                  apiRule={{
                    url: ({$args}) => 'https://api.github.com/users/' + $args.value,
                    method: 'GET',
                    validate: ({$output}) => $output
                  }}
                >{({valid, errmsg, validating}, {$handleBlur}) => {
                  console.log(`valid: ${valid}, errmsg: ${errmsg}, validating: ${validating}`);
                  return (
                    <FormItem
                      required={true}
                      help={errmsg}
                      hasFeedback={true}
                      validateStatus={validating ? 'validating' : (valid ? 'success' : 'error')}
                      label={'UserName'}
                    >
                      <ESInput name={'username'} onBlur={$handleBlur} />
                    </FormItem>
                  )
                }}</RCREFormItem>
                <RCREFormItem required={true}>{({valid, errmsg}, {$handleBlur}) => {
                  return (
                    <FormItem
                      required={true}
                      help={errmsg}
                      validateStatus={valid ? 'success' : 'error'}
                      label={'PassWord'}
                    >
                      <ESInput name={'password'} disabled={true} onBlur={$handleBlur} />
                    </FormItem>
                  )
                }}</RCREFormItem>
                <button type={'submit'} disabled={!$form.valid}>Submit</button>
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
