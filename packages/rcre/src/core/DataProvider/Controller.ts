import {RootState} from '../../data/reducers';
import {ProviderSourceConfig, runTimeType} from '../../types';
import {containerActionCreators} from '../Container/action';
import {isEqual, isPlainObject, isEmpty, get, has} from 'lodash';
import {ContainerProps} from '../Container/Container';
import {RunTimeContextCollection} from '../context';
import {getRuntimeContext, isPromise} from '../util/util';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';
import {SyncAdaptor} from './adaptors/sync';
import {AsyncAdaptor} from './adaptors/async';
import {SocketAdaptor} from './adaptors/socket';
import {AjaxAdaptor} from './applications/ajax';
import {CookieAdaptor} from './applications/cookie';
import {LocalStorageAdaptor} from './applications/localstorage';

// TODO autoInterval

export interface ProviderActions {
    /**
     * 异步加载中
     */
    asyncLoadDataProgress: typeof containerActionCreators.asyncLoadDataProgress;

    /**
     * 异步加载成功
     */
    asyncLoadDataSuccess: typeof containerActionCreators.asyncLoadDataSuccess;

    /**
     * 异步加载失败
     */
    asyncLoadDataFail: typeof containerActionCreators.asyncLoadDataFail;
}

/**
 * DataProvider 是一个数据源控制器
 * 它通过为Container组件提供一个单一, 简单的API调用. 来对各种各样的数据获取操作进行封装
 * 它支持控制同步的数据和异步的数据操作. 获取到目标数据之后,
 * DataProvider会触发action来写入数据到redux store
 *
 * 流程图可参考
 * src/doc/graphic/dataFlow.png
 *
 * 同步的操作会触发一个action, 并进行同步写入
 * 异步的操作会有3个运行状态:
 *
 * 1. before(异步运行前)
 * 2. progress(异步运行中)
 * 3.1 success(异步运行成功)
 * 3.2 fail(异步运行失败)
 */
export class DataProvider {
    static providerInstance: {
        [mode: string]: {
            type: 'sync',
            instance: SyncAdaptor
        } | {
            type: 'async',
            instance: AsyncAdaptor
        } | {
            type: 'socket',
            instance: SocketAdaptor
        };
    };

    public providerCache: {
        [namespace: string]: any;
    };
    public isUnmount: boolean;
    public dependencies: {
        [namespace: string]: {
            dep: string[];
            beDep: string[];
        }
    };
    public buildInProvider: {
        [namespace: string]: ProviderSourceConfig
    };
    public taskQueue: string[][];

    static registerSyncProvider(mode: string, adaptor: SyncAdaptor) {
        DataProvider.providerInstance[mode] = {
            type: 'sync',
            instance: adaptor
        };
    }

    static registerAsyncProvider(mode: string, adaptor: AsyncAdaptor) {
        DataProvider.providerInstance[mode] = {
            type: 'async',
            instance: adaptor
        };
    }

    static registerSocketProvider(mode: string, adaptor: SocketAdaptor) {
        DataProvider.providerInstance[mode] = {
            type: 'socket',
            instance: adaptor
        };
    }

    static getProvider(mode: string) {
        if (!DataProvider.providerInstance[mode]) {
            console.error('can not find exact data provider of mode: ' + mode);
            return null;
        }

        return DataProvider.providerInstance[mode];
    }

    constructor(providerList: ProviderSourceConfig[]) {
        this.providerCache = {};
        this.dependencies = {};
        this.buildInProvider = {};
        this.isUnmount = false;
        providerList.forEach(provider => {
            if (provider.namespace) {
                if (this.buildInProvider[provider.namespace]) {
                    console.warn('DataProvider: 检测到重复的namespace: ' + provider.namespace);
                    return;
                }

                this.buildInProvider[provider.namespace] = provider;
            }
        });

        this.buildDependencies(providerList);
        this.computeRequestGroup(providerList);
    }

    public depose() {
        delete this.providerCache;
        delete this.dependencies;
        delete this.buildInProvider;
        this.isUnmount = true;
    }

