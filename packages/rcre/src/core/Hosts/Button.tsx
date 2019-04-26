import React from 'react';
import {ES} from '../ES';
import {componentLoader} from '../util/componentLoader';

interface ButtonProps {
    text: string;
}

class RCREButton extends React.Component<ButtonProps, any> {
    render() {
        return (
            <ES>
                {({$data}, context) => {
                    return (
                        <button
                            onClick={event => {
                                context.trigger.eventHandle('onClick', {
                                    event: event
                                });
                            }}
                        >
                            {this.props.text}
                        </button>
                    );
                }}
            </ES>
        );
    }
}

componentLoader.addComponent('button', RCREButton);