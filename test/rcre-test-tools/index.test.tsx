import {RCRETestUtil} from 'rcre-test-tools';

describe('rcre-test-tools', () => {
    it('constructor', () => {
        let config = {
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
        expect(test.config).toBe(config);
    });

    it('unmount', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        expect(test.getState().container.demo.username).toBe('helloworld');
        test.unmount();
        expect(test.store).toBe(null);
    });

    it('getComponentByName', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        expect(username.name()).toBe('RCREConnect(input)');
    });

    it('getComponentByType', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [{
                    type: 'text',
                    text: 'a'
                }, {
                    type: 'text',
                    text: 'b'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let text1 = test.getComponentByType('text');
        let text2 = test.getComponentByType('text', 1);
        expect(text1.text()).toBe('a');
        expect(text2.text()).toBe('b');
    });

    it('componentToJSON', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        expect(test.componentToJSON(username).type).toBe('input');
    });

    it('setData', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'abc');
        let state = test.getContainerState();
        expect(state.username).toBe('abc');
    });

    it('simulate', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [{
                    type: 'input',
                    name: 'username'
                }, {
                    type: 'button',
                    text: 'click',
                    trigger: [{
                        event: 'onClick',
                        targetCustomer: '$this',
                        params: {
                            username: 'abc'
                        }
                    }]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');
        let state = test.getContainerState();
        expect(state.username).toBe('abc');
    });

    it('getComponentFormStatus', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'input',
                        name: 'badUsername'
                    },
                    {
                        type: 'form',
                        name: 'basicForm',
                        children: [{
                            type: 'input',
                            name: 'godUser'
                        }]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let badUsername = test.getComponentByName('badUsername');
        let godUser = test.getComponentByName('godUser');

        expect(test.getComponentFormStatus(badUsername)).toBe(null);
        expect(test.getComponentFormStatus(godUser)).toEqual({
            name: 'basicForm',
            valid: false,
            validateFirst: false,
            clearAfterSubmit: false,
            control: {} });
    });

    it('get dynamicName element', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    key: 'A'
                },
                children: [{
                    type: 'input',
                    name: 'scope.#ES{$data.key}'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let input = test.getComponentByName('scope.A');
        test.setData(input, 'helloworld');
        // expect();
    });
});
