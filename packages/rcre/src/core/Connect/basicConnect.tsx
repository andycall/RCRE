import {each, isEqual, isObjectLike, clone, has, isNil} from 'lodash';
import {RootState} from '../../data/reducers';
import {
    BasicConfig,
    BasicProps,
    ContainerSetDataOption,
    runTimeType
} from '../../types';
import {TriggerEventItem} from '../Trigger/Trigger';
import {createChild} from '../util/createChild';
import {getRuntimeContext} from '../util/util';
import {isExpression, parseExpressionString} from '../util/vm';
import React from 'react';
import {SET_FORM_ITEM_PAYLOAD} from '../Form/actions';

export type WrapperComponentType<T> =
    React.ComponentClass<T> |
    React.StatelessComponent<T> |
    React.ClassicComponentClass<T>;

export interface ConnectTools<Props> {
    /**
     * RCRE引擎执行当前组件的上下文
     */
    env: Props;
    /**
     * ExpressionString执行环境
     */
    runTime: runTimeType;
    /**
     * 注册事件
     * @param {string} event
     * @param args
     */
    registerEvent: (event: string, args: Object) => void;

    /**
     * 当有name属性时，使用这个函数来更新name所对应的值
     * @param value
     */
    updateNameValue: (value: any, options?: ContainerSetDataOption) => void;

    /**
     * 当有name属性时，使用这个函数来清空name所对应的值
     */
    clearNameValue: () => void;

    /**
     * 从name中获取数据
     */
    getNameValue: (name: string) => any;

    /**
     * 是否绑定了某个事件
     * @param {string} event
     * @return {boolean}
     */
    hasTriggerEvent: (event: string) => boolean;

    /**
     * 开启debounce模式，connect组件缓存的cache
     */
    debounceCache: {[key: string]: any};
    /**
     * 是否正处于debounce状态
     */
    isDebouncing: boolean;

    form: {
        /**
         * 更新FormItem的状态
         */
        $setFormItem: (payload: Partial<SET_FORM_ITEM_PAYLOAD>) => void;

        /**
         * 清空FormItem的状态
         */
        $deleteFormItem: (formItemName: string) => void;

        /**
         * 获取FormItem的信息
         * @param {string} name
         * @returns {SET_FORM_ITEM_PAYLOAD}
         */
        $getFormItem: (name: string) => SET_FORM_ITEM_PAYLOAD;

        /**
         * 是否处于Form组件下
         */
        isUnderForm?: boolean;
    };

    /**
     * 动态生成React组件
     * @param {object} config
     * @param {object} props
     * @returns {React.ReactNode}
     */
    createReactNode: (config: any, props: object) => React.ReactNode;
}

// export interface BasicConnectProps<Props, Config extends BasicConfig> {
//     tools: ConnectTools<Props, Config>;
//     /**
//      * 当前组件的值
//      */
//     value?: any;
// }

export interface CommonOptions {
    // 属性映射
    propsMapping?: object;

    /**
     * 解析传入配置的方式
     */
    parseOptions?: {
        // 跳过的属性
        blackList?: string[];
        // 是否递归解析
        isDeep?: boolean;
        // 只解析以下的属性
        whiteList?: string[];
    };

    /**
     * 手动设置数，默认为value
     */
    nameKey?: string;

    /**
     * 收集name时跳过的属性
     */
    collectNameBlackList?: string[];

    /**
     * 只要container组件更新，该组件一定会更新
     */
    forceUpdate?: boolean;

    /**
     * 满足一定条件就清空组件的值
     */
    autoClearCondition?: (props: any) => boolean;

    /**
     * 如果一个组件持有多个name，则需要实现这个函数来给Connect组件提供所有可能出现的name值
     * @param props
     */
    getAllNameKeys?: (props: any) => string[];

    /**
     * 设置自动数据更新使用的回调函数，默认为onChange
     */
    defaultNameCallBack?: string;

    /**
     * 在Container读取组件的值，并赋值到value属性之前进行一些数据处理
     * @param value
     * @returns {any}
     */
    beforeGetData?: (value: any, props: any) => any;

    /**
     * 在Container获取到组件通过updateNameValue函数写入的值之前进行一些数据处理
     * @param value
     * @returns {any}
     */
    beforeSetData?: (value: any, props: any) => any;

    /**
     * 获取默认值
     * @param value
     * @returns {any}
     */
    getDefaultValue?: (value: any, props: any) => any;

