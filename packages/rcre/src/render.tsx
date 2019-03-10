import {store} from './index';
import {BasicConfig} from './core/Container/types';
import * as React from 'react';
import Page, {PageProps, RCREOptions} from './core/Page';
import {Provider} from 'react-redux';
import {Events} from './core/Events/index';
import * as Container from './core/Container';

interface RenderState {
    renderFlag: boolean;
}

export type globalOptions = {
    [s: string]: any
};

export interface RenderPropsInterface<T extends Container.BasicConfig> {
    // 配置代码
    code: PageProps<T> | string;
    // 全局变量
    global?: globalOptions;
    // RCRE配置
    options?: RCREOptions;
    // 事件控制器
    events?: Events;
    // 开启组件调试模式
    debug?: boolean;
    // 组件加载模式
    loadMode?: string;
}

export class Render<T extends BasicConfig> extends React.Component<RenderPropsInterface<T>, RenderState> {
    static defaultProps = {
        code: '{"title": "空数据", "body": []}',
        global: {}
    };

    public events: Events;

    constructor(props: RenderPropsInterface<T>) {
        super(props);

        this.state = {
            renderFlag: true
        };

        this.events = props.events || new Events();
    }

    componentWillReceiveProps(nextProps: RenderPropsInterface<T>) {
        let prevCode = this.props.code;
        let nextCode = nextProps.code;

        if (typeof prevCode === 'object' && typeof nextCode === 'object') {
            prevCode = JSON.stringify(prevCode);
            nextCode = JSON.stringify(nextCode);
        }

        this.setState({
            renderFlag: false
        });
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
            <Provider store={store}>
                {
                    this.state.renderFlag ? (
                        <Page
                            title={info.title}
                            body={info.body}
                            debug={this.props.debug}
                            lang={info.lang}
                            global={this.props.global}
                            loadMode={this.props.loadMode}
                            options={this.props.options}
                            events={this.events}
                        />
                    ) : <div />
                }
            </Provider>
        );
    }

    componentDidUpdate() {
        if (!this.state.renderFlag) {
            this.setState({
                renderFlag: true
            });
        }
    }
}
