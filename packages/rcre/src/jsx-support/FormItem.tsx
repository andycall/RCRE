import React from 'react';
import {FormItemContext} from '../core/context';
import {FormItemProps, RCREFormItem as _RCREFormItem, RCREFormItemProps} from '../core/Form/FormItem';
import {withAllContext} from '../core/util/withAllContext';
import {FormItemContextType} from '../types';

type FormItemParams = {
    valid: boolean;
    errmsg: string;
    validating: boolean;
};
type FormItemChildFunc = (params: FormItemParams, context: FormItemContextType) => any;

interface FormItemComponentProps extends FormItemProps {
    children: React.ReactElement | FormItemChildFunc;
}

const WrappedRCREFormItem = withAllContext(_RCREFormItem);

class FormItemComponents extends React.PureComponent<RCREFormItemProps, {}> {
    render() {
        return (
            <WrappedRCREFormItem {...this.props}>
                <FormItemContext.Consumer>{formItemContext => {
                    let children;
                    let $formItem = formItemContext.$formItem;

                    if (typeof this.props.children === 'function') {
                        children = this.props.children($formItem, formItemContext);
                    } else {
                        children = this.props.children;
                    }

                    return children;
                }}
                </FormItemContext.Consumer>
            </WrappedRCREFormItem>
        );
    }
}

class DummyFormItem extends React.PureComponent<FormItemComponentProps> {
}

export const RCREFormItem = (FormItemComponents as any) as typeof DummyFormItem;