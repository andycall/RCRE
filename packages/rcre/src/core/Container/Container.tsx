/**
 * @file Container组件
 * @author dongtiancheng
 */
import * as React from 'react';
import {
    clone,
    get,
    find,
    isObject,
    isObjectLike,
    each
} from 'lodash';
import {
    // BasicConfig,
    BasicContainer,
    BasicContainerSetDataOptions, BasicContextType,
    ContainerProps,
    getRuntimeContext, runTimeType,
    // runTimeType
} from './types';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {actionCreators, IContainerAction} from './action';
import {RootState} from '../../data/reducers';
import {DataProvider} from '../DataProvider/Controller';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';
import {DataCustomer} from '../DataCustomer/index';
import {createChild} from '../util/createChild';
import {TMP_MODEL} from './reducer';
import {containerGraph, ContainerNode} from '../Service/ContainerDepGraph';
import {store} from '../../index';
import {ContainerConfig} from './AbstractContainer';
import {setWith} from '../util/util';

// First Init Life Circle:
// ComponentWillMount -> Render -> ComponentDidMount

const propsBlackList = ['children', 'data', 'dataCustomer', 'dataProvider', 'export', 'props'];
// Component Update Life Circle:
// componentWillReceiveProps -> shouldComponentUpdate -> ComponentWillUpdate -> Render -> ComponentDidMount
export class RCREContainer<Config extends ContainerConfig<Config>> extends BasicContainer<Config, ContainerProps<Config>, {}> {
    private dataProvider: DataProvider<Config>;
    private dataCustomer: DataCustomer<Config>;
    public CONTAINER_UPDATE_COUNT: number;
    // private event: EventNode;
    private isUnmount: boolean;
    private model: string;

    constructor(props: ContainerProps<Config>, context: BasicContextType) {
        super(props);
        this.dataProvider = new DataProvider(props.info.dataProvider || []);
        this.dataCustomer = new DataCustomer(props.dataCustomer);
        this.isUnmount = false;
        this.getData = this.getData.bind(this);
        this.childSetData = this.childSetData.bind(this);
        let info = this.getParsedInfo(props.info, {
            props,
            context,
            blackList: propsBlackList
        });
        this.CONTAINER_UPDATE_COUNT = 0;
        this.initContainerGraph(info);
        this.initDataCustomer(info, props);
        this.initDefaultData(info, props, context);
        this.model = info.model;
        // this.initDataProvider(info, props, context);
    }

    /**
     * 预先收集defaultValue
     * @param {BasicConfig[]} info
     * @param {object} defaultCache
     * @param {runTimeType} runTime
     */
    private collectDefaultValue(info: any, defaultCache: object, runTime: runTimeType) {
        if (info.type === 'container' || info.hidden || info.show) {
            return;
        }

        let defaultValue = info.defaultValue;

        if (isExpression(defaultValue)) {
            defaultValue = parseExpressionString(defaultValue, runTime);
        }

        if (Array.isArray(defaultValue) || isObject(defaultValue)) {
            defaultValue = compileExpressionString(defaultValue, runTime, [], true);
        }

        if (info.name && defaultValue) {
            defaultCache = setWith(defaultCache, info.name, defaultValue);
        }

        each(info, (value, property) => {
            if (value instanceof Array) {
                value.forEach(v => {
                    if (this.isRCREConfig(v)) {
                        this.collectDefaultValue(v, defaultCache, runTime);
                    }
                });
            } else if (this.isRCREConfig(value)) {
                this.collectDefaultValue(value, defaultCache, runTime);
            }
        });
    }

