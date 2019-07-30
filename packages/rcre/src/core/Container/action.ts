/**
 * @file Container组件的Action
 * @author dongtiancheng
 */
import {ContainerSetDataOption} from '../../types';
import {RunTimeContextCollection} from '../context';

export const RCRE_INIT_CONTAINER = 'RCRE_INIT_CONTAINER';
export const RCRE_SET_DATA = 'RCRE_SET_DATA';
export const RCRE_SET_MULTI_DATA = 'RCRE_SET_MULTI_DATA';
export const RCRE_RESET_CONTAINER_STORE = 'RCRE_RESET_CONTAINER_STORE';
export const RCRE_DELETE_DATA = 'RCRE_DELETE_DATA';
export const RCRE_CLEAR_DATA = 'RCRE_CLEAR_DATA';
export const RCRE_SYNC_LOAD_DATA_SUCCESS = 'RCRE_SYNC_LOAD_DATA_SUCCESS';
export const RCRE_SYNC_LOAD_DATA_FAIL = 'RCRE_SYNC_LOAD_DATA_FAIL';
export const RCRE_ASYNC_LOAD_DATA_PROGRESS = 'RCRE_ASYNC_LOAD_DATA_PROGRESS';
export const RCRE_ASYNC_LOAD_DATA_SUCCESS = 'RCRE_ASYNC_LOAD_DATA_SUCCESS';
export const RCRE_ASYNC_LOAD_DATA_FAIL = 'RCRE_ASYNC_LOAD_DATA_FAIL';
export const RCRE_DATA_CUSTOMER_PASS = 'RCRE_DATA_CUSTOMER_PASS';
export const RCRE_UNDO_STATE = 'RCRE_UNDO_STATE';
export type SET_DATA_PAYLOAD = {
    name: string;
    value: any;
    options?: ContainerSetDataOption,
    parent?: string;
};
export type DELETE_DATA_PAYLOAD = {
    name: string;
    parent?: string;
};
export type INIT_CONTAINER_PAYLOAD = {
    model: string;
    data: any;
};
export type SET_MULTI_DATA_PAYLOAD = ({
    name: string;
    value: any;
})[];

export type CLEAR_DATA_PAYLOAD = {
    model: string;
    context: RunTimeContextCollection;
};
export type ASYNC_LOAD_DATA_PROGRESS_PAYLOAD = {
    model: string;
};
export type ASYNC_LOAD_DATA_SUCCESS_PAYLOAD = {
    model: string;
    data: any;
    context: RunTimeContextCollection
};
export type ASYNC_LOAD_DATA_FAIL_PAYLOAD = {
    model: string;
    error: any;
};
export type SYNC_LOAD_DATA_SUCCESS_PAYLOAD = {
    model: string;
    data: any
    context: RunTimeContextCollection;
};
export type SYNC_LOAD_DATA_FAIL_PAYLOAD = {
    model: string;
    error: any
};
export type DATA_CUSTOMER_PASS_PAYLOAD = {
    model: string;
    data: Object;
};

export type IActions = {
    INIT_CONTAINER: {
        type: typeof RCRE_INIT_CONTAINER,
        payload: INIT_CONTAINER_PAYLOAD,
        context: RunTimeContextCollection
    },
    SET_DATA: {
        type: typeof RCRE_SET_DATA,
        payload: SET_DATA_PAYLOAD,
        model: string;
        context: RunTimeContextCollection;
    },
    SET_MULTI_DATA: {
        type: typeof RCRE_SET_MULTI_DATA,
        payload: SET_MULTI_DATA_PAYLOAD,
        model: string,
        context: RunTimeContextCollection
    },
    ASYNC_LOAD_DATA_PROGRESS: {
        type: typeof RCRE_ASYNC_LOAD_DATA_PROGRESS,
        payload: ASYNC_LOAD_DATA_PROGRESS_PAYLOAD
    },
    ASYNC_LOAD_DATA_SUCCESS: {
        type: typeof RCRE_ASYNC_LOAD_DATA_SUCCESS,
        payload: ASYNC_LOAD_DATA_SUCCESS_PAYLOAD
    },
    ASYNC_LOAD_DATA_FAIL: {
        type: typeof RCRE_ASYNC_LOAD_DATA_FAIL,
        payload: ASYNC_LOAD_DATA_FAIL_PAYLOAD
    },
    SYNC_LOAD_DATA_SUCCESS: {
        type: typeof RCRE_SYNC_LOAD_DATA_SUCCESS,
        payload: SYNC_LOAD_DATA_SUCCESS_PAYLOAD
    },
    SYNC_LOAD_DATA_FAIL: {
        type: typeof RCRE_SYNC_LOAD_DATA_FAIL,
        payload: SYNC_LOAD_DATA_FAIL_PAYLOAD
    },
    DELETE_DATA: {
        type: typeof RCRE_DELETE_DATA,
        payload: DELETE_DATA_PAYLOAD,
        model: string;
        context: RunTimeContextCollection;
    },
    CLEAR_DATA: {
        type: typeof RCRE_CLEAR_DATA,
        payload: CLEAR_DATA_PAYLOAD
    },
    RESET_STORE: {
        type: typeof RCRE_RESET_CONTAINER_STORE
    },
    DATA_CUSTOMER_PASS: {
        type: typeof RCRE_DATA_CUSTOMER_PASS,
        payload: DATA_CUSTOMER_PASS_PAYLOAD,
        context: RunTimeContextCollection
    },
    UNDO_STATE: {
        type: typeof RCRE_UNDO_STATE
    }
};

