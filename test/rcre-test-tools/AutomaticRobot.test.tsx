import {AutomaticRobot} from 'rcre-test-tools';
import {clearStore, componentLoader, Connect} from 'rcre';
import React from 'react';

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
        robot.test.unmount();
    });

    it('data not valid will cause error', async () => {
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

        robot.test.unmount();
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
                    }]
                }
            ]
        }]);

        expect(robot.test.getState()).toMatchSnapshot();

        robot.test.unmount();
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

        robot.test.unmount();
    });

    it('AutoComplete NameValid', async () => {
        class NameValid extends React.PureComponent<any> {
            render() {
                return (
                    <div>this.props.value</div>
                );
            }
        }
        componentLoader.addComponent('nameValidTest', Connect.commonConnect({
            isNameValid: (value, props) => {
                if (value === '1') {
                    return true;
                }

                return false;
            }
        })(NameValid));

        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'nameValidTest',
                    name: 'nameValidTest'
                }]
            }]
        };
        let robot = new AutomaticRobot(config);
        try {
            await robot.run([
                {
                    container: 'demo',
                    steps: [{
                        name: 'nameValidTest',
                        value: '2'
                    }]
                }
            ]);
        } catch (e) {
            expect(e.message).toBe('StepItem: item value is not valid. \n' +
                'Object {\n' +
                '  "name": "nameValidTest",\n' +
                '  "value": "2",\n' +
                '}');
        }

        robot.test.unmount();
    });

    it('Select NameValid', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'input',
                    name: 'list'
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

        robot.test.unmount();
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

        robot.test.unmount();
    });
});