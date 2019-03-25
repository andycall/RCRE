import * as React from 'react';
import {BasicContainer} from '../../Container/BasicComponent';
import {createChild} from '../../util/createChild';
import {BasicConfig, BasicContainerPropsInterface, COREConfig, CoreKind} from '../../../types';
import {componentLoader} from '../../util/componentLoader';

export interface DivConfig<Config> extends BasicConfig {
    type: CoreKind.div;
    children: (Config | COREConfig<Config>)[];
}

export class DivPropsInterface<Config extends BasicConfig> extends BasicContainerPropsInterface<Config> {
    info: Config;
}

export class Div<Config extends DivConfig<Config>> extends BasicContainer<Config, DivPropsInterface<Config>, {}> {
    constructor(props: DivPropsInterface<Config>) {
        super(props);
    }

    render() {
        let info = this.getPropsInfo(this.props.info);
        if (process.env.NODE_ENV === 'test') {
            // 测试框架支持
            this.TEST_INFO = info;
        }
        let children = info.children;

        if (!(children instanceof Array)) {
            children = [];
        }

        const buildInStyle = {
            width: '100%',
            outline: this.props.debug ? '1px dashed #B8B8B8' : ''
        };

        let childElements = (
            <div
                style={{
                    ...buildInStyle,
                    ...info.style
                }}
                onClick={(event) => this.commonEventHandler('onClick', event)}
                onMouseDown={(event) => this.commonEventHandler('onMouseDown', event)}
                onMouseUp={(event) => this.commonEventHandler('onMouseUp', event)}
                id={info.id}
                className={info.className}
            >
                {
                    children.map((child, key) => {
                        child = this.getPropsInfo(child, this.props, [], false, [
                            'show',
                            'hidden'
                        ]);

                        let element = createChild(child, {
                            ...this.props,
                            info: child,
                            key: key
                        });

                        return this.renderChildren(child, element);
                    })
                }
            </div>
        );

        return this.renderChildren(info, childElements);
    }
}

componentLoader.addComponent('div', Div, '__BUILDIN__');