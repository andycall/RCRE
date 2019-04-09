/**
 * @file 给普通组件提供的基础类，基础函数
 * @author dongtiancheng
 */

import {BasicConfig, BasicContainerPropsInterface, BasicContainerSetDataOptions, BasicContextType} from '../../types';
import {renderChildren} from '../util/createChild';
import {getRuntimeContext} from '../util/util';
import {actionCreators} from './action';
import PropTypes from 'prop-types';
import React from 'react';
import {isPlainObject, isEmpty, clone} from 'lodash';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';
import {RCREOptions} from '../Page';
import {gridPositionItems} from '../Layout/Row/Row';
// import {ContainerConfig} from './AbstractContainer';

export type rawJSONType = string | number | null | boolean | Object;
export type originJSONType = rawJSONType | rawJSONType[];

export type defaultData = {
    [s: string]: originJSONType
};

export class GridItem {
    gridCount?: number;
    gridPosition?: gridPositionItems;
    gridPaddingLeft?: number;
    gridPaddingRight?: number;
    gridLeft?: number;
    gridTop?: number;
    gridWidth?: number | string;
    gridHeight?: number | string;
}

export interface ContainerProps extends BasicContainerPropsInterface {
    info: any;

    $data: {};
    $tmp: {};
    $parent: {};

    options: RCREOptions;

    /**
     * 初始化Container的数据
     */
    initContainer: typeof actionCreators.initContainer;

    /**
     * 写入数据到数据模型
     */
    setData: typeof actionCreators.setData;

    /**
     * 批量写入多组不同key的数据
     */
    setMultiData: typeof actionCreators.setMultiData;

    /**
     * 清空当前数据模型
     */
    clearData: typeof actionCreators.clearData;

    /**
     * 删除数据模型某一个字段
     */
    deleteData: typeof actionCreators.deleteData;

    /**
     * 异步加载数据中
     */
    asyncLoadDataProgress: typeof actionCreators.asyncLoadDataProgress;

    /**
     * 异步加载数据成功
     */
    asyncLoadDataSuccess: typeof actionCreators.asyncLoadDataSuccess;

    /**
     * 异步加载数据失败
     */
    asyncLoadDataFail: typeof actionCreators.asyncLoadDataFail;

    /**
     * 同步加载数据成功
     */
    syncLoadDataSuccess: typeof actionCreators.syncLoadDataSuccess;

    /**
     * 同步加载数据失败
     */
    syncLoadDataFail: typeof actionCreators.syncLoadDataFail;
}

export const BasicContext = {
    $global: PropTypes.object,
    $location: PropTypes.object,
    $query: PropTypes.object,
    debug: PropTypes.bool,
    lang: PropTypes.string,
    store: PropTypes.object,
    events: PropTypes.object
};

/**
 * 获取ExpressionString 嵌入的上下文
 * @param {BasicContainerPropsInterface} props
 * @param context
 * @return {runTimeType}
 */

export type ParseInfoOptions<T> = {
    props?: T
    context?: BasicContextType;
    blackList?: string[];
    isDeep?: boolean;
    whiteList?: string[];
};

/**
 * 所有子级组件的基类
 */
export abstract class BasicContainer<T extends BasicContainerPropsInterface, P> extends React.Component<T, P> {
    static contextTypes = BasicContext;
    public isUnMounted: boolean;
    public TEST_INFO: any;

    constructor(props: T) {
        super(props);
        this.isUnMounted = false;
        this.setData = this.setData.bind(this);
        this.commonEventHandler = this.commonEventHandler.bind(this);
        this.getValueFromDataStore = this.getValueFromDataStore.bind(this);
    }

