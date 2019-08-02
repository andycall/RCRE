import {Container, createReduxStore, ES, RCREProvider, undoRCREContainerState, createContainerStateHistory, redoRCREContainerState} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import React from 'react';

describe('undo', () => {
    it('undo RCRE_SET_DATA', () => {
        const history = createContainerStateHistory();
        const store = createReduxStore(history);
        let component = (
            <RCREProvider store={store}>
                <Container model={'AAA'}>
                    <ES name={'username'}>
                        {({$value, $name}, {container}) => (
                            <input value={$value || ''} onChange={event => container.$setData($name, $value)}/>
                        )}
                    </ES>
                </Container>
            </RCREProvider>
        );

        let test = new RCRETestUtil(component);
        test.setContainer('AAA');
        expect(history.canUndoContainerState()).toBe(false);
        expect(history.canRedoContainerState()).toBe(false);
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        expect(history.canUndoContainerState()).toBe(true);
        expect(history.canRedoContainerState()).toBe(false);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        undoRCREContainerState(store);
        expect(history.canRedoContainerState()).toBe(true);
        expect(history.canUndoContainerState()).toBe(false);
        expect(test.getContainerState()).toEqual({});
    });

    it('undo RCRE_DELETE_DATA', () => {
        const history = createContainerStateHistory();
        let store = createReduxStore(history);
        const {canUndoContainerState, canRedoContainerState} = history;
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
        expect(canUndoContainerState()).toBe(false);
        expect(canRedoContainerState()).toBe(false);
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        expect(canUndoContainerState()).toBe(true);
        expect(canRedoContainerState()).toBe(false);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        test.setState('hide', true);
        expect(test.getContainerState()).toEqual({hide: true});
        undoRCREContainerState(store);
        expect(canRedoContainerState()).toBe(true);
        expect(canUndoContainerState()).toBe(true);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld',
            hide: true
        });
        undoRCREContainerState(store);
        expect(canUndoContainerState()).toBe(true);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        undoRCREContainerState(store);
        expect(canUndoContainerState()).toBe(false);
        expect(canRedoContainerState()).toBe(true);
    });
});
describe('forward', () => {
    it('FORWARD RCRE_SET_DATA', () => {
        let history = createContainerStateHistory();
        let store = createReduxStore(history);
        let {canRedoContainerState, canUndoContainerState} = history;
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
        expect(canUndoContainerState()).toBe(false);
        expect(canRedoContainerState()).toBe(false);
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({});
        redoRCREContainerState(store);
        expect(canRedoContainerState()).toBe(false);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
    });

    it('forward RCRE_DELETE_DATA', () => {
        let history = createContainerStateHistory();
        let store = createReduxStore(history);
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
        redoRCREContainerState(store);
        expect(history.canRedoContainerState()).toBe(false);
        expect(test.getContainerState()).toEqual({hide: true});
        undoRCREContainerState(store);
        undoRCREContainerState(store);
        expect(test.getContainerState()).toEqual({
            username: 'helloworld'
        });
    });
});