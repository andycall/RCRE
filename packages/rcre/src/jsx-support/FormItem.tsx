import React from 'react';
import {FormItemProps, RCREFormItem, RCREFormItemProps} from '../core/Form/FormItem';
import {withAllContext} from "../core/util/withAllContext";

class FormItemComponents extends React.PureComponent<RCREFormItemProps, {}> {
    render() {
        return (
            <RCREFormItem
                {...this.props}
            />
        );
    }
}

class DommyFormItem extends React.PureComponent<FormItemProps> {}

export const FormItem = withAllContext(FormItemComponents) as typeof DommyFormItem;