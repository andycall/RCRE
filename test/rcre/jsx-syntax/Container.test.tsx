import {RCRETestUtil} from 'rcre-test-tools';
import React from 'react';
import {createReduxStore, RCREProvider, Container, ES} from 'rcre';
import {Input} from "./components/Input";

describe('jsx syntax', function () {
    it('div', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container
                    model={'demo'}
                    data={{
                        username: 'helloworld'
                    }}
                >
                    <div>helloworld</div>
                </Container>
            </RCREProvider>
        );

        // @ts-ignore
        let test = new RCRETestUtil(component);
        test.setContainer('demo');
        let state = test.getState();
        expect(state).toEqual({
            'container': {'__TMP_MODEL__DO_NO_USE_IT': {}, 'demo': {'username': 'helloworld'}},
            'form': {},
            'trigger': {}
        });

        let container = test.getContainer('demo');
        expect(container.text()).toBe('helloworld');
    });

    it('container props inherit', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container
                    model={'demo'}
                    data={{
                        username: 'HELLOWORLD'
                    }}
                >
                    <div>
                        <span>helloworld</span>
                        <Container
                            model={'child'}
                            props={{
                                username: runTime => runTime.$parent.username.toLowerCase()
                            }}
                            export={{
                                username: runTime => runTime.$data.username.toUpperCase()
                            }}
                        >
                            <span>child</span>
                        </Container>
                    </div>
                </Container>
            </RCREProvider>
        );
        let test = new RCRETestUtil(component);
        let state = test.getState();

        expect(state.container.demo).toEqual({
            username: 'HELLOWORLD'
        });
        expect(state.container.child).toEqual({
            username: 'helloworld'
        });

        test.unmount();
    });

    it('Use ES function to get runTime', () => {
        const store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container
                    model={'demo'}
                    data={{
                        name: 'helloworld'
                    }}
                >
                    <div>
                        <div>export: <ES>{(runTime) => runTime.$data.name}</ES></div>
                        <ES>
                            {runTime => {
                                return (
                                    <div title={runTime.$data.name}>
                                        {runTime.$data.name}
                                    </div>
                                );
                            }}
                        </ES>
                    </div>
                </Container>
            </RCREProvider>
        );
        let test = new RCRETestUtil(component);
        let html = test.wrapper.html();
        expect(html).toEqual('<div><div>export: helloworld</div><div title="helloworld">helloworld</div></div>');
        test.unmount();
    });

    it('Can use context from ES component to set value directly', () => {
        const store = createReduxStore();

        let component = (
            <RCREProvider store={store}>
                <Container
                    model={'demo'}
                    data={{
                        username: 'helloworld'
                    }}
                >
                    <div>
                        <div>Helloworld: <ES>{(runTime) => runTime.$data.username}</ES></div>
                        <ES name={'username'}>
                            {(runTime, context) => {
                                return (
                                    <input
                                        value={runTime.$value}
                                        onChange={event => {
                                            context.container.$setData(runTime.$name, event.target.value);
                                        }}
                                    />
                                );
                            }}
                        </ES>
                    </div>
                </Container>
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);
        let input = test.wrapper.find('input');
        input.simulate('change', {
            target: {
                value: 'abc'
            }
        });

        test.setContainer('demo');
        let state = test.getContainerState();
        expect(state.username).toBe('abc');
    });

    it('Can exec DataCustomer from ES Component directly', async () => {
        const store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container
                    model={'demo'}
                    data={{
                        username: 'abc'
                    }}
                >
                    <div><ES name={'username'}>{({$data}) => $data.username}</ES></div>
                    <ES type={'button'}>
                        {(runTime, context) => {
                            return (
                                <button
                                    onClick={async (event) => {
                                        await context.trigger.execTask('$this', {
                                            username: 'helloworld'
                                        });
                                    }}
                                >
                                    click
                                </button>
                            );
                        }}
                    </ES>
                </Container>
                <Container model={'other'} />
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);
        test.setContainer('demo');

        let button = test.getComponentByType('button');
        await test.execTask(button, '$this', {
            username: 'helloworld'
        });
        let username = test.getComponentByName('username');
        expect(username.text()).toBe('helloworld');

        let state = test.getContainerState();
        expect(state.username).toBe('helloworld');
    });

    it('[export]: inner container can export value using ExpressionString', () => {
        let store = createReduxStore();

        let component = (
            <RCREProvider store={store}>
                <Container model={'exportModel'}>
                    <div>export: <ES>{({$data}) => $data.name}</ES></div>
                    <Container
                        model={'innerModel'}
                        export={{
                            name: ({$data}) => $data.subName + $data.anoSubName
                        }}
                    >
                        <Input name={'subName'} />
                        <Input name={'anoSubName'} />
                    </Container>
                </Container>
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);
        let inputs = test.wrapper.find('input');
        let firstInput = inputs.at(0);
        let secondInput = inputs.at(1);

        firstInput.simulate('change', {
            target: {
                value: '1'
            }
        });

        secondInput.simulate('change', {
            target: {
                value: '2'
            }
        });

        let state = test.getState();
        let container = state.container;

        expect(container.exportModel.name).toBe('12');
        expect(container.innerModel.subName).toBe('1');
        expect(container.innerModel.anoSubName).toBe('2');
    });
});