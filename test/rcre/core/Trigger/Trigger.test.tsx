import {clearStore} from '../../../../packages/rcre/src/index';
import {RCRETestUtil} from 'rcre-test-tools';

describe('Event', () => {
    beforeEach(() => {
        clearStore();
    });

    it('onClick', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'test',
                children: [{
                    type: 'text',
                    text: '1234',
                    trigger: [{
                        event: 'onClick',
                        targetCustomer: '$this',
                        params: {
                            isClicked: true
                        }
                    }]
                }, {
                    type: 'text',
                    show: '#ES{$data.isClicked}',
                    text: 'show'
                }]
            }]
        };

        let util = new RCRETestUtil(config);
        util.setContainer('test');
        let text = util.getComponentByType('text', 0);
        await util.simulate(text, 'onClick');
        util.expectWithPath('isClicked', true);

        let showText = util.getComponentByType('text', 1);
        expect(showText.text()).toBe('show');
    });

    it('event params', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'test',
                dataCustomer: {
                    customers: [{
                        mode: 'pass',
                        name: 'selfPass',
                        config: {
                            model: 'test',
                            assign: {
                                isClicked: '#ES{$trigger.selfPass.isClicked}'
                            }
                        }
                    }]
                },
                children: [{
                    type: 'text',
                    text: 'click',
                    trigger: [{
                        event: 'onClick',
                        targetCustomer: '$this',
                        params: {
                            isClicked: true
                        }
                    }]
                }, {
                    type: 'text',
                    show: '#ES{$data.isClicked}',
                    text: 'show'
                }]
            }]
        };

        let util = new RCRETestUtil(config);
        util.setContainer('test');
        let button = util.getComponentByType('text');
        await util.simulate(button, 'onClick');
        util.expectWithPath('isClicked', true);
        let text = util.getComponentByType('text', 1);
        expect(text.text()).toBe('show');
    });

    it('event group', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'test',
                dataCustomer: {
                    customers: [{
                        mode: 'pass',
                        name: 'selfPass',
                        config: {
                            model: 'test',
                            assign: {
                                isClicked: '#ES{$trigger.selfPass.isClicked}',
                                text: '#ES{$trigger.selfPass.test}'
                            }
                        }
                    }, {
                        mode: 'pass',
                        name: 'secondPass',
                        config: {
                            model: 'test',
                            assign: {
                                secondClick: '#ES{$trigger.secondPass.isClicked}',
                                secondText: '#ES{$trigger.secondPass.test}'
                            }
                        }
                    }],
                    groups: [{
                        name: 'selfPassGroup',
                        steps: ['selfPass', 'secondPass']
                    }]
                },
                children: [{
                    type: 'text',
                    text: 'click',
                    trigger: [{
                        event: 'onClick',
                        targetCustomer: 'selfPassGroup',
                        params: {
                            isClicked: true,
                            test: '1234'
                        }
                    }]
                }, {
                    type: 'text',
                    show: '#ES{$data.isClicked}',
                    text: 'show'
                }]
            }]
        };

        let util = new RCRETestUtil(config);
        util.setContainer('test');
        let button = util.getComponentByType('text');
        await util.simulate(button, 'onClick');

        let group = [
            ['isClicked', true],
            ['secondClick', true],
            ['text', '1234'],
            ['secondText', '1234']
        ];

        util.expectGroupWithPath(group);
    });

    it('event debounce will get last event args as value', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'input',
                    name: 'username',
                    trigger: [{
                        event: 'onChange',
                        targetCustomer: '$this',
                        debounce: 100,
                        params: {
                            password: '#ES{$args.value}'
                        }
                    }]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');

        test.simulate(username, 'onChange', {
            value: '1'
        });
        test.simulate(username, 'onChange', {
            valueL: '2'
        });
        setTimeout(() => {
            test.simulate(username, 'onChange', {
                value: '3'
            });
        }, 20);

        test.simulate(username, 'onChange');
        setTimeout(() => {
            test.simulate(username, 'onChange', {
                value: '5'
            });
        }, 50);

        let state = test.getContainerState();
        expect(state).toEqual({});

        await new Promise((resolve) => {
            setTimeout(() => {
                state = test.getContainerState();
                expect(state).toEqual({
                    password: '5'
                });
                resolve();
            }, 150);
        });
    });
});