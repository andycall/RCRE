import React from 'react';
import {RootState} from '../../data/reducers';
import {
    BasicConfig,
    ContainerContextType, ExecTaskOptions, FormContextType, IteratorContextType,
    RCREContextType,
    TriggerContextType
} from '../../types';
import {containerActionCreators} from '../Container/action';
import {RunTimeContextCollection, TriggerContext} from '../context';
import {componentLoader} from '../util/componentLoader';
import {getRuntimeContext, isPromise} from '../util/util';
import {formActions, TRIGGER_SET_DATA_OPTIONS, TRIGGER_SET_DATA_PAYLOAD} from './actions';
import {DataCustomer} from '../DataCustomer/index';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';
import {isObject} from 'lodash';

export class TriggerEventItem {
    /**
     * 事件名称
     */
    event: string;

    /**
     * 指定的目标DataCustomer
     */
    targetCustomer?: string | string[];
    targetTask: string | string[];

    /**
     * 传递给目标的参数
     */
    params?: any;

    /**
     * 阻止冒泡
     */
    stopPropagation?: boolean;

    /**
     * 阻止默认事件
     */
    preventDefault?: boolean;

    /**
     * 延迟触发
     */
    debounce?: number;

    /**
     * 等待之后触发
     */
    wait?: number;

    /**
     * 调试模式
     */
    debug?: boolean;

    /**
     * 事件触发的条件
     */
    condition?: string;
}

export interface TriggerProps {
    model: string;
    dataCustomer: DataCustomer;
    /**
     * 当前trigger的数据模型
     */
    trigger: TriggerEventItem[];

    /**
     * 来自RCRE的context对象
     */
    rcreContext: RCREContextType;

    /**
     * 来自Foreach组件的context对象
     */
    iteratorContext: IteratorContextType;

    /**
     * 来自父级Container的context对象
     */
    containerContext: ContainerContextType;

    formContext?: FormContextType;
}

type UnCookedTriggerEventItem = {
    customers: string[],
    data: any;
};

export class RCRETrigger<Config extends BasicConfig> extends React.Component<TriggerProps, {}> {
    private contextValue: TriggerContextType;
    private debounceCache: {
        isRunning: boolean;
        data: any
    }[];

    constructor(props: TriggerProps) {
        super(props);
        this.debounceCache = [];
        this.eventHandle = this.eventHandle.bind(this);
        this.contextValue = {
            $trigger: null,
            eventHandle: this.eventHandle,
            execTask: this.execTask
        };
    }

