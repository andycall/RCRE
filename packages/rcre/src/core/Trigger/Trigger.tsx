import React from 'react';
import {BasicConfig, BasicContainer, BasicContainerPropsInterface} from '../Container/types';
import {actionCreators, TRIGGER_SET_DATA_OPTIONS, TRIGGER_SET_DATA_PAYLOAD} from './actions';
import {DataCustomer} from '../DataCustomer/index';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';
import {isPromise, store} from '../../index';
import {isObject} from 'lodash';

interface TriggerConfig extends BasicConfig {
    trigger: TriggerEventItem[];
}

export class TriggerEventItem {
    /**
     * 事件名称
     */
    event: string;

    /**
     * 指定的目标DataCustomer
     */
    targetCustomer: string | string[];

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

export interface TriggerPropsInterface extends BasicContainerPropsInterface<TriggerConfig> {
    info: TriggerConfig;

    /**
     * 当前Container的数据模型对象
     */
    $data: Object;

    /**
     * 通过表格组件, 渲染之后, 获取到的每一行的数据
     */
    $item?: Object;

    /**
     * 通过表格组件, 渲染之后, 获取到的第几行
     */
    $index?: number;

    /**
     * React组件Key
     */
    key: string | number;

    /**
     * 底层组件设置数据模型值使用
     */
    $setData: (name: string, value: any) => void;

    /**
     * 父级的Container组件的model值
     */
    model: string;

    /**
     * 父级Container组件的dataCustomer
     */
    dataCustomer: DataCustomer<TriggerConfig>;
}

export interface TriggerProps extends TriggerPropsInterface {
    /**
     * 当前trigger的数据模型
     */
    $trigger: TriggerEventItem[];

    /**
     * 设置触发器的store缓存
     */
    triggerSetData: typeof actionCreators.triggerSetData;
}

type UnCookedTriggerEventItem = {
    customers: string[],
    data: any;
};

export class RCRETrigger<Config extends BasicConfig> extends BasicContainer<TriggerConfig, TriggerProps, {}> {
    private debounceCache: {
        isRunning: boolean;
        data: any
    }[];

    constructor(props: TriggerProps) {
        super(props);
        this.debounceCache = [];
        this.eventHandle = this.eventHandle.bind(this);
    }

    private async runTaskQueue(taskQueue: TRIGGER_SET_DATA_PAYLOAD[]) {
        let runTime = this.getRuntimeContext();
        let state = store.getState();
        runTime.$trigger = state.trigger[this.props.model];
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
                props: this.props,
                context: this.context,
                options: item.options
            });

            if (!prev && !(item.options && item.options.keepWhenError)) {
                break;
            }
        }

        return runTime.$trigger;
    }

    render() {
        let info = this.props.info;

        if (!this.isUnderContainerEnv()) {
            console.error('trigger属性只能在container组件内部使用');
            return this.props.children;
        }

        if (!info.trigger) {
            return this.props.children;
        }

        let trigger = info.trigger;
        let injectEvents = {};

        trigger.forEach(triggerItem => {
            injectEvents[triggerItem.event] = (...args: any[]) => this.eventHandle(triggerItem.event, args);
        });

        let children = React.Children.map(this.props.children, (child: React.ReactElement<any>) => {
            return React.cloneElement(child, {
                info: info,
                $data: this.props.$data,
                $parent: this.props.$parent,
                $trigger: this.props.$trigger,
                $setData: this.props.$setData,
                dataCustomer: this.props.dataCustomer,
                eventHandle: this.eventHandle,
                model: this.props.model,
                injectEvents: injectEvents
            });
        });

        return (
            children
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

            store.dispatch(actionCreators.triggerSetData(triggerItems));
            return this.runTaskQueue(taskQueue);
        });
    }

    private async eventHandle(eventName: string, args: Object, options: {index?: number, preventSubmit?: boolean} = {}) {
        let eventList = this.props.info.trigger;
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
        if (!event.targetCustomer) {
            console.warn('触发事件必须指定targetCustomer');
            return;
        }

        let params = event.params || {};
        let debug = event.debug;
        let targetCustomer = event.targetCustomer;

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

        let runTime = this.getRuntimeContext(this.props, this.context);
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
