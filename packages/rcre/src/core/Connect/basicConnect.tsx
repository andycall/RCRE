import {each, isPlainObject, get, isEqual, isObjectLike, clone, has, isNil} from 'lodash';
import {BasicContainer, BasicContainerSetDataOptions, runTimeType} from '../Container/types';
import {isExpression, parseExpressionString} from '../util/vm';
import {BasicConfig, BasicContainerPropsInterface} from '../Container/types';
import React from 'react';
import {createChild, store} from '../../index';
import {SET_FORM_ITEM_PAYLOAD} from '../Form/actions';

export type WrapperComponentType<T> =
    React.ComponentClass<T> |
    React.StatelessComponent<T> |
    React.ClassicComponentClass<T>;

export interface ConnectTools<Props, Config> {
    /**
     * RCRE引擎执行当前组件的上下文
     */
    env: Props;
    /**
     * 当前组件的值
     */
    value?: any;
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
    updateNameValue: (value: any, options?: BasicContainerSetDataOptions) => void;

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
    createReactNode: (config: Config, props: object) => React.ReactNode;
}

export interface BasicConnectProps<Props, Config extends BasicConfig> {
    tools: ConnectTools<Props, Config>;
}

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

    // 自动将看上去像是组件的配置转成React组件
    toReactNode?: boolean;

    /**
     * 手动设置数，默认为value
     */
    nameKey?: string;

    /**
     * 和使用name同步值具有相同功能的事件，
     * 如果组件有name属性，必填
     */
    nameBindEvents?: {
        eventName: string;
        valueKey: string | string[];
    } | {
        eventName: string;
        valueKey: string | string[];
    }[];

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
    autoClearCondition?: (props: any, runTime: runTimeType) => boolean;

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

export interface BasicConnectPropsInterface<T extends BasicConfig> extends BasicContainerPropsInterface<T> {
    /**
     * 更新表单元素的属性
     */
    $setFormItem: (payload: Partial<SET_FORM_ITEM_PAYLOAD>) => void;

    /**
     * 删除表单元素的验证信息
     */
    $deleteFormItem: (formItemName: string) => void;

    /**
     * 获取表单项的状态信息
     */
    $getFormItemControl: (formItemName: string) => any;
}

export abstract class BasicConnect<Config extends BasicConfig, P> extends BasicContainer<Config, BasicConnectPropsInterface<Config>, P> {
    public $propertyWatch: string[];
    public options: CommonOptions;
    protected debounceCache: { [key: string]: any };
    protected debounceTimer: any;
    protected isDebouncing: boolean;
    protected info: BasicConfig;
    private nameIsExpression: boolean = false;
    // 收集到属性过多也是一种负担
    private isTooMuchProperty: boolean = false;
    public nameBindEvents: any = null;
    protected constructor(props: BasicConnectPropsInterface<Config>, context: object, options: CommonOptions) {
        super(props);

        this.$propertyWatch = [];
        this.debounceCache = {};
        this.isDebouncing = false;
        this.options = options;

        let name = props.info.name;
        let runTime = this.getRuntimeContext(props, context);

        if (isExpression(name)) {
            name = parseExpressionString(name, runTime);
        }

        // 设置默认值的逻辑
        if ((props.info.hasOwnProperty('defaultValue') &&
            props.info.defaultValue !== null &&
            props.info.defaultValue !== undefined) &&
            props.info.name) {
            let defaultValue = props.info.defaultValue;
            let runtime = this.getRuntimeContext(props, context);
            runtime.$data = store.getState().container[props.model!];
            if (isExpression(defaultValue)) {
                defaultValue = parseExpressionString(defaultValue, runtime);
            }

            if (options.getDefaultValue) {
                defaultValue = options.getDefaultValue(defaultValue, props);
            }

            if (!has(runtime.$data, props.info.name)) {
                this.setData(props.info.name, defaultValue, props, {
                    noTransform: true
                });
            }
        }

        if (name) {
            let existValue = this.getValueFromDataStore(name, props);

            if (!isNil(existValue) && props.info.debounce) {
                this.debounceCache[name] = existValue;
            }
        }

        this.findWatchProperty(props.info, '');
        this.updateNameValue = this.updateNameValue.bind(this);
        this.createReactNode = this.createReactNode.bind(this);
        this.clearNameValue = this.clearNameValue.bind(this);
        this.getFormItemControl = this.getFormItemControl.bind(this);
        this.hasTriggerEvent = this.hasTriggerEvent.bind(this);

        if (this.$propertyWatch.length > 10) {
            this.isTooMuchProperty = true;
        }

        this.nameBindEvents = options.nameBindEvents;
    }

