import React from 'react';
import {BasicConnectProps, commonConnect} from '../Connect';
import {componentLoader} from '../util/componentLoader';

export interface RCREInputProps extends BasicConnectProps {}

class RCREInput extends React.PureComponent<RCREInputProps, any> {
    render() {
        let {
            tools,
            value,
            ...props
        } = this.props;

        return (
            <input
                {...props}
                value={value || ''}
                onChange={e => {
                    tools.updateNameValue(e.target.value);
                    tools.registerEvent('onChange', {
                        event: e,
                        value: e.target.value
                    });
                }}
                onAbort={e => {
                    tools.registerEvent('onAbort', {
                        event: e
                    });
                }}
                onBlur={e => {
                    tools.registerEvent('onBlur', {
                        event: e
                    });
                }}
                onFocus={e => {
                    tools.registerEvent('onFocus', {
                        event: e
                    });
                }}
                onClick={e => {
                    tools.registerEvent('onClick', {
                        event: e
                    });
                }}
            />
        );
    }
}

componentLoader.addComponent('input', commonConnect({
})(RCREInput));