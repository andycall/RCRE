import {clearStore} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';

describe('rcre-test-tools', () => {
    beforeEach(() => {
        clearStore();
    });



    it('constructor', () => {
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
        expect(test.config).toBe(config);
    });

    it('debug', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    name: 'test'
                },
                children: [{
                    type: 'form',
                    name: 'form',
                    children: [
                        {
                            type: 'input',
                            name: '1234'
                        }
                        // {
                        //     type: 'formItem',
                        //     required: true,
                        //     rules: [{
                        //         max: 20,
                        //         message: 'helloworld'
                        //     }],
                        //     control: {
                        //         type: 'input',
                        //         disabled: '#ES{$data.name === "test"}',
                        //         name: 'username'
                        //     }
                        // },
                        // {
                        //     type: 'text',
                        //     text: '#ES{$data.name}'
                        // },
                        // {
                        //     type: 'div',
                        //     hidden: '#ES{true}',
                        //     children: [
                        //         {
                        //             type: 'text',
                        //             text: 'hidden text'
                        //         }
                        //     ]
                        // }
                    ]
                }]
            }]
        };

        let test = new RCRETestUtil(config);
        expect(() => test.debug()).toThrow();
        test.setContainer('demo');

        console.log(test.debug());
    });

    it('getComponentFormStatus', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'input',
                        name: 'badUsername'
                    },
                    {
                        type: 'form',
                        name: 'basicForm',
                        children: [{
                            type: 'input',
                            name: 'godUser'
                        }]
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let badUsername = test.getComponentByName('badUsername');
        let godUser = test.getComponentByName('godUser');

        expect(test.getComponentFormStatus(badUsername)).toBe(null);
        expect(test.getComponentFormStatus(godUser)).toEqual({ name: 'basicForm',
            layout: 'horizontal',
            validateFirst: false,
            clearAfterSubmit: false,
            control: {} });
    });

    it('get dynamicName element', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    key: 'A'
                },
                children: [{
                    type: 'input',
                    name: 'scope.#ES{$data.key}'
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        test.setContainer('demo');

        let input = test.getComponentByName('scope.A');
        test.setData(input, 'helloworld');
        // expect();
    });
});
