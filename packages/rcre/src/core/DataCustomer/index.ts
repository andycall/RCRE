import {RootState} from "../../data/reducers";
import {BasicConfig, CustomerSourceConfig, runTimeType} from '../../types';
import {passCustomer} from './customers/pass';
import {EventEmitter} from 'events';
import {locationCustomer} from './customers/location';
import {ContainerProps} from '../Container/BasicComponent';
import {isExpression, parseExpressionString} from '../util/vm';
import {FunsCustomerController} from './funcCustomer';
import {localStoreCustomer} from './customers/localStorage';
import {submitCustomer} from './customers/submit';
import {isPromise} from '../util/util';
import {TRIGGER_SET_DATA_OPTIONS} from '../Trigger';

type CustomerInstance = (config: any, params: CustomerParams) => any;

/**
 * 把DataCustomerFunc函数变量注入到context中
 *
 * @param {Object} context
 */
export function injectDataCustomerIntoContext(context: Object) {
    let customerName = DataCustomer.funcCustomer.getAllCustomerName();

    let next = customerName.next();

    while (!next.done) {
        let funcName = next.value;
        context[funcName] = DataCustomer.funcCustomer.getCustomer(funcName);
        next = customerName.next();
    }
}

export interface CustomerParams {
    runTime: runTimeType;
    model: string;
    prev: any;
    props: any;
    params: any;
    customer: string;
    context: any;
    options: TRIGGER_SET_DATA_OPTIONS | undefined;
}

/**
 * 自定义函数dataCustomer的传入参数
 */
export type FuncCustomerArgs<Config extends BasicConfig> = {
    customer: string;
    runTime: runTimeType;
    model: string;
    prev: any;
    props: ContainerProps;
    context: any;
    params: any;
};

type DataCustomerItem = {
    mode?: string;
    config?: any;
    func?: string;
};

/**
 * DataCustomer是一个数据源输出端
 * 它通过注入customer插件的形式, 把各种各样的数据消耗方加载进来
 * 针对特殊的业务逻辑场景, 可以使用Group来使用链式调用
 */
export class DataCustomer<Config extends BasicConfig> extends EventEmitter {
    static customerInstance: {
        [name: string]: (config: any, params: CustomerParams) => any;
    };

    static funcCustomer: FunsCustomerController;
    static errorHandler: Function;

    public parentCustomer?: DataCustomer<Config>;
    public customers: {
        [name: string]: DataCustomerItem;
    };
    public groups: {
        [name: string]: {
            steps: string[];
            keepWhenError?: boolean;
        }
    };

    static hasCustomerInstance(name: string) {
        return DataCustomer.customerInstance.hasOwnProperty(name);
    }

    static getCustomerInstance(name: string) {
        return DataCustomer.customerInstance[name];
    }

    static registerCustomerInstance(name: string, fn: CustomerInstance) {
        if (DataCustomer.customerInstance.hasOwnProperty(name)) {
            throw new Error('Exist DataCustomer Instance: ' + name);
        }

        DataCustomer.customerInstance[name] = fn;
    }

    static deleteCustomerInstance(name: string) {
        if (!DataCustomer.hasCustomerInstance(name)) {
           return;
        }

        delete DataCustomer.customerInstance[name];
    }

    static registerError(fn: Function) {
        DataCustomer.errorHandler = fn;
    }

    constructor(parent?: DataCustomer<Config>) {
        super();

        this.customers = {};
        this.groups = {};
        this.parentCustomer = parent;
    }

    public depose() {
        delete this.parentCustomer;
        delete this.customers;
        delete this.groups;
    }

    private handleCustomerError(e: Error) {
        DataCustomer.errorHandler(e);
        // this.emit('errors', e);
    }

