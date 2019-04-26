import {each, isEqual, isObjectLike, clone, has, isNil, get} from 'lodash';
import {RootState} from '../../data/reducers';
import {polyfill} from 'react-lifecycles-compat';
import {
    BasicProps,
    ContainerSetDataOption,
    runTimeType
} from '../../types';
import {TriggerEventItem} from '../Trigger/Trigger';
import {getRuntimeContext} from '../util/util';
import {isExpression, parseExpressionString} from '../util/vm';
import React from 'react';
import {SET_FORM_ITEM_PAYLOAD} from '../Form/actions';

export type WrapperComponentType<T> =
    React.ComponentClass<T> |
    React.StatelessComponent<T> |
    React.ClassicComponentClass<T>;

export interface ConnectTools<Props> extends BasicProps {
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
    debounceCache: { [key: string]: any };
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
    autoClearCondition?: (value: any, props: any) => boolean;

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

export interface BasicConnectProps {
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
     * 组件禁用, 组件的验证规则也会自动跳过
     */
    disabled?: boolean;

    /**
     * 如果组件配置了autoClearCondition, 可以使用这个属性来关闭它
     */
    disabledAutoClear?: boolean;

    trigger?: TriggerEventItem[];
}

enum ValidateDecision {
    SKIP = 0, // 跳过本次验证
    BREAK = 1, // 阻止所有的验证
    PASS = 2 // 触发验证
}

class BasicConnect extends React.Component<BasicConnectProps & BasicProps, {}> {
    public options: CommonOptions;
    public debounceCache: { [key: string]: any };
    public debounceTimer: any;
    public isDebouncing: boolean;

    public constructor(props: BasicConnectProps & BasicProps, options: CommonOptions) {
        super(props);

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

        let value;
        let state: RootState = props.rcreContext.store.getState();
        // 设置默认值的逻辑
        if ((props.hasOwnProperty('defaultValue') &&
            props.defaultValue !== null &&
            props.defaultValue !== undefined) &&
            name &&
            !has(runTime.$data, name)) {
            let defaultValue = props.defaultValue;
            runTime.$data = state.$rcre.container[props.containerContext.model];
            if (isExpression(defaultValue)) {
                defaultValue = parseExpressionString(defaultValue, runTime);
            }

            if (options.getDefaultValue) {
                defaultValue = options.getDefaultValue(defaultValue, props);
            }

            props.containerContext.$setData(name, defaultValue);
            value = defaultValue;
        } else if (name) {
            let existValue = get(state.$rcre.container[props.containerContext.model], name);
            value = existValue;
            if (!isNil(existValue) && props.debounce) {
                this.debounceCache[name] = existValue;
            }
        }

        if (props.formItemContext && name) {
            props.formItemContext.initControlElements(name, {
                type: props.type,
                disabled: props.disabled,
                value: value
            });
        }
    }

