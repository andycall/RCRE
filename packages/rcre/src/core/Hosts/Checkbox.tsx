import React from 'react';
import {BasicConnectProps} from '../Connect/basicConnect';
import {commonConnect} from '../Connect/Common/Common';
import {componentLoader} from '../util/componentLoader';

interface RCRECheckboxProps extends BasicConnectProps {
    text: string;
}

class RCRECheckbox extends React.Component<RCRECheckboxProps, any> {
    render() {
        return (
            <input
                type={'checkbox'}
                value={this.props.value || false}
                onChange={e => {
                    this.props.tools.updateNameValue(e.target.checked);
                    this.props.tools.registerEvent('onChange', {
                        value: e.target.checked,
                        event: e
                    });
                }}
            />
        );
    }
}

componentLoader.addComponent('checkbox', commonConnect()(RCRECheckbox));