    public buildDependencies(providerList: ProviderSourceConfig[]) {
        for (let i = 0; i < providerList.length; i++) {
            let provider = providerList[i];
            let namespace = provider.namespace;

            if (!namespace) {
                console.error('DataProvider: mode: ' + provider.mode + ' 缺少namespace');
                continue;
            }

            if (!this.dependencies[namespace]) {
                this.dependencies[namespace] = {
                    dep: [],
                    beDep: []
                };
            }

            if (!provider.requiredParams) {
                continue;
            }

            let requiredParams = provider.requiredParams;

            if (!Array.isArray(requiredParams)) {
                continue;
            }

            for (let requiredKey of provider.requiredParams) {
                if (!this.dependencies[requiredKey]) {
                    this.dependencies[requiredKey] = {
                        dep: [],
                        beDep: []
                    };
                }

                if (this.buildInProvider[requiredKey]) {
                    this.dependencies[namespace].dep.push(requiredKey);
                    this.dependencies[requiredKey].beDep.push(namespace);
                }
            }
        }
    }

    public computeRequestGroup(providerList: ProviderSourceConfig[]) {
        let roads: string[] = [];
        let taskQueue: string[][] = [];

        for (let i = 0; i < providerList.length; i++) {
            let provider = providerList[i];
            let requiredParams = provider.requiredParams || [];

            if (!Array.isArray(requiredParams)) {
                continue;
            }

            requiredParams = requiredParams.filter(params => {
                return this.buildInProvider[params];
            });

            if (requiredParams.length === 0 && provider.namespace) {
                let key = provider.namespace;
                let paths = {};
                this.getRequestTaskQueue(key, this.dependencies[key].beDep, key, paths, roads);
            }
        }

        roads.sort((prev, next) => {
            return next.split('->').length - prev.split('->').length;
        });

        let activeStep = {};
        for (let road of roads) {
            let step = road.split('->');

            for (let i = 0; i < step.length; i ++) {
                if (!taskQueue[i]) {
                    taskQueue[i] = [];
                }

                if (!taskQueue[i].includes(step[i]) && !activeStep[step[i]]) {
                    activeStep[step[i]] = true;
                    taskQueue[i].push(step[i]);
                }
            }
        }

        this.taskQueue = taskQueue;
    }

    public getRequestTaskQueue(key: string, deps: string[], road: string, paths: { [key: string]: boolean }, roads: string[]) {
        if (deps.length === 0) {
            roads.push(road);
            return;
        }

        for (let nextProvider of deps) {
            let existPaths = road.split('->');

            if (existPaths.includes(nextProvider)) {
                throw new Error(`DataProvider: 发现循环依赖的dataProvider. ${road + '->' + nextProvider}`);
            }

            let nextRoad = road + '->' + nextProvider;

            this.getRequestTaskQueue(nextProvider, this.dependencies[nextProvider].beDep, nextRoad, paths, roads);
        }
    }