    /**
     * 告诉框架当前name属性绑定的值是否合法
     * @param value
     * @param props
     */
    isNameValid?: (value: any, props: any) => boolean;
}

export interface BasicConnectProps extends BasicProps {
    // 只清楚表单状态，而不清空组件数据
    clearFormStatusOnlyWhenDestroy?: boolean;
    // 组件销毁不清除组件状态
    disableClearWhenDestroy?: boolean;
    // 非表单模式下，开启此功能组件销毁自动清除数据
    clearWhenDestory?: boolean;

    tools: ConnectTools<BasicConnectProps>;

    type: any;

    /**
     * name属性绑定的值
     */
    name?: string;

    /**
     * 组件的值
     */
    value?: any;

    /**
     * 组件默认值
     */
    defaultValue?: any;

    /**
     * 延迟一定时间同步数据
     */
    debounce?: number;

    /**
     * 如果组件配置了autoClearCondition, 可以使用这个属性来关闭它
     */
    disabledAutoClear?: boolean;

    trigger?: TriggerEventItem[];
}

export abstract class BasicConnect extends React.Component<BasicConnectProps, {}> {
    public $propertyWatch: string[];
    public options: CommonOptions;
    protected debounceCache: { [key: string]: any };
    protected debounceTimer: any;
    protected isDebouncing: boolean;
    public nameBindEvents: any = null;
    protected constructor(props: BasicConnectProps, options: CommonOptions) {
        super(props);

        this.$propertyWatch = [];
        this.debounceCache = {};
        this.isDebouncing = false;
        this.options = options;

        let name = props.name;
        let runTime = getRuntimeContext(props.containerContext, props.rcreContext, {
            iteratorContext: props.iteratorContext
        });

        if (isExpression(name)) {
            name = parseExpressionString(name, runTime);
        }

        // 设置默认值的逻辑
        if ((props.hasOwnProperty('defaultValue') &&
            props.defaultValue !== null &&
            props.defaultValue !== undefined) &&
            name) {
            let defaultValue = props.defaultValue;
            let state: RootState = props.rcreContext.store.getState();
            runTime.$data = state.$rcre.container[props.containerContext.model];
            if (isExpression(defaultValue)) {
                defaultValue = parseExpressionString(defaultValue, runTime);
            }

            if (options.getDefaultValue) {
                defaultValue = options.getDefaultValue(defaultValue, props);
            }

            if (!has(runTime.$data, name)) {
                props.containerContext.$setData(name, defaultValue);
            }
        }

        if (name) {
            let existValue = props.containerContext.$getData(name);

            if (!isNil(existValue) && props.debounce) {
                this.debounceCache[name] = existValue;
            }
        }
    }

    componentDidCatch(error: Error, errInfo: any) {}

    componentWillUnmount() {
        if (this.props.name) {
            if (this.props.formContext && this.props.clearFormStatusOnlyWhenDestroy) {
                this.props.formContext.$deleteFormItem(this.props.name);
            } else if (this.props.formContext && !this.props.disableClearWhenDestroy) {
                this.props.containerContext.$deleteData(this.props.name);
            } else if (this.props.clearWhenDestory) {
                this.props.containerContext.$deleteData(this.props.name);
            }

            // if (this.props.$deleteFormItem && info.clearFormStatusOnlyWhenDestroy) {
            //     this.props.$deleteFormItem(info.name);
            // } else if (this.props.$form && !info.disableClearWhenDestroy) {
            //     this.props.$deleteData(info.name);
            // } else if (info.clearWhenDestroy) {
            //     this.props.$deleteData(info.name);
            // }
        }
    }

    /**
     * 执行一些属性的转换
     */
    public applyPropsMapping<infoType extends any>(info: infoType, mapping: object) {
        each(mapping, (newKey, prevKey) => {
            if (info.hasOwnProperty(prevKey)) {
                info[newKey] = info[prevKey];
                delete info[prevKey];
            }
        });
    }

    protected updateNameValue = (value: any, options: ContainerSetDataOption = {}) => {
        let name = this.props.name || options.name;

        if (name) {
            if (typeof this.options.beforeSetData === 'function') {
                value = this.options.beforeSetData(value, this.props);
            }

            if (typeof this.props.debounce === 'number' && !options.skipDebounce) {
                this.debounceCache[name] = value;
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.isDebouncing = false;
                    this.props.containerContext.$setData(name!, this.debounceCache[name!], options);
                }, this.props.debounce);

                this.isDebouncing = true;
                this.forceUpdate();
                return;
            }

