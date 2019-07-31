/**
 * @file Container组件的Reducer
 * @author dongtiancheng
 */

import {Reducer} from 'redux';
import {forward, undo} from '../../data/history';
import {
    RCRE_ASYNC_LOAD_DATA_FAIL,
    RCRE_ASYNC_LOAD_DATA_PROGRESS,
    RCRE_ASYNC_LOAD_DATA_SUCCESS,
    RCRE_RESET_CONTAINER_STORE,
    RCRE_DATA_CUSTOMER_PASS,
    IContainerAction,
    RCRE_SET_DATA,
    RCRE_SET_MULTI_DATA,
    RCRE_SYNC_LOAD_DATA_FAIL,
    RCRE_SYNC_LOAD_DATA_SUCCESS,
    RCRE_CLEAR_DATA,
    RCRE_DELETE_DATA, RCRE_INIT_CONTAINER, RCRE_UNDO_STATE, RCRE_FORWARD_STATE
} from './action';
import {clone, each, get} from 'lodash';
import {
    syncExportContainerState,
    syncDeleteContainerState, syncPropsContainerState, ContainerNode
} from '../Service/ContainerDepGraph';
import {setWith, deleteWith, combineKeys} from '../util/util';

export const TMP_MODEL = '__TMP_MODEL__DO_NO_USE_IT';

export type IContainerState = {
    [key: string]: any;
};
export let containerInitState: IContainerState = Object.freeze({
    [TMP_MODEL]: {}
});

