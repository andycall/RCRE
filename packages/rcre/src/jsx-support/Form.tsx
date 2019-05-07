import React from 'react';
import {FormProps, RCREForm} from '../core/Form/Form';
import {withAllContext} from '../core/util/withAllContext';
import {BasicProps} from '../types';

type FormComponentProps = {
    onSubmit?: (event: React.FormEvent<any>) => void;
};

class FormComponent extends React.PureComponent<FormProps & BasicProps & FormComponentProps> {
    render() {
        const {
            containerContext,
            formContext,
            formItemContext,
            rcreContext,
            triggerContext,
            iteratorContext,
            ...normalProps
        } = this.props;

        return (
            <RCREForm
                {...this.props}
            >
                <form
                    {...normalProps}
                    onSubmit={event => {
                        event.preventDefault();
                        if (this.props.onSubmit) {
                            this.props.onSubmit(event);
                        }
                    }}
                >
                    {this.props.children}
                </form>
            </RCREForm>
        );
    }
}

class DommyForm extends React.PureComponent<FormProps & FormComponentProps> {}

export const Form = withAllContext(FormComponent) as typeof DommyForm;