import React from 'react';
import {withAllContext} from '../core/context';
import {FormItemProps, RCREFormItem, RCREFormItemProps} from '../core/Form/FormItem';

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