    public findWatchProperty(info: any, path: string, depth: number = 0) {
        each(info, (value, name) => {
            if (name === 'trigger') {
                return;
            }

            if (depth > 5) {
                this.isTooMuchProperty = true;
                return;
            }

            let key = path;
            key += '.' + name;

            if (isExpression(value)) {
                this.$propertyWatch.push(key.substr(1));
            }

            if (Array.isArray(value) && value.length > 0) {
                value.forEach((v, i) => this.findWatchProperty(v, key + '[' + i + ']', depth + 1));
            }

            if (isPlainObject(value)) {
                this.findWatchProperty(value, key, depth + 1);
            }
        });
    }

    componentDidCatch(error: Error, errInfo: any) {}

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

    private isPropertyChanged(nextProps: BasicConnectPropsInterface<Config>, nameKeys: string[]) {
        // 当没有监听的Key，强制刷新
        if (this.$propertyWatch.length === 0 && nameKeys.length === 0) {
            return true;
        }
        let nextRunTime = this.getRuntimeContext(nextProps);
        let prevRunTime = this.getRuntimeContext();
        return !this.$propertyWatch.every(key => {
            let nextValue = parseExpressionString(get(nextProps.info, key), nextRunTime);
            let prevValue = parseExpressionString(get(this.props.info, key), prevRunTime);
            return nextValue === prevValue;
        });
    }

    protected updateNameValue(info: Config, connectOptions: CommonOptions) {
        return (value: any, options: BasicContainerSetDataOptions = {}) => {
            let name = info.name || options.name;

            if (name) {
                if (typeof connectOptions.beforeSetData === 'function') {
                    value = connectOptions.beforeSetData(value, info);
                }

                if (typeof info.debounce === 'number' && !options.skipDebounce) {
                    this.debounceCache[name] = value;
                    clearTimeout(this.debounceTimer);
                    this.debounceTimer = setTimeout(() => {
                        this.isDebouncing = false;
                        this.setData(name!, this.debounceCache[name!], this.props, options);
                    }, info.debounce);

                    this.isDebouncing = true;
                    this.forceUpdate();
                    return;
                }

                this.setData(name, value, this.props, options);
            }
        };
    }

    protected clearNameValue(name?: string) {
        return () => {
            if (name && this.props.$deleteData) {
                this.props.$deleteData(name);
            }
        };
    }

    protected getFormItemControl(name: string) {
        if (!this.props.$form) {
            console.warn(name + '组件没有在form组件内部');
            return null;
        }

        if (!this.props.$form.control.hasOwnProperty(name)) {
            console.warn('name: ' + name + '找不到对应的formItem组件');
            return null;
        }

        return this.props.$form.control[name];
    }

    private collectNameFromChild(control: any[] | any, props: BasicConnectPropsInterface<Config> = this.props): string[] {
        if (!(control instanceof Array)) {
            control = [control];
        }
        let nameList: string[] = [];
        let runTime = this.getRuntimeContext(props);
        let me = this;
        function _find(controlList: any[]) {
            if (me.nameIsExpression) {
                return;
            }
            controlList.forEach(con => {
                if (con.type === 'container') {
                    return;
                }

                if (con.hidden === true || con.show === false) {
                    return;
                }

                if (isExpression(con.hidden)) {
                    let hidden = parseExpressionString(con.hidden, runTime);

                    if (hidden === true) {
                        return;
                    }
                }

                if (isExpression(con.show)) {
                    let show = parseExpressionString(con.show, runTime);

                    if (show === false) {
                        return;
                    }
                }

                let name = con.name;
                if (isExpression(name)) {
                    me.nameIsExpression = true;
                    return;
                }

                if (name && nameList.indexOf(name) < 0) {
                    nameList.push(name);
                }

                for (let property in con) {
                    if (con.hasOwnProperty(property)) {
                        if (!(me.options.collectNameBlackList && me.options.collectNameBlackList.indexOf(property) > -1)) {
                            if (con[property] instanceof Array && con[property].length > 0) {
                                _find(con[property]);
                            }
                            if (isPlainObject(con[property])) {
                                _find([con[property]]);
                            }
                        }
                    }
                }
            });
        }

        _find(control);

        return nameList;
    }

