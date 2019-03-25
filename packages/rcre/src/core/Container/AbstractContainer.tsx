import * as React from 'react';
import './Container.css';
import {BasicContainer, ContainerProps, defaultData} from './BasicComponent';
import {ContainerNodeOptions} from '../Service/ContainerDepGraph';
import {CustomerSourceConfig} from '../DataCustomer/index';
import Container from './Container';
import {createChild} from '../util/createChild';
import {ProviderSourceConfig} from '../DataProvider/Controller';
import {BasicConfig, COREConfig, CoreKind} from '../../types';
import {componentLoader} from '../util/componentLoader';

export type BindItem = {
    child: string;
    parent: string;
    transform?: string
};

export interface ContainerConfig<Config> extends BasicConfig, ContainerNodeOptions {
    /**
     * Container的类型
     */
    type: CoreKind.container;

    /**
     * 字级组件
     */
    children: (Config | COREConfig<Config>)[];

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

export class AbstractContainer<Config extends ContainerConfig<Config>> extends BasicContainer<Config, ContainerProps<Config>, {}> {
    constructor(props: ContainerProps<Config>) {
        super(props);
    }

    render() {
        let children;

        if (Array.isArray(this.props.info.children)) {
            children = this.props.info.children.map((child, index) => {
                return this.renderChild(child, index);
            });
        }

        let childElement = React.createElement(Container, this.props, children);

        return this.renderChildren(this.props.info, childElement);
    }

    private renderChild(info: Config | COREConfig<Config>, index: number) {
        return createChild(info, {
            ...this.props,
            key: `${info.type}_${index}`,
            info: info
        });
    }
}

componentLoader.addComponent('container', AbstractContainer, '__BUILDIN__');
