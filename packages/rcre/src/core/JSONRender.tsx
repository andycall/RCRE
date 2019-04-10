import querystring from 'querystring';
import {Store} from 'redux';
import URL from 'url';
import createReduxStore from '../data/store';
import {RCREContext} from './context';
import {dataProviderEvent} from './Events/dataProviderEvent';
import {ContainerNode} from './Service/ContainerDepGraph';
import {RootState} from '../data/reducers';
import {BasicConfig, BasicContextType, PageConfig, RCREOptions} from '../types';
import * as React from 'react';
import {Provider} from 'react-redux';
import {Events} from './Events/index';
import {createChild} from './util/createChild';

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

export class JSONRender<T extends BasicConfig> extends React.Component<RenderPropsInterface<T>, RenderState> {
    static defaultProps = {
        code: '{"title": "空数据", "body": []}',
        global: {}
    };
    static contextType = RCREContext;

    private contextValue: BasicContextType;
    public events: Events;
    private store: Store<RootState>;
    private containerGraph: Map<string, ContainerNode>;

    getLocationService() {
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

    constructor(props: RenderPropsInterface<T>) {
        super(props);

        let location = this.getLocationService();
        let store: Store<any>;

        if (props.store) {
            store = props.store;
        } else {
            store = createReduxStore();
        }

        // for test use
        this.store = store;
        this.containerGraph = new Map();
        this.events = props.events || new Events();

        this.contextValue = {
            ...location,
            lang: '',
            $global: props.global || {},
            debug: props.debug || false,
            store: store,
            mode: 'json',
            options: props.options || {},
            events: this.events,
            containerGraph: this.containerGraph
        };
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
        let info: PageConfig<any> | null;
        if (typeof this.props.code === 'string') {
            try {
                info = JSON.parse(this.props.code);
            } catch (e) {
                console.error(e);
                info = null;
            }
        } else {
            info = this.props.code;
        }

        if (!info) {
            return <h1>JSON 解析异常</h1>;
        }

        let body = info.body;
        if (!Array.isArray(body)) {
            return <p>body props is not array</p>;
        }

        let childElements = body.map((item, index) => {
            return createChild(item, {
                info: item,
                key: index,
                loadMode: this.props.loadMode,
                debug: this.props.debug,
                options: this.props.options
            });
        });

        let pageHeader = info.title ? (
            <div className="page-header">
                <h1>{info.title}</h1>
            </div>
        ) : '';

        return (
            <Provider store={this.store}>
                <RCREContext.Provider value={this.contextValue}>
                    <div className="page-container">
                        {pageHeader}
                        <div className="page-body">
                            {childElements}
                        </div>
                    </div>
                </RCREContext.Provider>
            </Provider>
        );
    }
}

export class Render extends JSONRender<any> {
    constructor(props: any) {
        super(props);
        console.warn('Render API 已经改名，请使用 JSONRender');
    }
}