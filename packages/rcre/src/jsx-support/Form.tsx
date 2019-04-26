import React from 'react';
import {FormProps, RCREForm} from '../core/Form/Form';
import {withAllContext} from "../core/util/withAllContext";
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