/**
 * @file Container组件
 * @author dongtiancheng
 */
import * as React from 'react';
import {
    clone,
    get,
    isObjectLike,
} from 'lodash';
import {
    BasicProps, BindItem,
    ContainerContextType, ContainerNodeOptions, ContainerSetDataOption,
    CustomerSourceConfig, defaultData, ESFunc,
    ProviderSourceConfig,
    RCREContextType
} from '../../types';
import {connect} from 'react-redux';
import {
    ASYNC_LOAD_DATA_FAIL_PAYLOAD,
    ASYNC_LOAD_DATA_PROGRESS_PAYLOAD,
    ASYNC_LOAD_DATA_SUCCESS_PAYLOAD,
    containerActionCreators, SYNC_LOAD_DATA_FAIL_PAYLOAD, SYNC_LOAD_DATA_SUCCESS_PAYLOAD
} from './action';
import {RootState} from '../../data/reducers';
import {DataProvider} from '../DataProvider/Controller';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';
import {DataCustomer} from '../DataCustomer/index';
import {ContainerNode} from '../Service/ContainerDepGraph';
import {ContainerContext} from '../context';
import {getRuntimeContext} from '../util/util';

// First Init Life Circle:
// ComponentWillMount -> Render -> ComponentDidMount

export interface ContainerProps extends ContainerNodeOptions {
    /**
     * 数据模型Key
     */
    model: string;

    /**
     * 初始化数据
     */
    data?: defaultData;

    /**
     * container 继承属性映射
     */
    props?: {
        [key: string]: ESFunc
    };

    /**
     * 自动同步子级的对应属性的值到父级
     * @deprecated
     */
    bind?: BindItem[];

    /**
     * 自定义内部的属性值，只需指定父级的Key，根据ExpressionString来计算出传入到父级的值
     */
    export?: {
        [parent: string]: ESFunc;
    } | string;

    /**
     * dataProvider配置
     */
    dataProvider?: ProviderSourceConfig[];

    /**
     * dataCustomer配置
     */
    dataCustomer?: CustomerSourceConfig;

    /**
     * 子级组件
     */
    children?: any;
}

export interface ConnectContainerProps extends ContainerProps, BasicProps {
    /**
     * 当前Container组件的数据模型
     */
    $data?: any;
}

// Component Update Life Circle:
// componentWillReceiveProps -> shouldComponentUpdate -> ComponentWillUpdate -> Render -> ComponentDidMount
class Container extends React.Component<ConnectContainerProps, {}> {
    static displayName = 'RCREContainer';
    private dataProvider: DataProvider;
    private dataCustomer: DataCustomer;
    // private event: EventNode;
    private isUnmount: boolean;

    constructor(props: ConnectContainerProps, context: RCREContextType) {
        super(props);
        this.dataProvider = new DataProvider(props.dataProvider || []);
        this.dataCustomer = new DataCustomer(props.containerContext.dataCustomer);
        this.isUnmount = false;
        this.getData = this.getData.bind(this);
        this.$setData = this.$setData.bind(this);
        this.initContainerGraph(props);
        this.initDataCustomer(props);
        this.initDefaultData(props);
    }

    private initDataCustomer(props: ContainerProps) {
        const defaultCustomer = {
            mode: 'pass',
            name: '$SELF_PASS_CUSTOMER',
            config: {
                model: props.model,
                assign: {}
            }
        };

        const defaultParentCustomer = {
            mode: 'pass',
            name: '$PARENT_PASS_CUSTOMER',
            config: {
                model: props.model,
                assign: {}
            }
        };

        let dataCustomer = props.dataCustomer;

        if (dataCustomer) {
            if (!Array.isArray(dataCustomer.customers)) {
                console.error('DataCustomer: customer属性必须是个数组');
                return;
            }

            if (dataCustomer.groups && !Array.isArray(dataCustomer.groups)) {
                console.error('DataCustomer: groups属性必须是个数组');
                return;
            }

            dataCustomer.customers.unshift(defaultCustomer);
            dataCustomer.customers.unshift(defaultParentCustomer);
        } else {
            dataCustomer = {
                customers: [defaultCustomer, defaultParentCustomer],
                groups: []
            };
        }
        this.dataCustomer.initCustomerConfig(dataCustomer);
    }

    private getContextCollection() {
        return {
            rcre: this.props.rcreContext,
            container: this.props.containerContext,
            iterator: this.props.iteratorContext,
            form: this.props.formContext
        };
    }

    private initDefaultData(props: ContainerProps) {
        let data = this.props.data || {};
        let defaultValue = {};
        let runTime = getRuntimeContext({
            $data: this.props.$data,
            $parent: this.props.containerContext.$data
        } as ContainerContextType, this.props.rcreContext, {
            iteratorContext: this.props.iteratorContext
        });

        data = compileExpressionString(data, runTime, [], true);
        Object.assign(defaultValue, data);
        this.props.rcreContext.store.dispatch(containerActionCreators.initContainer({
            model: this.props.model,
            data: defaultValue
        }, this.getContextCollection()));
    }

    private initContainerGraph(props: ConnectContainerProps) {
        let model = props.model;
        let context = props.rcreContext;
        if (!context.containerGraph.has(model)) {
            let node = new ContainerNode(model, props.props, props.export, props.bind, {
                syncDelete: props.syncDelete,
                forceSyncDelete: props.forceSyncDelete,
                clearDataToParentsWhenDestroy: props.clearDataToParentsWhenDestroy,
                noNilToParent: props.noNilToParent
            });
            context.containerGraph.set(model, node);
            if (this.props.containerContext.model && context.containerGraph.has(this.props.model)) {
                let parentNode = context.containerGraph.get(this.props.containerContext.model)!;
                parentNode.addChild(node);
            }
        } else {
            console.warn('检测到有重复的container组件。model: ' + this.props.model);
        }
    }

