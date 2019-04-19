import React from 'react';
import {BasicConfig} from '../../types';
import {FormItemProps, RCREFormItem} from '../Form/FormItem';
import {componentLoader} from '../util/componentLoader';
import {createChild} from '../util/createChild';
import {memo} from 'react-memo-polyfill';

function JSONFormItem(props: FormItemProps) {
    let children = [];

    if (Array.isArray(props.control)) {
        children = props.control;
    } else if (props.control) {
        children = [props.control];
    }

    children = children.map((child: BasicConfig, index: number) => {
        return createChild(child, {
            key: child.type + '_' + index
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

componentLoader.addComponent('formItem', memo(JSONFormItem));