            this.props.containerContext.$setData(name, value, options);
        }
    }

    protected clearNameValue = (name?: string) => {
        name = name || this.props.name;
        if (name) {
            this.props.containerContext.$deleteData(name);
        }
    }

    protected getFormItemControl = (name: string) => {
        if (!this.props.formContext) {
            console.warn(name + '组件没有在form组件内部');
            return null;
        }

        return this.props.formContext.$getFormItem(name);
    }

    public componentWillUpdate(nextProps: BasicConnectProps) {
        let nameKey = this.options.nameKey || 'value';
        // let prevInfo = this.prepareRender(this.options, this.props);
        // let nextInfo = this.prepareRender(this.options, nextProps);

        if (nextProps.name && this.props.name && nextProps.debounce) {
            let prevValue = this.props.containerContext.$getData(this.props.name) || this.props[nameKey];
            let nextValue = nextProps.containerContext.$getData(nextProps.name) || nextProps[nameKey];

            if (!isEqual(prevValue, nextValue)) {
                this.debounceCache[nextProps.name] = nextValue;
            }
        }

        if (typeof this.options.autoClearCondition === 'function' && !nextProps.disabledAutoClear && nextProps.name) {
            let clear = this.options.autoClearCondition(nextProps);

            if (clear) {
                this.clearNameValue(nextProps.name);
            }
        }
    }

    public createReactNode<C extends BasicConfig>(config: C, props: object) {
        return createChild(config, {
            info: config,
            ...props
        });
    }

    public hasTriggerEvent(event: string) {
        if (!Array.isArray(this.props.trigger)) {
            return false;
        }

        for (let eventItem of this.props.trigger) {
            if (event === eventItem.event) {
                return true;
            }
        }

        return false;
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
        delete mute.rcreContext;
        delete mute.triggerContext;
        delete mute.containerContext;
        delete mute.iteratorContext;

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

    public prepareRender(options: CommonOptions, props: BasicConnectProps = this.props) {
        props = clone(props);
        let mutedInfo = this.muteParentInfo(props);

        mutedInfo = this.transformInnerProperty(mutedInfo);

        let nameKey = options.nameKey || 'value';
        let value = props[nameKey];

        if (this.props.debounce && this.props.name) {
            value = this.debounceCache[props.name!];
        } else if (props.name) {
            value = props.containerContext.$getData(props.name);
        }

        if (typeof options.beforeGetData === 'function') {
            value = options.beforeGetData(value, props);
        }

        if (value !== undefined) {
            mutedInfo[nameKey] = value;
        }

        if (isObjectLike(value)) {
            let cloneValue = clone(value);
            mutedInfo[nameKey] = cloneValue;
            props[nameKey] = cloneValue;
        }

        return {
            props: mutedInfo,
            runTime: getRuntimeContext(props.containerContext, props.rcreContext, {
                iteratorContext: props.iteratorContext,
                formContext: props.formContext
            }),
            env: props,
            debounceCache: this.debounceCache,
            updateNameValue: this.updateNameValue,
            registerEvent: this.props.triggerContext ? this.props.triggerContext.eventHandle : () => {},
            clearNameValue: this.clearNameValue,
            getNameValue: this.props.containerContext.$getData
        };
    }

    public async TEST_simulateEvent(event: string, args: Object = {}) {
        if (!this.props.triggerContext) {
            console.warn('Connect: 组件没有绑定事件');
            return null;
        }

        return this.props.triggerContext.eventHandle(event, args);
    }

    public async TEST_simulateEventOnce(event: string, args: Object = {}, index: number) {
        if (!this.props.triggerContext) {
            console.warn('Connect: 组件没有绑定事件');
            return null;
        }
        return this.props.triggerContext.eventHandle(event, args, {
            // 只触发指定index的事件
            index: index
        });
    }

    public TEST_setData(value: any) {
        if (this.props.name) {
            return this.props.containerContext.$setData(this.props.name, value);
        }

        throw new Error('can not get component name');
    }

    public TEST_getData() {
        return this.props;
    }

    public TEST_getNameValue(name: string) {
        return this.props.containerContext.$getData(name);
    }

    public TEST_isNameValid() {
        if (!this.options.isNameValid) {
            return true;
        }

        if (!this.props.name) {
            return true;
        }

        let value = this.props.containerContext.$getData(this.props.name);
        return this.options.isNameValid(value, this.props);
    }
}