    public shouldRequestData(
        provider: ProviderSourceConfig,
        runTime: runTimeType,
        model: string,
        props: ContainerProps,
        context: RunTimeContextCollection
    ) {
        let mode = provider.mode;
        let adaptor = DataProvider.getProvider(mode);
        let namespace = provider.namespace;

        if (!adaptor) {
            return false;
        }

        if (!namespace) {
            return false;
        }

        if (runTime.$data && runTime.$data[namespace] && runTime.$data[namespace].$loading === true) {
            return false;
        }

        if (!provider || !provider.config) {
            return false;
        }

        let previousConfig = this.providerCache[namespace];

        let config = compileExpressionString(provider.config, runTime, [], true);

        let forceUpdate = runTime.$data && runTime.$data['$update'];

        if (forceUpdate) {
            context.rcre.store.dispatch(containerActionCreators.setData({
                name: '$update',
                value: false
            }, model, context));
        }

        // if (providerConfig.autoInterval && !providerConfig._timer && !$data['$clearTimeout']) {
        //     providerConfig._timer = setInterval(() => {
        //         console.log('tick');
        //         store.dispatch(actionCreators.setMultiData([{
        //             name: '$update',
        //             value: true
        //         }, {
        //             name: '$clearTimeout',
        //             value: false
        //         }], props.info.model, context));
        //     }, providerConfig.autoInterval);
        // }
        //
        // if (providerConfig._timer && $data['$clearTimeout']) {
        //     clearTimeout(providerConfig._timer);
        //     providerConfig._timer = 0;
        // }

        // 如果$data中存在字段没有满足要求，则return false
        let requiredParams = provider.requiredParams;
        if (isExpression(requiredParams)) {
            requiredParams = parseExpressionString(requiredParams, runTime);
        }

        if (requiredParams instanceof Array) {
            let flag = requiredParams.every(param => {
                if (isExpression(param)) {
                    param = parseExpressionString(param, runTime);
                }

                if (param === null) {
                    console.warn('DataProvider: 动态requiredParams计算结果为null');
                    return false;
                }

                let paramData = get(runTime.$data, param);

                if (this.buildInProvider[param] && paramData) {
                    return !paramData.$loading;
                }

                let strictRequired = provider.strictRequired;

                if (isExpression(strictRequired)) {
                    strictRequired = parseExpressionString(strictRequired, runTime);
                }

                if (strictRequired === true) {
                    return !!get(runTime.$data, param);
                }

                return has(runTime.$data, param);
            });

            if (!flag) {
                return false;
            }
        }

        if (provider.hasOwnProperty('condition')) {
            let condition = provider.condition;
            if (isExpression(condition)) {
                condition = parseExpressionString(condition, runTime);
            }

            if (condition === false) {
                return false;
            }
        }

        // 如果provider数据配置和上次相同, 就必须阻止以后的操作.
        // 不然就会死循环
        // 参考流程图: src/doc/graphic/dataFlow.png
        if (previousConfig && !forceUpdate && isEqual(previousConfig, config)) {
            return false;
        }

        // 防止adaptor中出现代码改动了provider的值
        Object.freeze(config);
        this.providerCache[namespace] = config;

        return provider;
    }

    public async execProvider(config: any, provider: ProviderSourceConfig, runTime: runTimeType, actions: ProviderActions, model: string) {
        let mode = provider.mode;
        let adaptor = DataProvider.getProvider(mode);

        if (!adaptor) {
            return;
        }

        switch (adaptor.type) {
            default:
            case 'sync': {
                let sync = await this.execSyncAdaptor(config, provider, adaptor.instance, runTime, actions, model);
                return sync;
            }
            case 'async': {
                return await this.execAsyncAdaptor(config, provider, adaptor.instance, runTime, actions, model);
            }
            case 'socket': {
                // await this.execSocketAdaptor(provider, adaptor.instance, runTime, actions, model);
                break;
            }
        }
    }

    private async handleAdaptorResult(provider: ProviderSourceConfig, data: any, runTime: runTimeType) {
        data = this.applyRetMapping(provider, data, runTime);

        if (provider.responseRewrite) {
            data = await this.applyResponseRewrite(provider, data, runTime);
        } else if (provider.namespace) {
            data = {
                [provider.namespace]: data
            };
        }

        return data;
    }

    private async execSyncAdaptor(config: any, provider: ProviderSourceConfig, instance: SyncAdaptor, runTime: runTimeType, actions: ProviderActions, model: string) {
        try {
            let data = instance.exec(config, provider, runTime);
            return this.handleAdaptorResult(provider, data, runTime);
        } catch (e) {
            this.handleError(actions, model, e, e.message);
            return null;
        }
    }

    private async execAsyncAdaptor(config: any, provider: ProviderSourceConfig, instance: AsyncAdaptor, runTime: runTimeType, actions: ProviderActions, model: string) {
        try {
            let instanceResult = await instance.exec(config, provider, runTime);

            if (instanceResult.success && instanceResult.data) {
                let data = instanceResult.data;
                return this.handleAdaptorResult(provider, data, runTime);
            } else if (instanceResult.errmsg) {
                this.handleError(actions, model, new Error(instanceResult.errmsg), instanceResult.errmsg);
            }
        } catch (e) {
            this.handleError(actions, model, e, e.message);
        }
    }