export type IContainerAction = IActions[keyof IActions];

export const containerActionCreators = {
    initContainer: (payload: INIT_CONTAINER_PAYLOAD, context: RunTimeContextCollection) => ({
        type: RCRE_INIT_CONTAINER as typeof RCRE_INIT_CONTAINER,
        payload,
        context
    }),
    setData: (payload: SET_DATA_PAYLOAD, model: string, context: RunTimeContextCollection) => ({
        type: RCRE_SET_DATA as typeof RCRE_SET_DATA,
        payload,
        model,
        context
    }),
    setMultiData: (payload: SET_MULTI_DATA_PAYLOAD, model: string, context: RunTimeContextCollection) => ({
        type: RCRE_SET_MULTI_DATA as typeof RCRE_SET_MULTI_DATA,
        payload,
        model,
        context
    }),
    deleteData: (payload: DELETE_DATA_PAYLOAD, model: string, context: RunTimeContextCollection) => ({
        type: RCRE_DELETE_DATA as typeof RCRE_DELETE_DATA,
        payload,
        model,
        context
    }),
    resetContainer: () => ({
        type: RCRE_RESET_CONTAINER_STORE as typeof RCRE_RESET_CONTAINER_STORE
    }),
    clearData: (payload: CLEAR_DATA_PAYLOAD) => ({
        type: RCRE_CLEAR_DATA as typeof RCRE_CLEAR_DATA,
        payload
    }),
    asyncLoadDataProgress: (payload: ASYNC_LOAD_DATA_PROGRESS_PAYLOAD) => ({
        type: RCRE_ASYNC_LOAD_DATA_PROGRESS as typeof RCRE_ASYNC_LOAD_DATA_PROGRESS,
        payload
    }),
    asyncLoadDataSuccess: (payload: ASYNC_LOAD_DATA_SUCCESS_PAYLOAD) => ({
        type: RCRE_ASYNC_LOAD_DATA_SUCCESS as typeof RCRE_ASYNC_LOAD_DATA_SUCCESS,
        payload
    }),
    asyncLoadDataFail: (payload: ASYNC_LOAD_DATA_FAIL_PAYLOAD) => ({
        type: RCRE_ASYNC_LOAD_DATA_FAIL as typeof RCRE_ASYNC_LOAD_DATA_FAIL,
        payload
    }),
    syncLoadDataSuccess: (payload: SYNC_LOAD_DATA_SUCCESS_PAYLOAD) => ({
        type: RCRE_SYNC_LOAD_DATA_SUCCESS as typeof RCRE_SYNC_LOAD_DATA_SUCCESS,
        payload
    }),
    syncLoadDataFail: (payload: SYNC_LOAD_DATA_FAIL_PAYLOAD) => ({
        type: RCRE_SYNC_LOAD_DATA_FAIL as typeof RCRE_SYNC_LOAD_DATA_FAIL,
        payload
    }),
    dataCustomerPass: (payload: DATA_CUSTOMER_PASS_PAYLOAD, context: RunTimeContextCollection) => ({
        type: RCRE_DATA_CUSTOMER_PASS as typeof RCRE_DATA_CUSTOMER_PASS,
        payload,
        context
    }),
    undoState: () => ({
        type: RCRE_UNDO_STATE as typeof RCRE_UNDO_STATE
    })
};
