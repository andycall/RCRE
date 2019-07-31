import {Container, createReduxStore, ES, forwardRCREContainerState, RCREProvider, undoRCREContainerState} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import React from 'react';

describe('undo', () => {
    it('undo RCRE_SET_DATA', () => {
        const store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container model={'demo'}>
                    <ES name={'username'}>
                        {({$value, $name}, {container}) => (
                            <input value={$value || ''} onChange={event => container.$setData($name, $value)}/>
                        )}
                    </ES>
                </Container>
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        console.log(test.getContainerState());
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({});
    });

    it('undo RCRE_DELETE_DATA', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container model={'demo'}>
                    <ES>{({$data}) => {
                        if ($data.hide) {
                            return <div/>;
                        }

                        return (
                            <ES name={'username'} clearWhenDestory={true}>
                                {({$value, $name}, {container}) => (
                                    <input value={$value || ''} onChange={event => container.$setData($name, $value)}/>
                                )}
                            </ES>
                        );
                    }}</ES>
                </Container>
            </RCREProvider>
        );
        let test = new RCRETestUtil(component);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        test.setState('hide', true);
        expect(test.getContainerState()).toEqual({hide: true});
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld',
            hide: true
        });
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
    });
});
describe('forward', () => {
    it('FORWARD RCRE_SET_DATA', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container model={'demo'}>
                    <ES>{({$data}) => {
                        if ($data.hide) {
                            return <div/>;
                        }

                        return (
                            <ES name={'username'} clearWhenDestory={true}>
                                {({$value, $name}, {container}) => (
                                    <input value={$value || ''} onChange={event => container.$setData($name, $value)}/>
                                )}
                            </ES>
                        );
                    }}</ES>
                </Container>
            </RCREProvider>
        );
        let test = new RCRETestUtil(component);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({});
        forwardRCREContainerState(store);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
    });

    it('forward RCRE_DELETE_DATA', () => {
        let store = createReduxStore();
        let component = (
            <RCREProvider store={store}>
                <Container model={'demo'}>
                    <ES>{({$data}) => {
                        if ($data.hide) {
                            return <div/>;
                        }

                        return (
                            <ES name={'username'} clearWhenDestory={true}>
                                {({$value, $name}, {container}) => (
                                    <input value={$value || ''} onChange={event => container.$setData($name, $value)}/>
                                )}
                            </ES>
                        );
                    }}</ES>
                </Container>
            </RCREProvider>
        );
        let test = new RCRETestUtil(component);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        test.setState('hide', true);
        expect(test.getContainerState()).toEqual({hide: true});
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld',
            hide: true
        });
        forwardRCREContainerState(store);
        expect(test.getContainerState()).toEqual({hide: true});
        undoRCREContainerState(store);
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
    });
});