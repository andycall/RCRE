import React from 'react';
import {BasicConfig} from '../../types';
import {FormProps, RCREForm} from '../Form/Form';
import {componentLoader} from '../util/componentLoader';
import {createChild} from '../util/createChild';

function JSONForm(props: FormProps) {
    let children = (props.children || []).map((child: BasicConfig, index: number) => {
        return createChild(child, {
            key: index
        });
    });

    return (
        <RCREForm {...props}>
            {children}
        </RCREForm>
    );
}

componentLoader.addComponent('form', JSONForm);