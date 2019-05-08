import React from 'react';
import {get, has, isNil, isEqual, isObjectLike} from 'lodash';
import {ErrorBoundary} from './ErrorBoundary';
import {getRuntimeContext} from './util/util';
import {isExpression, parseExpressionString} from './util/vm';
import {RootState} from '../data/reducers';
import {
    BasicProps,
    ContainerContextType, ContainerSetDataOption, ExecTaskOptions,
    FormItemContextType,
    IteratorContextType,
    RCREContextType,
    runTimeType,
    TriggerContextType
} from '../types';
import {withAllContext} from './util/withAllContext';

type ESChild = (runTime: runTimeType, context: {
    container: ContainerContextType;
    trigger: TriggerContextType,
    formItem?: FormItemContextType,
    rcre: RCREContextType
    iterator: IteratorContextType
}) => any;

export interface ESProps {
    children: ESChild;
    name?: string;
    type?: string;
    debounce?: number;
    defaultValue?: any;
    disabled?: boolean;
    clearFormStatusOnlyWhenDestroy?: boolean;
    disableClearWhenDestroy?: boolean;
    clearWhenDestory?: boolean;
    clearWhenDestroy?: boolean;

    /**
     * 满足一定条件就清空组件的值
     */
    autoClearCondition?: (value: any, props: any) => boolean;
    disabledAutoClear?: boolean;
}

interface ESComponentInternalProps extends BasicProps {
    triggerContext: TriggerContextType;
}

enum ValidateDecision {
    SKIP = 0, // 跳过本次验证
    BREAK = 1, // 阻止所有的验证
    PASS = 2 // 触发验证
}

class ESComponent extends React.PureComponent<ESProps & ESComponentInternalProps> {
    static displayName = 'ES';
    public debounceCache: { [key: string]: any };
    public debounceTimer: any;
    public isDebouncing: boolean;

    constructor(props: ESProps & ESComponentInternalProps) {
        super(props);

        this.debounceCache = {};
        this.isDebouncing = false;
        let runTime = getRuntimeContext(props.containerContext, props.rcreContext, {
            iteratorContext: props.iteratorContext
        });

        let value;
        let name = props.name;
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
            let clearWhenDestroy = this.props.clearWhenDestory || this.props.clearWhenDestroy;

            // 表单模式下，自动开启数据清除功能
            if (this.props.formItemContext && this.props.clearFormStatusOnlyWhenDestroy) {
                this.props.formItemContext.$deleteFormItem(this.props.name);
            } else if (this.props.formItemContext && this.props.disableClearWhenDestroy === false) {
                clearWhenDestroy = true;
            }

            if (clearWhenDestroy) {
                this.props.containerContext.$deleteData(this.props.name);
            }

            if (this.props.formItemContext) {
                // 清空FormItem中监听的状态
                this.props.formItemContext.deleteControlElements(this.props.name);
            }
        }
    }

    public updateNameValue = (name: string, value: any, options: ContainerSetDataOption = {}) => {
        if (name === this.props.name) {
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
        }

        this.props.containerContext.$setData(name, value, options);
    }

    public clearNameValue = (name?: string) => {
        name = name || this.props.name;
        if (name) {
            this.props.containerContext.$deleteData(name);
        }
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
    private shouldNameTriggerValidate(nextProps: ESProps & BasicProps): ValidateDecision {
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

    private shouldDisabledTriggerValidate(nextProps: ESProps & BasicProps): ValidateDecision {
        if (!this.props.formItemContext || !nextProps.formItemContext) {
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
            nextProps.formItemContext.$setFormItem({
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

    private shouldValueTriggerValidate(nextProps: ESProps & BasicProps): ValidateDecision {
        if (!this.props.formItemContext || !nextProps.formItemContext) {
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
    private shouldValidateFormItem(nextProps: ESProps & BasicProps) {
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

    public componentWillUpdate(nextProps: ESProps & BasicProps) {
        if (this.props.name && nextProps.name) {
            let nextValue = nextProps.containerContext.$getData(nextProps.name);
            let prevValue = this.props.containerContext.$getData(this.props.name);

            if (!isEqual(prevValue, nextValue) && this.props.debounce) {
                this.debounceCache[this.props.name] = nextValue;
            }
        }

        if (typeof this.props.autoClearCondition === 'function' && !this.props.disabledAutoClear && nextProps.name) {
            let value = nextProps.containerContext.$getData(nextProps.name);
            let clear = this.props.autoClearCondition(value, nextProps);

            if (clear) {
                this.clearNameValue(this.props.name);
            }
        }

        this.shouldValidateFormItem(nextProps);
    }

    render() {
        if (typeof this.props.children !== 'function') {
            console.error(`ES 组件的子元素只能是个函数. 例如 \n
<ES>
    {runTime => {
        return <div>{JSON.stringify(runTime.$data)}</div>
    }}
<ES>`);
            return this.props.children;
        }
        let context = {
            container: {
                ...this.props.containerContext,
                $setData: this.updateNameValue
            },
            rcre: this.props.rcreContext,
            formItem: this.props.formItemContext,
            trigger: this.props.triggerContext,
            iterator: this.props.iteratorContext
        };

        let name = this.props.name;
        let runTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            iteratorContext: this.props.iteratorContext,
            formItemContext: this.props.formItemContext,
            triggerContext: this.props.triggerContext
        });

        if (name) {
            let value = get(runTime.$data, name);
            if (this.props.debounce && this.props.name) {
                value = this.debounceCache[this.props.name!];
            } else if (this.props.name) {
                value = this.props.containerContext.$getData(this.props.name);
            }

            // 阻止底层组件引用赋值破坏数据
            if (isObjectLike(value)) {
                Object.freeze(value);
            }

            runTime.$name = name;
            runTime.$value = value;
        }

        return (
            <ErrorBoundary>
                {this.props.children(runTime, context) || null}
            </ErrorBoundary>
        );
    }

    public async TEST_execTask(task: string, args: any, options: ExecTaskOptions) {
        return this.props.triggerContext.execTask(task, args, options);
    }

    public async TEST_simulateEvent(event: string, args: Object = {}) {
        if (!this.props.triggerContext) {
            console.warn('Connect: 组件没有绑定事件');
            return null;
        }

        return this.props.triggerContext.eventHandle(event, args);
    }

    public TEST_setData(value: any) {
        if (this.props.name) {
            return this.props.containerContext.$setData(this.props.name, value);
        }
    }

    public TEST_getData() {
        return this.props;
    }

    public TEST_getNameValue(name: string) {
        return this.props.containerContext.$getData(name);
    }

    /**
     * @deprecated
     * @constructor
     */
    public TEST_isNameValid() {
        // if (!this.options.isNameValid) {
        //     return true;
        // }
        //
        // if (!this.info.name) {
        //     return true;
        // }
        //
        // let value = this.getValueFromDataStore(this.info.name);
        // return this.options.isNameValid(value, this.info);
    }
}

class DommyES extends React.Component<ESProps> {}

export const ES = withAllContext(ESComponent) as typeof DommyES;