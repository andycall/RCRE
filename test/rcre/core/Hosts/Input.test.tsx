import {clearStore} from "rcre";
import {RCRETestUtil} from "rcre-test-tools";

describe('Input', () => {
    beforeEach(() => {
        clearStore();
    });

    it('name key', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [{
                    type: 'input',
                    name: 'username'
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        let state = test.getContainerState();
        expect(state.username).toBe('helloworld');
        test.unmount();
    });

    it('onChange event', async () => {
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
                        params: {
                            other: '12345'
                        }
                    }]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');
        await test.simulate(username, 'onChange');
        let state = test.getContainerState();
        expect(state.username).toBe('helloworld');
        expect(state.other).toBe('12345');
        test.unmount();
    });
});