import React from 'react';
import {withAllContext} from '../core/context';
import {FormProps, RCREForm} from '../core/Form/Form';
import {BasicProps} from '../types';

class FormComponent extends React.PureComponent<FormProps & BasicProps> {
    render() {
        return (
            <RCREForm
                {...this.props}
            />
        );
    }
}

class DommyForm extends React.PureComponent<FormProps> {}

export const Form = withAllContext(FormComponent) as typeof DommyForm;