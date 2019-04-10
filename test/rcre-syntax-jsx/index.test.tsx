import {RCRETestUtil} from 'rcre-test-tools';
import React from 'react';
import {createReduxStore, RCREProvider} from 'rcre';
import {Container} from 'rcre-syntax-jsx';

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
});