    componentWillUnmount() {
        if (this.props.name) {
            if (this.props.formContext && this.props.clearFormStatusOnlyWhenDestroy) {
                this.props.formContext.$deleteFormItem(this.props.name);
            } else if (this.props.formContext && !this.props.disableClearWhenDestroy) {
                this.props.containerContext.$deleteData(this.props.name);
            } else if (this.props.clearWhenDestory) {
                this.props.containerContext.$deleteData(this.props.name);
            }

            if (this.props.formItemContext) {
                // 清空FormItem中监听的状态
                this.props.formItemContext.deleteControlElements(this.props.name);
            }
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

    public updateNameValue = (value: any, options: ContainerSetDataOption = {}) => {
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

    public clearNameValue = (name?: string) => {
        name = name || this.props.name;
        if (name) {
            this.props.containerContext.$deleteData(name);
        }
    }

    public getFormItemControl = (name: string) => {
        if (!this.props.formContext) {
            console.warn(name + '组件没有在form组件内部');
            return null;
        }

        return this.props.formContext.$getFormItem(name);
    }

    /**
     *   组件name的变更是否会触发FormItem验证
     *   +----------------+-----------------+-----------------+
     *   |      prev      |       next      |     action      |
     *   +----------------------------------------------------+
     *   | name exist     | name not exist  |  delete form    |
     *   +----------------------------------------------------+
     *   | name not exist | name exist      |  validate form  |
     *   +----------------------------------------------------+
     *   | name not exist | name not exist  |  skip           |
     *   +----------------------------------------------------+
     *   | name exist     | name exist      |  validate form  |
     *   +----------------+-----------------+-----------------+
     * @param nextProps
     */
    private shouldNameTriggerValidate(nextProps: BasicConnectProps & BasicProps): ValidateDecision {
        // 前后都没有name属性跳过
        if (!this.props.name && !nextProps.name) {
            return ValidateDecision.SKIP;
        }

        // 之前有，现在name没了，销毁
        if (this.props.name && !nextProps.name) {
            // delete
            this.props.containerContext.$deleteData(this.props.name);
            return ValidateDecision.SKIP;
        }

        if (this.props.name === nextProps.name) {
            return ValidateDecision.SKIP;
        }

        if (this.props.name && nextProps.name && this.props.name !== nextProps.name) {
            // 清空旧的数据
            this.props.containerContext.$deleteData(this.props.name);
        }

        // 剩下都可以
        return ValidateDecision.PASS;
    }

    private shouldDisabledTriggerValidate(nextProps: BasicConnectProps & BasicProps): ValidateDecision {
        if (!this.props.formContext || !nextProps.formContext) {
            return ValidateDecision.SKIP;
        }

        // disabled都没变化的情况跳过
        if (!this.props.disabled && !nextProps.disabled) {
            return ValidateDecision.SKIP;
        }
        // disabled都没变化的情况跳过
        if (this.props.disabled && nextProps.disabled) {
            return ValidateDecision.SKIP;
        }

        // 之前是false，现在改成true，需要强制设置formItem为验证成功
        if (!this.props.disabled && nextProps.disabled && nextProps.name) {
            nextProps.formContext.$setFormItem({
                formItemName: nextProps.name,
                valid: true,
                status: 'success',
                errorMsg: ''
            });
            // 这里直接跳过验证，不再进行下一步操作
            return ValidateDecision.BREAK;
        }

        // 剩下的情况就是触发验证了
        return ValidateDecision.PASS;
    }

    private shouldValueTriggerValidate(nextProps: BasicConnectProps & BasicProps): ValidateDecision {
        if (!this.props.formContext || !nextProps.formContext) {
            return ValidateDecision.SKIP;
        }

        let nextValue = nextProps.name ? nextProps.containerContext.$getData(nextProps.name) : undefined;
        let prevValue = this.props.name ? this.props.containerContext.$getData(this.props.name) : undefined;

        if (prevValue === nextValue) {
            return ValidateDecision.SKIP;
        }

        return ValidateDecision.PASS;
    }

    /**
     * 处理值变更，name变更，以及disabled变更这三种情况所触发的表单验证
     * @param nextProps
     */
    private shouldValidateFormItem(nextProps: BasicConnectProps & BasicProps) {
        if (!this.props.formContext || !nextProps.formContext) {
            return;
        }

        if (!nextProps.formItemContext || !this.props.formItemContext) {
            return;
        }

        let list = [this.shouldNameTriggerValidate, this.shouldDisabledTriggerValidate, this.shouldValueTriggerValidate];

        let shouldValidate = false;
        for (let func of list) {
            let decision: ValidateDecision = func.call(this, nextProps);

            if (decision === ValidateDecision.SKIP) {
                continue;
            }

            if (decision === ValidateDecision.BREAK) {
                return;
            }

            if (decision === ValidateDecision.PASS) {
                shouldValidate = true;
                break;
            }
        }

        if (shouldValidate && nextProps.name) {
            let nextValue = nextProps.containerContext.$getData(nextProps.name);
            nextProps.formItemContext.$validateFormItem(nextProps.name, nextValue);
        }
    }

    public componentWillUpdate(nextProps: BasicConnectProps & BasicProps) {
        let nameKey = this.options.nameKey || 'value';

        if (this.props.name && nextProps.name) {
            let nextValue = nextProps.containerContext.$getData(nextProps.name) || nextProps[nameKey];
            let prevValue = this.props.containerContext.$getData(this.props.name) || this.props[nameKey];

            if (!isEqual(prevValue, nextValue) && this.props.debounce) {
                this.debounceCache[this.props.name] = nextValue;
            }
        }

        if (typeof this.options.autoClearCondition === 'function' && !this.props.disabledAutoClear && nextProps.name) {
            let value = nextProps.containerContext.$getData(nextProps.name) || nextProps[nameKey];
            let clear = this.options.autoClearCondition(value, nextProps);

            if (clear) {
                this.clearNameValue(this.props.name);
            }
        }

        this.shouldValidateFormItem(nextProps);
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
        delete mute.formContext;
        delete mute.formItemContext;

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
                if (config[key] === null && isExpression(this.props[key])) {
                    delete config[key];
                }
            }
        }

        return config;
    }

    public prepareRender(options: CommonOptions, props: BasicConnectProps & BasicProps = this.props) {
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
            registerEvent: this.props.triggerContext ? this.props.triggerContext.eventHandle : () => {
            },
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

polyfill(BasicConnect);

export {
    BasicConnect
};