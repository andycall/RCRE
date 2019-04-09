import React from 'react';
import {CustomerSourceConfig, defaultData, ProviderSourceConfig, createChild} from 'rcre';

interface ContainerProps {
    /**
     * 数据模型Key
     */
    model: string;
    /**
     * dataProvider配置
     */
    dataProvider?: ProviderSourceConfig[];

    /**
     * dataCustomer配置
     */
    dataCustomer?: CustomerSourceConfig;
    /**
     * 初始化数据
     */
    data?: defaultData;

    /**
     * container 继承属性映射
     */
    props?: Object;

    /**
     * 自定义内部的属性值，只需指定父级的Key，根据ExpressionString来计算出传入到父级的值
     */
    export?: {
        [parent: string]: string;
    } | string;
}

export class Container extends React.Component<ContainerProps, {}> {
    render() {
        let info = {
            type: 'container',
            ...this.props
        };

        return createChild(info, this.props);
    }
}