    private isNameListChanged(nextProps: BasicConnectPropsInterface<Config>, prevNameList: string[], nextNameList: string[]) {
        // 判断info中包含的name是否改变的函数
        return nextNameList.some((name: string, index: number) => {
            if (this.isNameChanged(nextProps, prevNameList[index], nextNameList[index])) {
                return true;
            } else {
                return false;
            }
        });
    }

    private isNameChanged(nextProps: BasicConnectPropsInterface<Config>, prevName?: string, nextName?: string) {
        if (!prevName && !nextName) {
            return false;
        }

        if (!nextName) {
            return true;
        }

        if (isExpression(name)) {
            prevName = parseExpressionString(name, this.getRuntimeContext());
            nextName = parseExpressionString(name, this.getRuntimeContext(nextProps));
        }

        if (prevName !== nextName) {
            return true;
        }

        let prevValue = this.getValueFromDataStore(prevName);
        let nextValue = this.getValueFromDataStore(nextName, nextProps);

        return prevValue !== nextValue;
    }

    public componentWillUpdate(nextProps: BasicConnectPropsInterface<Config>, nextState: P, nextContext: any) {
        let nameKey = this.options.nameKey || 'value';
        let prevInfo = this.prepareRender(this.options, this.props);
        let nextInfo = this.prepareRender(this.options, nextProps);

        if (nextInfo.info.name && nextInfo.info.debounce) {
            let prevValue = this.getValueFromDataStore(prevInfo.info.name) || prevInfo[nameKey];
            let nextValue = this.getValueFromDataStore(nextInfo.info.name, nextProps) || nextInfo[nameKey];

            if (!isEqual(prevValue, nextValue)) {
                this.debounceCache[nextInfo.info.name] = nextValue;
            }
        }

        if (typeof this.options.autoClearCondition === 'function' && !nextInfo.info.disabledAutoClear) {
            let clear = this.options.autoClearCondition(nextInfo.props, nextInfo.runTime);

            if (clear) {
                this.clearNameValue(nextInfo.info.name)();
            }
        }
    }

    private isGroupNameChanged(nextProps: BasicConnectPropsInterface<Config>, nextContext: {}) {
        if (!this.options.getAllNameKeys) {
            return {
                changed: false,
                names: []
            };
        }

        let prevInfo = this.getParsedInfo(this.props.info, {
            props: this.props,
            context: this.context,
            ...this.options.parseOptions
        });

        let nextInfo = this.getParsedInfo(nextProps.info, {
            props: nextProps,
            context: nextContext,
            ...this.options.parseOptions
        });

        let prevNameKeys = this.options.getAllNameKeys(prevInfo);
        let nextNameKeys = this.options.getAllNameKeys(nextInfo);

        if (prevNameKeys.length !== nextNameKeys.length) {
            return {
                changed: true,
                names: []
            };
        }

        if (!isEqual(prevNameKeys, nextNameKeys)) {
            return {
                changed: true,
                names: prevNameKeys
            };
        }

        let isChanged = prevNameKeys.some(key => {
            return this.isNameChanged(nextProps, key, key);
        });

        return {
            changed: isChanged,
            names: prevNameKeys
        };
    }