    componentWillUnmount() {
        let info = this.getPropsInfo(this.props.info);
        if (this.props.$deleteData && info.name) {
            if (this.props.$deleteFormItem && info.clearFormStatusOnlyWhenDestroy) {
                this.props.$deleteFormItem(info.name);
            } else if (this.props.$form && !info.disableClearWhenDestroy) {
                this.props.$deleteData(info.name);
            } else if (info.clearWhenDestroy) {
                this.props.$deleteData(info.name);
            }

        }
        this.isUnMounted = true;
    }

    shouldComponentUpdate(nextProps: T, nextState: P) {
        return true;
    }

    /**
     * 获取当前组件的ExpressionString 内嵌变量
     *
     * @param {T} props React组件的Props
     * @param context React组件Context
     * @returns {runTimeType}
     */
    public getRuntimeContext(props: T = this.props, context: any = this.context || {}) {
        let runTime = getRuntimeContext(props, context);
        return runTime;
    }

    /**
     * 是否组件已经从container获取了值
     * @returns {boolean}
     */
    public isReady(props: T = this.props) {
        if (!this.isUnderContainerEnv()) {
            return true;
        }

        return !isEmpty(props.$data);
    }

    /**
     * 在Connect组件上清除不需要传递到RCRE之外的属性
     */
    public muteParentInfo(mute: any) {
        mute = clone(mute);
        delete mute.type;
        delete mute.trigger;
        delete mute.gridCount;
        delete mute.show;
        delete mute.hidden;
        delete mute.gridWidth;
        delete mute.gridPaddingLeft;
        delete mute.gridPaddingRight;
        delete mute.gridPosition;
        delete mute.defaultValue;
        delete mute.clearFormStatusOnlyWhenDestroy;
        delete mute.clearWhenDestroy;
        delete mute.disableSync;
        delete mute.disableClearWhenDestroy;

        return mute;
    }

    /**
     * 转换带有~的内部属性
     * @param {Q} config
     * @returns {Q}
     */
    public transformInnerProperty(config: any) {
        for (let key in config) {
            if (config.hasOwnProperty(key)) {
                if (key[0] === '~') {
                    config[key.substring(1)] = config[key];
                    delete config[key];
                }

                // @ts-ignore
                if (config[key] === null && isExpression(this.props.info[key])) {
                    delete config[key];
                }
            }
        }

        return config;
    }

    /**
     * 调用此函数来解析JSON配置中的ExpressionString指令
     * @deprecated
     * @param {InfoType} info 组件的JSON配置
     * @param {T} props React组件的Props
     * @param {string[]} blackList 属性黑名单，指定之后不处理ExpressionString
     * @param {boolean} isDeep 是否深度遍历JSON配置
     * @param {string[]} whiteList 属性白名单，如果指定之后，只处理白名单里面的属性值
     * @param {object} context 组件上下文
     * @returns {InfoType}
     */
    protected getPropsInfo<InfoType>(info: InfoType,
                                     props?: T,
                                     blackList?: string[],
                                     isDeep?: boolean,
                                     whiteList?: string[],
                                     context?: BasicContextType
    ) {
        // do not deep copy info. it is dangerous, Find another way out!!!
        let runTime = this.getRuntimeContext(props, context);
        info = compileExpressionString(info, runTime, blackList, isDeep, whiteList);

        if (isPlainObject(info['style'])) {
            info['style'] = compileExpressionString(info['style'], runTime);
        }

        return info;
    }

    /**
     * 调用此函数来解析JSON配置中的ExpressionString指令
     *
     * @param {InfoType} info
     * @param {ParseInfoOptions} options
     * @return
     */
    public getParsedInfo<InfoType>(info: InfoType, options: ParseInfoOptions<T> = {}) {
        return this.getPropsInfo(
            info,
            options.props,
            options.blackList,
            options.isDeep,
            options.whiteList,
            options.context
        );
    }

    /**
     * 渲染组件，用于支持hidden属性，可让组件隐藏
     *
     * @param {BasicConfig} info 组件的JSON配置
     * @param {React.ReactElement} children 输出的React组件
     * @returns {any}
     */
    public renderChildren(info: BasicConfig, children: React.ReactNode) {
        return renderChildren(info, children);
    }

