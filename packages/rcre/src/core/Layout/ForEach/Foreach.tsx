import React, {CSSProperties} from 'react';
import {map} from 'lodash';
import {BasicConfig, BasicProps} from '../../../types';
import {IteratorContext} from '../../context';
import {componentLoader} from '../../util/componentLoader';
import {createChild} from '../../util/createChild';

export interface ForeachProps extends BasicProps {
    /**
     * 数据源
     */
    dataSource: any[];

    /**
     * 渲染的组件
     */
    control: BasicConfig;

    className?: string;
    id?: string;
    style?: CSSProperties;
}

export class Foreach extends React.PureComponent<ForeachProps, {}> {
    constructor(props: ForeachProps) {
        super(props);
    }

    render() {
        let dataSource = this.props.dataSource || [];
        let control = this.props.control;

        if (!control) {
            console.warn('Foreach: 你必须要提供一个control配置，才能循环输出组件');
            return <div/>;
        }

        console.log(this.props);

        if (!Array.isArray(dataSource)) {
            console.warn('Foreach: dataSource 属性必须是个数组');
        }

        return (
            <div className={this.props.className} style={this.props.style} id={this.props.id}>
                {
                    map(dataSource, (source, index) => {
                        let child = createChild(control, {
                            key: source.rowKey || index
                        });

                        return (
                            <IteratorContext.Consumer key={source.rowKey || index}>
                                {
                                    iteratorContext => {
                                        if (iteratorContext.$item && iteratorContext.hasOwnProperty('$index')) {
                                            source['$parentItem'] = iteratorContext.$item;
                                            source['$parentIndex'] = iteratorContext.$index;
                                        }

                                        return (
                                            <IteratorContext.Provider
                                                value={{
                                                    $item: source,
                                                    $index: source.rowKey || index
                                                }}
                                            >
                                                {child}
                                            </IteratorContext.Provider>
                                        );
                                    }
                                }
                            </IteratorContext.Consumer>
                        );
                    })
                }
            </div>
        );
    }
}

componentLoader.addComponent('foreach', Foreach);
