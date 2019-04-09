import React from 'react';
import {map} from 'lodash';
import {BasicConfig, BasicContainerPropsInterface} from '../../../types';
import {BasicContainer} from '../../Container/BasicComponent';
import {componentLoader} from '../../util/componentLoader';
import {createChild} from '../../util/createChild';

export interface ForeachConfig<Config> extends BasicConfig {
    /**
     * 数据源
     */
    dataSource: any[];

    /**
     * 渲染的组件
     */
    control: BasicConfig;
}

export class ForeachPropsInterface<Config extends BasicConfig> extends BasicContainerPropsInterface {
    info: Config;
}

export class Foreach<Config extends ForeachConfig<Config>> extends BasicContainer<ForeachPropsInterface<Config>, {}> {
    constructor(props: ForeachPropsInterface<Config>) {
        super(props);
    }

    render() {
        let info = this.getPropsInfo(this.props.info);
        let dataSource = info.dataSource || [];
        let control = info.control;

        if (!control) {
            console.warn('Foreach: 你必须要提供一个control配置，才能循环输出组件');
            return <div />;
        }

        return (
            <div className={info.className} style={info.style} id={info.id}>
                {
                    map(dataSource, (source, index) => {
                        if (this.props.$item) {
                            source['$parentItem'] = this.props.$item;
                        }
                        let parentIndex = this.props.$index;
                        if (typeof parentIndex !== 'undefined') {
                            source['$parentIndex'] = parentIndex;
                        }

                        return createChild(control, {
                            ...this.props,
                            info: control,
                            $item: source,
                            $index: source.rowKey || index,
                            key: source.rowKey || index
                        });
                    })
                }
            </div>
        );
    }
}

componentLoader.addComponent('foreach', Foreach);
