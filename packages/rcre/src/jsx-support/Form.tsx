import React from 'react';
import {FormProps, RCREForm as _RCREForm} from '../core/Form/Form';
import {withAllContext} from '../core/util/withAllContext';
import {FormContext} from '../core/context';
import {BasicProps, FormContextType} from '../types';

interface FormComponentProps extends FormProps {
    onSubmit?: (event: React.FormEvent<any>, data: object) => any;
    children: (context: FormContextType) => any;
}

class FormComponent extends React.PureComponent<BasicProps & FormComponentProps> {
    render() {
        if (typeof this.props.children !== 'function') {
            return <div>The children property of RCREForm component should be a function</div>;
        }

        const fn = async () => {};
        const onSubmit = this.props.onSubmit || fn;

        return (
            <_RCREForm
                {...this.props}
            >
                <FormContext.Consumer>
                    {context => this.props.children({
                        ...context,
                        $handleSubmit: async (event: any) => {
                            if (event && event.preventDefault) {
                                event.preventDefault();
                            }
                            event.persist();

                            let valid = await context.$runValidations();

                            if (valid) {
                                let submitData = {};
                                let names = Object.keys(context.$form.control);
                                for (let itemName of names) {
                                    if (context.$form.control.hasOwnProperty(itemName)) {
                                        submitData[itemName] = this.props.containerContext.$getData(itemName);
                                    }
                                }

                                onSubmit(event, submitData);
                            }
                        }
                    })}
                </FormContext.Consumer>
            </_RCREForm>
        );
    }
}

class DommyForm extends React.PureComponent<FormComponentProps> {}

export const RCREForm = withAllContext(FormComponent) as typeof DommyForm;