    componentWillUpdate(nextProps: ContainerProps) {
        let store = this.props.rcreContext.store;
        const providerActions = {
            asyncLoadDataProgress: (payload: ASYNC_LOAD_DATA_PROGRESS_PAYLOAD) =>
                store.dispatch(containerActionCreators.asyncLoadDataProgress(payload)),
            asyncLoadDataSuccess: (payload: ASYNC_LOAD_DATA_SUCCESS_PAYLOAD) =>
                store.dispatch(containerActionCreators.asyncLoadDataSuccess(payload)),
            asyncLoadDataFail: (payload: ASYNC_LOAD_DATA_FAIL_PAYLOAD) =>
                store.dispatch(containerActionCreators.asyncLoadDataFail(payload)),
            syncLoadDataSuccess: (payload: SYNC_LOAD_DATA_SUCCESS_PAYLOAD) =>
                store.dispatch(containerActionCreators.syncLoadDataSuccess(payload)),
            syncLoadDataFail: (payload: SYNC_LOAD_DATA_FAIL_PAYLOAD) =>
                store.dispatch(containerActionCreators.syncLoadDataFail(payload))
        };

        if (this.props.dataProvider) {
            this.dataProvider.requestForData(nextProps.model, this.props.dataProvider, providerActions, nextProps, this.getContextCollection());
        }
    }

    componentWillUnmount() {
        this.props.rcreContext.store.dispatch(containerActionCreators.clearData({
            model: this.props.model,
            context: this.getContextCollection()
        }));
        this.dataProvider.providerCache = {};
        let node = this.props.rcreContext.containerGraph.get(this.props.model);

        if (node && node.parent) {
            let parentNode = node.parent;
            parentNode.removeChild(node);
        }

        this.props.rcreContext.containerGraph.delete(this.props.model);
        this.isUnmount = true;
        this.dataProvider.depose();
        this.dataCustomer.depose();
        this.depose();
        // this.event.trigger('componentWillUnMount');
    }

    private depose() {
        delete this.dataProvider;
        delete this.dataCustomer;
        delete this.$setData;
        delete this.getData;
        this.isUnmount = true;
    }

    private getData(nameStr: string) {
        let $data = this.props.$data;

        if (!$data) {
            return null;
        }

        if (typeof nameStr !== 'string') {
            nameStr = String(nameStr);
        }

        return get($data, nameStr);
    }

    $setData(name: string, value: any, options: ContainerSetDataOption = {}) {
        if (this.isUnmount) {
            return;
        }

        // IMPORTANT, 删除这个代码会引发严重的Bug
        if (isObjectLike(value)) {
            value = clone(value);
        }

        this.props.rcreContext.store.dispatch(containerActionCreators.setData({
            name: String(name),
            value: value,
            options: options
        }, this.props.model, this.getContextCollection()));

        if (options.forceUpdate) {
            this.forceUpdate();
        }
    }

    $setMultiData = (items: {name: string, value: any}[]) => {
        if (this.isUnmount) {
            return;
        }

        items = items.map(item => {
            // IMPORTANT, 删除这个代码会引发严重的Bug
            if (isObjectLike(item.value)) {
                item.value = clone(item.value);
            }

            return item;
        });

        this.props.rcreContext.store.dispatch(containerActionCreators.setMultiData(
            items,
            this.props.model,
            this.getContextCollection()
        ));
    }

    $deleteData = (name: string) => {
        this.props.rcreContext.store.dispatch(
            containerActionCreators.deleteData({
                name: name
            }, this.props.model, this.getContextCollection())
        );
    }

    TEST_setData(name: string, value: any) {
        this.$setData(name, value);
    }

    render() {
        if (!this.props.model) {
            return <div className="err-text">Container: model should defined in container like components</div>;
        }

        if (!this.props.children) {
            return <div className="err-text">Container: children props must be specific in Container Component</div>;
        }

        let model = this.props.model;
        let state: RootState = this.props.rcreContext.store.getState();
        let $data = state.$rcre.container[model] || {};
        let parentModel = this.props.containerContext.model;
        let $parent = parentModel ? state.$rcre.container[parentModel] : {};

        let childElements = this.props.children;

        // 通过这样的方式强制子级组件更新
        const context = {
            model: this.props.model,
            $data: $data,
            $parent: $parent,
            dataCustomer: this.dataCustomer,
            $setData: this.$setData,
            $getData: this.getData,
            $deleteData: this.$deleteData,
            $setMultiData: this.$setMultiData,
        };

        return (
            <ContainerContext.Provider value={context}>
                {childElements}
            </ContainerContext.Provider>
        );
    }
}

const mapStateToProps = (state: RootState, props: ConnectContainerProps) => {
    let model = props.model;
    let runTime = getRuntimeContext({} as ContainerContextType, props.rcreContext, {
        iteratorContext: props.iteratorContext,
    });

    if (isExpression(model)) {
        model = parseExpressionString(model, runTime);
    }

    return {
        $data: state.$rcre.container[model]
    };
};

export const RCREContainer = connect(mapStateToProps)(Container);
