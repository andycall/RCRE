import React from 'react';
import {BasicConfig} from '../../types';
import {RCREFormItem, RCREFormItemProps} from '../Form/FormItem';
import {componentLoader} from '../util/componentLoader';
import {createChild} from '../util/createChild';

class JSONFormItem extends React.PureComponent<RCREFormItemProps> {
    static getComponentParseOptions() {
        return {
            blackList: ['filterRule', 'filterErrMsg', 'validation']
        };
    }

    render() {
        let children = [];

        if (Array.isArray(this.props.control)) {
            children = this.props.control;
        } else if (this.props.control) {
            children = [this.props.control];
        }

        children = children.map((child: BasicConfig, index: number) => {
            return createChild(child, {
                key: child.type + '_' + index
            });
        });

        return (
            <RCREFormItem {...this.props}>
                {children}
            </RCREFormItem>
        );
    }
}

componentLoader.addComponent('formItem', JSONFormItem);