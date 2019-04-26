import {Container, createReduxStore, RCREProvider, Form, FormItem, ES} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import React from 'react';
import {Input} from './components/Input';

describe('FormItem', () => {
    it('basic Form', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container model={'demo'}>
                    <Form name={'test'}>
                        <div>helloworld</div>
                        <FormItem required={true}>
                            <Input name={'username'} />
                        </FormItem>
                        <ES type={'button'}>
                            {({$form}, context) => {
                                return <button disabled={!$form.valid}>Submit</button>;
                            }}
                        </ES>
                    </Form>
                </Container>
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);

        test.setContainer('demo');

        let username = test.getComponentByName('username');
        test.setData(username, 'test');
        let formState = test.getFormState('test');
        expect(formState.valid).toBe(true);

        let button = test.wrapper.find('button');
        expect(button.prop('disabled')).toBe(false);
    });
});