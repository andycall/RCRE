import React from 'react';
import {mount} from 'enzyme';
import {filter, JSONRender, FuncCustomerArgs} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import moxios from 'moxios';
import axios from 'axios';
// import {CoreKind} from '../../../../packages/rcre/src/types';

describe('FormItem', () => {
    beforeEach(() => {
        moxios.install(axios);
    });

    afterEach(() => {
        moxios.uninstall(axios);
    });

    it('basicForm', () => {
        return new Promise((resolve, reject) => {
            let basicConfig = {
                body: [
                    {
                        'type': 'container',
                        'model': 'form',
                        'dataCustomer': {
                            'customers': [{
                                'mode': 'submit',
                                'name': 'submitForm',
                                'config': {
                                    'url': '/api/mock/submit',
                                    'method': 'GET',
                                    'data': '#ES{$trigger.submitForm}'
                                }
                            }, {
                                'name': 'asyncCallback',
                                'func': '#ES{asyncCallback}'
                            }],
                            'groups': [{
                                'name': 'asyncSubmit',
                                'steps': ['submitForm', 'asyncCallback']
                            }]
                        },
                        'data': {
                            'username': 'andycallandycal',
                            'max': 20
                        },
                        'children': [
                            {
                                'type': 'form',
                                'name': 'basicForm',
                                'clearAfterSubmit': true,
                                'trigger': [
                                    {
                                        'event': 'onSubmit',
                                        'targetCustomer': 'asyncSubmit',
                                        'params': {
                                            'username': '#ES{$args.username}'
                                        }
                                    }
                                ],
                                'children': [
                                    {
                                        'type': 'formItem',
                                        'label': '姓名',
                                        'required': true,
                                        'rules': [{
                                            'maxLength': '#ES{$data.max}',
                                            'message': '长度不能超过#ES{$data.max}个字符'
                                        }, {
                                            'required': true,
                                            'message': '姓名是必填属性'
                                        }],
                                        'control': {
                                            'type': 'input',
                                            'name': 'username',
                                            'placeholder': '请输入姓名',
                                            className: 'test-username'
                                        },
                                        'extra': 'Extra Text'
                                    },
                                    {
                                        'type': 'formItem',
                                        'label': '单价',
                                        'required': true,
                                        'rules': [{
                                            'max': 0,
                                            'message': '不能大于0'
                                        }],
                                        'control': {
                                            'type': 'input',
                                            'name': 'price'
                                        }
                                    },
                                    {
                                        'type': 'formItem',
                                        'label': '动态控制验证',
                                        'control': {
                                            'type': 'input',
                                            'name': 'max'
                                        }
                                    },
                                    {
                                        'type': 'formItem',
                                        'wrapperCol': {
                                            'offset': 4
                                        },
                                        'control': {
                                            'type': 'button',
                                            'text': '提交',
                                            'disabled': '#ES{!$form.valid}'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            let test = new RCRETestUtil(basicConfig);
            let wrapper = test.wrapper;
            let username = wrapper.find('input').at(0);
            let price = wrapper.find('input').at(1);
            let max = wrapper.find('input').at(2);

            username.simulate('change', {
                target: {
                    value: 'andycall'
                }
            });
            let state = test.getState();
            let formState = test.getFormState('basicForm');
            expect(state.container.form.username).toBe('andycall');
            expect(formState.control.username.valid).toBe(true);

            username.simulate('change', {
                target: {
                    value: ''
                }
            });

            username.simulate('blur', {});
            formState = test.getFormState('basicForm');
            expect(formState.valid).toBe(false);

            price.simulate('change', {
                target: {
                    value: 10
                }
            });

            state = test.getState();
            formState = test.getFormState('basicForm');
            let formControl = formState.control;
            let priceControl = formControl.price;
            expect(priceControl.valid).toBe(false);
            expect(priceControl.status).toBe('error');
            expect(priceControl.errorMsg).toBe('不能大于0');

            price.simulate('change', {
                target: {
                    value: -10
                }
            });

            formState = test.getFormState('basicForm');

            expect(formState.control.price.valid).toBe(true);

            const str = 'abfdeijwidjwijdwijdoqwijdqiodjqiwojdwoqijdqw';
            username.simulate('change', {
                target: {
                    value: str
                }
            });
            state = test.getState();
            formState = test.getFormState('basicForm');
            expect(state.container.form.username).toBe(str);
            expect(formState.control.username.valid).toBe(false);
            expect(formState.control.username.errorMsg).toBe('长度不能超过20个字符');

            max.simulate('change', {
                target: {
                    value: str.length + 1
                }
            });
            expect(formState.control.username.valid).toBe(true);

            function asyncCallback($args: FuncCustomerArgs<any>) {
                let params = $args.params;
                try {
                    expect(params.username).toBe('abfdeijwidjwijdwijdoqwijdqiodjqiwojdwoqijdqw');
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }

            filter.setFilter('asyncCallback', asyncCallback);

            let form = wrapper.find('form').at(0);
            form.simulate('submit', {});

            moxios.wait(async () => {
                let submitRequest = moxios.requests.mostRecent();

                expect(JSON.parse(submitRequest.config.data)).toEqual({
                    username: 'abfdeijwidjwijdwijdoqwijdqiodjqiwojdwoqijdqw'
                });

                await submitRequest.respondWith({
                    status: 200,
                    response: {
                        errno: 0
                    }
                });
            });
        });
    });

    describe('unexpected form config', () => {
        it('formItem required in outside', async () => {
            let config = {
                body: [{
                    type: 'container',
                    model: 'testFormContainer',
                    children: [
                        {
                            type: 'form',
                            name: 'testForm',
                            children: [{
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'username'
                                }
                            }]
                        }
                    ]
                }]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;
            await test.triggerFormValidate('testForm');
            let formState = test.getFormState('testForm');
            expect(formState.valid).toBe(false);
            expect(formState.control.username.valid).toBe(false);
            expect(formState.control.username.required).toBe(true);
            wrapper.unmount();
        });

        it('formItem required in rules', async () => {
            let config = {
                body: [{
                    type: 'container',
                    model: 'testFormContainer',
                    children: [
                        {
                            type: 'form',
                            name: 'nestTestForm',
                            children: [{
                                type: 'formItem',
                                rules: [{
                                    required: true,
                                    message: '内容必填'
                                }],
                                control: {
                                    type: 'input',
                                    name: 'username'
                                }
                            }]
                        }
                    ]
                }]
            };

            let test = new RCRETestUtil(config);
            let wrapper = test.wrapper;
            await test.triggerFormValidate('nestTestForm');
            let formState = test.getFormState('nestTestForm');
            expect(formState.valid).toBe(false);
            expect(formState.control.username.valid).toBe(false);
            expect(formState.control.username.required).toBe(true);

            let username = wrapper.find('input').at(0);
            username.simulate('blur', {});
            formState = test.getFormState('nestTestForm');

            expect(formState.control.username.errorMsg).toBe('内容必填');
            wrapper.unmount();
        });
    });

    it('sync FormItem Value in parent Container', async () => {
        const FORM_NAME = 'testForm';
        let config = {
            body: [{
                type: 'container',
                model: 'rootContainer',
                children: [
                    {
                        type: 'button',
                        text: 'setValue',
                        trigger: [{
                            event: 'onClick',
                            targetCustomer: '$this',
                            params: {
                                username: 'andycall'
                            }
                        }]
                    },
                    {
                        type: 'container',
                        model: 'formContainer',
                        props: {
                            username: '#ES{$parent.username}'
                        },
                        export: {
                            username: '#ES{$data.username}'
                        },
                        children: [
                            {
                                type: 'form',
                                name: FORM_NAME,
                                children: [
                                    {
                                        type: 'formItem',
                                        required: true,
                                        control: {
                                            type: 'input',
                                            name: 'username'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }]
        };

        let util = new RCRETestUtil(config);
        util.setContainer('rootContainer');
        let button = util.getComponentByType('button');
        await util.simulate(button, 'onClick');
        let formState = util.getFormState(FORM_NAME);
        expect(formState.valid).toBe(true);
        expect(formState.control.username.valid).toBe(true);
    });

    it('sync FormItem Value in parent Container using dataProvider', async () => {
        return new Promise(async (resolve, reject) => {
            const FORM_NAME = 'testForm';
            let config = {
                body: [{
                    type: 'container',
                    model: 'rootContainer',
                    dataProvider: [{
                        mode: 'ajax',
                        config: {
                            url: '/api/mock/submit',
                            method: 'GET',
                            data: {
                                username: '1'
                            }
                        },
                        namespace: 'submitData',
                        responseRewrite: {
                            username: '#ES{$output.data.username}'
                        }
                    }],
                    children: [
                        {
                            type: 'container',
                            model: 'formContainer',
                            props: {
                                username: '#ES{$parent.username}'
                            },
                            export: {
                                username: '#ES{$data.username}'
                            },
                            children: [
                                {
                                    type: 'form',
                                    name: FORM_NAME,
                                    children: [
                                        {
                                            type: 'formItem',
                                            required: true,
                                            control: {
                                                type: 'input',
                                                name: 'username'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }]
            };

            let test = new RCRETestUtil(config);

            await test.triggerFormValidate(FORM_NAME);

            let formState = test.getFormState(FORM_NAME);
            expect(formState.valid).toBe(false);

            moxios.wait(async () => {
                let request = moxios.requests.mostRecent();
                let requestData = request.config.data;

                expect(JSON.parse(requestData).username).toBe('1');

                await request.respondWith({
                    status: 200,
                    response: {
                        errno: 0,
                        errmsg: 'ok',
                        data: {
                            username: 'andycall'
                        }
                    }
                });

                let state = test.getState();
                formState = test.getFormState(FORM_NAME);

                expect(state.container.rootContainer.username).toBe('andycall');
                expect(state.container.formContainer.username).toBe('andycall');

                expect(formState.valid).toBe(true);

                resolve();
            });
        });
    });

    it('formItem is valid when change to disabled', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'disabledContainer',
                data: {
                    disabled: false
                },
                children: [{
                    type: 'form',
                    name: 'disabledForm',
                    children: [
                        {
                            type: 'formItem',
                            required: true,
                            rules: [
                                {
                                    minLength: 10
                                }
                            ],
                            control: {
                                type: 'input',
                                name: 'username',
                                disabled: '#ES{$data.disabled}'
                            }
                        },
                        {
                            type: 'button',
                            text: 'text',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: '$this',
                                params: {
                                    disabled: true
                                }
                            }]
                        },
                        {
                            type: 'button',
                            text: 'text',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: '$this',
                                params: {
                                    disabled: false
                                }
                            }]
                        }
                    ]
                }]
            }]
        };

        let util = new RCRETestUtil(config);
        util.setContainer('disabledContainer');
        let input = util.getComponentByType('input');
        util.setData(input, 'aaa');

        let formState = util.getFormState('disabledForm');
        expect(formState.valid).toBe(false);
        expect(formState.control.username.valid).toBe(false);

        let button = util.getComponentByType('button');
        await util.simulate(button, 'onClick');

        formState = util.getFormState('disabledForm');
        expect(formState.valid).toBe(true);
        expect(formState.control.username.valid).toBe(true);

        let enableButton = util.getComponentByType('button', 1);
        await util.simulate(enableButton, 'onClick');

        formState = util.getFormState('disabledForm');
        expect(formState.valid).toBe(false);
        expect(formState.control.username.valid).toBe(false);
    });

    it('formItem with hidden or show should not be mounted', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'showHiddenTest',
                data: {
                    hideInput: true
                },
                children: [{
                    type: 'form',
                    name: 'hiddenTestForm',
                    children: [
                        {
                            type: 'formItem',
                            required: true,
                            label: 'UserName',
                            control: {
                                type: 'input',
                                name: 'username',
                                hidden: '#ES{$data.hideInput}'
                            }
                        },
                        {
                            type: 'formItem',
                            required: true,
                            label: 'Password',
                            control: {
                                type: 'input',
                                name: 'password'
                            }
                        }
                    ]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        let state = test.getState();
        await test.triggerFormValidate('hiddenTestForm');
        let formState = test.getFormState('hiddenTestForm');
        expect(state.container.showHiddenTest.hideInput).toBe(true);
        expect(formState.control.username).toBe(undefined);
        expect(formState.control.password.valid).toBe(false);
    });

    it('change formItem required will trigger validate', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'requiredForm',
                children: [
                    {
                        type: 'form',
                        name: 'requiredForm',
                        children: [
                            {
                                type: 'formItem',
                                required: '#ES{!$data.password}',
                                control: {
                                    type: 'input',
                                    name: 'username'
                                }
                            },
                            {
                                type: 'formItem',
                                required: '#ES{!$data.username}',
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

        let test = new RCRETestUtil(config);
        let wrapper = test.wrapper;

        let userName = wrapper.find('input').at(0);
        let password = wrapper.find('input').at(1);

        await test.triggerFormValidate('requiredForm');
        let formState = test.getFormState('requiredForm');
        expect(formState.control.username.valid).toBe(false);
        expect(formState.control.username.required).toBe(true);
        expect(formState.control.password.valid).toBe(false);
        expect(formState.control.password.required).toBe(true);
        expect(formState.valid).toBe(false);

        userName.simulate('change', {
            target: {
                value: 'helloworld'
            }
        });
        password.simulate('change', {
            target: {
                value: ''
            }
        });

        formState = test.getFormState('requiredForm');
        expect(formState.control.username.valid).toBe(true);
        expect(formState.control.username.required).toBe(true);
        expect(formState.control.password.valid).toBe(true);
        expect(formState.control.password.required).toBe(false);
        expect(formState.valid).toBe(true);

        userName.simulate('change', {
            target: {
                value: ''
            }
        });

        password.simulate('change', {
            target: {
                value: 'helloworld'
            }
        });

        formState = test.getFormState('requiredForm');
        expect(formState.control.username.valid).toBe(true);
        expect(formState.control.username.required).toBe(false);
        expect(formState.control.password.valid).toBe(true);
        expect(formState.control.password.required).toBe(true);
        expect(formState.valid).toBe(true);
    });

    it('formItem init value validate', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'initFormValidate',
                data: {
                    userName: 'lx',
                    age: 27,
                    gender: null,
                    localPerson: true,
                    edu: [],
                    interest: {}
                },
                children: [
                    {
                        type: 'form',
                        name: 'initFormValidate',
                        children: [
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'userName'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'age'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'gender'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'localPerson'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'edu'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'interest'
                                }
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        let wrapper = test.wrapper;

        await test.triggerFormValidate('initFormValidate');
        let userName = wrapper.find('input').at(0);
        let age = wrapper.find('input').at(1);

        let formState = test.getFormState('initFormValidate');
        let state = test.getState();

        expect(state.container.initFormValidate.userName).toBe('lx');
        expect(formState.control.userName.valid).toBe(true);
        expect(formState.control.age.valid).toBe(true);
        expect(formState.control.gender.valid).toBe(false);
        expect(formState.control.localPerson.valid).toBe(true);
        expect(formState.control.edu.valid).toBe(false);
        expect(formState.control.interest.valid).toBe(false);

        userName.simulate('change', {
            target: {
                value: ''
            }
        });

        age.simulate('change', {
            target: {
                value: 0
            }
        });

        formState = test.getFormState('initFormValidate');
        expect(formState.control.userName.valid).toBe(false);
        expect(formState.control.age.valid).toBe(true);
        expect(formState.valid).toBe(false);
    });

    // it('formItem updateCount', () => {
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'formUpdateCount',
    //             data: {
    //                 userName: 'lx',
    //                 age: '123',
    //                 age2: '123',
    //                 gender: 'male',
    //                 gender2: 'female',
    //                 edu: '123',
    //                 interest: '123'
    //             },
    //             children: [
    //                 {
    //                     type: 'form',
    //                     name: 'initFormValidate',
    //                     children: [
    //                         {
    //                             type: 'formItem',
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             required: true,
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'userName'
    //                             }
    //                         },
    //                         {
    //                             type: 'formItem',
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max1}',
    //                                 message: '长度不能超过#ES{$data.max1}个字符'
    //                             }],
    //                             required: true,
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'age'
    //                             }
    //                         },
    //                         {
    //                             type: 'formItem',
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             required: true,
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'gender'
    //                             }
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     type: 'form',
    //                     name: 'initFormValidate2',
    //                     children: [
    //                         {
    //                             type: 'formItem',
    //                             required: true,
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'userName2'
    //                             }
    //                         },
    //                         {
    //                             type: 'formItem',
    //                             required: true,
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'age2'
    //                             }
    //                         },
    //                         {
    //                             type: 'formItem',
    //                             required: true,
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'gender2'
    //                             }
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }]
    //     };
    //
    //     let component = <JSONRender code={JSON.stringify(config)}/>;
    //     let wrapper = mount(component);
    //
    //     // 同页面下的两个表单
    //     let firstForm = wrapper.find('RCREForm').at(0).find('RCREFormItem');
    //     let secondForm = wrapper.find('RCREForm').at(1).find('RCREFormItem');
    //
    //     let firstFormFirstItemInstance: any = firstForm.at(0).instance();
    //     let firstFormSecondItemInstance: any = firstForm.at(1).instance();
    //     let firstFormThirdItemInstance: any = firstForm.at(2).instance();
    //
    //     let secondFormFirstItemInstance: any = secondForm.at(0).instance();
    //     let secondFormSecondItemInstance: any = secondForm.at(1).instance();
    //     let secondFormThirdItemInstance: any = secondForm.at(2).instance();
    //
    //     let initFirstFormFirstItemCount = firstFormFirstItemInstance.TEST_UPDATECOUNT;
    //     let initFirstFormSecondItemCount = firstFormSecondItemInstance.TEST_UPDATECOUNT;
    //     let initFirstFormThirdItemCount = firstFormThirdItemInstance.TEST_UPDATECOUNT;
    //
    //     let initSecondformfirstitemcount = secondFormFirstItemInstance.TEST_UPDATECOUNT;
    //     let initSecondFormSecondItemCount = secondFormSecondItemInstance.TEST_UPDATECOUNT;
    //     let initSecondFormThirdItemCount = secondFormThirdItemInstance.TEST_UPDATECOUNT;
    //     // 当更改第一个form中的一个输入框时
    //     let firstFormFirstInput = firstForm.at(0).find('input').at(0);
    //     firstFormFirstInput.simulate('change', {
    //         target: {
    //             value: 'helloworld'
    //         }
    //     });
    //     expect(firstFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormFirstItemCount + 1);
    //     expect(firstFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormSecondItemCount);
    //     expect(firstFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormThirdItemCount);
    //
    //     expect(secondFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initSecondformfirstitemcount);
    //     expect(secondFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormSecondItemCount);
    //     expect(secondFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormThirdItemCount);
    //
    //     // 当更改第一个form中的二个输入框时
    //     let firstFormSecondInput = wrapper.find('RCREForm').at(0).find('input').at(1);
    //     firstFormSecondInput.simulate('change', {
    //         target: {
    //             value: '10'
    //         }
    //     });
    //     expect(firstFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormFirstItemCount + 1);
    //     expect(firstFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormSecondItemCount + 1);
    //     expect(firstFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormThirdItemCount);
    //
    //     expect(secondFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initSecondformfirstitemcount);
    //     expect(secondFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormSecondItemCount);
    //     expect(secondFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormThirdItemCount);
    //
    //     // 当更改第二个form中的一个输入框时
    //     let secondFormFirstInput = secondForm.at(0).find('input').at(0);
    //     secondFormFirstInput.simulate('change', {
    //         target: {
    //             value: 'helloworld'
    //         }
    //     });
    //     expect(firstFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormFirstItemCount + 1);
    //     expect(firstFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormSecondItemCount + 1);
    //     expect(firstFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormThirdItemCount);
    //
    //     expect(secondFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initSecondformfirstitemcount + 1);
    //     expect(secondFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormSecondItemCount);
    //     expect(secondFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormThirdItemCount);
    //
    //     // 当更改第二个form中的二个输入框时
    //     let secondFormSecondInput = wrapper.find('RCREForm').at(1).find('input').at(1);
    //     secondFormSecondInput.simulate('change', {
    //         target: {
    //             value: '10'
    //         }
    //     });
    //     expect(firstFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormFirstItemCount + 1);
    //     expect(firstFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormSecondItemCount + 1);
    //     expect(firstFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initFirstFormThirdItemCount);
    //
    //     expect(secondFormFirstItemInstance.TEST_UPDATECOUNT).toBe(initSecondformfirstitemcount + 1);
    //     expect(secondFormSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormSecondItemCount + 1);
    //     expect(secondFormThirdItemInstance.TEST_UPDATECOUNT).toBe(initSecondFormThirdItemCount);
    // });

    // it('formItem with name is ES expression', () => {
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'formUpdateCount',
    //             data: {
    //                 userName: 'lx',
    //                 age: 27,
    //                 localPerson: '123',
    //             },
    //             children: [
    //                 {
    //                     type: 'form',
    //                     name: 'initFormValidate',
    //                     children: [
    //                         {
    //                             type: 'formItem',
    //                             required: true,
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'localPerson'
    //                             }
    //                         },
    //                         {
    //                             type: 'formItem',
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             required: true,
    //                             control: {
    //                                 type: 'input',
    //                                 name: 'userName'
    //                             }
    //                         },
    //                         {
    //                             type: 'formItem',
    //                             rules: [{
    //                                 maxLength: '#ES{$data.max}',
    //                                 message: '长度不能超过#ES{$data.max}个字符'
    //                             }, {
    //                                 required: true,
    //                                 message: '姓名是必填属性'
    //                             }],
    //                             required: true,
    //                             control: {
    //                                 type: 'input',
    //                                 name: '#ES{$data.age}'
    //                             }
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }]
    //     };
    //
    //     let component = <JSONRender code={JSON.stringify(config)}/>;
    //     let wrapper = mount(component);
    //
    //     // 同页面下的两个表单
    //     let form = wrapper.find('RCREForm').at(0).find('RCREFormItem');
    //
    //     let formFirstItemInstance: any = form.at(0).instance();
    //     let formSecondItemInstance: any = form.at(1).instance();
    //     let formThirdItemInstance: any = form.at(2).instance();
    //
    //     // 不更改时 默认渲染次数
    //     // let initFirstItemCount = formFirstItemInstance.TEST_UPDATECOUNT;
    //     // let initSecondItemCount = formSecondItemInstance.TEST_UPDATECOUNT;
    //     // let initThirdItemCount = formThirdItemInstance.TEST_UPDATECOUNT;
    //     // expect(formFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstItemCount);
    //     // expect(formSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondItemCount);
    //     // expect(formThirdItemInstance.TEST_UPDATECOUNT).toBe(initThirdItemCount);
    //     // 当更改第一个form中的一个输入框时
    //     let firstFormFirstInput = form.at(0).find('input').at(0);
    //     firstFormFirstInput.simulate('change', {
    //         target: {
    //             value: 'helloworld'
    //         }
    //     });
    //     expect(formFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstItemCount + 1);
    //     expect(formSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondItemCount);
    //     expect(formThirdItemInstance.TEST_UPDATECOUNT).toBe(initThirdItemCount + 2);
    //
    //     // 当更改第一个form中的二个输入框时
    //     let firstFormSecondInput = wrapper.find('RCREForm').at(0).find('input').at(1);
    //     firstFormSecondInput.simulate('change', {
    //         target: {
    //             value: '10'
    //         }
    //     });
    //     expect(formFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstItemCount + 1);
    //     expect(formSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondItemCount + 1);
    //     expect(formThirdItemInstance.TEST_UPDATECOUNT).toBe(initThirdItemCount + 4);
    //
    //     // 当更改第一个form中的三个输入框时
    //     let firstFormThirdInput = wrapper.find('RCREForm').at(0).find('input').at(2);
    //     firstFormThirdInput.simulate('change', {
    //         target: {
    //             value: '10'
    //         }
    //     });
    //     expect(formFirstItemInstance.TEST_UPDATECOUNT).toBe(initFirstItemCount + 1);
    //     expect(formSecondItemInstance.TEST_UPDATECOUNT).toBe(initSecondItemCount + 1);
    //     expect(formThirdItemInstance.TEST_UPDATECOUNT).toBe(initThirdItemCount + 6);
    // });

    it('form with component not in formItem', () => {
        let config = {
            body: [
                {
                    type: 'container',
                    model: 'loadingExample',
                    data: {
                        test: 'tst',
                        testModal: 't123',
                        placeholder: 'test'
                    },
                    children: [
                        {
                            type: 'form',
                            name: 'testForm',
                            children: [
                                {
                                    type: 'input',
                                    name: 'test'
                                },
                                {
                                    type: 'formItem',
                                    control: {
                                        type: 'input',
                                        placeholder: '#ES{$data.placeholder}',
                                        name: 'testModal'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let component = <JSONRender code={JSON.stringify(config)}/>;
        let wrapper = mount(component);

        let input = wrapper.find('RCREForm').at(0).find('input');
        let firstInput = input.at(0);
        let secondInput = input.at(0);
        firstInput.simulate('change', {
            target: {
                value: 'first'
            }
        });
        expect(firstInput.html()).toBe('<input name="test" value="first">');

        secondInput.simulate('change', {
            target: {
                value: 'second'
            }
        });
        expect(firstInput.html()).toBe('<input name="test" value="second">');
    });

    // it('upload error update', async () => {
    //     return new Promise((resolve, reject) => {
    //         let config = {
    //             body: [
    //                 {
    //                     type: 'container',
    //                     model: 'TextForm',
    //                     children: [
    //                         {
    //                             type: 'form',
    //                             name: 'textForm',
    //                             children: [
    //                                 {
    //                                     type: 'formItem',
    //                                     required: true,
    //                                     hasFeedBack: false,
    //                                     control: {
    //                                         type: 'upload',
    //                                         name: 'upload',
    //                                         action: 'http://127.0.0.1:8844/api/mock/gdUploadImgError',
    //                                         responsePattern: '#ES{$output.errno === 0}',
    //                                         responseErrMsg: '#ES{$output.errmsg}',
    //                                         listType: 'picture-card',
    //                                         uploadExt: ['.jpg', '.png'],
    //                                         uploadSize: 100000
    //                                     }
    //                                 },
    //                                 {
    //                                     type: 'button',
    //                                     text: '提交',
    //                                     htmlType: 'submit',
    //                                     disabled: '#ES{!$form.valid}'
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 }
    //             ]
    //         };
    //
    //         let component = <JSONRender code={JSON.stringify(config)}/>;
    //         let wrapper = mount(component);
    //         const fileList = [{
    //             uid: -1,
    //             name: 'xxx.png',
    //             status: 'done',
    //             size: 100,
    //             url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    //             thumbUrl: 'https://zos.alipayobjects.com/rmsportal/IQKRngzUuFzJzGzRJXUs.png',
    //         }];
    //
    //         let upload = wrapper.find('input').at(0);
    //
    //         upload.simulate('change', {
    //             target: {
    //                 files: fileList
    //             },
    //         });
    //
    //         setTimeout(() => {
    //             wrapper.update();
    //             let uploadTxt = wrapper.find('.ant-form-explain').at(0);
    //             expect(uploadTxt.html()).toBe('<div class="ant-form-explain">error</div>');
    //             resolve();
    //         }, 300);
    //     });
    //
    // });

    it('FormItem rules pattern', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'form',
                        name: 'demoForm',
                        children: [{
                            type: 'formItem',
                            rules: [{
                                pattern: /^\d+$/,
                                message: 'ABC'
                            }],
                            control: {
                                type: 'input',
                                name: 'username'
                            }
                        }]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let username = test.getComponentByName('username');
        test.setData(username, 'abc');

        let formStatus = test.getFormItemState('demoForm', 'username');
        expect(formStatus.valid).toBe(false);

        test.setData(username, '1');
        formStatus = test.getFormItemState('demoForm', 'username');
        expect(formStatus.valid).toBe(true);

        test.setData(username, 111);
        formStatus = test.getFormItemState('demoForm', 'username');
        expect(formStatus.valid).toBe(true);

        test.setData(username, {});
        formStatus = test.getFormItemState('demoForm', 'username');
        expect(formStatus.valid).toBe(false);
    });

    it('FormItem contains filterRule to be verified at initialization time', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'form',
                    name: 'form',
                    children: [{
                        type: 'formItem',
                        filterRule: '#ES{$args.value === "A" ? true : false}',
                        filterErrMsg: 'got something wrong',
                        control: {
                            type: 'input',
                            name: 'username'
                        }
                    }]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        await test.triggerFormValidate('form');
        let formStatus = test.getFormItemState('form', 'username');
        expect(formStatus.valid).toBe(false);
        expect(formStatus).toMatchSnapshot();
    });

    it('Container component updates will also trigger FormItem revalidation', async () => {
        filter.setFilter('isUserValid', (username: any) => {
            if (!username) {
                return false;
            }

            let keys = Object.keys(username);
            if (keys.some(key => !!username[key])) {
                return true;
            }

            return false;
        });

        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'form',
                    name: 'form2',
                    children: [{
                        type: 'foreach',
                        dataSource: [1, 2, 3, 4, 5],
                        control: {
                            type: 'formItem',
                            filterRule: '#ES{isUserValid($data.username)}',
                            filterErrMsg: 'got something wrong',
                            control: {
                                type: 'input',
                                name: 'username.#ES{$index}'
                            }
                        }
                    }]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        await test.triggerFormValidate('form2');
        let formState = test.getFormState('form2');
        expect(formState.valid).toBe(false);
        expect(formState.control).toMatchSnapshot();

        let firstUserName = test.getComponentByName('username.0');
        test.setData(firstUserName, '123456');

        formState = test.getFormState('form2');
        
        expect(formState.valid).toBe(true);
        expect(formState.control).toMatchSnapshot();
    });

    it('FormItem validate should be triggered after component mounted', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    dataSource: [{
                        rowKey: 'A',
                        id: '1'
                    }, {
                        rowKey: 'B',
                        id: '2'
                    }]
                },
                children: [{
                    type: 'form',
                    name: 'basicForm',
                    children: [
                        {
                            type: 'foreach',
                            dataSource: '#ES{$data.dataSource}',
                            rowKey: '#ES{$item.rowKey + $item.id}',
                            control: {
                                type: 'formItem',
                                required: true,
                                apiRule: {
                                    url: 'http://localhost:8844/static/table.json',
                                    method: 'GET',
                                    data: {
                                        name: '#ES{$args.value}'
                                    },
                                    condition: '#ES{$item.rowKey === "B"}',
                                    validate: '#ES{$output.errno === 0}',
                                    export: {
                                        'C': 'RESPONE'
                                    }
                                },
                                control: {
                                    type: 'input',
                                    name: '#ES{$item.rowKey}',
                                    defaultValue: '#ES{$item.rowKey}'
                                }
                            }
                        },
                        {
                            type: 'button',
                            text: 'update',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: '$this',
                                params: {
                                    dataSource: [{
                                        rowKey: 'B',
                                        id: '22'
                                    }, {
                                        rowKey: 'C',
                                        id: '33'
                                    }]
                                }
                            }, {
                                event: 'onClick',
                                targetCustomer: '$this',
                                params: {
                                    C: '',
                                    B: ''
                                }
                            }]
                        }
                    ]
                }]
            }]
        };

        moxios.uninstall(axios);

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        await test.waitForDataProviderComplete();

        let A = test.getComponentByName('A');
        test.setData(A, 'test');
        let B = test.getComponentByName('B');
        test.setData(B, 'BBB');

        await test.waitForDataProviderComplete();

        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        let C = test.getComponentByName('C');
        test.setData(C, 'CCC');

        await test.waitForDataProviderComplete();

        let state = test.getContainerState();
        expect(state.C).toBe('CCC');
    });

    it('FormItem control multi elements', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'form',
                    name: 'demo',
                    children: [
                        {
                            type: 'formItem',
                            required: true,
                            control: [
                                {
                                    type: 'text',
                                    text: '#ES{$formItem.errmsg}'
                                },
                                {
                                    type: 'input',
                                    name: 'username'
                                },
                                {
                                    type: 'input',
                                    name: 'password'
                                }
                            ]
                        }
                    ]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        await test.triggerFormValidate('demo');
        let input = test.getComponentByName('username');
        test.setData(input, 'helloworld');

        let text = test.getComponentByType('text');
        expect(text.text()).toBe('不能为空');

        let password = test.getComponentByName('password');
        test.setData(password, '123456');

        text = test.getComponentByType('text');
        expect(text.text()).toBe('');
    });

    it('name changed will trigger FormItem to revalidate', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    dynamicName: 'username',
                    username: 'hello',
                    password: 'eeieieieieieieieeieieieieieiwqweqweqweqwe'
                },
                children: [
                    {
                        type: 'form',
                        name: 'demo',
                        children: [
                            {
                                type: 'formItem',
                                required: true,
                                rules: [{
                                    maxLength: 5,
                                    message: '字数最大不能超过10'
                                }],
                                control: {
                                    type: 'input',
                                    name: '#ES{$data.dynamicName}'
                                }
                            },
                            {
                                type: 'formItem',
                                required: true,
                                control: {
                                    type: 'input',
                                    name: 'dynamicName'
                                }
                            }
                        ]
                    },
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let formState = test.getFormState('demo');
        let state = test.getContainerState();
        expect(formState.valid).toBe(true);
        expect(formState.control.dynamicName.valid).toBe(true);
        expect(formState.control.username.valid).toBe(true);
        expect(state.username).toBe('hello');

        let dynamicName = test.getComponentByName('dynamicName');
        test.setData(dynamicName, 'password');

        formState = test.getFormState('demo');
        expect(formState.control.password.valid).toBe(false);
        expect(formState.control.username).toBe(undefined);
        expect(formState.control.password.errorMsg).toBe('字数最大不能超过10');
        expect(formState.valid).toBe(false);

        state = test.getContainerState();
        expect(state.username).toBe(undefined);
        expect(state.password).toBe('eeieieieieieieieeieieieieieiwqweqweqweqwe');
    });

    it('disabled changed will trigger form revalidate', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    disabled: true,
                    username: 'hello'
                },
                children: [
                    {
                        type: 'form',
                        name: 'demo',
                        children: [
                            {
                                type: 'formItem',
                                required: true,
                                rules: [{
                                    maxLength: 1
                                }],
                                control: {
                                    type: 'input',
                                    name: 'username',
                                    disabled: '#ES{$data.disabled}'
                                }
                            },
                            {
                                type: 'input',
                                name: 'disabled'
                            }
                        ]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let formState = test.getFormState('demo');
        expect(formState.valid).toBe(true);
        let disabled = test.getComponentByName('disabled');
        test.setData(disabled, false);
        formState = test.getFormState('demo');
        expect(formState.valid).toBe(false);
        expect(formState.control.username.valid).toBe(false);
        expect(formState.control.username.errorMsg).toBe('长度不能大于1');
    });

    it('change components value will trigger formItem revalidate', async () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [{
                    type: 'form',
                    name: 'demo',
                    children: [
                        {
                            type: 'formItem',
                            required: true,
                            rules: [{
                                maxLength: 10
                            }],
                            control: {
                                type: 'input',
                                name: 'username'
                            }
                        },
                        {
                            type: 'button',
                            text: 'update',
                            trigger: [{
                                event: 'onClick',
                                targetCustomer: '$this',
                                params: {
                                    username: '0000000000000000000000000000000000000000'
                                }
                            }]
                        }
                    ]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let formStatus = test.getFormState('demo');
        expect(formStatus.valid).toBe(true);

        let username = test.getComponentByName('username');
        test.setData(username, '010101010101010101010101010110');

        formStatus = test.getFormState('demo');
        expect(formStatus.valid).toBe(false);
        expect(formStatus.control.username.valid).toBe(false);
        expect(formStatus.control.username.errorMsg).toBe('长度不能大于10');

        test.setData(username, 'test');
        formStatus = test.getFormState('demo');
        expect(formStatus.valid).toBe(true);

        let button = test.getComponentByType('button');
        await test.simulate(button, 'onClick');

        formStatus = test.getFormState('demo');
        expect(formStatus.valid).toBe(false);
        expect(formStatus.control.username.valid).toBe(false);
        expect(formStatus.control.username.errorMsg).toBe('长度不能大于10');
    });
});
