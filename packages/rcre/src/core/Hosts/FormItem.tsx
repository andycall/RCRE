import React from 'react';
import {formItemConnect} from "../Form/FormItem";
import {componentLoader} from "../util/componentLoader";

class RCREFormItem extends React.Component<any, any> {
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}

componentLoader.addComponent('formItem', formItemConnect()(RCREFormItem));