export const containerReducer: Reducer<IContainerState> =
    (state: IContainerState = containerInitState, actions: IContainerAction): IContainerState => {
        switch (actions.type) {
            case RCRE_INIT_CONTAINER: {
                let model = actions.payload.model;
                let data = actions.payload.data;
                let context = actions.context;

                if (!state[model]) {
                    state = setWith(state, model, data);
                } else {
                    state = setWith(state, model, {
                        ...state[model],
                        ...data
                    });
                }

                let container = context.rcre.containerGraph.get(model);

                if (!container) {
                    return state;
                }

                // 初次挂载的时候，继承父级的数据
                if (container.parent) {
                    let affectNode: ContainerNode[] = [container.parent];
                    state = syncPropsContainerState(state, actions.context, container.parent);
                    state = syncExportContainerState(state, affectNode, actions.context, container);

                    affectNode.forEach(node => {
                        state = syncPropsContainerState(state, actions.context, node);
                    });
                }

                return state;
            }
            case RCRE_SET_DATA: {
                let name = actions.payload.name;
                let newValue = actions.payload.value;
                let context = actions.context;
                let options = actions.payload.options || {};

                let model = actions.model;
                if (!(model in state)) {
                    state = setWith(state, model, {});
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
                    state = setWith(state, combineKeys(model, paginationKey), newPaginationValue);
                }

                state = setWith(state, combineKeys(model, name), newValue);

                let container = context.rcre.containerGraph.get(model);
                let affectNode: ContainerNode[] = [];

                state = syncExportContainerState(state, affectNode, actions.context, container);

                affectNode.forEach(node => {
                    state = syncPropsContainerState(state, actions.context, node);
                });

                return state;
            }
            case RCRE_SET_MULTI_DATA: {
                let payload = actions.payload;
                let model = actions.model;
                let context = actions.context;

                if (!(model in state)) {
                    state = setWith(state, model, {});
                }

                payload.forEach(item => {
                    let name = item.name;
                    let value = item.value;
                    model = actions.model;

                    state = setWith(state, combineKeys(model, name), value);
                });

                let container = context.rcre.containerGraph.get(model);
                let affectNode: ContainerNode[] = [];
                state = syncExportContainerState(state, affectNode, actions.context, container);
                affectNode.forEach(node => {
                    state = syncPropsContainerState(state, actions.context, node);
                });

                return state;
            }
            case RCRE_ASYNC_LOAD_DATA_PROGRESS: {
                let payload = actions.payload;
                let model = payload.model;

                if (!(model in state)) {
                    state = setWith(state, model, {
                        $loading: true
                    });
                }

                state = setWith(state, combineKeys(model, '$loading'), true);

                return state;
            }
            case RCRE_ASYNC_LOAD_DATA_SUCCESS: {
                let payload = actions.payload;
                let model = payload.model;
                let context = payload.context;
                let data = payload.data;

                if (!state[model]) {
                    state = setWith(state, model, {});
                }

                state = setWith(state, combineKeys(model, '$loading'), false);
                state = setWith(state, combineKeys(model, '$error'), null);

                each(data, (value, name) => {
                    state = setWith(state, combineKeys(model, name), value);
                });

                let container = context.rcre.containerGraph.get(model);
                let affectNode: ContainerNode[] = [];

                // 初次挂载的时候，继承父级的数据
                if (container && container.parent) {
                    affectNode.push(container.parent);
                }
                state = syncExportContainerState(state, affectNode, payload.context, container);
                affectNode.forEach(node => {
                    state = syncPropsContainerState(state, payload.context, node);
                });

                return state;
            }
            case RCRE_ASYNC_LOAD_DATA_FAIL: {
                let payload = actions.payload;
                let model = payload.model;
                let error = payload.error;

                if (!(model in state)) {
                    state = setWith(state, model, {});
                }

                state = setWith(state, combineKeys(model, '$loading'), false);
                state = setWith(state, combineKeys(model, '$error'), error);

                return state;
            }
            case RCRE_SYNC_LOAD_DATA_SUCCESS: {
                let payload = actions.payload;
                let model = payload.model;
                let data = payload.data;
                let context = payload.context;

                if (!(model in state)) {
                    state = setWith(state, model, {});
                }

                each(data, (val, key) => {
                    state = setWith(state, combineKeys(model, key), val);
                });

                let container = context.rcre.containerGraph.get(model);
                let affectNode: ContainerNode[] = [];

                // 初次挂载的时候，继承父级的数据
                if (container && container.parent) {
                    affectNode.push(container.parent);
                    state = syncPropsContainerState(state, payload.context, container.parent);
                }
                state = syncExportContainerState(state, affectNode, payload.context, container);
                affectNode.forEach(node => {
                    state = syncPropsContainerState(state, payload.context, node);
                });

                return state;
            }
            case RCRE_SYNC_LOAD_DATA_FAIL: {
                let payload = actions.payload;
                let model = payload.model;
                let error = payload.error;

                if (!(model in state)) {
                    state = setWith(state, model, {});
                }

                state = setWith(state, combineKeys(model, '$error'), error);
                return state;
            }
            case RCRE_DATA_CUSTOMER_PASS: {
                let payload = actions.payload;
                let model = payload.model;
                let data = payload.data;
                let context = actions.context;

                if (!(model in state)) {
                    console.error(`DataCustomerPass: ${model} is not exist`);
                    return state;
                }

                each(data, (val, key) => {
                    state = setWith(state, combineKeys(model, key), val);
                });

                let container = context.rcre.containerGraph.get(model);
                let affectNode: ContainerNode[] = [];
                state = syncExportContainerState(state, affectNode, actions.context, container);
                affectNode.forEach(node => {
                    state = syncPropsContainerState(state, actions.context, node);
                });

                return state;
            }
            case RCRE_CLEAR_DATA: {
                let delKey = actions.payload.model;
                let context = actions.payload.context;
                let node = context.rcre.containerGraph.get(delKey);

                if (node && node.options.clearDataToParentsWhenDestroy) {
                    state = syncDeleteContainerState(state, actions.payload.context, node);
                }

                state = deleteWith(state, delKey);
                return state;
            }
            case RCRE_RESET_CONTAINER_STORE:
                state = {
                    [TMP_MODEL]: {}
                };
                return state;
            case RCRE_DELETE_DATA: {
                let payload = actions.payload;
                let name = payload.name;
                let model = actions.model;
                let context = actions.context;
                let container = context.rcre.containerGraph.get(model);

                if (!(model in state)) {
                    return state;
                }

                if (container && container.options.syncDelete) {
                    state = syncDeleteContainerState(state, context, container, name);
                    state = deleteWith(state, combineKeys(model, name));
                } else {
                    state = deleteWith(state, combineKeys(model, name));
                    state = syncExportContainerState(state, [], actions.context, container);
                }

                return state;
            }
            case RCRE_UNDO_STATE: {
                let prevState = undo(state);

                if (!prevState) {
                    return state;
                }

                return prevState;
            }
            case RCRE_FORWARD_STATE: {
                let nextState = forward(state);

                if (!nextState) {
                    return state;
                }

                return nextState;
            }
            default:
                return state;
        }
    };
