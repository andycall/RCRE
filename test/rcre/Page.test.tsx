import React from 'react';
import {mount} from 'enzyme';
import {clearStore, Render, store} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
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

        let case1 = mount(<Render code={config} />);
        expect(case1.text()).toBe('helloworld');

        // dynamic push code
        config.body.push({
            type: 'text',
            text: 'abc'
        });

        let case2 = mount(<Render code={config} />);
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
                return <Render code={config} />;
            }
        }

        let instance = <Demo />;
        let wrapper = mount(instance);
        expect(wrapper.text()).toBe('helloworld');

        config.body.push({
            type: 'text',
            text: 'abc'
        });

        wrapper.instance().forceUpdate();
        expect(wrapper.text()).toBe('helloworldabc');
    });

    it('change code will also clear all state', () => {
        let config = {
            body: [
                {
                    type: 'container',
                    model: 'test',
                    data: {
                        username: 'andycall'
                    },
                    children: [
                        {
                            type: 'container',
                            model: 'innerContainer',
                            data: {
                                username: 'yhtree'
                            },
                            children: [
                                {
                                    type: 'text',
                                    text: '#ES{$data.username}'
                                }
                            ]
                        },
                        {
                            type: 'text',
                            text: '#ES{$data.username}'
                        }
                    ]
                }
            ]
        };

        let oneWrapper = mount(<Render code={config} />);
        let oneText = oneWrapper.text();
        expect(oneText).toBe('yhtreeandycall');

        let state = store.getState();
        expect(state.container.test.username).toBe('andycall');
        expect(state.container.innerContainer.username).toBe('yhtree');

        config.body = [];
        oneWrapper.instance().forceUpdate();
        state = store.getState();

        expect(state.container.test).toBe(undefined);
        expect(state.container.innerContainer).toBe(undefined);

        expect(oneWrapper.text()).toBe('');
    });
});

describe('CLEAR', () => {
    beforeEach(() => {
        clearStore();
    });

    it('init a container and form', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'repeat',
                children: [{
                    type: 'form',
                    name: 'repeatForm',
                    children: [{
                        type: 'text',
                        text: '1234'
                    }]
                }]
            }]
        };
        // @ts-ignore
        let test = new RCRETestUtil(config);
    });

    it('state should be empty', () => {
        let state = store.getState();
        expect(state).toEqual({
            container: {
                __TMP_MODEL__DO_NO_USE_IT: {}
            },
            trigger: {},
            form: {}
        });
    });

    it('repeat container and form', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'repeat',
                children: [{
                    type: 'form',
                    name: 'repeatForm',
                    children: [{
                        type: 'text',
                        text: '1234'
                    }]
                }]
            }]
        };
        // @ts-ignore
        let test = new RCRETestUtil(config);
    });

    it('state should be empty', () => {
        let state = store.getState();
        expect(state).toEqual({
            container: {
                __TMP_MODEL__DO_NO_USE_IT: {}
            },
            trigger: {},
            form: {}
        });
    });
});