    public initCustomerConfig(info: CustomerSourceConfig) {
        let customers = info.customers;
        let groups = info.groups;

        customers.forEach(customer => {
            if (!customer.name) {
                console.error('DataCustomer: 缺少name属性', customer);
                return;
            }

            let mode = customer.mode;
            let name = customer.name;
            let config = customer.config;
            let func = customer.func;

            if (mode) {
                if (!DataCustomer.hasCustomerInstance(mode)) {
                    console.error('can not find customer of mode: ' + mode);
                    return;
                }

                this.customers[name] = {
                    mode: mode,
                    config: config
                };
            } else if (func) {
                if (!isExpression(func)) {
                    console.error('func必须是一个ExpressionString调用');
                }

                this.customers[name] = {
                    func: func
                };
            } else {
                console.error('DataCustomer 需要提供mode或者func属性');
                return;
            }
        });

        if (groups instanceof Array) {
            groups.forEach(group => {
                if (!group.name) {
                    console.error('name property is required for group');
                    return;
                }

                if (!group.steps || !Array.isArray(group.steps)) {
                    console.error('steps property is required and it\'s an array type');
                    return;
                }

                let name = group.name;
                this.groups[name] = {
                    steps: group.steps,
                    keepWhenError: group.keepWhenError
                };
            });
        }
    }

    public getGroups() {
        return this.groups;
    }

    public async execCustomerItem(customer: string, item: DataCustomerItem, params: CustomerParams) {
        let runTime = params.runTime;
        if (item.mode) {
            let config = item.config;
            let instance = DataCustomer.getCustomerInstance(item.mode);

            // 处理$this的内置customer
            if (customer === '$SELF_PASS_CUSTOMER' && runTime.$trigger && runTime.$trigger.$SELF_PASS_CUSTOMER) {
                config.assign = runTime.$trigger.$SELF_PASS_CUSTOMER;
            }

            if (customer === '$PARENT_PASS_CUSTOMER' && runTime.$trigger && runTime.$trigger.$PARENT_PASS_CUSTOMER) {
                config.assign = runTime.$trigger.$PARENT_PASS_CUSTOMER;
            }

            if (!config) {
                config = `#ES{$trigger.${customer}`;
            }

            try {
                return await instance(config, params);
            } catch (e) {
                this.handleCustomerError(e);
                return false;
            }
        } else if (item.func) {
            let funcStr = item.func;

            return await new Promise((resolve, reject) => {
                injectDataCustomerIntoContext(runTime);
                try {
                    let func = parseExpressionString(funcStr, runTime);

                    if (typeof func !== 'function') {
                        console.error('提供给func的值需要是一个函数');
                        return resolve(false);
                    }

                    let ret: Promise<any> = func({
                        ...params
                    });

                    if (isPromise(ret)) {
                        return ret.then(result => resolve(result)).catch(err => {
                            this.handleCustomerError(err);
                            resolve(false);
                        });
                    }

                    return resolve(ret);
                } catch (err) {
                    this.handleCustomerError(err);
                    resolve(false);
                }
            });
        }
    }

    public async execCustomer(params: CustomerParams) {
        let customer = params.customer;

        let state: RootState = params.context.store.getState();
        params.runTime.$data = state.$rcre.container[params.model];

        let customerInstance: DataCustomer<Config> = this;
        let targetCustomer: DataCustomerItem;

        while (true) {
            if (!customerInstance.customers[customer] && !customerInstance.groups[customer]) {

                if (customerInstance.parentCustomer) {
                    customerInstance = customerInstance.parentCustomer;
                    continue;
                } else {
                    console.error(`customer: ${customer} is not defined`);
                    return;
                }
            }

            targetCustomer = customerInstance.customers[customer];
            break;
        }

        return await this.execCustomerItem(customer, targetCustomer, params);
    }
}

DataCustomer.customerInstance = {};
DataCustomer.funcCustomer = new FunsCustomerController();
DataCustomer.errorHandler = (e: Error) => console.error(e);

DataCustomer.registerCustomerInstance('localStorage', localStoreCustomer);
DataCustomer.registerCustomerInstance('location', locationCustomer);
DataCustomer.registerCustomerInstance('pass', passCustomer);
DataCustomer.registerCustomerInstance('submit', submitCustomer);