    private initDataCustomer(info: ContainerConfig<Config>, props: ContainerProps<Config>) {
        const defaultCustomer = {
            mode: 'pass',
            name: '$SELF_PASS_CUSTOMER',
            config: {
                model: props.info.model,
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

        if (info.dataCustomer) {
            if (!Array.isArray(info.dataCustomer.customers)) {
                console.error('DataCustomer: customer属性必须是个数组');
                return;
            }

            if (info.dataCustomer.groups && !Array.isArray(info.dataCustomer.groups)) {
                console.error('DataCustomer: groups属性必须是个数组');
                return;
            }

            info.dataCustomer.customers.unshift(defaultCustomer);
            info.dataCustomer.customers.unshift(defaultParentCustomer);
        } else {
            info.dataCustomer = {
                customers: [defaultCustomer, defaultParentCustomer],
                groups: []
            };
        }
        this.dataCustomer.initCustomerConfig(info.dataCustomer);
    }

    private initDefaultData(info: ContainerConfig<Config>, props: ContainerProps<Config>, context: object) {
        let defaultValue = {};
        let runTime = this.getRuntimeContext(props, context);
        this.collectDefaultValue(info.children, defaultValue, runTime);
        let data = compileExpressionString(info.data, runTime, [], true);

        if (defaultValue) {
            Object.assign(defaultValue, data);

            this.props.initContainer({
                model: info.model,
                data: defaultValue
            }, context);
        }
    }

    // private initDataProvider(info: ContainerConfig<Config>, props: ContainerProps<Config>, context: object) {
    //     const providerActions = {
    //         asyncLoadDataProgress: this.props.asyncLoadDataProgress,
    //         asyncLoadDataSuccess: this.props.asyncLoadDataSuccess,
    //         asyncLoadDataFail: this.props.asyncLoadDataFail,
    //         syncLoadDataSuccess: this.props.syncLoadDataSuccess,
    //         syncLoadDataFail: this.props.syncLoadDataFail
    //     };
    //
    //     let dataProvider = info.dataProvider;
    //     if (dataProvider) {
    //         this.dataProvider.requestForData(info.model, dataProvider, providerActions, props, context);
    //     }
    // }

    private initContainerGraph(info: ContainerConfig<Config>) {
        if (!containerGraph.has(info.model)) {
            let node = new ContainerNode(info.model, info.props, info.export, info.bind, info);
            containerGraph.set(info.model, node);
            if (this.props.model && containerGraph.has(this.props.model)) {
                let parentNode = containerGraph.get(this.props.model)!;
                parentNode.addChild(node);
            }
        } else {
            // console.warn('检测到有重复的container组件。model: ' + info.model);
        }
    }

    componentWillReceiveProps(nextProps: ContainerProps<Config>) {
        const providerActions = {
            asyncLoadDataProgress: this.props.asyncLoadDataProgress,
            asyncLoadDataSuccess: this.props.asyncLoadDataSuccess,
            asyncLoadDataFail: this.props.asyncLoadDataFail,
            syncLoadDataSuccess: this.props.syncLoadDataSuccess,
            syncLoadDataFail: this.props.syncLoadDataFail
        };

        if (this.props.info.dataProvider) {
            this.dataProvider.requestForData(this.props.info.model, this.props.info.dataProvider, providerActions, nextProps, this.context);
        }

        // this.event.trigger('componentWillUpdate');
    }

    componentDidUpdate() {
        // this.event.trigger('componentDidUpdate');
    }

    componentWillUnmount() {
        let info = this.getPropsInfo(this.props.info, this.props, propsBlackList);
        if (info.model) {
            this.props.clearData({
                model: info.model,
                context: this.context
            });
        }
        this.dataProvider.providerCache = {};
        let node = containerGraph.get(info.model);

        if (node && node.parent) {
            let parentNode = node.parent;
            parentNode.removeChild(node);
        }

        containerGraph.delete(info.model);
        this.isUnmount = true;
        // this.dataProvider.depose();
        // this.dataCustomer.depose();
        this.depose();
        // this.event.trigger('componentWillUnMount');
    }

    private depose() {
        delete this.dataProvider;
        delete this.dataCustomer;
        delete this.childSetData;
        delete this.getData;
        this.isUnmount = true;
    }

    private getData(nameStr: string, props: any = this.props, isTmp?: boolean) {
        let $data = props.$data;

        if (!$data) {
            return null;
        }

        if (isTmp) {
            $data = props.$tmp;
        }

        if (typeof nameStr !== 'string') {
            nameStr = String(nameStr);
        }

        let value = get($data, nameStr);

        if (props.info.transform && isExpression(props.info.transform.in)) {
            let runTime = this.getRuntimeContext(props);
            value = parseExpressionString(props.info.transform.in, {
                ...runTime,
                $args: {
                    name: nameStr,
                    value: value
                }
            });
        }

        return value;
    }

    childSetData(name: string, value: any, options: BasicContainerSetDataOptions = {}) {
        if (this.isUnmount) {
            return;
        }

        // IMPORTANT, 删除这个代码会引发严重的Bug
        if (isObjectLike(value)) {
            value = clone(value);
        }

        this.props.setData({
            name: String(name),
            value: value,
            options: options
        }, this.model, this.context);

        if (options.forceUpdate) {
            this.forceUpdate();
        }
    }

    TEST_setData(name: string, value: any) {
        this.childSetData(name, value);
    }

    render() {
        let info = this.getPropsInfo(this.props.info, this.props, propsBlackList);

        if (process.env.NODE_ENV === 'test') {
            // 测试框架支持
            this.TEST_INFO = info;
            this.CONTAINER_UPDATE_COUNT++;
        }

        if (!info.model) {
            return <div className="err-text">Container: model should defined in container like components</div>;
        }

        this.model = info.model;

        if (!info.children) {
            return <div className="err-text">Container: children props must be specific in Container Component</div>;
        }

        let state = store.getState();
        let $data = clone(state.container[info.model] || {});
        let $tmp = clone(this.props.$tmp);

        const setMultiData = (items: { name: string, value: any, isTmp: boolean }[]) => {
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

            this.props.setMultiData(items, info.model, this.context);
        };

        const $deleteData = (name: string, isTmp?: boolean) => {
            if (info.bind && info.bind instanceof Array) {
                let bindTarget = find(info.bind, o => o.child === name);

                if (bindTarget && this.props.$deleteData) {
                    this.props.$deleteData(bindTarget.parent);
                }
            }

            this.props.deleteData({
                name: name,
                isTmp: isTmp
            }, info.model, this.context);
        };

        // Container Component no long compile expression string for child
        // instead, AbstractComponent should compile it by themSelf
        let childElements = info.children.map((child, index) => {
            child = this.getPropsInfo(child, this.props, [], false, ['show', 'hidden']);
            let childElement = createChild(child, {
                ...this.props,
                info: child,
                model: info.model,
                $data: $data,
                $tmp: $tmp,
                $parent: this.props.$parent,
                options: this.props.options,
                dataCustomer: this.dataCustomer,
                $index: this.props.$index,
                $item: this.props.$item,
                $setData: this.childSetData,
                $getData: this.getData,
                $deleteData: $deleteData,
                $setMultiData: setMultiData,
                key: `${child.type}_${index}`
            });

            return this.renderChildren(child, childElement);
        });

        const containerStyle = {
            border: this.props.debug ? '1px dashed #3398FC' : '',
            ...info.style,
            width: '100%'
        };

        return (
            <div className={'rcre-container ' + (info.className || '')} style={containerStyle}>
                {this.props.debug && <span>container: {info.model}</span>}
                {childElements}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: ContainerProps<any>) => {
    let runTime = getRuntimeContext(ownProps, {});
    // direct compile
    let info = compileExpressionString(ownProps.info, runTime,
        ['children', 'data', 'dataCustomer', 'dataProvider'], false);

    let $data = state.container[info.model] || {};
    let $tmp = state.container[TMP_MODEL] || {};

    return {
        $data: $data,
        $tmp: $tmp,
        selfModel: info.model
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IContainerAction>) => bindActionCreators({
    initContainer: actionCreators.initContainer,
    setData: actionCreators.setData,
    setMultiData: actionCreators.setMultiData,
    clearData: actionCreators.clearData,
    deleteData: actionCreators.deleteData,
    asyncLoadDataProgress: actionCreators.asyncLoadDataProgress,
    asyncLoadDataSuccess: actionCreators.asyncLoadDataSuccess,
    asyncLoadDataFail: actionCreators.asyncLoadDataFail,
    syncLoadDataSuccess: actionCreators.syncLoadDataSuccess,
    syncLoadDataFail: actionCreators.syncLoadDataFail
}, dispatch);

/**
 * RCRE 0.15以下版本的父子级兼容策略
 *
 * @param {ContainerPropsInterface} ownProps
 * @param {{$data: Object}} stateProps
 * @param {ContainerProps} dispatchProps
 * @returns {any}
 */
function oldNestContainerCompatible(ownProps: ContainerProps<any>, stateProps: {
    $data: Object
}, dispatchProps: ContainerProps<any>) {
    let parentProps = ownProps.$data || {};
    let stateData = stateProps.$data;
    if (isObject(ownProps.info.parentMapping)) {
        let runTime = getRuntimeContext(ownProps, {});
        let parentMappingRet = compileExpressionString(ownProps.info.parentMapping, {
            ...runTime,
            $parent: parentProps,
            $data: stateProps.$data
        });
        if (parentMappingRet) {
            let originalData = stateProps.$data;
            Object.assign(stateData, originalData);
        }
    } else {
        // 屏蔽$loading属性
        delete parentProps['$loading'];
        Object.assign(stateData, parentProps);
    }
    return Object.assign({}, ownProps, stateProps, dispatchProps, {
        $data: stateData
    });
}

/**
 * 执行container组件嵌套的逻辑
 *
 * @param stateProps 当前container组件的mapStateToProps返回的对象
 * @param dispatchProps 当前container组件的mapDispatchToProps返回的对象
 * @param parentProps connect组件接收到的props
 * @return 当前container组件的props
 */
let hasWarn = false;
export const mergeProps =
    (stateProps: {
        $data: Object
    }, dispatchProps: ContainerProps<any>, ownProps: ContainerProps<any>): ContainerProps<any> => {
        // 启用兼容模式， 父级优先
        if (ownProps.options && ownProps.options.oldNestContainerCompatible) {
            if (!hasWarn) {
                hasWarn = true;
                console.warn('oldNestContainerCompatible该配置为兼容老版本功能,不建议使用,会导致container嵌套功能无法使用');
            }
            return oldNestContainerCompatible(ownProps, stateProps, dispatchProps);
        }

        // 子级优先
        let parentData = ownProps.$data;

        if (ownProps.$parent && parentData) {
            parentData['$parent'] = ownProps.$parent;
        }

        let retProps = Object.assign({}, ownProps, stateProps, dispatchProps, {
            $parent: parentData
        });

        return retProps;
    };

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, {
    pure: true,
    areStatePropsEqual: (nextStateProps, prevStateProps) => {
        return nextStateProps.$data === prevStateProps.$data && nextStateProps.$tmp === prevStateProps.$tmp;
    },
    areMergedPropsEqual: (nextMergedProps, prevMergedProps) => {
        return nextMergedProps.$data === prevMergedProps.$data && nextMergedProps.$parent === prevMergedProps.$parent;
    }
})(RCREContainer);
