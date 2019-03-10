import * as React from 'react';
import {CSSProperties} from 'react';
import * as _ from 'lodash';
import {BasicConfig} from '../../Container/types';
import {ConfigFactory, CoreKind} from '../../../types';

import './Text.css';
import {TriggerEventItem} from '../../Trigger/Trigger';
import {BasicConnectProps} from '../../Connect/basicConnect';
import {commonConnect} from '../../Connect/Common/Common';
import {componentLoader} from '../../util/componentLoader';

export type TextProps = {
    text: string;
    /**
     * 文本类型
     */
    textType?: 'text' | 'link' | 'strong';

    /**
     * HTML标签
     */
    htmlType?: keyof HTMLElementTagNameMap;

    /**
     * 跳转链接
     */
    href?: string;

    /**
     * 是否禁用
     */
    disabled?: boolean;

    /**
     * 右侧添加额外的文字
     */
    rightAddon?: string;

    /**
     * 添加千分位符
     */
    thousands?: boolean;

    /**
     * 快速切换常用颜色
     */
    mode?: 'info' | 'error' | 'warning' | 'success' | 'primary';

    /**
     * 内联属性
     */
    style?: React.CSSProperties;

    /**
     * 使用纯HTML的方式展示
     */
    rawHtml?: boolean;

    /**
     * CSS Class
     */
    className?: string;
};

export interface TextEvent extends TriggerEventItem {
    event: 'onClick' | string;
}

export type TextConfig = ConfigFactory<TextProps, {
    type: CoreKind.text
}>;

export type TextDriverProps = BasicConfig & BasicConnectProps<any, TextConfig> & TextProps;

export class TextDriver extends React.Component<TextDriverProps, {}> {
    constructor(props: TextDriverProps) {
        super(props);
    }

    private parseThousand(text: string) {
        text = String(text);
        let group = text.split('').reverse();
        let ret = '';

        for (let i = 1; i <= group.length; i++) {
            if (i % 3 !== 0) {
                ret = group[i - 1] + ret;
            } else {
                ret = ',' + group[i - 1] + ret;
            }
        }

        if (ret[0] === ',') {
            ret = ret.substring(1);
        }

        return ret;
    }

    render() {
        let {
            tools,
            mode,
            text,
            thousands,
            disabled,
            textType,
            style,
            className,
            href,
            rawHtml,
            rightAddon,
            htmlType
        } = this.props;
        let defaultTextStyle: CSSProperties = {};

        switch (mode) {
            case 'info':
                defaultTextStyle.color = '#999999';
                break;
            case 'error':
                defaultTextStyle.color = '#FF5B5B';
                break;
            case 'warning':
                defaultTextStyle.color = '#FE9700';
                break;
            case 'primary':
                defaultTextStyle.color = '#3389E2';
                break;
            case 'success':
                defaultTextStyle.color = '#5BC49F';
                break;
            default:
        }

        let children;
        if (typeof text === 'boolean') {
            text = String(text);
        }

        if (thousands && /^\d+\.?\d+?$/.test(text)) {
            text = String(text);
            // 带小数点
            if (/^\d+\.\d+$/.test(text)) {
                let prefix = text.split('.')[0];
                let suffix = text.split('.')[1];
                text = this.parseThousand(prefix) + '.' + suffix;
            } else {
                text = this.parseThousand(text);
            }
        }

        if (_.isArray(text) || _.isObject(text) || _.isObjectLike(text)) {
            text = JSON.stringify(text);
        }

        if (disabled) {
            Object.assign(defaultTextStyle, {
                color: '#b8b8b8',
                cursor: 'not-allowed'
            });
        }

        switch (textType) {
            case 'link': {
                let props = {
                    style: Object.assign(defaultTextStyle, style),
                    className: 'rcre-text ' + (className || ''),
                    href: href,
                    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
                        event.preventDefault();
                        if (disabled) {
                            event.stopPropagation();
                            return;
                        }

                        if (href && window) {
                            window.location.href = href;
                        }
                        tools.registerEvent('onClick', event);
                    }
                };

                if (!rawHtml) {
                    children = <a {...props}>{text}{rightAddon}</a>;
                } else {
                    children = <a {...props} dangerouslySetInnerHTML={{__html: text}} />;
                }

                break;
            }
            default: {
                let tag = htmlType || 'span';
                let props = {
                    style: Object.assign(defaultTextStyle, style),
                    onClick: (event: React.MouseEvent<HTMLSpanElement>) => {
                        if (disabled) {
                            event.stopPropagation();
                            return;
                        }
                        tools.registerEvent('onClick', event);
                    },
                    className: 'rcre-text ' + (className || '')
                };

                if (!rawHtml) {
                    if (rightAddon) {
                        text += rightAddon;
                    }

                    children = React.createElement(tag, props, text);
                } else {
                    children = React.createElement(tag, {
                        ...props,
                        dangerouslySetInnerHTML: {__html: text}
                    });
                }
            }
        }

        return children;
    }
}

componentLoader.addComponent('text', commonConnect()(TextDriver), '__BUILDIN__');
