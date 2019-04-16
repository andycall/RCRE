import {RCRETestUtil} from 'rcre-test-tools';

describe('Form', () => {
    it('init form', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    username: 'helloworld'
                },
                children: [
                    {
                        type: 'form',
                        name: 'test',
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
        let test = new RCRETestUtil(config);
        console.log(test.getState());
        console.log(test.wrapper.debug());
    });
});