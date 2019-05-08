import React from 'react';
import {FormProps, RCREForm as _RCREForm} from '../core/Form/Form';
import {withAllContext} from '../core/util/withAllContext';
import {FormContext} from '../core/context';
import {BasicProps, FormContextType} from '../types';

interface FormComponentProps extends FormProps {
    onSubmit?: (event: React.FormEvent<any>) => any;
    children: (context: FormContextType) => any;
}

const WrappedForm = withAllContext(_RCREForm);

class FormComponent extends React.PureComponent<BasicProps & FormComponentProps> {
    render() {
        if (typeof this.props.children !== 'function') {
            return <div>THe children property of RCREForm component should be a function</div>;
        }

        const fn = async () => {};
        const onSubmit = this.props.onSubmit || fn;

        return (
            <WrappedForm
                {...this.props}
            >
                <FormContext.Consumer>
                    {context => this.props.children({
                        ...context,
                        $handleSubmit: onSubmit
                    })}
                </FormContext.Consumer>
            </WrappedForm>
        );
    }
}

class DommyForm extends React.PureComponent<FormComponentProps> {}

export const RCREForm = FormComponent as typeof DommyForm;