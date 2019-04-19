import {RCRETestUtil} from 'rcre-test-tools';

describe('Events', () => {
    it('waitForDataProviderComplete trigger when dataProvider finished', async () => {
        let config = {
            body: [
                {
                    type: 'container',
                    model: 'container',
                    data: {
                        name: 'helloworld'
                    },
                    dataProvider: [
                        {
                            mode: 'ajax',
                            namespace: 'demo',
                            config: {
                                url: 'http://localhost:8844/static/table.json',
                                method: 'GET',
                                data: {
                                    name: '#ES{$data.name}'
                                }
                            }
                        }
                    ],
                    children: [
                        {
                            type: 'button',
                            text: 'helloworld'
                        },
                        {
                            type: 'container',
                            model: 'innerContainer',
                            dataProvider: [
                                {
                                    mode: 'ajax',
                                    namespace: 'innerDemo',
                                    config: {
                                        url: 'http://localhost:8844/static/table.json',
                                        method: 'GET',
                                        data: {
                                            name: '#ES{$data.name}'
                                        }
                                    }
                                }
                            ],
                            children: [
                                {
                                    type: 'input',
                                    name: 'name'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'container',
                    model: 'container3',
                    data: {
                        name: 'helloworld'
                    },
                    dataProvider: [
                        {
                            mode: 'ajax',
                            namespace: 'demo',
                            config: {
                                url: 'http://localhost:8844/static/table.json',
                                method: 'GET',
                                data: {}
                            }
                        }
                    ],
                    children: [
                        {
                            type: 'button',
                            text: 'helloworld'
                        },
                        {
                            type: 'container',
                            model: 'innerContainer4',
                            dataProvider: [
                                {
                                    mode: 'ajax',
                                    namespace: 'innerDemo',
                                    config: {
                                        url: 'http://localhost:8844/static/table.json',
                                        method: 'GET',
                                        data: {}
                                    }
                                }
                            ],
                            children: [
                                {
                                    type: 'text',
                                    text: '1234'
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        let test = new RCRETestUtil(config);
        await test.waitForDataProviderComplete();

        test.setContainer('innerContainer');
        let input = test.getComponentByName('name');
        test.setData(input, 'helloworld');
        await test.waitForDataProviderComplete();
    });
});