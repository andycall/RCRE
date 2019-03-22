import React from 'react';
import {BasicConnectProps} from "../Connect/basicConnect";
import {commonConnect} from "../Connect/Common/Common";
import {componentLoader} from "../util/componentLoader";

interface RCREButtonProps extends BasicConnectProps<any, any> {
    text: string;
}

class RCREButton extends React.Component<RCREButtonProps, any> {
    render() {
        let {
            tools,
            ...props
        } = this.props;

        return (
            <button
                {...props}
                onClick={event => {
                    tools.registerEvent('onClick', {
                        event: event
                    })
                }}
            >
                {this.props.text}
            </button>
        );
    }
}

componentLoader.addComponent('button', commonConnect()(RCREButton));