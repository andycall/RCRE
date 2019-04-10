/**
 * @file 引擎入口
 * @author dongtiancheng
 */

import React from 'react';
import PropsTypes from 'prop-types';
import {Store} from 'redux';
import {BasicConfig} from '../types';
import {ContainerNode} from './Service/ContainerDepGraph';
import {createChild} from './util/createChild';
import URL from 'url';
import querystring from 'querystring';
import {Events} from './Events';

export type RCREOptions = {
    /**
     * 启动0.15.0版本之前的container数据合并策略
     */
    oldNestContainerCompatible?: boolean;

    /**
     * 兼容Safari10的兼容代码
     */
    safari10Layout?: boolean;
};

export interface PageConfig<T extends BasicConfig> {
    title?: string;
    body: T[];
}

export interface PageProps<T extends BasicConfig> extends PageConfig<T> {
    // 外部注入的全局对象
    global?: Object;
    // 调试模式
    debug?: boolean;
    // 报错的信息语言
    lang?: string;
    loadMode?: string;
    options?: RCREOptions;
    events?: Events;
    store: Store<any>;
    containerGraph: Map<string, ContainerNode>;
}

class Page<T extends BasicConfig> extends React.Component<PageProps<T>, {}> {
    static defaultProps = {
        title: '',
        debug: false,
        global: {},
        lang: 'zh_CN',
        options: {}
    };

    static childContextTypes = {
        $global: PropsTypes.object,
        $location: PropsTypes.object,
        $query: PropsTypes.object,
        debug: PropsTypes.bool,
        lang: PropsTypes.string,
        events: PropsTypes.object,
        store: PropsTypes.object,
        options: PropsTypes.object,
        containerGraph: PropsTypes.object
    };

    static getLocationService() {
        let $location = URL.parse(location.href);
        let $query = {};

        if ($location.query && typeof $location.query === 'string') {
            $query = querystring.parse($location.query);
        }

        return {
            $location,
            $query
        };
    }

    constructor(props: PageProps<T>) {
        super(props);
        // this.buildContainerGraph();
        this.logOptionTips(props);
    }

    private logOptionTips(props: PageProps<T>) {
        if (props.options) {
            let hasWarn = false;

            if (props.options.oldNestContainerCompatible) {
                hasWarn = true;
                console.warn('RCRE兼容模式: 覆盖式数据继承逻辑');
            }

            if (hasWarn) {
                console.warn('RCRE 兼容功能将不再维护，请使用最新RCRE版本的功能');
            }
        }
    }

    getChildContext() {
        let {
            $location,
            $query
        } = Page.getLocationService();

        return {
            $global: this.props.global,
            $location,
            $query,
            store: this.props.store,
            debug: this.props.debug,
            events: this.props.events,
            containerGraph: this.props.containerGraph
        };
    }

    // private buildContainerGraph() {
    //     let config = this.props.body;
    //
    //     function find(conf: any, parent?: string) {
    //         if ('show' in conf || 'hidden' in conf) {
    //             return;
    //         }
    //
    //         if (conf.type === 'container') {
    //             let node = new ContainerNode(
    //                 conf.model,
    //                 conf.props,
    //                 conf.export,
    //                 conf.bind,
    //                 conf as Partial<ContainerConfig<T>>
    //             );
    //
    //             if (containerGraph.has(conf.model)) {
    //                 let existNode = containerGraph.get(conf.model);
    //
    //                 if (existNode && existNode.parent && existNode.parent.model === parent) {
    //                     console.warn('检测到页面中有重复model的container，正确的使用RCRE是保证页面中每个container的model都不一样');
    //                     return;
    //                 }
    //             }
    //
    //             containerGraph.set(conf.model, node);
    //
    //             if (parent) {
    //                 let parentNode = containerGraph.get(parent);
    //                 if (parentNode) {
    //                     parentNode.addChild(node);
    //                 }
    //             }
    //
    //             parent = conf.model;
    //         }
    //
    //         if (conf.children instanceof Array && conf.children.length > 0) {
    //             conf.children.forEach((c: any) => {
    //                 find(c, parent);
    //             });
    //         }
    //     }
    //
    //     if (config instanceof Array) {
    //         config.forEach(conf => find(conf));
    //     }
    // }

    render() {
        let body;

        if (!Array.isArray(this.props.body)) {
            return <p>body props is not array</p>;
        }

        body = this.props.body.map((item, index) => {
            return createChild(item, {
                info: item,
                key: index,
                loadMode: this.props.loadMode,
                debug: this.props.debug,
                options: this.props.options
            });
        });

        let pageHeader = this.props.title ? (
            <div className="page-header">
                <h1>{this.props.title}</h1>
            </div>
        ) : '';

        return (
            <div className="page-container">
                {pageHeader}
                <div className="page-body">
                    {body}
                </div>
            </div>
        );
    }
}

export default Page;