    private applyRetMapping(provider: ProviderSourceConfig, data: any, runTime: runTimeType) {
        let retMapping = provider.retMapping;

        if (!retMapping || !isPlainObject(retMapping)) {
            return data;
        }

        return compileExpressionString(retMapping, {
            ...runTime,
            $output: data
        });
    }

    private async applyResponseRewrite(provider: ProviderSourceConfig, data: any, runTime: runTimeType) {
        let response;
        if (isPlainObject(provider.responseRewrite)) {
            response = compileExpressionString(provider.responseRewrite, {
                ...runTime,
                $output: data
            }, [], true);
        }

        if (provider.responseRewrite && isExpression(provider.responseRewrite)) {
            response = parseExpressionString(provider.responseRewrite, {
                ...runTime,
                $output: data
            });
        }

        if (isPromise(response)) {
            response = await response;
        } else if (isPlainObject(response)) {
            for (let key in response) {
                if (response.hasOwnProperty(key) && isPromise(response[key])) {
                    response[key] = await response[key];
                }
            }
        }

        if (typeof provider.namespace === 'string' && response) {
            response[provider.namespace] = data;
        }

        return response;
    }

    private handleError(actions: ProviderActions, model: string, error: Error, errmsg: string) {
        actions.asyncLoadDataFail({
            model: model,
            error: errmsg
        });
        console.error('DataProvider exec error: ' + errmsg);
    }

    // private async execSocketAdaptor(provider: ProviderSourceConfig, instance: SocketAdaptor, runTime: runTimeType, actions: ProviderActions, model: string) {
    // }

    public getRunTime(model: string, props: ContainerProps, context: RunTimeContextCollection) {
        let runTime = getRuntimeContext(context.container, context.rcre, {
            iteratorContext: context.iterator
        });
        let state: RootState = context.rcre.store.getState();
        runTime.$data = state.$rcre.container[model];
        runTime.$trigger = state.$rcre.trigger[model];

        return runTime;
    }

    public async requestForData(
        model: string,
        providerConfig: ProviderSourceConfig[],
        actions: ProviderActions,
        props: ContainerProps,
        context: RunTimeContextCollection
    ) {
        let runTime = this.getRunTime(model, props, context);
        let retCache = {};
        let execTask = this.taskQueue;
        let isProgress = false;

        // 并发发送请求
        for (let i = 0; i < execTask.length; i++) {
            let state: RootState = context.rcre.store.getState();
            let container = state.$rcre.container[model];
            let parallel = execTask[i].map(namespace => {
                let provider = this.buildInProvider[namespace];
                runTime.$data = {
                    ...container,
                    ...retCache
                };

                let verifyProvider = this.shouldRequestData(provider, runTime, model, props, context);

                if (typeof verifyProvider === 'boolean') {
                    return null;
                }

                if (!isProgress) {
                    actions.asyncLoadDataProgress({
                        model: model
                    });
                }

                isProgress = true;

                context.rcre.dataProviderEvent.addToList(verifyProvider.namespace);

                return this.execProvider(this.providerCache[namespace], verifyProvider, runTime, actions, model);
            });

            let resultList = await Promise.all(parallel);

            resultList.forEach((result, index) => {
                if (!result) {
                    return;
                }

                process.nextTick(() => {
                    context.rcre.dataProviderEvent.setToDone(execTask[i][index]);
                });

                Object.assign(retCache, result);
            });
        }

        if (!isEmpty(retCache) &&
            !this.isUnmount &&
            // 如果测试代码中没有正确处理，会导致jest已经回收了DOM，而接口这时候才调用完毕
            (window && !!window.document)) {
            actions.asyncLoadDataSuccess({
                model: model,
                data: retCache,
                context: context
            });

            return retCache;
        }

        return null;
    }
}

DataProvider.providerInstance = {};

DataProvider.registerAsyncProvider('ajax', new AjaxAdaptor());
DataProvider.registerSyncProvider('localStorage', new LocalStorageAdaptor());
DataProvider.registerSyncProvider('cookie', new CookieAdaptor());