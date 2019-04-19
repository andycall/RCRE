import {
    addEventListener,
    removeEventListener,
    ListenerFnItem,
    removeAllEventListener,
    removeAllEventListenerByEventName
} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import moxios from 'moxios';
import axios from 'axios';

describe('Event', () => {
    beforeEach(() => {
        removeAllEventListener();
        moxios.install(axios);
    });

    afterEach(() => {
        moxios.uninstall(axios);
    });

    it('add logger', () => {
        addEventListener('SET_DATA', (action, state) => {
            expect(action.type).toBe('SET_DATA');
            expect(state.$rcre.container.demo.username).toBe('helloworld');
        });

        let config: any = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');

        test.setData(username, 'helloworld');
    });

    it('async middleware', async () => {
        addEventListener('ASYNC_LOAD_DATA_SUCCESS', (action, state) => {
            expect(action.type).toBe('ASYNC_LOAD_DATA_SUCCESS');
            expect(state.$rcre.container.demo).toMatchSnapshot();
        });

        let config: any = {
            body: [{
                type: 'container',
                model: 'demo',
                dataProvider: [{
                    mode: 'ajax',
                    namespace: 'test',
                    config: {
                        url: '/test',
                        method: 'GET',
                        data: {
                            username: '#ES{$data.username}'
                        },
                        requiredParams: ['username']
                    }
                }],
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };

        await new Promise((resolve) => {

            let test = new RCRETestUtil(config);
            test.setContainer('demo');
            moxios.wait(() => {
                let request = moxios.requests.mostRecent();

                setTimeout(() => {
                    request.respondWith({
                        status: 200,
                        response: {
                            errno: 0,
                            data: 'ok'
                        }
                    }).then(() => {
                        resolve();
                    });
                }, 100);
            });

            let username = test.getComponentByName('username');
            test.setData(username, 'helloworld');
        });
    });

    it('removeEventListener', () => {
        let setDataOne: ListenerFnItem = (action, state) => {
            expect(action.type).toBe('SET_DATA');
            expect(state.$rcre.container.demo.username).toBe('helloworld');
        };

        let setDataTwo: ListenerFnItem = (action, state) => {
            throw new Error('error');
        };

        addEventListener('SET_DATA', setDataOne);
        addEventListener('SET_DATA', setDataTwo);
        removeEventListener('SET_DATA', setDataTwo);

        let config: any = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');

        test.setData(username, 'helloworld');
    });

    it('removeAllEventListenerByEventName', () => {
        addEventListener('SET_DATA', (action, state) => {
            throw new Error('error');
        });
        addEventListener('SET_DATA', (action, state) => {
            throw new Error('error');
        });
        addEventListener('SET_DATA', (action, state) => {
            throw new Error('error');
        });
        addEventListener('SET_DATA', (action, state) => {
            throw new Error('error');
        });
        addEventListener('SET_DATA', (action, state) => {
            throw new Error('error');
        });
        removeAllEventListenerByEventName('SET_DATA');

        let config: any = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');

        test.setData(username, 'helloworld');
    });
});