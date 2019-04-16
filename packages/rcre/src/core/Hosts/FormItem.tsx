import React from 'react';
import {BasicConfig} from '../../types';
import {FormItemProps, RCREFormItem} from '../Form/FormItem';
import {componentLoader} from '../util/componentLoader';
import {createChild} from '../util/createChild';

function JSONFormItem(props: FormItemProps) {
    let children = [];

    if (props.control) {
        children = [props.control];
    } else if (Array.isArray(props.children)) {
        children = props.children;
    }

    children = children.map((child: BasicConfig, index: number) => {
        return createChild(child, {
            key: index
        });
    });

    return (
        <RCREFormItem {...props}>
            {children}
        </RCREFormItem>
    );
}

JSONFormItem.getComponentParseOptions = function() {
    return {
        blackList: ['filterRule', 'filterErrMsg']
    };
};

componentLoader.addComponent('formItem', JSONFormItem);