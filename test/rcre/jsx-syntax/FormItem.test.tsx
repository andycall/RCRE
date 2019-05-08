import {Container, createReduxStore, RCREProvider, RCREForm, RCREFormItem, ES} from 'rcre';
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
                    <RCREForm name={'test'}>{({$form, $handleSubmit}) => (
                        <form onSubmit={$handleSubmit}>
                            <div>helloworld</div>
                            <RCREFormItem required={true}>
                                <Input name={'username'}/>
                            </RCREFormItem>
                            <button disabled={!$form.valid}>Submit</button>
                            ;
                        </form>
                    )}</RCREForm>
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
                    <RCREForm name={'test'}>{() => (
                        <div>
                            <ES>{({$data}) => (
                                <RCREFormItem required={$data.required}>
                                    <Input name={'username'} />
                                </RCREFormItem>
                            )}</ES>
                            <Checkbox name={'required'}/>
                        </div>
                    )}</RCREForm>
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
                    <RCREForm name={'test'}>{() => (
                        <div>
                            <ES>{({$data}) => (
                                <RCREFormItem required={true} rules={[{maxLength: 1}]}>
                                    <Input disabled={$data.disabled} name={'username'} />
                                </RCREFormItem>
                            )}</ES>
                            <Checkbox name={'disabled'}/>
                        </div>
                    )}</RCREForm>
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