    /**
     * 事件注册器，注册一个事件，可以使用trigger属性来调用
     *
     * @param {string} eventName 事件名称
     * @param {any} args 额外的参数，会注入到param属性中的$args对象
     * @param {object} options 特殊参数
     */
    public async commonEventHandler(eventName: string, args: {
        [s: string]: any
    }, options?: object) {
        if (this.props.eventHandle) {
            return await this.props.eventHandle(eventName, args, options);
        } else if (this.props.info.trigger) {
            console.warn(this.props.info.type + ': invalid ' + eventName + ' event', args);
        }
    }

    /**
     * 使用Key，获取当前组件在container中的值
     *
     * @param {string} nameStr
     * @param {BasicConfig} info
     * @param {BasicContainerPropsInterface} props
     * @param {boolean} isTmp 从TMP_STORE中获取数据
     * @returns {any}
     */
    public getValueFromDataStore(
        nameStr?: string | number,
        props: T = this.props,
        info?: BasicConfig,
        isTmp?: boolean
    ): any | null {
        if (!this.props.$getData) {
            console.log('请把' + this.props.info.type + '组件放在Container组件下面');
            return null;
        }

        if (!info) {
            let runTime = this.getRuntimeContext(props, this.context);
            info = props.info;
            if (info && isExpression(props.info.disableSync)) {
                info.disableSync = parseExpressionString(info.disableSync, runTime);
            }
        }

        if (info && !info.disableSync) {
            if (!nameStr) {
                console.error('实时同步的组件需要提供name属性');
                return null;
            }

            return this.props.$getData(nameStr, props, isTmp);
        }

        return info ? info.value : null;
    }

    /**
     * 同步值到Container组件
     * @param {string} key 同步到Container的key
     * @param {any} value 同步到Container的值
     * @param {BasicContainerPropsInterface} props 当前环境下的props
     * @param {BasicContainerSetDataOptions} options 额外的配置项
     * @return {void}
     */
    public setData(key: string, value: any, props: T = this.props, options: BasicContainerSetDataOptions = {}) {
        if (this.props.$setData) {
            let info = props.info;
            let runTime = this.getRuntimeContext(props);

            if (info.disableSync) {
                return;
            }

            if (info.transform && !options.noTransform) {
                if (isExpression(info.transform.out)) {
                    value = parseExpressionString(info.transform.out, {
                        ...runTime,
                        $args: {
                            value: value,
                            name: key
                        }
                    });
                }

                if (isPlainObject(info.transform.out)) {
                    value = compileExpressionString(info.transform.out, {
                        ...runTime,
                        $args: {
                            value: value,
                            name: key
                        }
                    }, [], true);
                }
            }
            this.props.$setData(key, value, options);
        } else {
            console.warn(`你是不是忘了把组件: ${this.props.info.name} 放置在Container组件内部`);
        }
    }

    /**
     * 组件是否处于container组件内部
     * @returns {boolean}
     */
    public isUnderContainerEnv() {
        return !!this.props.$data && !!this.props.$setData;
    }

    /**
     *
     * @returns {boolean}
     */
    public isDebugMode() {
        return !!this.context.debug;
    }

    public isRCREConfig(config: any) {
        if (typeof config !== 'object' || !config) {
            return false;
        }

        if (config instanceof Array) {
            return config.every(c => c.hasOwnProperty('type'));
        }

        return config.hasOwnProperty('type');
    }

    /**
     * 当使用扩展组件来使用的时候才提供参数，正常不提供参数
     * @param {any[]} args
     * @deprecated
     * @param {(event: any) => Object} callback
     * @returns {Object}
     */
    public getExternalCallbackArgs(args: any[], callback?: (event: any) => Object): Object {
        if (callback) {
            return callback.apply(this, args) || {};
        } else {
            return {};
        }
    }
}
