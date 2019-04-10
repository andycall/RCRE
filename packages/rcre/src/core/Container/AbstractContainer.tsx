import * as React from 'react';
import './Container.css';
import {RCREContext} from "../context";
import {ContainerProps, defaultData} from './BasicComponent';
import {ContainerNodeOptions} from '../Service/ContainerDepGraph';
import Container from './Container';
import {createChild, renderChildren} from '../util/createChild';
import {BasicConfig, CoreKind, CustomerSourceConfig, ProviderSourceConfig} from '../../types';
import {componentLoader} from '../util/componentLoader';

export type BindItem = {
    child: string;
    parent: string;
    transform?: string
};

export interface ContainerConfig extends BasicConfig, ContainerNodeOptions {
    /**
     * Container的类型
     */
    type: CoreKind.container;

    /**
     * 字级组件
     */
    children?: any[];

    /**
     * 数据模型Key
     */
    model: string;

    /**
     * 初始化数据
     */
    data?: defaultData;

    /**
     * container 继承属性映射
     */
    props?: Object;

    /**
     * 自动同步子级的对应属性的值到父级
     */
    bind?: BindItem[];

    /**
     * 自定义内部的属性值，只需指定父级的Key，根据ExpressionString来计算出传入到父级的值
     */
    export?: {
        [parent: string]: string;
    } | string;

    /**
     * dataProvider配置
     */
    dataProvider?: ProviderSourceConfig[];

    /**
     * dataCustomer配置
     */
    dataCustomer?: CustomerSourceConfig;
}

export class AbstractContainer extends React.Component<ContainerProps, {}> {
    static contextType = RCREContext;
    constructor(props: ContainerProps) {
        super(props);
    }

    render() {
        let children = this.props.children;

        if (this.context === 'json' && this.props.info.children && Array.isArray(this.props.info.children)) {
            children = this.props.info.children.map((child: any, index: number) => {
                return this.renderChild(child, index);
            });
        }

        let childElement = React.createElement(Container, this.props, children);

        return renderChildren(this.props.info, childElement);
    }

    private renderChild(info: any, index: number) {
        return createChild(info, {
            ...this.props,
            key: `${info.type}_${index}`,
            info: info
        });
    }
}

componentLoader.addComponent('container', AbstractContainer, '__BUILDIN__');
