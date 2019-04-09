/**
 * @file Container组件的Reducer
 * @author dongtiancheng
 */

import {Reducer} from 'redux';
import {
    ASYNC_LOAD_DATA_FAIL,
    ASYNC_LOAD_DATA_PROGRESS,
    ASYNC_LOAD_DATA_SUCCESS,
    RESET_CONTAINER,
    DATA_CUSTOMER_PASS,
    IContainerAction,
    SET_DATA,
    SET_MULTI_DATA,
    SYNC_LOAD_DATA_FAIL,
    SYNC_LOAD_DATA_SUCCESS,
    CLEAR_DATA,
    DELETE_DATA, INIT_CONTAINER
} from './action';
import {clone, each, get} from 'lodash';
import {
    containerGraph,
    syncExportContainerState,
    syncDeleteContainerState, syncPropsContainerState, ContainerNode
} from '../Service/ContainerDepGraph';
import {setWith, deleteWith} from '../util/util';

export const TMP_MODEL = '__TMP_MODEL__DO_NO_USE_IT';

export type IContainerState = {
    [key: string]: any;
};
export let initialState: IContainerState = Object.freeze({
    [TMP_MODEL]: {}
});

export const reducer: Reducer<IContainerState> =
    (state: IContainerState = initialState, actions: IContainerAction): IContainerState => {
        switch (actions.type) {
            case INIT_CONTAINER: {
                let model = actions.payload.model;
                let data = actions.payload.data;

                if (!state[model]) {
                    state = setWith(state, model, data);
                } else {
                    state = setWith(state, model, {
                        ...state[model],
                        ...data
                    });
                }

                let container = containerGraph.get(model);

                if (!container) {
                    return clone(state);
                }

                // 初次挂载的时候，继承父级的数据
                if (container.parent) {
                    let affectNode: ContainerNode[] = [container.parent];
                    syncPropsContainerState(state, actions.context, container.parent);
                    syncExportContainerState(state, affectNode, actions.context, container);

                    affectNode.forEach(node => {
                        syncPropsContainerState(state, actions.context, node);
                    });
                }

                return clone(state);
            }
            case SET_DATA: {
                let name = actions.payload.name;
                let newValue = actions.payload.value;
                let options = actions.payload.options || {};

                let model = actions.model;
                if (!(model in state)) {
                    state[model] = {};
                }

                let paginationCacheKey = `${TMP_MODEL}.${model}.pagination`;

                if (options.pagination) {
                    let cache = {};
                    options.pagination.paginationQueryParams.forEach(param => {
                        cache[param] = state[model][param];
                    });

                    state = setWith(state, paginationCacheKey, {
                        key: name,
                        value: newValue,
                        cache: cache
                    });
                }

                if (options.isTmp) {
                    model = TMP_MODEL;
                }

                // 在当前分页器不在第一页的情况下，选择新的选项要重置分页的值
                let oldPaginationCache = get(state, paginationCacheKey);
                if (!options.pagination &&
                    oldPaginationCache &&
                    oldPaginationCache.value.current !== 1 &&
                    oldPaginationCache.cache.hasOwnProperty(name) &&
                    oldPaginationCache.cache[name] !== newValue) {
                    let newPaginationValue = clone(oldPaginationCache.value);
                    let paginationKey = oldPaginationCache.key;
                    newPaginationValue.current = 1;
                    state[model] = setWith(state[model], paginationKey, newPaginationValue);
                }

                state[model] = setWith(state[model], name, newValue);

                let container = containerGraph.get(model);
                let affectNode: ContainerNode[] = [];

                syncExportContainerState(state, affectNode, actions.context, container);

                affectNode.forEach(node => {
                    syncPropsContainerState(state, actions.context, node);
                });

                state = clone(state);
                state[model] = clone(state[model]);

                return state;
            }
            case SET_MULTI_DATA: {
                let payload = actions.payload;
                let model = actions.model;

                if (!(model in state)) {
                    state[model] = {};
                }

                payload.forEach(item => {
                    let name = item.name;
                    let value = item.value;
                    let isTmp = item.isTmp;
                    model = actions.model;

                    if (isTmp) {
                        model = TMP_MODEL;
                    }

                    state[model] = setWith(state[model], name, value);
                });

                let container = containerGraph.get(model);
                let affectNode: ContainerNode[] = [];
                syncExportContainerState(state, affectNode, actions.context, container);
                affectNode.forEach(node => {
                    syncPropsContainerState(state, actions.context, node);
                });

                return clone(state);
            }
            case ASYNC_LOAD_DATA_PROGRESS: {
                let payload = actions.payload;
                let model = payload.model;

                if (!(model in state)) {
                    state[model] = {
                        $loading: true
                    };
                }

                state[model].$loading = true;

                return clone(state);
            }
            case ASYNC_LOAD_DATA_SUCCESS: {
                let payload = actions.payload;
                let model = payload.model;
                let data = payload.data;

                if (!state[model]) {
                    state[model] = {};
                }

                state[model].$loading = false;

                each(data, (value, name) => {
                    state[model] = setWith(state[model], name, value);
                });

                state = clone(state);
                state[model] = clone(state[model]);

                let container = containerGraph.get(model);
                let affectNode: ContainerNode[] = [];

                // 初次挂载的时候，继承父级的数据
                if (container && container.parent) {
                    affectNode.push(container.parent);
                }
                syncExportContainerState(state, affectNode, payload.context, container);
                affectNode.forEach(node => {
                    syncPropsContainerState(state, payload.context, node);
                });

                return clone(state);
            }
            case ASYNC_LOAD_DATA_FAIL: {
                let payload = actions.payload;
                let model = payload.model;
                let error = payload.error;

                if (!(model in state)) {
                    state[model] = {};
                }

                state[model] = clone(state[model]);
                state[model].$loading = false;
                state[model].$error = error;

                return clone(state);
            }
            case SYNC_LOAD_DATA_SUCCESS: {
                let payload = actions.payload;
                let model = payload.model;
                let data = payload.data;

                if (!(model in state)) {
                    state[model] = {};
                }

                state = clone(state);
                state[model] = clone(state[model]);
                Object.assign(state[model], data);

                let container = containerGraph.get(model);
                let affectNode: ContainerNode[] = [];

                // 初次挂载的时候，继承父级的数据
                if (container && container.parent) {
                    affectNode.push(container.parent);
                    syncPropsContainerState(state, payload.context, container.parent);
                }
                syncExportContainerState(state, affectNode, payload.context, container);
                affectNode.forEach(node => {
                    syncPropsContainerState(state, payload.context, node);
                });

                return clone(state);
            }
            case SYNC_LOAD_DATA_FAIL: {
                let payload = actions.payload;
                let model = payload.model;
                let error = payload.error;

                if (!(model in state)) {
                    state[model] = {};
                }

                Object.assign(state[model], {
                    $error: error
                });

                return clone(state);
            }
            case DATA_CUSTOMER_PASS: {
                let payload = actions.payload;
                let model = payload.model;
                let data = payload.data;

                if (!(model in state)) {
                    console.error(`DataCustomerPass: ${model} is not exist`);
                    return state;
                }

                state = clone(state);
                state[model] = clone(state[model]);

                each(data, (val, key) => {
                    state[model] = setWith(state[model], key, val);
                });

                let container = containerGraph.get(model);
                let affectNode: ContainerNode[] = [];
                syncExportContainerState(state, affectNode, actions.context, container);
                affectNode.forEach(node => {
                    syncPropsContainerState(state, actions.context, node);
                });

                return state;
            }
            case CLEAR_DATA: {
                let delKey = actions.payload.model;
                let node = containerGraph.get(delKey);

                if (node && node.options.clearDataToParentsWhenDestroy) {
                    syncDeleteContainerState(state, actions.payload.context, node);
                }

                delete state[delKey];
                return clone(state);
            }
            case RESET_CONTAINER:
                state = {
                    [TMP_MODEL]: {}
                };
                return state;
            case DELETE_DATA: {
                let payload = actions.payload;
                let name = payload.name;
                let model = actions.model;
                let isTmp = payload.isTmp;
                let context = actions.context;
                let container = containerGraph.get(model);

                if (!(model in state)) {
                    return state;
                }

                if (isTmp) {
                    model = TMP_MODEL;
                }

                if (container && container.options.syncDelete) {
                    syncDeleteContainerState(state, context, container, name);
                    state[model] = deleteWith(name, state[model]);
                } else {
                    state[model] = deleteWith(name, state[model]);
                    syncExportContainerState(state, [], actions.context, container);
                }

                return clone(state);
            }
            default:
                return state;
        }
    };
