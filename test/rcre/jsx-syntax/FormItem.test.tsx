import {Container, createReduxStore, RCREProvider, Form, FormItem, ES} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import React from 'react';
import {Input} from './components/Input';
import {Checkbox} from './components/Checkbox';

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

        let formState = test.getFormState('test');
        expect(formState.valid).toBe(false);

        let username = test.getComponentByName('username');
        test.setData(username, 'test');
        formState = test.getFormState('test');
        expect(formState.valid).toBe(true);

        let button = test.wrapper.find('button');
        expect(button.prop('disabled')).toBe(false);
    });

    it('required change', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container model={'demo'} data={{required: true}}>
                    <Form name={'test'}>
                        <ES>{({$data}) => (
                            <FormItem required={$data.required}>
                                <Input name={'username'} />
                            </FormItem>
                        )}</ES>
                        <Checkbox name={'required'}/>
                    </Form>
                </Container>
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);
        test.setContainer('demo');

        let formState = test.getFormState('test');
        expect(formState.valid).toBe(false);

        let checkbox = test.getComponentByType('checkbox');
        test.setData(checkbox, false);

        formState = test.getFormState('test');
        expect(formState.valid).toBe(true);

        test.setData(checkbox, true);
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');

        formState = test.getFormState('test');
        expect(formState.valid).toBe(true);
    });

    it('disabled change', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container model={'demo'} data={{disabled: false}}>
                    <Form name={'test'}>
                        <ES>{({$data}) => (
                            <FormItem required={true} rules={[{maxLength: 1}]}>
                                <Input disabled={$data.disabled} name={'username'} />
                            </FormItem>
                        )}</ES>
                        <Checkbox name={'disabled'}/>
                    </Form>
                </Container>
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);
        test.setContainer('demo');

        let formState = test.getFormState('test');
        expect(formState.valid).toBe(false);

        let username = test.getComponentByName('username');

        test.setData(username, 'h');
        formState = test.getFormState('test');
        expect(formState.valid).toBe(true);

        test.setData(username, 'helloworld');
        formState = test.getFormState('test');
        expect(formState.valid).toBe(false);

        let checkbox = test.getComponentByType('checkbox');
        test.setData(checkbox, true);

        formState = test.getFormState('test');
        expect(formState.valid).toBe(true);
    });
});