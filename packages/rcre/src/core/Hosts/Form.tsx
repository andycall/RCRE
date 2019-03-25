import React from 'react';
import {formConnect} from '../Form/Form';
import {componentLoader} from '../util/componentLoader';

class RCREForm extends React.Component<any, any> {
    render() {
        return (
            <form
                {...this.props}
                onSubmit={this.props.onSubmit}>
                {this.props.children}
            </form>
        );
    }
}

componentLoader.addComponent('form', formConnect()(RCREForm));