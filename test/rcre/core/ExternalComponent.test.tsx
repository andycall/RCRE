import {ES, componentLoader} from 'rcre';
import {RCRETestUtil} from 'rcre-test-tools';
import React from 'react';

describe('External Component', () => {
    it('Component with ES Wrapper Can directly render by JSON', () => {
        class Input extends React.Component<any, any> {
            render() {
                return (
                    <ES name={this.props.name}>
                        {({$data}, context) => {
                            return (
                                <input
                                    value={$data.name}
                                    onChange={event => context.container.$setData(this.props.name, event.target.value)}
                                />
                            );
                        }}
                    </ES>
                );
            }
        }

        componentLoader.addComponent('ESInput', Input);

        let config = {
            body: [{
                type: 'container',
                model: 'demo',
                children: [
                    {
                        type: 'ESInput',
                        name: 'username'
                    },
                    {
                        type: 'text',
                        text: '#ES{$data.username}'
                    }
                ]
            }]
        };

        let test = new RCRETestUtil(config);
        test.setContainer('demo');
        let username = test.getComponentByName('username');
        test.setData(username, 'helloworld');

        let state = test.getContainerState();
        expect(state.username).toBe('helloworld');
    });
});