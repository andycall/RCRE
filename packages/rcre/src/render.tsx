// import {Store} from 'redux';
import {Store} from 'redux';
import {dataProviderEvent} from './core/Events/dataProviderEvent';
import {ContainerNode} from './core/Service/ContainerDepGraph';
import {RootState} from './data/reducers';
import configureStore from './data/store';
import {BasicConfig} from './types';
import * as React from 'react';
import Page, {PageConfig, RCREOptions} from './core/Page';
import {Provider} from 'react-redux';
import {Events} from './core/Events/index';

interface RenderState {
    renderFlag: boolean;
}

export type globalOptions = {
    [s: string]: any
};

// export let store: Store<RootState> = configureStore();

export interface RenderPropsInterface<T extends BasicConfig> {
    // 配置代码
    code: PageConfig<T> | string;
    // 全局变量
    global?: globalOptions;
    // RCRE配置
    options?: RCREOptions;
    // 事件控制器
    events?: Events;
    // 开启组件调试模式
    debug?: boolean;
    // Redux store
    store?: Store<any>;
    // 组件加载模式
    loadMode?: string;
}

export class Render<T extends BasicConfig> extends React.Component<RenderPropsInterface<T>, RenderState> {
    static defaultProps = {
        code: '{"title": "空数据", "body": []}',
        global: {}
    };

    public events: Events;
    private store: Store<RootState>;
    private containerGraph: Map<string, ContainerNode>;

    constructor(props: RenderPropsInterface<T>) {
        super(props);
        if (props.store) {
            this.store = props.store;
        } else {
            this.store = configureStore();
        }
        this.containerGraph = new Map();
        this.events = props.events || new Events();
    }

    componentWillUnmount(): void {
        this.store.dispatch({
            type: '_RESET_STORE_'
        });
        dataProviderEvent.clear();
        this.containerGraph.clear();
        // @ts-ignore
        this.containerGraph = null;
        // @ts-ignore
        this.store = null;
    }

    render() {
        let info;
        if (typeof this.props.code === 'string') {
            try {
                info = JSON.parse(this.props.code);
            } catch (e) {
                console.error(e);
            }
        } else {
            info = this.props.code;
        }

        if (!info) {
            return <h1>JSON 解析异常</h1>;
        }

        return (
            <Provider store={this.store}>
                <Page
                    title={info.title}
                    body={info.body}
                    debug={this.props.debug}
                    lang={info.lang}
                    global={this.props.global}
                    loadMode={this.props.loadMode}
                    options={this.props.options}
                    containerGraph={this.containerGraph}
                    events={this.events}
                    store={this.store}
                />
            </Provider>
        );
    }
}
