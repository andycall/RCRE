import React from 'react';
import {
    clearStore,
    CustomerParams,
    DataCustomer,
    JSONRender,
    filter,
    FuncCustomerArgs
} from 'rcre';
import {mount} from 'enzyme';
import axios from 'axios';
import moxios from 'moxios';
import {RCRETestUtil, simulate} from 'rcre-test-tools';
import {CoreKind} from '../../../packages/rcre/src/types';

describe('DataCustomer', () => {
    beforeEach(() => {
        clearStore();
        filter.clearFilter();
        DataCustomer.funcCustomer.clearCustomer();
        moxios.install(axios);
    });

    afterEach(() => {
        moxios.uninstall(axios);
    });

    it('$this', async () => {
        let config = {
            body: [{
                type: CoreKind.container,
                model: 'demo',
                children: [{
                    type: 'button',
                    text: 'click me',
                    trigger: [{
                        event: 'onClick',
                        targetCustomer: '$this',
                        params: {
                            username: 'helloworld'
                        }
                    }]
                }, {
                    type: CoreKind.text,
                    text: '#ES{$data.username}'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let text = test.getComponentByType('text');
        expect(text.text()).toBe('helloworld');
    });

    it('$parent', async () => {
        let config = {
            body: [{
                type: CoreKind.container,
                model: 'demo',
                children: [
                    {
                        type: CoreKind.container,
                        model: 'child',
                        children: [
                            {
                                type: 'button',
                                text: 'click me',
                                trigger: [{
                                    event: 'onClick',
                                    targetCustomer: '$parent',
                                    params: {
                                        username: 'helloworld'
                                    }
                                }]
                            }
                        ]
                    },
                    {
                        type: CoreKind.text,
                        text: '#ES{$data.username}'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        test.setContainer('demo');
        let text = test.getComponentByType('text');
        expect(text.text()).toBe('helloworld');
    });

    it('dynamic targetCustomer', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'container',
                        model: 'child',
                        children: [
                            {
                                type: 'input',
                                name: 'dynamicSelect',
                                defaultValue: '$this'
                            },
                            {
                                type: 'button',
                                text: 'click me',
                                trigger: [{
                                    event: 'onClick',
                                    targetCustomer: '#ES{$data.dynamicSelect}',
                                    params: {
                                        username: '#ES{$data.dynamicSelect + "value"}'
                                    },
                                    // debug: true
                                }]
                            }
                        ]
                    },
                    {
                        type: 'text',
                        text: '#ES{$data.username}'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let childState = test.getContainerState();
        expect(childState.username).toBe('$thisvalue');

        let select = test.getComponentByName('dynamicSelect');
        test.setData(select, '$parent');
        await test.simulate(button, 'onClick');

        test.setContainer('demo');
        let text = test.getComponentByType('text');
        expect(text.text()).toBe('$parentvalue');
    });

    it('helloworld', () => {
        return new Promise((resolve, reject) => {
            DataCustomer.registerCustomerInstance('helloworld', (conf: any, params: CustomerParams) => {
                expect(conf.test).toBe(1);
                resolve();
            });

            let config = {
                body: [{
                    type: CoreKind.container,
                    model: 'demo',
                    dataCustomer: {
                        customers: [{
                            mode: 'helloworld',
                            name: 'demo',
                            config: {
                                test: 1
                            }
                        }]
                    },
                    children: [
                        {
                            type: 'button',
                            text: 'helloworld',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: 'demo',
                                params: {
                                    name: 'test'
                                }
                            }]
                        }
                    ]
                }]
            };

            let test = new RCRETestUtil(config);
            test.setContainer('demo');
            let button = test.getComponentByType('button');

            test.simulate(button, 'onClick').then(() => {
            });
        });
    });

    it('dataPass', async () => {
        let config = {
            body: [{
                type: CoreKind.container,
                model: 'dataPassDemo',
                dataCustomer: {
                    customers: [
                        {
                            name: 'passData',
                            mode: 'pass',
                            config: {
                                model: 'dataPassDemo',
                                assign: {
                                    fromData: '#ES{$trigger.passData.data}'
                                }
                            }
                        }
                    ]
                },
                children: [
                    {
                        type: CoreKind.text,
                        text: 'pass',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: 'passData',
                            params: {
                                data: 'helloworld'
                            }
                        }]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);

        let text = test.wrapper.find('RCREConnect(text)');

        await test.simulate(text, 'onClick');

        let state = test.getState();
        expect(state.container.dataPassDemo.fromData).toBe('helloworld');
    });

    it('multi targetCustomer', async () => {
        let config = {
            body: [{
                type: CoreKind.container,
                model: 'demo',
                children: [
                    {
                        type: CoreKind.container,
                        model: 'child',
                        children: [
                            {
                                type: 'button',
                                text: 'text',
                                trigger: [{
                                    event: 'onClick',
                                    targetCustomer: ['$this', '$parent'],
                                    params: {
                                        username: 'helloworld'
                                    }
                                }]
                            },
                            {
                                type: CoreKind.text,
                                text: '#ES{$data.username}'
                            }
                        ]
                    },
                    {
                        type: CoreKind.text,
                        text: '#ES{$data.username}'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let childText = test.getComponentByType('text');
        expect(childText.text()).toBe('helloworld');

        test.setContainer('demo');
        let parentText = test.getComponentByType('text');
        expect(parentText.text()).toBe('helloworld');
    });

    it('multi event handler', async () => {
        let config = {
            body: [{
                type: CoreKind.container,
                model: 'demo',
                children: [
                    {
                        type: CoreKind.container,
                        model: 'child',
                        children: [
                            {
                                type: 'button',
                                text: 'text',
                                trigger: [{
                                    event: 'onClick',
                                    targetCustomer: '$this',
                                    params: {
                                        username: 'helloworld'
                                    }
                                }, {
                                    event: 'onClick',
                                    targetCustomer: '$parent',
                                    params: {
                                        username: 'helloworld'
                                    }
                                }]
                            },
                            {
                                type: CoreKind.text,
                                text: '#ES{$data.username}'
                            }
                        ]
                    },
                    {
                        type: CoreKind.text,
                        text: '#ES{$data.username}'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let childText = test.getComponentByType('text');
        expect(childText.text()).toBe('helloworld');

        test.setContainer('demo');
        let parentText = test.getComponentByType('text');
        expect(parentText.text()).toBe('helloworld');
    });

    it('funcCustomer', async () => {
        DataCustomer.registerCustomerInstance('normalCustomer', (c, $args) => {
            expect(c.source).toBe(1);
            expect($args.params.eventData).toBe('onClick data');
            return {
                name: 1
            };
        });

        DataCustomer.funcCustomer.setCustomer('firstFunc', $args => {
            expect($args.prev.name).toBe(1);
            expect($args.params.eventData).toBe('onClick data');
            return 1;
        });

        DataCustomer.funcCustomer.setCustomer('secondFunc', $args => {
            expect($args.prev).toBe(1);
            expect($args.params.eventData).toBe('onClick data');
            return 2;
        });

        let config = {
            body: [
                {
                    type: CoreKind.container,
                    model: 'funcCustomerDemo',
                    dataCustomer: {
                        customers: [
                            {
                                name: 'normalCustomer',
                                mode: 'normalCustomer',
                                config: {
                                    source: 1
                                }
                            },
                            {
                                name: 'firstFunc',
                                func: '#ES{firstFunc}'
                            },
                            {
                                name: 'secondFunc',
                                func: '#ES{secondFunc}'
                            }
                        ],
                        groups: [{
                            name: 'funcGroup',
                            steps: ['normalCustomer', 'firstFunc', 'secondFunc']
                        }]
                    },
                    children: [
                        {
                            type: CoreKind.text,
                            text: 'click',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: 'funcGroup',
                                params: {
                                    eventData: 'onClick data'
                                }
                            }]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(config);
        let text = test.wrapper.find('RCREConnect(text)');

        await test.simulate(text, 'onClick');
    });

    it('submit dataCustomer', () => {
        return new Promise(async (resolve, reject) => {
            let config = {
                body: [
                    {
                        type: CoreKind.container,
                        model: 'submit',
                        data: {
                            username: 'andycall',
                            password: '123456'
                        },
                        dataCustomer: {
                            customers: [
                                {
                                    mode: 'submit',
                                    name: 'formSubmit',
                                    config: {
                                        url: '/submit',
                                        method: 'POST',
                                        data: {
                                            username: '#ES{$data.username}',
                                            password: '#ES{$data.password}'
                                        }
                                    }
                                }
                            ]
                        },
                        children: [
                            {
                                type: 'input',
                                name: 'username'
                            },
                            {
                                type: 'input',
                                name: 'password'
                            },
                            {
                                type: 'button',
                                text: 'submit',
                                trigger: [{
                                    event: 'onSubmit',
                                    targetCustomer: 'formSubmit',
                                    params: {}
                                }]
                            }
                        ]
                    }
                ]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;
            test.setContainer('submit');
            let button = test.getComponentByType('button');

            moxios.wait(async () => {
                let request = moxios.requests.mostRecent();
                let requestData = JSON.parse(request.config.data);
                expect(requestData.username).toBe('andycall');
                expect(requestData.password).toBe('123456');
                await request.respondWith({
                    status: 200,
                    response: {
                        errno: 0,
                        errmsg: 'ok'
                    }
                });

                resolve();
            });

            await simulate(wrapper, button, 'onSubmit');
        });
    });

    it('data submit customer with http 500 error', () => {
        return new Promise(async (resolve, reject) => {
            DataCustomer.registerError((e: Error) => {
                expect(e.message).toBe('请求失败');
            });

            let config = {
                body: [
                    {
                        type: CoreKind.container,
                        model: 'submit',
                        data: {
                            username: 'andycall',
                            password: '123456'
                        },
                        dataCustomer: {
                            customers: [
                                {
                                    mode: 'submit',
                                    name: 'formSubmit',
                                    config: {
                                        url: '/submit',
                                        method: 'POST',
                                        data: {
                                            username: '#ES{$data.username}',
                                            password: '#ES{$data.password}'
                                        },
                                        retErrMsg: '#ES{$output.errmsg || "请求失败"}'
                                    }
                                }
                            ]
                        },
                        children: [
                            {
                                type: 'input',
                                name: 'username'
                            },
                            {
                                type: 'input',
                                name: 'password'
                            },
                            {
                                type: 'button',
                                text: 'submit',
                                trigger: [{
                                    event: 'onSubmit',
                                    targetCustomer: 'formSubmit',
                                    params: {}
                                }]
                            }
                        ]
                    }
                ]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;
            test.setContainer('submit');
            let button = test.getComponentByType('button');

            moxios.wait(async () => {
                let request = moxios.requests.mostRecent();
                let requestData = JSON.parse(request.config.data);
                expect(requestData.username).toBe('andycall');
                expect(requestData.password).toBe('123456');
                await request.respondWith({
                    status: 500
                });

                resolve();
            });

            await simulate(wrapper, button, 'onSubmit');
        });
    });

    it('data submit customer with retCheckPattern failed', () => {
        return new Promise(async (resolve, reject) => {
            DataCustomer.registerError((e: Error) => {
                expect(e.message).toBe('数据调用错误');
            });

            let config = {
                body: [
                    {
                        type: CoreKind.container,
                        model: 'submit',
                        data: {
                            username: 'andycall',
                            password: '123456'
                        },
                        dataCustomer: {
                            customers: [
                                {
                                    mode: 'submit',
                                    name: 'formSubmit',
                                    config: {
                                        url: '/submit',
                                        method: 'POST',
                                        data: {
                                            username: '#ES{$data.username}',
                                            password: '#ES{$data.password}'
                                        },
                                        retCheckPattern: '#ES{$output.errno === 0}',
                                        retErrMsg: '#ES{$output.errmsg}'
                                    }
                                }
                            ]
                        },
                        children: [
                            {
                                type: 'input',
                                name: 'username'
                            },
                            {
                                type: 'input',
                                name: 'password'
                            },
                            {
                                type: 'button',
                                text: 'submit',
                                trigger: [{
                                    event: 'onSubmit',
                                    targetCustomer: 'formSubmit',
                                    params: {}
                                }]
                            }
                        ]
                    }
                ]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;
            test.setContainer('submit');
            let button = test.getComponentByType('button');

            moxios.wait(async () => {
                let request = moxios.requests.mostRecent();
                let requestData = JSON.parse(request.config.data);
                expect(requestData.username).toBe('andycall');
                expect(requestData.password).toBe('123456');
                await request.respondWith({
                    status: 200,
                    response: {
                        errno: 500,
                        errmsg: '数据调用错误'
                    }
                });

                resolve();
            });

            await simulate(wrapper, button, 'onSubmit');
        });
    });

    it('data submit customer with export', () => {
        return new Promise(async (resolve, reject) => {
            let config = {
                body: [
                    {
                        type: CoreKind.container,
                        model: 'submit',
                        data: {
                            username: 'andycall',
                            password: '123456'
                        },
                        dataCustomer: {
                            customers: [
                                {
                                    mode: 'submit',
                                    name: 'formSubmit',
                                    config: {
                                        url: '/submit',
                                        method: 'POST',
                                        data: {
                                            username: '#ES{$data.username}',
                                            password: '#ES{$data.password}'
                                        },
                                        retCheckPattern: '#ES{$output.errno === 0}',
                                        retErrMsg: '#ES{$output.errmsg}',
                                        export: {
                                            name: '#ES{$output.data.name}'
                                        }
                                    }
                                }
                            ]
                        },
                        children: [
                            {
                                type: 'input',
                                name: 'username'
                            },
                            {
                                type: 'input',
                                name: 'password'
                            },
                            {
                                type: 'button',
                                text: 'submit',
                                trigger: [{
                                    event: 'onSubmit',
                                    targetCustomer: 'formSubmit',
                                    params: {}
                                }]
                            }
                        ]
                    }
                ]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;
            test.setContainer('submit');

            let button = test.getComponentByType('button');

            moxios.wait(async () => {
                let request = moxios.requests.mostRecent();
                let requestData = JSON.parse(request.config.data);
                expect(requestData.username).toBe('andycall');
                expect(requestData.password).toBe('123456');
                await request.respondWith({
                    status: 200,
                    response: {
                        errno: 0,
                        errmsg: 'ok',
                        data: {
                            name: 'RCRE is best'
                        }
                    }
                });

                let state = test.getState();
                expect(state.container.submit.name).toBe('RCRE is best');

                resolve();
            });

            await simulate(wrapper, button, 'onSubmit');
        });
    });

    it('form submit with application/x-www-form-urlencoded encode', () => {
        return new Promise(async (resolve, reject) => {
            DataCustomer.registerError((e: Error) => {
                expect(e.message).toBe('请求失败');
            });

            let config = {
                body: [
                    {
                        type: CoreKind.container,
                        model: 'submit',
                        data: {
                            username: 'andycall',
                            password: '123456'
                        },
                        dataCustomer: {
                            customers: [
                                {
                                    mode: 'submit',
                                    name: 'formSubmit',
                                    config: {
                                        url: '/submit',
                                        method: 'POST',
                                        data: {
                                            username: '#ES{$data.username}',
                                            password: '#ES{$data.password}'
                                        },
                                        formSubmit: true,
                                        retErrMsg: '#ES{$output.errmsg || "请求失败"}'
                                    }
                                }
                            ]
                        },
                        children: [
                            {
                                type: 'input',
                                name: 'username'
                            },
                            {
                                type: 'input',
                                name: 'password'
                            },
                            {
                                type: 'button',
                                text: 'submit',
                                trigger: [{
                                    event: 'onSubmit',
                                    targetCustomer: 'formSubmit',
                                    params: {}
                                }]
                            }
                        ]
                    }
                ]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;
            test.setContainer('submit');

            let button = test.getComponentByType('button');
            moxios.wait(async () => {
                let request = moxios.requests.mostRecent();
                expect(request.config.data).toBe('username=andycall&password=123456');
                await request.respondWith({
                    status: 200,
                    response: {}
                });

                resolve();
            });

            await simulate(wrapper, button, 'onSubmit');
        });
    });

    it('$parent targetCustomer', async () => {
        let config = {
            body: [
                {
                    type: CoreKind.container,
                    model: 'outer',
                    children: [
                        {
                            type: CoreKind.container,
                            model: 'inner',
                            data: {
                                username: 'helloworld'
                            },
                            children: [
                                {
                                    type: 'button',
                                    text: 'updateValue',
                                    trigger: [
                                        {
                                            event: 'onClick',
                                            targetCustomer: '$parent',
                                            params: {
                                                username: '#ES{$data.username}'
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

        let test = new RCRETestUtil(config);
        test.setContainer('inner');
        let wrapper = test.wrapper;

        let button = test.getComponentByType('button');

        await simulate(wrapper, button, 'onClick');

        let state = test.getState();
        expect(state.container.outer.username).toBe('helloworld');
    });

    it('async funcCustomer', async () => {
        DataCustomer.funcCustomer.setCustomer('asyncFn', ($args) => {
            return new Promise((resolve) => {
                let args = $args.params;

                expect(args.username).toBe('andycall');

                setTimeout(() => {
                    resolve({
                        name: 'helloworld'
                    });
                }, 100);
            });
        });

        let config = {
            body: [
                {
                    type: CoreKind.container,
                    model: 'outer',
                    dataCustomer: {
                        customers: [{
                            name: 'asyncFunc',
                            func: '#ES{asyncFn}'
                        }, {
                            name: 'passData',
                            mode: 'pass',
                            config: {
                                model: 'outer',
                                assign: {
                                    name: '#ES{$prev.name}',
                                    age: '#ES{$trigger.passData.age}'
                                }
                            }
                        }],
                        groups: [{
                            name: 'asyncPassData',
                            steps: ['asyncFunc', 'passData']
                        }]
                    },
                    children: [
                        {
                            type: 'button',
                            text: 'click',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: 'asyncPassData',
                                params: {
                                    username: 'andycall',
                                    age: 22
                                }
                            }]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(config);
        let wrapper = test.wrapper;

        test.setContainer('outer');

        let button = test.getComponentByType('button');
        await simulate(wrapper, button, 'onClick');

        let state = test.getState();
        expect(state.container.outer.name).toBe('helloworld');
        expect(state.container.outer.age).toBe(22);
    });

    it('customer won"t exec when previous got error', async () => {
        let config = {
            body: [
                {
                    type: CoreKind.container,
                    model: 'customerGroup',
                    dataCustomer: {
                        customers: [
                            {
                                mode: 'submit',
                                name: 'step1',
                                config: {
                                    url: '/submit',
                                    method: 'GET',
                                    data: {
                                        text: '1234'
                                    }
                                }
                            },
                            {
                                mode: 'submit',
                                name: 'step2',
                                config: {
                                    url: '/submit2',
                                    method: 'GET',
                                    data: {
                                        text: '4567'
                                    }
                                }
                            }
                        ],
                        groups: [{
                            name: 'submitGroup',
                            steps: ['step1', 'step2']
                        }]
                    },
                    children: [
                        {
                            type: CoreKind.text,
                            text: 'submit',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: 'submitGroup',
                                params: {}
                            }]
                        }
                    ]
                }
            ]
        };

        let component = <JSONRender code={config}/>;
        let wrapper = mount(component);

        let button = wrapper.find('RCREConnect(text)');

        DataCustomer.errorHandler = function (error: Error) {
            expect(error.message).toBe('Request failed with status code 500');
        };

        moxios.wait(async () => {
            let submitRequest = moxios.requests.get('GET', '/submit?text=1234');

            await submitRequest.respondWith({
                status: 500
            });

            // 正确的情况就是啥都不做，单测正常跑过，如果单测超时，则有问题
        });

        await simulate(wrapper, button, 'onClick');
    });

    it('customer exec when add keepWhenError property in groups', async () => {
        return new Promise(async (resolve) => {
            let config = {
                body: [
                    {
                        type: CoreKind.container,
                        model: 'customerGroup',
                        dataCustomer: {
                            customers: [
                                {
                                    mode: 'submit',
                                    name: 'step1',
                                    config: {
                                        url: '/submit',
                                        method: 'GET',
                                        data: {
                                            text: '1234'
                                        }
                                    }
                                },
                                {
                                    mode: 'submit',
                                    name: 'step2',
                                    config: {
                                        url: '/submit2',
                                        method: 'GET',
                                        data: {
                                            text: '4567'
                                        }
                                    }
                                }
                            ],
                            groups: [{
                                name: 'submitGroup',
                                keepWhenError: true,
                                steps: ['step1', 'step2']
                            }]
                        },
                        children: [
                            {
                                type: CoreKind.text,
                                text: 'submit',
                                trigger: [{
                                    event: 'onClick',
                                    targetCustomer: 'submitGroup',
                                    params: {}
                                }]
                            }
                        ]
                    }
                ]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;

            let button = wrapper.find('RCREConnect(text)');

            DataCustomer.errorHandler = function (error: Error) {
                expect(error.message).toBe('Request failed with status code 500');
            };

            moxios.wait(async () => {
                let submitRequest = moxios.requests.get('GET', '/submit?text=1234');

                await submitRequest.respondWith({
                    status: 500
                });

                let secondRequest = moxios.requests.get('GET', '/submit2?text=4567');
                await secondRequest.respondWith({
                    status: 200,
                    response: {
                        text: '1234'
                    }
                });

                let state = test.getState();
                expect(state).toMatchSnapshot();
                resolve();
            });

            await simulate(wrapper, button, 'onClick');
        });
    });

    it('one event to three customer', async () => {
        let config = {
            body: [{
                type: CoreKind.container,
                model: 'demo',
                children: [
                    {
                        type: 'button',
                        text: 'text',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                username: '1234'
                            }
                        }, {
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                password: '4567'
                            }
                        }, {
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                abcd: '9999'
                            }
                        }]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let state = test.getContainerState();
        expect(state).toEqual(
            {username: '1234', password: '4567', abcd: '9999'}
        );
    });

    it('child container can use parent dataCustomer', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                dataCustomer: {
                    customers: [{
                        mode: 'pass',
                        name: 'sendDataToDemo2',
                        config: {
                            model: 'demo2',
                            assign: {
                                username: '#ES{$trigger.sendDataToDemo2.username}'
                            }
                        }
                    }]
                },
                children: [
                    {
                        type: 'container',
                        model: 'child',
                        children: [
                            {
                                type: 'button',
                                text: 'click',
                                trigger: [{
                                    event: 'onClick',
                                    targetCustomer: 'sendDataToDemo2',
                                    params: {
                                        username: 'helloworld'
                                    }
                                }]
                            }
                        ]
                    }
                ]
            }, {
                type: 'container',
                model: 'demo2',
                children: [{
                    type: 'text',
                    text: '#ES{$data.username}'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let state = test.getState();
        expect(state.trigger.child).toEqual({sendDataToDemo2: {username: 'helloworld'}});
        expect(state.container.demo2.username).toBe('helloworld');
    });

    it('child"s child container can use parent dataCustomer', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                dataCustomer: {
                    customers: [{
                        mode: 'pass',
                        name: 'sendDataToDemo2',
                        config: {
                            model: 'demo2',
                            assign: {
                                username: '#ES{$trigger.sendDataToDemo2.username}'
                            }
                        }
                    }]
                },
                children: [
                    {
                        type: 'container',
                        model: 'child',
                        children: [
                            {
                                type: 'container',
                                model: 'child-child',
                                children: [
                                    {
                                        type: 'button',
                                        text: 'click',
                                        trigger: [{
                                            event: 'onClick',
                                            targetCustomer: 'sendDataToDemo2',
                                            params: {
                                                username: 'helloworld'
                                            }
                                        }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, {
                type: 'container',
                model: 'demo2',
                children: [{
                    type: 'text',
                    text: '#ES{$data.username}'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child-child');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let state = test.getState();
        expect(state.trigger['child-child']).toEqual({sendDataToDemo2: {username: 'helloworld'}});
        expect(state.container.demo2.username).toBe('helloworld');
    });

    it('child has priority than parents', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                dataCustomer: {
                    customers: [{
                        mode: 'pass',
                        name: 'sendDataToDemo2',
                        config: {
                            model: 'demo2',
                            assign: {
                                username: '#ES{$trigger.sendDataToDemo2.username}'
                            }
                        }
                    }]
                },
                children: [
                    {
                        type: 'container',
                        model: 'child',
                        dataCustomer: {
                            customers: [{
                                mode: 'pass',
                                name: 'sendDataToDemo2',
                                config: {
                                    model: 'demo2',
                                    assign: {
                                        otherName: '#ES{$trigger.sendDataToDemo2.username}'
                                    }
                                }
                            }]
                        },
                        children: [
                            {
                                type: 'container',
                                model: 'child-child',
                                children: [
                                    {
                                        type: 'button',
                                        text: 'click',
                                        trigger: [{
                                            event: 'onClick',
                                            targetCustomer: 'sendDataToDemo2',
                                            params: {
                                                username: 'helloworld'
                                            }
                                        }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, {
                type: 'container',
                model: 'demo2',
                children: [{
                    type: 'text',
                    text: '#ES{$data.username}'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('child-child');
        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let state = test.getState();
        console.log(state.trigger);
        expect(state.trigger['child-child']).toEqual({sendDataToDemo2: {username: 'helloworld'}});
        expect(state.container.demo2.otherName).toBe('helloworld');
    });

    it('multi dataCustomer pass with async and sync', async () => {
        filter.setFilter('asyncCustomer', async () => {
            return await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('123456');
                }, 1000);
            });
        });

        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'input',
                        name: 'abcd'
                    },
                    {
                        type: 'text',
                        text: '#ES{$data.username}'
                    },
                    {
                        type: 'button',
                        text: 'click',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                username: 'andycall'
                            }
                        }, {
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                password: '#ES{asyncCustomer()}'
                            }
                        }]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let input = test.getComponentByName('abcd');
        test.setData(input, '0000');

        let button = test.getComponentByType('button');
        await new Promise((resolve) => {
            test.simulate(button, 'onClick').then(() => {
                resolve();
            });

            setTimeout(() => {
                let text = test.getComponentByType('text');
                expect(text.text()).toBe('andycall');
            }, 200);
        });

        expect(test.getContainerState()).toEqual({
            abcd: '0000',
            username: 'andycall',
            password: '123456'
        });
    });

    it('async dataCustomer with groups', async () => {
        filter.setFilter('asyncCustomer', async () => {
            return await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('123456');
                }, 100);
            });
        });

        DataCustomer.funcCustomer.setCustomer('asyncDataCustomerA', (params: FuncCustomerArgs<any>) => {
            return new Promise((resolve) => {
                expect(params.params.username).toBe('andycall');
                setTimeout(() => {
                    resolve('A');
                }, 500);
            });
        });

        DataCustomer.funcCustomer.setCustomer('asyncDataCustomerB', (params: FuncCustomerArgs<any>) => {
            return new Promise((resolve) => {
                expect(params.params.username).toBe('andycall');
                expect(params.prev).toBe('A');
                setTimeout(() => {
                    resolve('B');
                }, 500);
            });
        });

        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                dataCustomer: {
                    customers: [{
                        name: 'asyncA',
                        func: '#ES{asyncDataCustomerA}'
                    }, {
                        name: 'asyncB',
                        func: '#ES{asyncDataCustomerB}'
                    }, {
                        name: 'passToSelf',
                        mode: 'pass',
                        config: {
                            model: 'demo',
                            assign: {
                                username: '#ES{$prev}'
                            }
                        }
                    }],
                    groups: [{
                        name: 'asyncGroup',
                        steps: ['asyncA', 'asyncB', 'passToSelf']
                    }]
                },
                children: [
                    {
                        type: 'input',
                        name: 'abcd'
                    },
                    {
                        type: 'text',
                        text: '#ES{$data.password}'
                    },
                    {
                        type: 'button',
                        text: 'click',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: 'asyncGroup',
                            params: {
                                username: 'andycall'
                            }
                        }, {
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                password: '#ES{asyncCustomer()}'
                            }
                        }]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let input = test.getComponentByName('abcd');
        test.setData(input, '0000');

        let button = test.getComponentByType('button');

        await new Promise((resolve) => {
            test.simulate(button, 'onClick').then(() => {
                resolve();
            });

            setTimeout(() => {
                let text = test.getComponentByType('text');
                expect(text.text()).toBe('123456');
            }, 200);
        });

        expect(test.getContainerState()).toEqual({
            abcd: '0000',
            username: 'B',
            password: '123456'
        });
    });
});