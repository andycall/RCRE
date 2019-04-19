import React from 'react';
import {mount} from 'enzyme';
import {clearStore, rcreReducer, JSONRender} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import {combineReducers, createStore} from 'redux';
// import {RCRECore} from '../../packages/rcre/src/types';
// import {RCRENativeAntd} from '../../rcre-components-nativeads-antd/types';

describe('Page', function () {
    it('change code will update render. static case', () => {
        let config = {
            body: [
                {
                    type: 'text',
                    text: 'helloworld'
                }
            ]
        };

        let case1 = mount(<JSONRender code={config}/>);
        expect(case1.text()).toBe('helloworld');

        // dynamic push code
        config.body.push({
            type: 'text',
            text: 'abc'
        });

        let case2 = mount(<JSONRender code={config}/>);
        expect(case2.text()).toBe('helloworldabc');
    });

    it('parent component update will update render, static case', () => {
        let config = {
            body: [
                {
                    type: 'text',
                    text: 'helloworld'
                }
            ]
        };

        class Demo extends React.Component<any, any> {
            constructor(props: any) {
                super(props);
                this.state = {count: 0};
                this.updateState = this.updateState.bind(this);
            }

            updateState() {

                this.setState({
                    count: this.state.count + 1
                });
            }

            render() {
                return <JSONRender code={config}/>;
            }
        }

        let instance = <Demo/>;
        let wrapper = mount(instance);
        expect(wrapper.text()).toBe('helloworld');

        config.body.push({
            type: 'text',
            text: 'abc'
        });

        wrapper.instance().forceUpdate();
        expect(wrapper.text()).toBe('helloworldabc');
    });
});

describe('Store', () => {
    it('use buildIn redux store', () => {
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
        let state = test.getState();
        expect(state.container.demo.username).toBe('helloworld');

        let username = test.getComponentByName('username');

        test.setData(username, 'abc');
        state = test.getState();
        expect(state.container.demo.username).toBe('abc');
        test.unmount();
    });

    it('use external redux store', () => {
        let demoReducer = (state: any = {test: '1234'}) => state;
        let store = createStore(combineReducers({
            demo: demoReducer,
            $rcre: rcreReducer
        }));
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
        let test = new RCRETestUtil(config, {}, store);
        let rcreState = test.getState();
        expect(rcreState).toEqual({
            container: {
                __TMP_MODEL__DO_NO_USE_IT: {},
                demo: {
                    username: 'helloworld'
                }
            },
            trigger: {},
            form: {}
        });
        test.unmount();
        let rootState: any = store.getState();
        expect(rootState.demo).toEqual({
            test: '1234'
        });
        expect(rootState.$rcre).toEqual({
            container: {__TMP_MODEL__DO_NO_USE_IT: {}},
            trigger: {},
            form: {}
        });
    });
});

describe('CLEAR', () => {
    beforeEach(() => {
        clearStore();
    });

    let config = {
        body: [{
            type: 'container',
            model: 'repeat',
            children: [{
                type: 'form',
                name: 'repeatForm',
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        }]
    };

    it('init a container and form', () => {
        let test = new RCRETestUtil(config);
        test.setContainer('repeat');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
    });

    it('state should be clear automatically', () => {
        let test = new RCRETestUtil(config);
        let state = test.getState();
        expect(state.container).toEqual({__TMP_MODEL__DO_NO_USE_IT: {}, repeat: {}});
        expect(state.form).toEqual({
            repeatForm:
                {
                    valid: false,
                    name: 'repeatForm',
                    validateFirst: false,
                    clearAfterSubmit: false,
                    control: {}
                }
        });
        test.unmount();
    });
});
