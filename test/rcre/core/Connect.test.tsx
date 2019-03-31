import React from 'react';
import {mount} from 'enzyme';
import {clearStore, componentLoader, Connect, Render} from 'rcre';

describe('CommonConnect', () => {
    const TYPE = 'testButton';
    beforeEach(() => {
        componentLoader.removeComponent(TYPE);
        clearStore();
    });

    it('propsMapping', () => {
        interface ButtonTest extends Connect.BasicConnectProps<any, any> {
            type: string;
        }

        class Button extends React.PureComponent<ButtonTest, {}> {
            render() {
                const {
                    tools,
                    ...props
                } = this.props;

                expect(props.type).toBe('demoType');

                // @ts-ignore
                return <button {...props}>{props.children}</button>;
            }
        }

        const connectOptions = {
            propsMapping: {
                text: 'children',
                buttonType: 'type'
            }
        };

        componentLoader.addComponent(TYPE, Connect.commonConnect(connectOptions)(Button));

        let config = {
            body: [{
                type: 'testButton',
                text: 'helloworld',
                buttonType: 'demoType'
            }]
        };

        let wrapper = mount(<Render code={JSON.stringify(config)}/>);
        let button = wrapper.find('button');
        expect(button.text()).toBe('helloworld');
    });

    it('provider build in events', () => {
        interface ButtonTest extends Connect.BasicConnectProps<any, any> {
            otherOptions: string;
        }

        class Button extends React.PureComponent<ButtonTest, {}> {
            render() {
                const {
                    tools,
                    otherOptions,
                    ...props
                } = this.props;

                expect(otherOptions).toBe('1234');

                return <button {...props}>{props.children}</button>;
            }
        }

        const connectOptions = {
            propsMapping: {
                text: 'children',
                buttonType: 'type'
            }
        };

        componentLoader.addComponent(TYPE, Connect.commonConnect(connectOptions)(Button));

        let config = {
            body: [{
                type: 'testButton',
                text: 'helloworld',
                otherOptions: '1234'
            }]
        };

        let wrapper = mount(<Render code={JSON.stringify(config)}/>);
        let button = wrapper.find('button');
        expect(button.text()).toBe('helloworld');
    });
    //
    // it('debounce feature', () => {
    //     return new Promise((resolve, reject) => {
    //         type SampleConfig = types.ConfigFactory<{}, {
    //             type: 'sample'
    //         }>;
    //
    //         type SampleProps = types.DriverPropsFactory<SampleConfig, {}, RCRENativeAntd>;
    //
    //         class Sample extends React.PureComponent<SampleProps, {}> {
    //             render() {
    //                 let {
    //                     tools,
    //                     ...props
    //                 } = this.props;
    //
    //                 return (
    //                     <input
    //                         value={props.value || ''}
    //                         onChange={(e) => {
    //                             let value = e.target.value;
    //                             tools.updateNameValue(value);
    //                         }}
    //                     />
    //                 );
    //             }
    //         }
    //
    //         componentLoader.addComponent('sample', Connect.commonConnect()(Sample));
    //
    //         let config: any = {
    //             body: [{
    //                 type: 'container',
    //                 model: 'sampleDemo',
    //                 children: [
    //                     {
    //                         type: 'sample',
    //                         name: 'username',
    //                         debounce: 500
    //                     },
    //                     {
    //                         type: 'button',
    //                         text: 'click',
    //                         trigger: [{
    //                             event: 'onClick',
    //                             targetCustomer: '$this',
    //                             params: {
    //                                 username: 'event'
    //                             }
    //                         }]
    //                     }
    //                 ]
    //             }]
    //         };
    //         let test = new RCRETestUtil(config);
    //         let input = test.wrapper.find('input').at(0);
    //
    //         input.simulate('change', {
    //             target: {
    //                 value: 'helloworld'
    //             }
    //         });
    //
    //         let instance: any = input.getDOMNode();
    //         expect(instance.value).toBe('helloworld');
    //
    //         let state = store.getState();
    //         expect(state.container.sampleDemo.username).toBe(undefined);
    //
    //         setTimeout(() => {
    //             state = store.getState();
    //             expect(state.container.sampleDemo.username).toBe('helloworld');
    //             let button = test.wrapper.find('RCREConnect(button)');
    //
    //             test.simulate(button, 'onClick').then(() => {
    //                 state = store.getState();
    //                 expect(state.container.sampleDemo.username).toBe('event');
    //
    //                 instance = input.getDOMNode();
    //                 expect(instance.value).toBe('event');
    //                 resolve();
    //             });
    //         }, 600);
    //     });
    // });
    //
    // it('debounce input can be updated by others', async () => {
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'demo',
    //             children: [{
    //                 type: 'input',
    //                 name: 'username',
    //                 debounce: 300
    //             }, {
    //                 type: 'button',
    //                 text: 'update',
    //                 trigger: [{
    //                     event: 'onClick',
    //                     targetCustomer: '$this',
    //                     params: {
    //                         username: 'helloworld'
    //                     }
    //                 }]
    //             }]
    //         }]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //
    //     let button = test.getComponentByType('button');
    //     await test.simulate(button, 'onClick');
    //
    //     let input = test.getComponentByName('username');
    //     let inputElement = input.find('input');
    //     let value = inputElement.prop('value');
    //     expect(value).toBe('helloworld');
    // });
    //
    // it('debounce can be init during mount', () => {
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'demo',
    //             data: {
    //                 username: 'helloworld'
    //             },
    //             children: [{
    //                 type: 'input',
    //                 name: 'username',
    //                 debounce: 300
    //             }]
    //         }]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //
    //     let username = test.getComponentByName('username');
    //     let input = username.find('input');
    //     expect(input.prop('value')).toBe('helloworld');
    // });
    //
    // it('input component won"t update when value does not changed', () => {
    //     let inputUpdateCount = 0;
    //
    //     class InputDemo extends React.PureComponent<any> {
    //         render() {
    //             inputUpdateCount++;
    //             return (
    //                 <input
    //                     value={this.props.value || ''}
    //                     onChange={(e) => this.props.tools.updateNameValue(e.target.value)}
    //                 />
    //             );
    //         }
    //     }
    //
    //     componentLoader.addComponent('inputDemo', Connect.commonConnect()(InputDemo));
    //
    //     let config: any = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'demo',
    //                 data: {
    //                     firstProp: 'aaa'
    //                 },
    //                 children: [
    //                     {
    //                         type: 'inputDemo',
    //                         name: 'username',
    //                         test: '#ES{$data.firstProp}'
    //                     },
    //                     {
    //                         type: 'input',
    //                         name: 'password'
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //     expect(inputUpdateCount).toBe(1);
    //
    //     let username = test.getComponentByName('username');
    //     test.setData(username, 'helloworld');
    //     expect(inputUpdateCount).toBe(2);
    //     let password = test.getComponentByName('password');
    //     test.setData(password, '12345');
    //     expect(inputUpdateCount).toBe(2);
    //
    //     test.setData(username, 'abcd');
    //     expect(inputUpdateCount).toBe(3);
    // });
    //
    // it('$item update will trigger connect to update', async () => {
    //     let config: PageProps<RCRENativeAntd> = {
    //         body: [{
    //             type: CoreKind.container,
    //             model: 'demo',
    //             data: {
    //                 list: [{
    //                     name: '111'
    //                 }, {
    //                     name: '222',
    //                 }, {
    //                     name: '333'
    //                 }]
    //             },
    //             children: [
    //                 {
    //                     type: ComponentKind.foreach,
    //                     dataSource: '#ES{$data.list}',
    //                     control: {
    //                         type: CoreKind.text,
    //                         text: '#ES{$item.name}'
    //                     }
    //                 },
    //                 {
    //                     type: ComponentKind.button,
    //                     text: 'updateList',
    //                     trigger: [{
    //                         event: 'onClick',
    //                         targetCustomer: '$this',
    //                         params: {
    //                             'list[0].name': '444'
    //                         }
    //                     }]
    //                 }
    //             ]
    //         }]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //
    //     let button = test.getComponentByType('button');
    //     await test.simulate(button, 'onClick');
    //
    //     let textA = test.getComponentByType('text', 0);
    //     let textB = test.getComponentByType('text', 1);
    //     let textC = test.getComponentByType('text', 2);
    //
    //     console.log(textA.text());
    //     console.log(textB.text());
    //     console.log(textC.text());
    // });
    //
    // it('component with name in component with name', () => {
    //     let config = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'popOverContainer',
    //                 data: {
    //                     username: '1'
    //                 },
    //                 children: [
    //                     {
    //                         type: 'transfer',
    //                         name: 'transfer',
    //                         showSearch: true,
    //                         dataSource: [
    //                             {
    //                                 key: '1',
    //                                 title: 'title-1'
    //                             }
    //                         ],
    //                         leftSearchControls: [
    //                             {
    //                                 type: 'div',
    //                                 children: [
    //                                     {
    //                                         type: 'input',
    //                                         name: 'username'
    //                                     }
    //                                 ]
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     let input = test.wrapper.find('.ant-input[name="username"]');
    //
    //     let instance: any = input.getDOMNode();
    //
    //     expect(instance.value).toBe('1');
    //     input.simulate('change', {
    //         target: {
    //             value: 'helloworld'
    //         }
    //     });
    //     expect(instance.value).toBe('helloworld');
    // });
    //
    // it('name with ES expression update', () => {
    //     let inputUpdateCount = 0;
    //
    //     class InputNameDemo extends React.PureComponent<any> {
    //         render() {
    //             inputUpdateCount++;
    //             return (
    //                 <input
    //                     value={this.props.value || ''}
    //                     onChange={(e) => this.props.tools.updateNameValue(e.target.value)}
    //                 />
    //             );
    //         }
    //     }
    //
    //     componentLoader.addComponent('InputNameDemo', Connect.commonConnect()(InputNameDemo));
    //
    //     let config: any = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'demo',
    //                 data: {
    //                     name1: 'aaa',
    //                     name2: 'bbb'
    //                 },
    //                 children: [
    //                     {
    //                         type: 'InputNameDemo',
    //                         name: '#ES{$data.name1}',
    //                     }, {
    //                         type: 'InputNameDemo',
    //                         name: '#ES{$data.name2}',
    //                     }, {
    //                         type: 'InputNameDemo',
    //                         name: 'name3'
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     let initUpdateCount = inputUpdateCount;
    //     expect(inputUpdateCount).toBe(initUpdateCount);
    //
    //     let wrapper = test.wrapper;
    //     let firstInput = wrapper.find('input').at(0);
    //     firstInput.simulate('change', {
    //         target: {
    //             value: 'helloworld'
    //         }
    //     });
    //     expect(inputUpdateCount).toBe(initUpdateCount + 2);
    //
    //     let secondInput = wrapper.find('input').at(1);
    //     secondInput.simulate('change', {
    //         target: {
    //             value: '123456'
    //         }
    //     });
    //
    //     expect(inputUpdateCount).toBe(initUpdateCount + 4);
    //
    //     let thirdInput = wrapper.find('input').at(2);
    //     thirdInput.simulate('change', {
    //         target: {
    //             value: '123456'
    //         }
    //     });
    //
    //     expect(inputUpdateCount).toBe(initUpdateCount + 7);
    // });
    //
    // it('custom control is Object update count', () => {
    //     let inputUpdateCount = 0;
    //
    //     class InputControlDemo extends React.PureComponent<any> {
    //         render() {
    //             inputUpdateCount++;
    //             return (
    //                 <input
    //                     value={this.props.value || ''}
    //                     onChange={(e) => this.props.tools.updateNameValue(e.target.value)}
    //                 />
    //             );
    //         }
    //     }
    //
    //     componentLoader.addComponent('inputDemo', Connect.commonConnect()(InputControlDemo));
    //
    //     let config: any = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'demo',
    //                 data: {
    //                     name1: 'aaa',
    //                     name2: 'bbb',
    //                     list: [{
    //                         name: '111'
    //                     }, {
    //                         name: '222',
    //                     }, {
    //                         name: '333'
    //                     }]
    //                 },
    //                 children: [
    //                     {
    //                         type: 'foreach',
    //                         dataSource: '#ES{$data.list}',
    //                         control: {
    //                             type: 'inputDemo',
    //                             name: '#ES{$item.name}'
    //                         }
    //                     }, {
    //                         type: 'inputDemo',
    //                         name: 'name3'
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //     let initUpdateCount = inputUpdateCount;
    //     expect(inputUpdateCount).toBe(initUpdateCount);
    //     let firstInput = test.getComponentByType('inputDemo', 0);
    //     test.setData(firstInput, 'helloworld');
    //     expect(inputUpdateCount).toBe(initUpdateCount + 3);
    //
    //     let secondInput = test.getComponentByType('inputDemo', 1);
    //     test.setData(secondInput, '123456');
    //     expect(inputUpdateCount).toBe(initUpdateCount + 6);
    //
    //     let thirdInput = test.getComponentByType('inputDemo', 3);
    //     test.setData(thirdInput, '123456');
    //     expect(inputUpdateCount).toBe(initUpdateCount + 10);
    // });
    //
    // it('component with defaultValue boolean', () => {
    //     let config = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'checkboxDemo',
    //                 data: {
    //                     test: true
    //                 },
    //                 children: [
    //                     {
    //                         type: 'checkbox',
    //                         name: 'checked',
    //                         text: 'isChecked',
    //                         disabled: true,
    //                         defaultValue: '#ES{$data.test}'
    //                     },
    //                     {
    //                         type: 'text',
    //                         text: '#ES{$data.checked}'
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     let input = test.wrapper.find('.ant-checkbox-input');
    //
    //     let instance: any = input.getDOMNode();
    //
    //     expect(instance.value).toBe('true');
    // });
    //
    // it('component with defaultValue array', () => {
    //     let config = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'checkboxGroup',
    //                 data: {
    //                     groups: [
    //                         {
    //                             key: 'name',
    //                             text: '姓名'
    //                         },
    //                         {
    //                             key: 'age',
    //                             text: '年龄'
    //                         },
    //                         {
    //                             key: 'company',
    //                             text: '公司'
    //                         }
    //                     ]
    //                 },
    //                 children: [
    //                     {
    //                         type: 'checkbox',
    //                         name: 'boxGroup',
    //                         groups: '#ES{$data.groups}',
    //                         groupSelectAll: true,
    //                         defaultValue: ['name']
    //                     },
    //                     {
    //                         type: 'text',
    //                         htmlType: 'code',
    //                         style: {
    //                             marginTop: 10,
    //                             display: 'block'
    //                         },
    //                         text: '#ES{$data.boxGroup}'
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     let input = test.wrapper.find('.ant-checkbox').at(1);
    //     let className = input.props().className;
    //     expect(className).toEqual('ant-checkbox ant-checkbox-checked');
    // });
    //
    // it('hidden component with defaultValue boolean', async () => {
    //     let config = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'checkboxDemo',
    //                 data: {
    //                     test: true,
    //                     show: false
    //                 },
    //                 children: [
    //                     {
    //                         type: 'div',
    //                         show: '#ES{$data.show}',
    //                         children: [
    //                             {
    //                                 type: 'checkbox',
    //                                 name: 'checked',
    //                                 text: 'isChecked',
    //                                 disabled: true,
    //                                 defaultValue: '#ES{$data.test}'
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         type: 'button',
    //                         text: 'click',
    //                         trigger: [{
    //                             event: 'onClick',
    //                             targetCustomer: '$this',
    //                             params: {
    //                                 show: true
    //                             }
    //                         }]
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('checkboxDemo');
    //     let state = store.getState();
    //     expect(state.container.checkboxDemo.show).toBe(false);
    //
    //     let inputBeforeClick = test.wrapper.find('.ant-checkbox-input');
    //     expect(inputBeforeClick.length).toBe(0);
    //
    //     let button = test.getComponentByType('button');
    //     await test.simulate(button, 'onClick');
    //
    //     let inputAfterClick = test.wrapper.find('.ant-checkbox-input');
    //     let instance: any = inputAfterClick.getDOMNode();
    //     state = store.getState();
    //
    //     expect(state.container.checkboxDemo.show).toBe(true);
    //     expect(instance.value).toBe('true');
    // });
    //
    // it('hidden component with defaultValue array', async () => {
    //     let config = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'checkboxGroup',
    //                 data: {
    //                     show: false,
    //                     groups: [
    //                         {
    //                             key: 'name',
    //                             text: '姓名'
    //                         },
    //                         {
    //                             key: 'age',
    //                             text: '年龄'
    //                         },
    //                         {
    //                             key: 'company',
    //                             text: '公司'
    //                         }
    //                     ]
    //                 },
    //                 children: [
    //                     {
    //                         type: 'div',
    //                         show: '#ES{$data.show}',
    //                         children: [{
    //                             type: 'checkbox',
    //                             name: 'boxGroup',
    //                             groups: '#ES{$data.groups}',
    //                             groupSelectAll: true,
    //                             defaultValue: ['name']
    //                         }]
    //                     },
    //                     {
    //                         type: 'button',
    //                         text: 'click',
    //                         trigger: [{
    //                             event: 'onClick',
    //                             targetCustomer: '$this',
    //                             params: {
    //                                 show: true
    //                             }
    //                         }]
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('checkboxGroup');
    //
    //     let state = store.getState();
    //     expect(state.container.checkboxGroup.show).toBe(false);
    //
    //     let inputBeforeClick = test.wrapper.find('.ant-checkbox-input');
    //     expect(inputBeforeClick.length).toBe(0);
    //
    //     let button = test.getComponentByType('button');
    //     await test.simulate(button, 'onClick');
    //
    //     state = store.getState();
    //     expect(state.container.checkboxGroup.show).toBe(true);
    //
    //     let inputAfterClick = test.wrapper.find('.ant-checkbox').at(1);
    //     let className = inputAfterClick.props().className;
    //     expect(className).toEqual('ant-checkbox ant-checkbox-checked');
    // });
    //
    // it('When the name value is a combined path, the defaultValue can still be initialized.', () => {
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'demo',
    //             children: [{
    //                 type: 'input',
    //                 name: 'user.name',
    //                 defaultValue: 'helloworld'
    //             }]
    //         }]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //
    //     expect(test.getContainerState()).toEqual({
    //         user: {
    //             name: 'helloworld'
    //         }
    //     });
    // });
    //
    // it('DefaultValue is 0 will still initialize', () => {
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'demo',
    //             children: [{
    //                 type: 'input',
    //                 name: 'username',
    //                 defaultValue: 0
    //             }]
    //         }]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //     expect(test.getContainerState()).toEqual({
    //         username: 0
    //     });
    // });
    //
    // it('defaultValue does not perform the function of transform', () => {
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'demo',
    //             children: [{
    //                 type: 'input',
    //                 name: 'username',
    //                 transform: {
    //                     in: '#ES{$args.value === "A" ? "0" : "1"}',
    //                     out: '#ES{$args.value === "0" ? "A" : "B"}'
    //                 },
    //                 defaultValue: 'A'
    //             }]
    //         }]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //     expect(test.getContainerState()).toEqual({
    //         username: 'A'
    //     });
    // });
    //
    // it('multiple select component update', async () => {
    //     let config = {
    //         body: [
    //             {
    //                 type: 'container',
    //                 model: 'multiple',
    //                 data: {
    //                     options: [
    //                         {
    //                             key: 'A',
    //                             value: 'a'
    //                         },
    //                         {
    //                             key: 'B',
    //                             value: 'b'
    //                         }
    //                     ]
    //                 },
    //                 children: [
    //                     {
    //                         type: 'select',
    //                         name: 'list',
    //                         mode: 'multiple',
    //                         options: '#ES{$data.options}'
    //                     },
    //                     {
    //                         type: 'text',
    //                         text: 'select value: #ES{$data.list.join(",")}'
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     let wrapper = mount(<Render code={JSON.stringify(config)}/>);
    //     let select = wrapper.find('.ant-select').at(0);
    //     select.simulate('click');
    //
    //     let selectItems = document.getElementsByClassName('ant-select-dropdown-menu-item');
    //     let selectItemA: any = selectItems[0];
    //     let selectItemB: any = selectItems[1];
    //
    //     let text = wrapper.find('RCRE(text)').at(0).getDOMNode();
    //
    //     expect(text.innerHTML).toEqual('select value: ');
    //     selectItemA.click();
    //     expect(text.innerHTML).toEqual('select value: a');
    //     selectItemB.click();
    //     expect(text.innerHTML).toEqual('select value: a,b');
    //     selectItemA.click();
    //     expect(text.innerHTML).toEqual('select value: b');
    // });
    //
    // it('autoClearCondition: component will auto delete value when satisfy the condition expression', async () => {
    //     let autoClearComponent = ((props: any) => {
    //         return (
    //             <input
    //                 value={props.value || ''}
    //                 onChange={event => {
    //                     props.tools.updateNameValue(event.target.value);
    //                 }}
    //             />
    //         );
    //     });
    //
    //     componentLoader.addComponent('autoClear', Connect.commonConnect({
    //         autoClearCondition: (props, runTime) => {
    //             if (props.value === 'AAA') {
    //                 return true;
    //             }
    //             return false;
    //         }
    //     })(autoClearComponent));
    //
    //     let config = {
    //         body: [{
    //             type: 'container',
    //             model: 'demo',
    //             children: [{
    //                 type: 'autoClear',
    //                 name: 'username'
    //             }]
    //         }]
    //     };
    //
    //     let test = new RCRETestUtil(config);
    //     test.setContainer('demo');
    //     let autoClear = test.getComponentByName('username');
    //     test.setData(autoClear, 'helloworld');
    //     expect(test.getComponentNameValue(autoClear)).toBe('helloworld');
    //     test.setData(autoClear, 'AAA');
    //
    //     expect(test.getComponentNameValue(autoClear)).toBe(undefined);
    // });
});