    public shouldComponentUpdate(nextProps: BasicConnectPropsInterface<Config>, nextState: {}) {
        if (this.options.forceUpdate || this.nameIsExpression || this.isTooMuchProperty) {
            return true;
        }
        let isPropertyChanged;
        if (typeof this.options.getAllNameKeys === 'function') {
            let status = this.isGroupNameChanged(nextProps, nextState);
            isPropertyChanged = this.isPropertyChanged(nextProps, status.names);

            return isPropertyChanged || status.changed;
        }

        isPropertyChanged = this.isPropertyChanged(nextProps, [this.props.info.name!]);

        let preNameList = this.collectNameFromChild(this.props.info);
        let nextNameList = this.collectNameFromChild(nextProps.info);

        let isNameListChange;
        if (this.nameIsExpression) {
            isNameListChange = true;
        } else {
            isNameListChange = this.isNameListChanged(nextProps, preNameList, nextNameList);
        }

        return isPropertyChanged || isNameListChange;
    }

    public createReactNode<C extends BasicConfig>(config: C, props: object) {
        return createChild(config, {
            ...this.props,
            info: config,
            ...props
        });
    }

    public hasTriggerEvent(event: string) {
        if (!Array.isArray(this.props.info.trigger)) {
            return false;
        }

        for (let eventItem of this.props.info.trigger) {
            if (event === eventItem.event) {
                return true;
            }
        }

        return false;
    }

    public prepareRender(options: CommonOptions, props: BasicConnectPropsInterface<Config> = this.props) {
        let info: Config = this.getParsedInfo(props.info, {
            props: props,
            context: this.context,
            ...options.parseOptions
        });

        if (info.hasOwnProperty('name') && !this.options.nameBindEvents) {
            // console.error(this.props.info.type + ': 组件如果含有name属性，则需要配置nameBindEvents');
        }

        this.info = info;

        if (options.toReactNode) {
            info = this.RCREConfigToReactNode(info);
        }

        let mutedInfo: Config = this.muteParentInfo(info);

        mutedInfo = this.transformInnerProperty(mutedInfo);

        let nameKey = options.nameKey || 'value';

        let value = info[nameKey];

        if (info.debounce && info.name) {
            value = this.debounceCache[info.name!];
        } else if (info.name && !info.disableSync) {
            value = this.getValueFromDataStore(info.name, props);
        }

        if (typeof options.beforeGetData === 'function') {
            value = options.beforeGetData(value, info);
        }

        if (value !== undefined) {
            mutedInfo[nameKey] = value;
        }

        if (isObjectLike(value)) {
            let cloneValue = clone(value);
            mutedInfo[nameKey] = cloneValue;
            info[nameKey] = cloneValue;
        }

        this.TEST_INFO = info;

        return {
            props: mutedInfo,
            info: info,
            runTime: this.getRuntimeContext(props),
            env: props,
            debounceCache: this.debounceCache,
            updateNameValue: this.updateNameValue(info, options),
            registerEvent: this.commonEventHandler,
            clearNameValue: this.clearNameValue(info.name),
            getNameValue: this.getValueFromDataStore
        };
    }

    private RCREConfigToReactNode(info: any) {
        for (let key in info) {
            if (info.hasOwnProperty(key) && this.isRCREConfig(info[key])) {
                if (info[key] instanceof Array) {
                    info[key] = info[key].map((i: any, index: number) => this.createReactNode(i, {key: index}));
                } else {
                    info[key] = this.createReactNode(info[key], {});
                }
            }
        }

        return info;
    }

    public async TEST_simulateEvent(event: string, args: Object = {}) {
        return this.commonEventHandler(event, args);
    }

    public async TEST_simulateEventOnce(event: string, args: Object = {}, index: number) {
        return this.commonEventHandler(event, args, {
            // 只触发指定index的事件
            index: index
        });
    }

    public TEST_setData(value: any) {
        if (this.info && this.info.name) {
            return this.setData(this.info.name, value);
        }

        throw new Error('can not get component name');
    }

    public TEST_getData() {
        return this.info;
    }

    public TEST_getNameValue(name: string) {
        return this.getValueFromDataStore(name);
    }

    public TEST_isNameValid() {
        if (!this.options.isNameValid) {
            return true;
        }

        if (!this.info.name) {
            return true;
        }

        let value = this.getValueFromDataStore(this.info.name);
        return this.options.isNameValid(value, this.info);
    }
}
