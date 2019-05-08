import React from 'react';
import {FormItemContext} from '../core/context';
import {FormItemProps, RCREFormItem as _RCREFormItem, RCREFormItemProps} from '../core/Form/FormItem';
import {withAllContext} from '../core/util/withAllContext';

type FormItemParams = {
    valid: boolean;
    errmsg: string;
};
type FormItemChildFunc = (params: FormItemParams) => any;

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
                        children = this.props.children($formItem);
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