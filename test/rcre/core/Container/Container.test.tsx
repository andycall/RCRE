// import * as React from 'react';
// import {mount} from 'enzyme';
import {CoreKind, filter} from 'rcre';
// import {Provider} from 'react-redux';
import {RCRETestUtil} from 'rcre-test-tools';

class LocalStorageMock {
    store: object;

    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key: string) {
        return this.store[key] || null;
    }

    setItem(key: string, value: any) {
        this.store[key] = value.toString();
    }

    removeItem(key: string) {
        delete this.store[key];
    }
}

global['localStorage'] = new LocalStorageMock;

describe('Container Component', () => {
    it('HELLO WORLD', () => {
        const containerModel = 'containerTest';
        const info = {
            body: [{
                type: 'container',
                model: containerModel,
                data: {
                    name: 'andycall',
                    password: '12345'
                },
                children: [
                    {
                        type: 'text',
                        text: '#ES{$data.name}'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        test.setContainer(containerModel);
        test.expectWithPath('name', 'andycall');
        let text = test.getComponentByType('text');
        expect(text.text()).toBe('andycall');
        test.unmount();
    });

    it('container unmount', () => {
        const containerModel = 'containerTest';
        const info = {
            body: [
                {
                    type: 'container',
                    model: containerModel,
                    data: {
                        name: 'andycall'
                    },
                    children: [
                        {
                            type: 'text',
                            text: 'helloworld'
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        test.unmount();
    });

    it('merge with exist $data', () => {
        const containerModal = 'mergeWithExist';
        const info = {
            body: [{
                type: 'container',
                model: containerModal,
                data: {
                    name: 'andycall'
                },
                children: [
                    {
                        type: 'text',
                        text: 'andycall'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        let state = test.getState();
        expect(state.container[containerModal].name).toBe('andycall');
        test.unmount();
    });

    it('[export]: inner container can export value using ExpressionString', () => {
        const exportModel = 'exportDemo';
        const innerModel = 'innerExportContainer';
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': exportModel,
                    'children': [
                        {
                            'type': 'text',
                            'text': 'export: #ES{$data.name}'
                        },
                        {
                            'type': 'container',
                            'model': innerModel,
                            'export': {
                                'name': '#ES{$data.subName + $data.anoSubName}'
                            },
                            'children': [{
                                'type': 'input',
                                'name': 'subName',
                                'style': {
                                    'width': 300
                                },
                                'placeholder': '第一个输入框'
                            }, {
                                'type': 'input',
                                'name': 'anoSubName',
                                'style': {
                                    'width': 300
                                },
                                'placeholder': '第二个输入框'
                            }]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
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

        expect(container[exportModel].name).toBe('12');
        expect(container[innerModel].subName).toBe('1');
        expect(container[innerModel].anoSubName).toBe('2');

        test.unmount();
    });

    it('[$parent]: inner container can access parent container\'s property with $parent', () => {
        let info = {
            body: [
                {
                    'type': 'container',
                    'model': 'outer',
                    'data': {
                        'name': 'outer'
                    },
                    'children': [{
                        'type': 'container',
                        'model': 'inner',
                        'data': {
                            'name': 'inner'
                        },
                        'children': [{
                            'type': 'text',
                            'className': 'inner',
                            'text': '#ES{$data.name}'
                        }, {
                            'type': 'text',
                            'className': 'outer',
                            'text': '#ES{$parent.name}'
                        }]
                    }]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        const innerElement = test.wrapper.find('.inner').at(0);
        const outerElement = test.wrapper.find('.outer').at(0);

        let state = test.getState();
        let container = state.container;
        expect(container['inner'].name).toBe('inner');
        expect(container['outer'].name).toBe('outer');

        expect(innerElement.html()).toBe('<span class="rcre-text inner">inner</span>');
        expect(outerElement.html()).toBe('<span class="rcre-text outer">outer</span>');

        test.unmount();
    });

    it('[bind]: basic usage for bind property', () => {
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': 'bindContainer',
                    'children': [{
                        'type': 'form',
                        'name': 'demoForm',
                        'children': [{
                            'type': 'formItem',
                            'label': 'UserName',
                            'required': true,
                            'control': {
                                'type': 'input',
                                'name': 'username'
                            }
                        }, {
                            'type': 'container',
                            'model': 'childBindContainer',
                            'bind': [{
                                'child': 'password',
                                'parent': 'password'
                            }],
                            'children': [{
                                'type': 'formItem',
                                'label': 'PassWord',
                                'required': true,
                                'control': {
                                    'type': 'input',
                                    'name': 'password'
                                }
                            }]
                        }, {
                            'type': 'formItem',
                            'control': {
                                'type': 'button',
                                '~type': 'submit',
                                'disabled': '#ES{!$form.valid}',
                                'text': 'submit'
                            }
                        }]
                    }]
                }
            ]
        };

        const test = new RCRETestUtil(info);
        const wrapper = test.wrapper;
        let inputs = wrapper.find('input');
        let firstInput = inputs.at(0);
        let secondInput = inputs.at(1);

        firstInput.simulate('change', {
            target: {
                value: 'mike'
            }
        });

        secondInput.simulate('change', {
            target: {
                value: '1234'
            }
        });

        let state = test.getState();
        let container = state.container;

        expect(container['bindContainer'].username).toBe('mike');
        expect(container['bindContainer'].password).toBe('1234');
        expect(container['childBindContainer'].password).toBe('1234');

        test.unmount();
    });

    it('[bind]: 3th nest container with bind property', () => {
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': 'bindContainer',
                    'children': [
                        {
                            'type': 'form',
                            'name': 'demoForm',
                            'children': [{
                                'type': 'formItem',
                                'label': 'UserName',
                                'required': true,
                                'control': {
                                    'type': 'input',
                                    'name': 'username'
                                }
                            }, {
                                'type': 'container',
                                'model': 'childBindContainer',
                                'bind': [{
                                    'child': 'password',
                                    'parent': 'password'
                                }],
                                'children': [
                                    {
                                        'type': 'container',
                                        'model': 'innerChildBindContainer',
                                        'bind': [{
                                            'child': 'password',
                                            'parent': 'password'
                                        }],
                                        'children': [
                                            {
                                                'type': 'formItem',
                                                'label': 'PassWord',
                                                'required': true,
                                                'control': {
                                                    'type': 'input',
                                                    'name': 'password'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                'type': 'formItem',
                                'control': {
                                    'type': 'button',
                                    'htmlType': 'submit',
                                    'disabled': '#ES{!$form.valid}',
                                    'text': 'submit'
                                }
                            }]
                        }
                    ]
                }
            ]
        };

        const test = new RCRETestUtil(info);
        let inputs = test.wrapper.find('input');
        let firstInput = inputs.at(0);
        let secondInput = inputs.at(1);

        firstInput.simulate('change', {
            target: {
                value: 'mike'
            }
        });

        secondInput.simulate('change', {
            target: {
                value: '1234'
            }
        });

        let state = test.getState();
        let container = state.container;

        expect(container['bindContainer'].username).toBe('mike');
        expect(container['bindContainer'].password).toBe('1234');
        expect(container['childBindContainer'].password).toBe('1234');
    });

    it('[$parent + $export] sync container in 3th nest container', async () => {
        const info: any = {
            body: [
                {
                    type: 'container',
                    model: 'root',
                    data: {
                        age: 10,
                        hidden: false
                    },
                    children: [
                        {
                            type: 'input',
                            name: 'age'
                        },
                        {
                            type: 'row',
                            hidden: '#ES{$data.hidden}',
                            children: [{
                                type: 'container',
                                model: 'textContainer',
                                children: [{
                                    type: 'text',
                                    className: 'textContainer',
                                    text: '#ES{$parent.age}'
                                }]
                            }]
                        },
                        {
                            type: 'container',
                            model: 'otherContainer',
                            export: {
                                age: '#ES{$data.innerAge}'
                            },
                            children: [{
                                type: 'button',
                                text: 'button container',
                                trigger: [{
                                    event: 'onClick',
                                    targetCustomer: '$this',
                                    params: {
                                        innerAge: 'button'
                                    }
                                }]
                            }]
                        }
                    ]
                }
            ]
        };
        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;

        let inputs = wrapper.find('RCREConnect(input)');
        let firstInput: any = inputs.at(0).instance();

        firstInput.TEST_setData('23');

        let state = test.getState();
        let container = state.container;
        expect(container['root'].age).toBe('23');
        let textElement = wrapper.find('.textContainer').at(0);
        expect(textElement.html()).toBe('<span class="rcre-text textContainer">23</span>');

        firstInput.TEST_setData('2');
        state = test.getState();
        container = state.container;
        expect(container['root'].age).toBe('2');
        textElement = wrapper.find('.textContainer').at(0);
        expect(textElement.html()).toBe('<span class="rcre-text textContainer">2</span>');

        let button: any = wrapper.find('RCREConnect(button)').at(0).instance();

        await button.TEST_simulateEvent('onClick', {});
        state = test.getState();

        expect(state.container.otherContainer.innerAge).toBe('button');
        expect(state.container.root.age).toBe('button');

        test.unmount();
    });

    it('[bind] setMultiData with bind', () => {
        const exportModel = 'exportDemo';
        const innerModel = 'innerExportContainer';
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': 'exportDemo',
                    'children': [{
                        'type': 'text',
                        'text': 'export: #ES{$data.name}'
                    }, {
                        'type': 'container',
                        'model': 'innerExportContainer',
                        'bind': [{
                            'child': 'subName',
                            'parent': 'subName'
                        },
                            {
                                'child': 'anoSubName',
                                'parent': 'anoSubName'
                            }],
                        'children': [{
                            'type': 'input',
                            'name': 'subName',
                            'style': {
                                'width': 300
                            },
                            'placeholder': '第一个输入框'
                        }, {
                            'type': 'input',
                            'name': 'anoSubName',
                            'style': {
                                'width': 300
                            },
                            'placeholder': '第二个输入框'
                        }]
                    }]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;
        let inputs = wrapper.find('input');
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

        expect(container[exportModel].subName).toBe('1');
        expect(container[exportModel].anoSubName).toBe('2');
        expect(container[innerModel].subName).toBe('1');
        expect(container[innerModel].anoSubName).toBe('2');

        test.unmount();
    });

    it('[bind]: setMultiDataBind', () => {
        let info = {
            body: [
                {
                    type: 'container',
                    model: 'outer',
                    data: {
                        username: 'andycall'
                    },
                    children: [
                        {
                            type: 'container',
                            model: 'inner',
                            props: {
                                username: '#ES{$parent.username}'
                            },
                            bind: [
                                {
                                    child: 'username',
                                    parent: 'username'
                                }
                            ],
                            children: [
                                {
                                    type: 'form',
                                    name: 'form',
                                    clearAfterSubmit: true,
                                    children: [
                                        {
                                            type: 'formItem',
                                            label: 'username',
                                            control: {
                                                type: 'input',
                                                name: 'username'
                                            }
                                        },
                                        {
                                            type: 'formItem',
                                            label: 'password',
                                            control: {
                                                type: 'input',
                                                name: 'password'
                                            }
                                        },
                                        {
                                            type: 'formItem',
                                            control: {
                                                type: 'button',
                                                '~type': 'submit',
                                                className: 'submit-button',
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;
        console.log(wrapper.debug());

        const innerElement = wrapper.find('form').at(0);
        innerElement.simulate('submit', {});
        let state = test.getState();
        console.log(state);
        let container = state.container;

        expect(container['outer'].username).toBe(undefined);
        expect(container['inner'].username).toBe(undefined);
        expect(container['inner'].password).toBe(undefined);

        test.unmount();
    });

    it('deleteData', async () => {
        let info = {
            body: [
                {
                    type: 'container',
                    model: 'outer',
                    data: {
                        'userNameShow': true
                    },
                    children: [
                        {
                            type: 'form',
                            name: 'deleteDataForm',
                            children: [
                                {
                                    type: 'formItem',
                                    label: 'username',
                                    show: '#ES{$data.userNameShow}',
                                    control: {
                                        type: 'input',
                                        name: 'username'
                                    }
                                },
                                {
                                    type: 'formItem',
                                    label: 'password',
                                    control: {
                                        type: 'input',
                                        name: 'password'
                                    }
                                },
                                {
                                    'type': 'button',
                                    'className': 'test-button',
                                    'text': 'test',
                                    'trigger': [
                                        {
                                            'event': 'onClick',
                                            'targetCustomer': '$this',
                                            'params': {
                                                'userNameShow': false,
                                                'test': 1
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('outer');

        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');

        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        expect(test.hasComponentByName('username')).toBe(false);
        let state = test.getContainerState();
        expect(state.username).toBe(undefined);

        test.unmount();
    });

    it('[bind]: deleteData with bind', async () => {
        let info: any = {
            body: [
                {
                    type: 'container',
                    model: 'outer',
                    data: {
                        'userNameShow': true
                    },
                    children: [
                        {
                            type: 'container',
                            model: 'inner',
                            bind: [
                                {
                                    child: 'username',
                                    parent: 'username'
                                }
                            ],
                            children: [
                                {
                                    type: 'form',
                                    name: 'deleteDataFormWithBind',
                                    children: [
                                        {
                                            type: 'formItem',
                                            label: 'username',
                                            show: '#ES{$parent.userNameShow}',
                                            control: {
                                                type: 'input',
                                                name: 'username'
                                            }
                                        },
                                        {
                                            type: 'formItem',
                                            label: 'password',
                                            control: {
                                                type: 'input',
                                                name: 'password'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            'type': 'button',
                            'className': 'test-button',
                            'text': 'test',
                            'trigger': [
                                {
                                    'event': 'onClick',
                                    'targetCustomer': '$this',
                                    'params': {
                                        'userNameShow': false,
                                        'test': 1
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('inner');

        let username = test.getComponentByName('username');
        test.setData(username, '1234');

        let rootState = test.getState();
        let container = rootState.container;
        expect(container['outer'].username).toBe('1234');
        expect(container['inner'].username).toBe('1234');

        test.setContainer('outer');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        test.setContainer('inner');
        expect(test.hasComponentByName('username')).toBe(false);
        expect(test.hasComponentByName('password')).toBe(true);

        rootState = test.getState();
        container = rootState.container;
        expect(container['outer'].userNameShow).toBe(false);
        expect(container['outer'].test).toBe(1);
        expect(container['outer'].username).toBe(undefined);
        expect(container['inner'].username).toBe(undefined);
        test.unmount();
    });

    it('[bind]: delete parent bind data property', async () => {
        let info: any = {
            body: [
                {
                    type: 'container',
                    model: 'outer',
                    data: {
                        'userNameShow': true,
                    },
                    children: [
                        {
                            type: 'container',
                            model: 'inner',
                            bind: [
                                {
                                    child: 'username',
                                    parent: 'username'
                                }
                            ],
                            props: {
                                username: '#ES{$parent.username}'
                            },
                            children: [
                                {
                                    type: 'form',
                                    name: 'deleteDataFormWithBind',
                                    children: [
                                        {
                                            type: 'formItem',
                                            label: 'username',
                                            show: '#ES{$parent.userNameShow}',
                                            control: {
                                                type: 'input',
                                                name: 'username'
                                            }
                                        },
                                        {
                                            type: 'formItem',
                                            label: 'password',
                                            control: {
                                                type: 'input',
                                                name: 'password'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            'type': 'button',
                            'className': 'test-button',
                            'text': 'test',
                            'trigger': [
                                {
                                    'event': 'onClick',
                                    'targetCustomer': '$this',
                                    'params': {
                                        'userNameShow': false,
                                        'test': 1
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('inner');
        let username = test.getComponentByName('username');
        test.setData(username, '1234');

        let state = test.getState();
        let container = state.container;

        expect(container['outer'].username).toBe('1234');
        expect(container['inner'].username).toBe('1234');

        test.setContainer('outer');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');
        state = test.getState();
        container = state.container;
        expect(container['outer'].userNameShow).toBe(false);
        expect(container['outer'].test).toBe(1);
        expect(container['outer'].username).toBe(undefined);
        expect(container['inner'].username).toBe(undefined);

        test.unmount();
    });

    it('oldNestContainerCompatible', () => {
        const exportModel = 'exportDemo';
        const innerModel = 'innerExportContainer';
        const info = {
            body: [{
                'type': 'container',
                'model': exportModel,
                'data': {
                    name: 'outer'
                },
                'children': [
                    {
                        'type': 'container',
                        'model': innerModel,
                        'parentMapping': {
                            username: '#ES{$parent.name}'
                        },
                        'children': [
                            {
                                type: 'text',
                                className: 'test-text',
                                text: '#ES{$data.username}'
                            },
                            {
                                'type': 'text',
                                'text': '#ES{$parent.name}'
                            },
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        let state = test.getState();
        let container = state.container;

        expect(container[exportModel].name).toBe('outer');
        test.unmount();
    });

    it('[props] SYNC_DATA_SUCCESS inherit', () => {
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': 'component',
                    'data': {
                        'name': 'andycall',
                        'age': 22,
                        'mode': 'outer'
                    },
                    'children': [{
                        'type': 'container',
                        'model': 'child',
                        'data': {
                            'mode': 'inner'
                        },
                        'props': {
                            'name': '#ES{$parent.name + " is children"}',
                            'age': '#ES{$parent.age + $parent.age}'
                        },
                        'children': [{
                            'type': 'text',
                            'text': 'name: #ES{$data.name}'
                        }, {
                            'type': 'text',
                            'text': 'age: #ES{$data.age}'
                        }]
                    }]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;
        let texts = wrapper.find('span');
        let state = test.getState();
        let container = state.container;

        expect(container['component'].name).toBe('andycall');
        expect(container['component'].age).toBe(22);
        expect(texts.at(0).text()).toBe('name: andycall is children');
        expect(texts.at(1).text()).toBe('age: 44');
        test.unmount();
    });

    it('[props]: inherit', () => {
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': 'component',
                    'data': {
                        'name': 'andycall',
                        'age': 22,
                        'mode': 'outer'
                    },
                    'children': [{
                        'type': 'container',
                        'model': 'child',
                        'data': {
                            'mode': 'inner'
                        },
                        'props': 'inherit',
                        'children': [{
                            'type': 'text',
                            'text': 'name: #ES{$data.name}'
                        }, {
                            'type': 'text',
                            'text': 'age: #ES{$data.age}'
                        }]
                    }]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;
        let texts = wrapper.find('span');
        let state = test.getState();
        let container = state.container;

        expect(container['component'].name).toBe('andycall');
        expect(container['component'].age).toBe(22);
        expect(texts.at(0).text()).toBe('name: andycall');
        expect(texts.at(1).text()).toBe('age: 22');

        test.unmount();
    });

    it('[props]: prop is not Expression', () => {
        const info = {
            body: [{
                'type': 'container',
                'model': 'component',
                'data': {
                    'name': 'andycall',
                    'age': 22,
                    'mode': 'outer'
                },
                'children': [{
                    'type': 'container',
                    'model': 'child',
                    'props': {
                        'name': '#ES{$parent.name + " is children"}',
                        'age': '#ES{$parent.age + $parent.age}',
                        'friend': {
                            'prop': 'mike',
                            'age': 16
                        }
                    },
                    'children': [
                        {
                            type: 'text',
                            text: '#ES{$data.friend}'
                        }
                    ]
                }]
            }]
        };

        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;
        let state = test.getState();
        let container = state.container;
        let texts = wrapper.find('span');

        expect(container['component'].name).toBe('andycall');
        expect(container['component'].age).toBe(22);
        expect(texts.at(0).html()).toBe('<span class="rcre-text "></span>');
        test.unmount();
    });

    it('[props]: has prop without data', () => {
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': 'component',
                    'data': {
                        'name': 'andycall',
                        'age': 22,
                        'mode': 'outer'
                    },
                    'children': [{
                        'type': 'container',
                        'model': 'child',
                        'props': {
                            'name': '#ES{$parent.name + " is children"}',
                            'age': '#ES{$parent.age + $parent.age}',
                            'friend': {
                                'prop': '#ES{$parent.name}',
                                'priority': 'child'
                            }
                        },
                        'children': [
                            {
                                'type': 'text',
                                'text': '#ES{$data.friend}'
                            },
                            {
                                type: 'input',
                                name: 'friend'
                            }
                        ]
                    }]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;
        let state = test.getState();
        let container = state.container;
        let texts = wrapper.find('span');
        let input = wrapper.find('input');

        expect(container['component'].name).toBe('andycall');
        expect(container['component'].age).toBe(22);

        expect(texts.at(0).text()).toBe('andycall');
        input.simulate('change', {
            target: {
                value: 'yhtree'
            }
        });

        expect(texts.at(0).text()).toBe('yhtree');
        test.unmount();
    });

    it('[props]: set Data inherit', () => {
        const info = {
            body: [
                {
                    'type': 'container',
                    'model': 'component',
                    'children': [
                        {
                            type: 'input',
                            name: 'friend'
                        },
                        {
                            'type': 'container',
                            'model': 'child',
                            'props': {
                                friend: '#ES{$parent.friend}'
                            },
                            'children': [
                                {
                                    'type': 'text',
                                    'text': '#ES{$data.friend}'
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('component');
        let friend = test.getComponentByName('friend');
        test.setData(friend, 'yhtree');

        test.setContainer('child');
        let text = test.getComponentByType('text');
        expect(text.text()).toBe('yhtree');

        console.log(test.wrapper.debug());
        test.unmount();
    });

    it('[props]: inner container sync data and inherit to other', () => {
        let info = {
            body: [{
                type: 'container',
                model: 'outer',
                children: [
                    {
                        type: 'container',
                        model: 'child1',
                        props: {
                            username: '#ES{$parent.username}'
                        },
                        export: {
                            username: '#ES{$data.username}'
                        },
                        children: [
                            {
                                type: 'input',
                                name: 'username'
                            }
                        ]
                    },
                    {
                        type: 'container',
                        model: 'child2',
                        props: {
                            username: '#ES{$parent.username}'
                        },
                        export: {
                            username: '#ES{$data.username}'
                        },
                        children: [
                            {
                                type: 'text',
                                text: '#ES{$data.username}'
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;

        let input = wrapper.find('input').at(0);

        input.simulate('change', {
            target: {
                value: 'helloworld'
            }
        });

        let state = test.getState();
        expect(state.container.outer.username).toBe('helloworld');
        expect(state.container.child1.username).toBe('helloworld');
        expect(state.container.child2.username).toBe('helloworld');
        test.unmount();
    });

    it('has dataCustomer', async () => {
        let info: any = {
            body: [{
                type: 'container',
                model: 'all',
                children: [
                    {
                        'type': 'container',
                        'model': 'dataPass',
                        'dataCustomer': {
                            'customers': [
                                {
                                    'mode': 'pass',
                                    'name': 'passData',
                                    'config': {
                                        'model': 'receiveData',
                                        'assign': '#ES{$trigger.passData}'
                                    }
                                }
                            ]
                        },
                        'children': [
                            {
                                'type': 'button',
                                'text': '点击传递数据',
                                'className': 'test-button',
                                'trigger': [
                                    {
                                        'event': 'onClick',
                                        'targetCustomer': 'passData',
                                        'params': {
                                            'text': 'data from dataPass'
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        'type': 'container',
                        'model': 'receiveData',
                        'data': {
                            'text': 'empty'
                        },
                        'children': [
                            {
                                'type': 'text',
                                'text': 'received container data: #ES{JSON.stringify($data)}'
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        let state = test.getState();
        let container = state.container;
        expect(container['receiveData'].text).toBe('empty');

        let buttonElement = test.wrapper.find('RCREConnect(button)').at(0);
        await test.simulate(buttonElement, 'onClick');

        state = test.getState();
        container = state.container;
        expect(container['receiveData'].text).toBe('data from dataPass');
        test.unmount();
    });

    it('mount new container will add new node to containerGraph', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'initTest',
                data: {
                    showContainer: true,
                    name: 'andycall'
                },
                children: [
                    {
                        type: 'button',
                        text: 'hidden',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                showContainer: false
                            }
                        }]
                    },
                    {
                        type: 'button',
                        text: 'show',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                showContainer: true
                            }
                        }]
                    },
                    {
                        type: 'div',
                        show: '#ES{$data.showContainer}',
                        children: [
                            {
                                type: 'container',
                                model: 'nestInitTest',
                                props: {
                                    name: '#ES{$parent.name}'
                                },
                                export: {
                                    name: '#ES{$data.name}'
                                },
                                children: [
                                    {
                                        type: 'text',
                                        text: '#ES{$data.name}'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        let state = test.getState();

        let hidden = test.wrapper.find('RCREConnect(button)').at(0);
        let show = test.wrapper.find('RCREConnect(button)').at(1);
        await test.simulate(hidden, 'onClick');

        state = test.getState();
        expect(state.container.nestInitTest).toBe(undefined);
        await test.simulate(show, 'onClick');

        state = test.getState();
        expect(typeof state.container.nestInitTest).toBe('object');
        expect(state.container.nestInitTest.name).toBe('andycall');

        test.unmount();
    });

    it('has dataProvider', async () => {
        return new Promise((resolve, reject) => {
            window.localStorage.setItem('password', '123');
            let info = {
                body: [{
                    'type': 'container',
                    'model': 'localStorageCustomer',
                    'dataCustomer': {
                        'customers': [{
                            'mode': 'localStorage',
                            'name': 'setLocalStorage',
                            'config': {
                                'groups': '#ES{$trigger.setLocalStorage.groups}'
                            }
                        }]
                    },
                    'dataProvider': [
                        {
                            'mode': 'localStorage',
                            'config': ['username'],
                            namespace: 'A',
                            responseRewrite: {
                                username: '#ES{$output.username}'
                            }
                        },
                        {
                            'mode': 'localStorage',
                            'config': ['password'],
                            namespace: 'B',
                            responseRewrite: {
                                password: '#ES{$output.password}'
                            }
                        }
                    ],
                    'children': [
                        {
                            'type': 'text',
                            'text': '把输入的值写入到LocalStorage',
                            'gridWidth': 250
                        },
                        {
                            'type': 'row',
                            'children': [{
                                'type': 'input',
                                'name': 'username',
                                'gridWidth': 300,
                                'trigger': [{
                                    'event': 'onChange',
                                    'targetCustomer': 'setLocalStorage',
                                    'params': {
                                        'groups': [{
                                            'key': 'username',
                                            'value': '#ES{$args.value}'
                                        }]
                                    }
                                }]
                            }]
                        },
                        {
                            'type': 'text',
                            'style': {
                                'display': 'block'
                            },
                            'text': '读取到的值： #ES{$data.username}'
                        },
                        {
                            'type': 'text',
                            'mode': 'success',
                            'style': {
                                'display': 'block'
                            },
                            'text': '将Input的name模型和从localStorage的name值进行一一对应，就能实现在初始化的时候，自动设置Input的值'
                        }
                    ]
                }]
            };

            let test = new RCRETestUtil(info);
            test.setContainer('localStorageCustomer');

            setTimeout(() => {
                let state = test.getState();
                let container = state.container;
                expect(container['localStorageCustomer'].username).toBe(null);
                expect(container['localStorageCustomer'].password).toBe(123);

                let inputs = test.wrapper.find('RCREConnect(input)');
                let firstInput = inputs.at(0);

                test.setData(firstInput, 'mike');

                state = test.getState();
                container = state.container;
                expect(container['localStorageCustomer'].username).toBe('mike');
                expect(container['localStorageCustomer'].password).toBe(123);

                test.unmount();
                resolve();
            });
        });
    });

    it('[dataProvider]: data init should be before first render', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'initTest',
                data: {
                    name: 'andycall'
                },
                children: [
                    {
                        type: 'container',
                        model: 'nestInitTest',
                        props: {
                            name: '#ES{$parent.name}'
                        },
                        export: {
                            name: '#ES{$data.name}'
                        },
                        children: [
                            {
                                type: 'text',
                                text: '#ES{$data.name}'
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        let wrapper = test.wrapper;
        let state = test.getState();
        expect(state.container.initTest.name).toBe('andycall');

        let text = wrapper.find('span').at(0);
        expect(text.text()).toBe('andycall');
        test.unmount();
    });

    it('dataProvider responseRewrite support decoupling assignment', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'dataProviderResponseTest',
                dataProvider: [{
                    mode: 'ajax',
                    namespace: 'dataSource',
                    config: {
                        url: 'http://localhost:8844/static/table.json',
                        method: 'GET'
                    },
                    responseRewrite: {
                        'demo.list': '#ES{$output.head}'
                    }
                }],
                children: [{
                    type: 'text',
                    text: 'helloworld'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        await test.waitForDataProviderComplete();
        let state = test.getState();
        console.log(state.container);
        let demo = state.container.dataProviderResponseTest.demo;
        expect(demo.list.length).toBe(5);
        test.unmount();
    });

    it('[dataProvider]: ASYNC_LOAD_SUCCESS can be refresh the component', () => {
        return new Promise((resolve, reject) => {
            let config = {
                body: [
                    {
                        type: 'container',
                        model: 'dataProviderTest',
                        dataProvider: [
                            {
                                mode: 'ajax',
                                namespace: 'DataSource',
                                config: {
                                    url: 'http://localhost:8844/static/table.json',
                                    method: 'GET'
                                }
                            }
                        ],
                        children: [
                            {
                                type: 'container',
                                model: 'innerSource',
                                props: {
                                    datasource: '#ES{$parent.DataSource}'
                                },
                                children: [
                                    {
                                        type: 'text',
                                        text: '#ES{$data.datasource.length}'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            let test = new RCRETestUtil(config);

            setTimeout(() => {
                let state = test.getState();
                console.log(state.container);
                expect(typeof state.container.dataProviderTest.DataSource).toBe('object');
                expect(typeof state.container.innerSource.datasource).toBe('object');
                test.unmount();
                resolve();
            }, 300);
        });
    });

    it('[export]: all', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'initTest',
                data: {
                    name: 'andycall'
                },
                children: [
                    {
                        type: 'container',
                        model: 'nestInitTest',
                        props: {
                            name: '#ES{$parent.name}'
                        },
                        export: 'all',
                        children: [
                            {
                                type: 'input',
                                name: 'name'
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        let wrapper = test.wrapper;
        let state = test.getState();
        expect(state.container.initTest.name).toBe('andycall');

        let input = wrapper.find('input');

        input.simulate('change', {
            target: {
                value: 'test'
            }
        });

        state = test.getState();
        expect(state.container.initTest.name).toBe('test');

        test.unmount();
    });

    it('formItem in container should have form control', () => {
        let info = {
            body: [
                {
                    type: 'container',
                    model: 'formContainer',
                    data: {
                        username: 'andycall'
                    },
                    children: [
                        {
                            type: 'form',
                            name: 'containerForm',
                            children: [
                                {
                                    type: 'container',
                                    model: 'containerInForm',
                                    props: {
                                        username: '#ES{$parent.username}'
                                    },
                                    export: {
                                        username: '#ES{$data.username}'
                                    },
                                    children: [
                                        {
                                            type: 'formItem',
                                            label: 'UserName',
                                            required: true,
                                            control: {
                                                type: 'text',
                                                text: '#ES{$data.username}'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        let wrapper = test.wrapper;

        let text = wrapper.find('span').at(0);
        expect(text.text()).toBe('andycall');

        test.unmount();
    });

    it('data Customer with 3 container inherit', async () => {
        let info = {
            body: [
                {
                    type: 'container',
                    model: 'root',
                    children: [
                        {
                            type: 'container',
                            model: 'middle',
                            export: {
                                name: '#ES{$data.name}'
                            },
                            children: [
                                {
                                    type: 'button',
                                    text: 'click',
                                    trigger: [
                                        {
                                            event: 'onClick',
                                            targetCustomer: '$this',
                                            params: {
                                                name: 'andycall'
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: 'container',
                                    model: 'inner',
                                    props: {
                                        name: '#ES{$parent.name}'
                                    },
                                    children: [
                                        {
                                            type: 'text',
                                            text: '#ES{$data.name}'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('middle');
        let button = test.wrapper.find('RCREConnect(button)').at(0);
        await test.simulate(button, 'onClick');

        let state = test.getState();
        expect(state.container.root.name).toBe('andycall');
        expect(state.container.middle.name).toBe('andycall');

        test.setContainer('inner');
        let text = test.getComponentByType('text');
        expect(text.text()).toBe('andycall');

        test.unmount();
    });

    it('auth deleteFormItem in nest Container', async () => {
        let info = {
            body: [{
                type: 'container',
                model: 'outer',
                data: {
                    test: 'yhtree'
                },
                children: [
                    {
                        type: 'form',
                        name: 'authDeleteForm',
                        children: [
                            {
                                type: 'container',
                                model: 'formContainer',
                                props: {
                                    username: '#ES{$parent.outerUserName}',
                                    age: 10
                                },
                                syncDelete: true,
                                export: {
                                    outerUserName: '#ES{$data.username}',
                                    test: '#ES{$data.age}',
                                    mixed: '#ES{$data.username + $data.username}',
                                    'arr.name': '#ES{$data.username}'
                                },
                                children: [
                                    {
                                        type: 'formItem',
                                        label: 'username',
                                        required: true,
                                        show: '#ES{$data.input_type === "a"}',
                                        control: {
                                            type: 'input',
                                            className: 'username',
                                            name: 'username'
                                        }
                                    },
                                    {
                                        type: 'formItem',
                                        label: 'password',
                                        required: true,
                                        show: '#ES{$data.input_type === "b"}',
                                        control: {
                                            type: 'input',
                                            name: 'password'
                                        }
                                    },
                                    {
                                        type: 'formItem',
                                        label: 'type',
                                        required: true,
                                        control: {
                                            type: 'input',
                                            name: 'input_type',
                                            defaultValue: 'a'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('formContainer');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');

        let state = test.getState();
        expect(state.container.outer.outerUserName).toBe('helloworld');
        expect(state.container.outer.test).toBe(10);
        expect(state.container.outer.mixed).toBe('helloworldhelloworld');
        expect(state.container.outer.arr.name).toBe('helloworld');

        let radio = test.getComponentByName('input_type');
        test.setData(radio, 'b');

        state = test.getState();
        expect(state.container.outer.outerUserName).toBe(undefined);
        expect(state.container.outer.test).toBe(10);
        expect(state.container.outer.mixed).toBe(undefined);
        expect(state.container.outer.arr.name).toBe(undefined);
        expect(state.container.formContainer.username).toBe(undefined);

        test.unmount();
    });

    it('[function ExpressionString] auth deleteFormItem in nest Container', async () => {
        let info = {
            body: [{
                type: 'container',
                model: 'outer',
                data: {
                    test: 'yhtree'
                },
                children: [
                    {
                        type: 'form',
                        name: 'authDeleteForm',
                        children: [
                            {
                                type: 'container',
                                model: 'formContainer',
                                props: {
                                    username: (runTime: any) => {
                                        return runTime.$parent.outerUserName;
                                    },
                                    age: 10
                                },
                                syncDelete: true,
                                export: {
                                    outerUserName: (runTime: any) => runTime.$data.username,
                                    test: (runTime: any) => runTime.$data.age,
                                    mixed: (runTime: any) => runTime.$data.username + runTime.$data.username,
                                    'arr.name': (runTime: any) => runTime.$data.username
                                },
                                children: [
                                    {
                                        type: 'formItem',
                                        label: 'username',
                                        required: true,
                                        show: (runTime: any) => runTime.$data.input_type === 'a',
                                        control: {
                                            type: 'input',
                                            className: 'username',
                                            name: 'username'
                                        }
                                    },
                                    {
                                        type: 'formItem',
                                        label: 'password',
                                        required: true,
                                        show: (runTime: any) => runTime.$data.input_type === 'b',
                                        control: {
                                            type: 'input',
                                            name: 'password'
                                        }
                                    },
                                    {
                                        type: 'formItem',
                                        label: 'type',
                                        required: true,
                                        control: {
                                            type: 'input',
                                            name: 'input_type',
                                            defaultValue: 'a'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('formContainer');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');

        let state = test.getState();
        expect(state.container.outer.outerUserName).toBe('helloworld');
        expect(state.container.outer.test).toBe(10);
        expect(state.container.outer.mixed).toBe('helloworldhelloworld');
        expect(state.container.outer.arr.name).toBe('helloworld');

        let radio = test.getComponentByName('input_type');
        test.setData(radio, 'b');

        state = test.getState();
        expect(state.container.outer.outerUserName).toBe(undefined);
        expect(state.container.outer.test).toBe(10);
        expect(state.container.outer.mixed).toBe(undefined);
        expect(state.container.outer.arr.name).toBe(undefined);
        expect(state.container.formContainer.username).toBe(undefined);

        test.unmount();
    });

    it('sync export when inner child component unmount', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'parent',
                children: [
                    {
                        type: 'container',
                        model: 'inner',
                        export: {
                            innerData: `#ES{({
                                username: $data.basic ? $data.basic.username : ''
                            })}`
                        },
                        children: [
                            {
                                type: 'input',
                                name: 'switch'
                            },
                            {
                                type: 'input',
                                hidden: '#ES{$data.switch === "2"}',
                                clearWhenDestroy: true,
                                name: 'basic.username'
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('inner');
        let state = test.getState();
        // expect(state.container.parent.innerData.username).toBe('');

        let switchInput = test.getComponentByName('switch');
        let username = test.getComponentByName('basic.username');

        test.setData(username, 'helloworld');
        test.setData(switchInput, '2');

        state = test.getState();
        expect(state.container.inner.switch).toBe('2');
        expect(state.container.inner.basic.username).toBe(undefined);
        expect(state.container.parent.innerData.username).toBe(undefined);

        test.unmount();
    });

    it('auth deleteFormItem with string export in nest Container', () => {
        function filterExport(data: any) {
            return {
                outerUserName: data.username,
                test: data.username,
                mixed: data.username + data.username,
                'arr.name': data.username
            };
        }

        filter.setFilter('filterExport', filterExport);

        let info = {
            body: [{
                type: 'container',
                model: 'outer',
                data: {
                    test: 'yhtree'
                },
                children: [
                    {
                        type: 'form',
                        name: 'authDeleteForm',
                        children: [
                            {
                                type: 'container',
                                model: 'formContainer',
                                props: {
                                    username: '#ES{$parent.outerUserName}'
                                },
                                export: '#ES{filterExport($data)}',
                                syncDelete: true,
                                forceSyncDelete: true,
                                children: [
                                    {
                                        type: 'formItem',
                                        label: 'username',
                                        required: true,
                                        show: '#ES{$data.input_type === "a"}',
                                        control: {
                                            type: 'input',
                                            className: 'username',
                                            name: 'username'
                                        }
                                    },
                                    {
                                        type: 'formItem',
                                        label: 'password',
                                        required: true,
                                        show: '#ES{$data.input_type === "b"}',
                                        control: {
                                            type: 'input',
                                            name: 'password'
                                        }
                                    },
                                    {
                                        type: 'formItem',
                                        label: 'type',
                                        required: true,
                                        control: {
                                            type: 'input',
                                            name: 'input_type',
                                            defaultValue: 'a'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        test.setContainer('formContainer');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');

        let state = test.getState();
        expect(state.container.outer.outerUserName).toBe('helloworld');
        expect(state.container.outer.test).toBe('helloworld');
        expect(state.container.outer.mixed).toBe('helloworldhelloworld');
        expect(state.container.outer.arr.name).toBe('helloworld');

        test.setContainer('formContainer');
        let radio = test.getComponentByName('input_type');
        test.setData(radio, 'b');
        state = test.getState();
        expect(state.container.outer.outerUserName).toBe(undefined);
        expect(state.container.outer.test).toBe(undefined);
        expect(state.container.outer.mixed).toBe(undefined);
        expect(state.container.outer.arr.name).toBe(undefined);
        expect(state.container.formContainer.username).toBe(undefined);

        test.unmount();
    });

    it('when inner container is destroyed, it can still recover', async () => {
        let config = {
            body: [
                {
                    type: 'container',
                    model: 'demo',
                    data: {
                        username: 'andycall'
                    },
                    children: [
                        {
                            type: 'button',
                            text: 'hide',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: '$this',
                                params: {
                                    modal: false
                                }
                            }]
                        },
                        {
                            type: 'button',
                            text: 'show',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: '$this',
                                params: {
                                    modal: true
                                }
                            }]
                        },
                        {
                            type: 'div',
                            show: '#ES{$data.modal}',
                            children: [
                                {
                                    type: 'container',
                                    model: 'containerModel',
                                    props: {
                                        username: '#ES{$parent.username}'
                                    },
                                    children: [
                                        {
                                            type: 'text',
                                            text: '#ES{$data.username}'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let hide = test.wrapper.find('RCREConnect(button)').at(0);
        let show = test.wrapper.find('RCREConnect(button)').at(1);
        await test.simulate(hide, 'onClick');
        let state = test.getState();
        expect(state.container.containerModel).toBe(undefined);
        await test.simulate(show, 'onClick');
        state = test.getState();
        expect(state.container.containerModel.username).toBe('andycall');

        test.unmount();
    });

    it('clearDataToParentsWhenDestroy', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'outer',
                children: [
                    {
                        type: 'button',
                        text: 'clear',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                clear: true
                            }
                        }]
                    },
                    {
                        type: 'div',
                        hidden: '#ES{$data.clear}',
                        children: [
                            {
                                type: 'container',
                                model: 'child',
                                clearDataToParentsWhenDestroy: true,
                                props: {
                                    username: '#ES{$parent.username}'
                                },
                                export: {
                                    username: '#ES{$data.username}'
                                },
                                children: [{
                                    type: 'input',
                                    name: 'username'
                                }, {
                                    type: 'div',
                                    children: [
                                        {
                                            type: 'container',
                                            model: '222',
                                            children: [{
                                                type: 'input',
                                                name: 'username'
                                            }]
                                        }
                                    ]
                                }]
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('outer');
        let button = test.wrapper.find('RCREConnect(button)');
        let input = test.wrapper.find('RCREConnect(input)').at(0);

        test.setData(input, 'andycall');

        let state = test.getState();
        expect(state.container.outer.username).toBe('andycall');
        expect(state.container.child.username).toBe('andycall');

        await test.simulate(button, 'onClick');

        state = test.getState();
        expect(state.container.outer.username).toBe(undefined);
        expect(state.container.child).toBe(undefined);

        test.unmount();
    });

    it('collect defaultValue will never into hidden and show component', () => {
        let info = {
            body: [{
                type: 'container',
                model: 'defaultCollect',
                data: {
                    hide: true
                },
                children: [
                    {
                        type: 'div',
                        hidden: '#ES{true}',
                        children: [{
                            type: 'input',
                            name: 'hideInput',
                            defaultValue: 'hideValue'
                        }]
                    },
                    {
                        type: 'input',
                        name: 'showInput',
                        defaultValue: 'showValue'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        let state = test.getState();
        expect(state.container.defaultCollect.showInput).toBe('showValue');
        expect(state.container.defaultCollect.hideInput).toBe(undefined);
        test.unmount();
    });

    it('set defaultValue with multiname', () => {
        let info = {
            body: [{
                type: 'container',
                model: 'defaultCollect',
                data: {
                    hide: true
                },
                children: [
                    {
                        type: 'div',
                        hidden: '#ES{true}',
                        children: [{
                            type: 'input',
                            name: 'scope.hideInput',
                            defaultValue: 'hideValue'
                        }]
                    },
                    {
                        type: 'div',
                        children: [
                            {
                                type: 'input',
                                name: 'scope.showInput',
                                defaultValue: 'showValue'
                            }
                        ]
                    },
                    {
                        type: 'input',
                        name: 'arr[0].name',
                        defaultValue: 'test'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(info);
        let state = test.getState();
        expect(state.container.defaultCollect.scope.showInput).toBe('showValue');
        expect(state.container.defaultCollect.scope.hideInput).toBe(undefined);
        expect(state.container.defaultCollect.arr[0].name).toBe('test');
    });

    it('sync data with dataProvider in nest Container', async () => {
        const dataProvider = [{
            mode: 'ajax',
            namespace: 'dataSource',
            config: {
                url: 'http://127.0.0.1:8844/static/table.json',
                method: 'GET'
            },
            responseRewrite: {
                total: '#ES{$output.body.length}',
                showChildChild: true
            }
        }];

        const child = {
            type: 'div',
            show: '#ES{$data.showChildChild}',
            children: [
                {
                    type: 'container',
                    model: 'childChild',
                    props: {
                        total: '#ES{$parent.total}'
                    },
                    bind: [{
                        child: 'total',
                        parent: 'total'
                    }],
                    children: [
                        {
                            type: 'text',
                            text: '#ES{$data.total}'
                        }
                    ]
                }
            ]
        };

        let config = {
            body: [{
                type: 'container',
                model: 'outer',
                data: {
                    username: 'andycall'
                },
                children: [
                    {
                        type: 'button',
                        text: 'A',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                mode: 'A'
                            }
                        }]
                    },
                    {
                        type: 'button',
                        text: 'B',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                mode: 'B'
                            }
                        }]
                    },
                    {
                        type: 'div',
                        show: '#ES{$data.mode === "A"}',
                        children: [
                            {
                                type: 'container',
                                model: 'childA',
                                props: {
                                    username: '#ES{$parent.username}'
                                },
                                dataProvider: dataProvider,
                                children: [
                                    child
                                ]
                            },
                        ]
                    },
                    {
                        type: 'div',
                        show: '#ES{$data.mode === "B"}',
                        children: [
                            {
                                type: 'container',
                                model: 'childB',
                                props: {
                                    username: '#ES{$parent.username}'
                                },
                                dataProvider: dataProvider,
                                children: []
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('outer');

        let A = test.getComponentByType('button', 0);
        let B = test.getComponentByType('button', 1);

        let state = test.getState();

        expect(state.container.outer.username).toBe('andycall');

        await test.simulate(A, 'onClick');

        await test.waitForDataProviderComplete();

        state = test.getState();
        expect(state.container.childA.username).toBe('andycall');
        expect(state.container.childA.total).toBe(13);
        expect(state.container.childA.showChildChild).toBe(true);
        expect(state.container.childChild.total).toBe(13);

        await test.simulate(B, 'onClick');

        await test.waitForDataProviderComplete();

        state = test.getState();

        expect(state.container.childB.username).toBe('andycall');
        expect(state.container.childB.showChildChild).toBe(true);

        test.unmount();
    });

    it('container with loading in container', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'parent',
                data: {
                    startTime: '1521043200'
                },
                dataProvider: [
                    {
                        mode: 'ajax',
                        config: {
                            url: 'http://127.0.0.1:8844/static/table.json',
                            method: 'GET'
                        },
                        namespace: 'dateStartTime'
                    }
                ],
                children: [{
                    type: 'row',
                    show: '#ES{!$data.$loading}',
                    children: [
                        {
                            type: 'container',
                            model: 'test',
                            props: {
                                startTime: '#ES{$parent.startTime}'
                            },
                            children: [
                                {
                                    type: 'text',
                                    show: '#ES{!!$data.startTime}',
                                    text: 'test'
                                }
                            ]
                        }
                    ]
                }
                ]
            }]
        };

        let test = new RCRETestUtil(config);

        await test.waitForDataProviderComplete();
        test.setContainer('test');
        let textElement = test.getComponentByType('text');
        expect(textElement.text()).toBe('test');
    });

    it('Container should export when init', () => {
        let config = {
            body: [{
                type: CoreKind.container,
                model: 'demo',
                children: [
                    {
                        type: CoreKind.div,
                        show: '#ES{$data.showChildContainer}',
                        children: [
                            {
                                type: CoreKind.container,
                                model: 'child-demo',
                                clearDataToParentsWhenDestroy: true,
                                data: {
                                    username: 'andycall'
                                },
                                export: {
                                    username: '#ES{$data.username}'
                                },
                                children: [{
                                    type: CoreKind.text,
                                    text: '1234'
                                }]
                            }
                        ]
                    },
                    {
                        type: 'checkbox',
                        name: 'showChildContainer'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let childCheckbox = test.getComponentByName('showChildContainer');
        test.setData(childCheckbox, true);
        let state = test.getContainerState();
        expect(state.username).toBe('andycall');

        test.setData(childCheckbox, false);
        state = test.getContainerState();
        expect(state.username).toBe(undefined);

        test.setData(childCheckbox, true);
        state = test.getContainerState();
        expect(state.username).toBe('andycall');

        test.unmount();
    });

    it('container inherit', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: [1]
                },
                children: [
                    {
                        type: 'container',
                        model: 'child',
                        data: {
                            username: [],
                            show: true,
                        },
                        props: {
                            username: '#ES{$parent.username}'
                        },
                        export: {
                            username: '#ES{$data.username}'
                        },
                        children: [
                        ]
                    }
                ]
            }]
        };
        let test = new RCRETestUtil(config);
        let state = test.getState().container;
        expect(state.demo).toEqual({username: [1]});
        expect(state.child).toEqual({username: [1], show: true});

        test.unmount();
    });

    it('props can single works without export', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'andycall'
                },
                children: [
                    {
                        type: 'container',
                        model: 'child',
                        props: {
                            username: '#ES{$parent.username}'
                        },
                        children: [{
                            type: 'text',
                            text: '#ES{$data.username}'
                        }]
                    },
                    {
                        type: 'input',
                        name: 'username'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child');
        let state = test.getContainerState();
        expect(state.username).toBe('andycall');

        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'test');

        test.setContainer('child');
        state = test.getContainerState();
        expect(state.username).toBe('test');

        test.unmount();
    });
});
