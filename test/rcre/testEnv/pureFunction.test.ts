import {clearStore, filter} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import moment from 'moment';
import {VERSION} from 'lodash';

describe('In Test Env, pure Function is ExpressionString', () => {
    beforeEach(() => {
        clearStore();
    });
    it('simple pure function', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'text',
                    text: (runTime: any) => runTime.$data.username
                }, {
                    type: 'input',
                    name: 'username'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');

        let text = test.getComponentByType('text');
        expect(test.getDataOfProperty(text, 'text')).toBe('helloworld');
    });

    it('pure function in Container component', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: (runTime: any) => runTime.$moment()
                },
                children: [{
                    type: 'text',
                    text: (runTime: any) => runTime.$data.username
                }, {
                    type: 'input',
                    name: 'username'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let text = test.getComponentByType('text');
        expect(test.getDataOfProperty(text, 'text').format('YYYY-MM-DD')).toEqual(moment().format('YYYY-MM-DD'));
    });

    it('pure function with many params', () => {
        filter.setFilter('toSum', (p: any, n: any) => p + n);

        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'text',
                    text: (runTime: any) => runTime.toSum(runTime.$data.prev, runTime.$data.next)
                }, {
                    type: 'input',
                    name: 'prev'
                }, {
                    type: 'input',
                    name: 'next'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let prev = test.getComponentByName('prev');
        let next = test.getComponentByName('next');
        test.setData(prev, '1');
        test.setData(next, '2');

        let text = test.getComponentByType('text');
        expect(test.getDataOfProperty(text, 'text')).toBe('12');
    });

    it('use lodash function', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'text',
                    text: (runTime: any) => runTime._.VERSION
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        expect(test.wrapper.text()).toBe(VERSION);
    });

    it('multi expressionString', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    name: 'test',
                    next: 1,
                    prev: 2
                },
                children: [{
                    type: 'text',
                    // '#ES{$data.name} #ES{$data.next + $data.prev}'
                    text: (runTime: any) => `${runTime.$data.name} ${runTime.$data.next + runTime.$data.prev}`
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let text = test.getComponentByType('text');
        expect(text.text()).toBe('test 3');
    });
});