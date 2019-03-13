import {AutomaticRobot} from 'rcre-test-tools';
import {clearStore, store} from 'rcre';

describe('AutomaticRobot', () => {
    beforeEach(() => {

        clearStore();
    });

    it('init', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'form',
                        name: 'test',
                        children: [
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'username'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                rules: [{
                                    minLength: 2
                                }],
                                control: {
                                    type: 'input',
                                    name: 'password'
                                }
                            }
                        ]
                    }
                ]
            }]
        };

        let robot = new AutomaticRobot(config);

        await robot.run([
            {
                container: 'demo',
                steps: [
                    {
                        name: 'username',
                        value: 'helloworld'
                    },
                    {
                        name: 'password',
                        value: '123'
                    }
                ]
            }
        ]);
    });

    it('data not valid will cause error', async () => {
        console.log(store.getState());
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'form',
                        name: 'test',
                        children: [
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'username'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                rules: [{
                                    minLength: 2
                                }],
                                control: {
                                    type: 'input',
                                    name: 'password'
                                }
                            }
                        ]
                    }
                ]
            }]
        };

        let robot = new AutomaticRobot(config);
        try {
            await robot.run([
                {
                    container: 'demo',
                    steps: [
                        {
                            name: 'username',
                            value: 'helloworld'
                        },
                        {
                            name: 'password',
                            value: ''
                        }
                    ]
                }
            ]);
            throw new Error('robot did not throw');
        } catch (e) {
            expect(e.message).toBe('CheckState failed: password\'s form status is not valid. errmsg: 长度不能小余2');
        }
    });

    it('event steps', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                dataL: {
                    username: '1'
                },
                dataCustomer: {
                    customers: [{
                        mode: 'pass',
                        name: 'testCustomer',
                        config: {
                            model: 'demo',
                            assign: {
                                passUserName: '#ES{$trigger.testCustomer.passUserName}'
                            }
                        }
                    }]
                },
                children: [{
                    type: 'form',
                    name: 'test',
                    children: [
                        {
                            type: 'formItem',
                            required: true,
                            control: {
                                type: 'input',
                                name: 'username',
                                trigger: [{
                                    event: 'onChange',
                                    targetCustomer: '$this',
                                    params: {
                                        anotherUserName: '#ES{$args.value}'
                                    }
                                }, {
                                    event: 'onChange',
                                    targetCustomer: 'testCustomer',
                                    params: {
                                        passUserName: '#ES{$args.value}'
                                    }
                                }]
                            }
                        }
                    ]
                }]
            }]
        };

        let robot = new AutomaticRobot(config);

        await robot.run([{
            container: 'demo',
            steps: [
                {
                    name: 'username',
                    value: '1234',
                    event: [{
                        eventName: 'onChange',
                        args: {
                            value: '1234'
                        }
                    }, {
                        eventName: 'onChange',
                        args: {
                            value: '4567'
                        }
                    }]
                }
            ]
        }]);
        expect(robot.test.getState()).toMatchSnapshot();
    });

    it('Containers can still be embedded in the Steps', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                dataL: {
                    username: '1'
                },
                dataCustomer: {
                    customers: [{
                        mode: 'pass',
                        name: 'testCustomer',
                        config: {
                            model: 'demo',
                            assign: {
                                passUserName: '#ES{$trigger.testCustomer.passUserName}'
                            }
                        }
                    }]
                },
                children: [{
                    type: 'form',
                    name: 'test',
                    children: [
                        {
                            type: 'formItem',
                            required: true,
                            control: {
                                type: 'input',
                                name: 'username',
                                trigger: [{
                                    event: 'onChange',
                                    targetCustomer: '$this',
                                    params: {
                                        anotherUserName: '#ES{$args.value}'
                                    }
                                }, {
                                    event: 'onChange',
                                    targetCustomer: 'testCustomer',
                                    params: {
                                        passUserName: '#ES{$args.value}'
                                    }
                                }, {
                                    event: 'onSelect',
                                    targetCustomer: '$this',
                                    params: {}
                                }]
                            }
                        },
                        {
                            type: 'container',
                            model: 'child',
                            children: [{
                                type: 'input',
                                name: 'child-username'
                            }]
                        }
                    ]
                }]
            }]
        };

        let robot = new AutomaticRobot(config);
        await robot.run([{
            container: 'demo',
            steps: [
                {
                    name: 'username',
                    value: '1234',
                    manual: true,
                    event: [{
                        eventName: 'onChange',
                        args: {
                            value: '1234'
                        }
                    }]
                },
                {
                    container: 'child',
                    steps: [{
                        name: 'child-username',
                        value: '1234'
                    }]
                }
            ]
        }]);

        expect(robot.test.getState().container).toMatchSnapshot();
    });

    it('AutoComplete NameValid', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'autoComplete',
                    name: 'search',
                    dataSource: ['1', '2', '3']
                }]
            }]
        };
        let robot = new AutomaticRobot(config);
        try {
            await robot.run([
                {
                    container: 'demo',
                    steps: [{
                        name: 'search',
                        value: '9'
                    }]
                }
            ]);
        } catch (e) {
            expect(e.message).toBe('StepItem: item value is not valid. \n' +
                'Object {\n' +
                '  "name": "search",\n' +
                '  "value": "9",\n' +
                '}');
        }
    });

    it('Select NameValid', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'select',
                    name: 'list',
                    options: [{
                        key: 'a',
                        value: 'A'
                    }, {
                        key: 'b',
                        value: 'B'
                    }]
                }]
            }]
        };

        let robot = new AutomaticRobot(config);
        try {
            await robot.run([{
                container: 'demo',
                steps: [{
                    name: 'list',
                    value: 'c'
                }]
            }]);
        } catch (e) {
            expect(e.message).toBe('StepItem: item value is not valid. \n' +
                'Object {\n' +
                '  "name": "list",\n' +
                '  "value": "c",\n' +
                '}');
        }
    });

    it('Checkbox NameValid', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'checkbox',
                    name: 'template_id',
                    groups: [{key: 'BC0119', text: 'AAA', disabled: false}]
                }]
            }]
        };

        let robot = new AutomaticRobot(config);
        try {
            await robot.run([{
                container: 'demo',
                steps: [{
                    name: 'template_id',
                    value: {'AAWWE': true, 'GEFERE': true, 'BC0119': true}
                }]
            }]);
        } catch (e) {
            expect(e.message).toBe('StepItem: item value is not valid. \n' +
                'Object {\n' +
                '  "name": "template_id",\n' +
                '  "value": Object {\n' +
                '    "AAWWE": true,\n' +
                '    "BC0119": true,\n' +
                '    "GEFERE": true,\n' +
                '  },\n' +
                '}');
        }
    });
});