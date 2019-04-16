import {RCRETestUtil} from 'rcre-test-tools';

describe('ForEach', () => {
    it('all component under foreach should have $item and $index', () => {
        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                data: {
                    dataSource: [{
                        index: 0,
                        value: '1'
                    }, {
                        index: 1,
                        value: '2'
                    }],
                },
                children: [{
                    type: 'foreach',
                    dataSource: '#ES{$data.dataSource}',
                    control: {
                        type: 'text',
                        text: '#ES{$item}'
                    }
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        expect(test.wrapper.text()).toBe(`{"index":0,"value":"1"}{"index":1,"value":"2"}`);
    });

    it('use $item.$parentItem to access parent $item', () => {
        let config = {
            body: [{
                type: 'container',
                data: {
                    list: [{
                        name: 'A',
                        children: [{
                            name: 'A-A',
                            children: [{
                                name: 'A-A-A'
                            }]
                        }, {
                            name: 'A-B'
                        }]
                    }, {
                        name: 'B',
                        children: [{
                            name: 'B-A',
                            children: [{
                                name: 'B-A-A'
                            }]
                        }]
                    }]
                },
                model: 'demo',
                children: [{
                    type: 'foreach',
                    dataSource: '#ES{$data.list}',
                    control: {
                        type: 'foreach',
                        dataSource: '#ES{$item.children}',
                        control: {
                            type: 'foreach',
                            dataSource: '#ES{$item.children}',
                            control: {
                                type: 'div',
                                children: [{
                                    type: 'text',
                                    text: 'parent: #ES{$item.$parentItem.$parentItem.name}\n'
                                }, {
                                    type: 'text',
                                    text: 'middle: #ES{$item.$parentItem.name}\n'
                                }, {
                                    type: 'text',
                                    text: 'child: #ES{$item.name}'
                                }]
                            }
                        }
                    }
                }]
            }]
        };
        let test = new RCRETestUtil(config);
        expect(test.wrapper.text()).toBe('parent: Amiddle: A-Achild: A-A-Aparent: Bmiddle: B-Achild: B-A-A');
    });
});