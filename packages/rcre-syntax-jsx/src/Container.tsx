import React from 'react';
import {CustomerSourceConfig, defaultData, ProviderSourceConfig, createChild, PropsRunTimeType, runTimeType} from 'rcre';
const ContainerContext = React.createContext('');

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
    props?: {
        [key: string]: (runTime: PropsRunTimeType) => any
    };

    /**
     * 自定义内部的属性值，只需指定父级的Key，根据ExpressionString来计算出传入到父级的值
     */
    export?: {
        [parent: string]: (runTime: runTimeType) => any;
    };
}

export class Container extends React.Component<ContainerProps, {}> {
    static contextType = ContainerContext;

    render() {
        let info = {
            type: 'container',
            ...this.props
        };

        let parentModel = this.context;

        let children = createChild(info, {
            info: info,
            // the model of parent
            model: parentModel
        }, this.props.children);

        return (
            <ContainerContext.Provider value={this.props.model}>
                {children}
            </ContainerContext.Provider>
        );
    }
}