    private async runTaskQueue(taskQueue: TRIGGER_SET_DATA_PAYLOAD[]) {
        let runTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            iteratorContext: this.props.iteratorContext
        });
        let context: RunTimeContextCollection = {
            rcre: this.props.rcreContext,
            container: this.props.containerContext,
            iterator: this.props.iteratorContext,
            form: this.props.formContext
        };
        let state: RootState = this.props.rcreContext.store.getState();
        runTime.$trigger = state.$rcre.trigger[this.props.model];
        let prev = null;

        while (taskQueue.length > 0) {
            let item = taskQueue.shift();

            if (!item) {
                break;
            }

            runTime.$prev = prev;
            prev = await this.props.dataCustomer.execCustomer({
                customer: item.customer,
                runTime,
                prev: prev,
                params: runTime.$trigger![item.customer],
                model: this.props.model,
                actions: {
                    taskPass: (payload) => this.props.rcreContext.store.dispatch(
                        containerActionCreators.dataCustomerPass(payload, context)
                    )
                },
                options: item.options,
                rcreContext: this.props.rcreContext,
                containerContext: this.props.containerContext,
                iteratorContext: this.props.iteratorContext
            });

            if (!prev && !(item.options && item.options.keepWhenError)) {
                break;
            }
        }

        return runTime.$trigger;
    }

    render() {
        return (
            <TriggerContext.Provider value={this.contextValue}>
                {this.props.children}
            </TriggerContext.Provider>
        );
    }

    private async postProcessEvent(itemP: Promise<UnCookedTriggerEventItem | undefined>, customerMap: object, options: TRIGGER_SET_DATA_OPTIONS = {}) {
        return itemP.then(item => {
            if (!item) {
                return;
            }

            let triggerItems: TRIGGER_SET_DATA_PAYLOAD[] = [];
            let group = this.props.dataCustomer.getGroups();
            let taskQueue: TRIGGER_SET_DATA_PAYLOAD[] = [];
            for (let customer of item.customers) {
                let isGroup = group[customer];

                if (isGroup) {
                    group[customer].steps.forEach(groupItem => {
                        let data = item.data;
                        if (isObject(item.data)) {
                            if (!customerMap[groupItem]) {
                                customerMap[groupItem] = {};
                            }

                            Object.assign(customerMap[groupItem], item.data);
                            data = customerMap[groupItem];
                        }

                        let conf = {
                            model: this.props.model,
                            customer: groupItem,
                            data: data,
                            options: {
                                ...options,
                                keepWhenError: group[customer].keepWhenError
                            }
                        };
                        taskQueue.push(conf);
                        triggerItems.push(conf);
                    });
                } else {
                    let data = item.data;
                    if (isObject(item.data)) {
                        if (!customerMap[customer]) {
                            customerMap[customer] = {};
                        }

                        Object.assign(customerMap[customer], item.data);
                        data = customerMap[customer];
                    }

                    let conf = {
                        model: this.props.model,
                        customer: customer,
                        data: data,
                        options: {
                            ...options
                        }
                    };
                    taskQueue.push(conf);
                    triggerItems.push(conf);
                }
            }

            this.props.rcreContext.store.dispatch(formActions.triggerSetData(triggerItems));
            return this.runTaskQueue(taskQueue);
        });
    }

    private execTask = async (targetTask: string, params: any, options?: ExecTaskOptions) => {
        let event: TriggerEventItem = {
            event: '__INTENAL__',
            targetTask: targetTask,
            params: params,
            ...options
        };
        let customerMap = {};
        let execItem = this.execEvent(event, params, 0);
        return this.postProcessEvent(execItem, customerMap);
    }

    private async eventHandle(eventName: string, args: Object, options: { index?: number, preventSubmit?: boolean } = {}) {
        let eventList = this.props.trigger;
        let validEventList = eventList.filter(event => event.event === eventName);

        if (validEventList.length === 0) {
            return;
        }

        let customerMap = {};

        if (options.index) {
            let execItem = this.execEvent(validEventList[options.index], args, options.index);
            await this.postProcessEvent(execItem, customerMap, {
                preventSubmit: options.preventSubmit
            });
            return;
        }

        let pEvent: Promise<any>[] = validEventList.map((event, index) => {
            let execItem = this.execEvent(event, args, index);
            return this.postProcessEvent(execItem, customerMap, {
                preventSubmit: options.preventSubmit
            });
        });

        return await Promise.all(pEvent);
    }

    private async execEvent(event: TriggerEventItem, args: Object, index: number): Promise<UnCookedTriggerEventItem | undefined> {
        if (!event.targetCustomer && !event.targetTask) {
            console.warn('触发事件必须指定targetTask');
            return;
        }

        let params = event.params || {};
        let debug = event.debug;
        let targetCustomer = event.targetTask || event.targetCustomer || '';

        if (event.wait) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, event.wait);
            });
        }

        if (typeof event.debounce === 'number') {
            if (!this.debounceCache[index]) {
                this.debounceCache[index] = {
                    isRunning: true,
                    data: args
                };
                args = await new Promise((resolve) => {
                    setTimeout(() => {
                        let data = this.debounceCache[index].data;
                        delete this.debounceCache[index];
                        resolve(data);
                    }, event.debounce);
                });
            } else {
                this.debounceCache[index].data = args;
                return;
            }
        }

        let runTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            iteratorContext: this.props.iteratorContext
        });

        let context = {
            ...runTime,
            $args: args
        };

        if (event.stopPropagation && args['stopPropagation']) {
            args['stopPropagation']();
        }

        if (event.preventDefault && args['preventDefault']) {
            args['preventDefault']();
        }

        let output: any;
        if (isExpression(params)) {
            output = parseExpressionString(params, context);

            if (isPromise(output)) {
                output = await output;
            }
        } else {
            output = compileExpressionString(params, context, [], true);

            for (let key in output) {
                if (output.hasOwnProperty(key) && isPromise(output[key])) {
                    output[key] = await output[key];
                }
            }
        }

        let condition: boolean = true;

        if (isExpression(event.condition)) {
            condition = !!parseExpressionString(event.condition, context);
        }

        if (debug) {
            console.group(`RCRE trigger event`);
            console.log('event: ' + event.event);
            console.log('targetCustomer: ' + event.targetCustomer);
            console.log('params: ', event.params);
            console.log('params parsed output: ', output);
            console.log('condition: ', event.condition, 'result: ', condition);
            console.log('$args: ', args);
            console.groupEnd();
        }

        if (!condition) {
            return;
        }

        if (typeof targetCustomer === 'string') {
            targetCustomer = [targetCustomer];
        }

        targetCustomer = targetCustomer.map(customer => {
            if (isExpression(customer)) {
                customer = parseExpressionString(customer, runTime);
            }

            if (customer === '$this') {
                return '$SELF_PASS_CUSTOMER';
            }

            if (customer === '$parent') {
                return '$PARENT_PASS_CUSTOMER';
            }

            return customer;
        });

        return {
            customers: targetCustomer,
            data: output
        };
    }
}

componentLoader.addComponent('__TRIGGER__', RCRETrigger);