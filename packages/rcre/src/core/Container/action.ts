/**
 * @file Container组件的Action
 * @author dongtiancheng
 */
import {BasicContainerSetDataOptions} from '../../types';

export const INIT_CONTAINER = 'INIT_CONTAINER';
export const SET_DATA = 'SET_DATA';
export const SET_MULTI_DATA = 'SET_MULTI_DATA';
export const RESET_CONTAINER = 'RESET_CONTAINER_STORE';
export const DELETE_DATA = 'DELETE_DATA';
export const CLEAR_DATA = 'CLEAR_DATA';
export const SYNC_LOAD_DATA_SUCCESS = 'SYNC_LOAD_DATA_SUCCESS';
export const SYNC_LOAD_DATA_FAIL = 'SYNC_LOAD_DATA_FAIL';
export const ASYNC_LOAD_DATA_PROGRESS = 'ASYNC_LOAD_DATA_PROGRESS';
export const ASYNC_LOAD_DATA_SUCCESS = 'ASYNC_LOAD_DATA_SUCCESS';
export const ASYNC_LOAD_DATA_FAIL = 'ASYNC_LOAD_DATA_FAIL';
export const DATA_CUSTOMER_PASS = 'DATA_CUSTOMER_PASS';
export type SET_DATA_PAYLOAD = {
    name: string;
    value: any;
    options?: BasicContainerSetDataOptions,
    parent?: string;
};
export type DELETE_DATA_PAYLOAD = {
    name: string;
    parent?: string;
    isTmp?: boolean;
};
export type INIT_CONTAINER_PAYLOAD = {
    model: string;
    data: any;
};
export type SET_MULTI_DATA_PAYLOAD = ({
    name: string;
    value: any;
    isTmp?: boolean;
})[];

export type CLEAR_DATA_PAYLOAD = {
    model: string;
    context: Object;
};
export type ASYNC_LOAD_DATA_PROGRESS_PAYLOAD = {
    model: string;
};
export type ASYNC_LOAD_DATA_SUCCESS_PAYLOAD = {
    model: string;
    data: any;
    context: Object
};
export type ASYNC_LOAD_DATA_FAIL_PAYLOAD = {
    model: string;
    error: any;
};
export type SYNC_LOAD_DATA_SUCCESS_PAYLOAD = {
    model: string;
    data: any
    context: Object;
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
        type: typeof INIT_CONTAINER,
        payload: INIT_CONTAINER_PAYLOAD,
        context: object
    },
    SET_DATA: {
        type: typeof SET_DATA,
        payload: SET_DATA_PAYLOAD,
        model: string;
        context: Object;
    },
    SET_MULTI_DATA: {
        type: typeof SET_MULTI_DATA,
        payload: SET_MULTI_DATA_PAYLOAD,
        model: string,
        context: Object
    },
    ASYNC_LOAD_DATA_PROGRESS: {
        type: typeof ASYNC_LOAD_DATA_PROGRESS,
        payload: ASYNC_LOAD_DATA_PROGRESS_PAYLOAD
    },
    ASYNC_LOAD_DATA_SUCCESS: {
        type: typeof ASYNC_LOAD_DATA_SUCCESS,
        payload: ASYNC_LOAD_DATA_SUCCESS_PAYLOAD
    },
    ASYNC_LOAD_DATA_FAIL: {
        type: typeof ASYNC_LOAD_DATA_FAIL,
        payload: ASYNC_LOAD_DATA_FAIL_PAYLOAD
    },
    SYNC_LOAD_DATA_SUCCESS: {
        type: typeof SYNC_LOAD_DATA_SUCCESS,
        payload: SYNC_LOAD_DATA_SUCCESS_PAYLOAD
    },
    SYNC_LOAD_DATA_FAIL: {
        type: typeof SYNC_LOAD_DATA_FAIL,
        payload: SYNC_LOAD_DATA_FAIL_PAYLOAD
    },
    DELETE_DATA: {
        type: typeof DELETE_DATA,
        payload: DELETE_DATA_PAYLOAD,
        model: string;
        context: Object;
    },
    CLEAR_DATA: {
        type: typeof CLEAR_DATA,
        payload: CLEAR_DATA_PAYLOAD
    },
    RESET_STORE: {
        type: typeof RESET_CONTAINER
    },
    DATA_CUSTOMER_PASS: {
        type: typeof DATA_CUSTOMER_PASS,
        payload: DATA_CUSTOMER_PASS_PAYLOAD,
        context: Object
    }
};

export type IContainerAction = IActions[keyof IActions];

export const actionCreators = {
    initContainer: (payload: INIT_CONTAINER_PAYLOAD, context: object) => ({
        type: INIT_CONTAINER as typeof INIT_CONTAINER,
        payload,
        context
    }),
    setData: (payload: SET_DATA_PAYLOAD, model: string, context: Object) => ({
        type: SET_DATA as typeof SET_DATA,
        payload,
        model,
        context
    }),
    setMultiData: (payload: SET_MULTI_DATA_PAYLOAD, model: string, context: Object) => ({
        type: SET_MULTI_DATA as typeof SET_MULTI_DATA,
        payload,
        model,
        context
    }),
    deleteData: (payload: DELETE_DATA_PAYLOAD, model: string, context: Object) => ({
        type: DELETE_DATA as typeof DELETE_DATA,
        payload,
        model,
        context
    }),
    resetContainer: () => ({
        type: RESET_CONTAINER as typeof RESET_CONTAINER
    }),
    clearData: (payload: CLEAR_DATA_PAYLOAD) => ({
        type: CLEAR_DATA as typeof CLEAR_DATA,
        payload
    }),
    asyncLoadDataProgress: (payload: ASYNC_LOAD_DATA_PROGRESS_PAYLOAD) => ({
        type: ASYNC_LOAD_DATA_PROGRESS as typeof ASYNC_LOAD_DATA_PROGRESS,
        payload
    }),
    asyncLoadDataSuccess: (payload: ASYNC_LOAD_DATA_SUCCESS_PAYLOAD) => ({
        type: ASYNC_LOAD_DATA_SUCCESS as typeof ASYNC_LOAD_DATA_SUCCESS,
        payload
    }),
    asyncLoadDataFail: (payload: ASYNC_LOAD_DATA_FAIL_PAYLOAD) => ({
        type: ASYNC_LOAD_DATA_FAIL as typeof ASYNC_LOAD_DATA_FAIL,
        payload
    }),
    syncLoadDataSuccess: (payload: SYNC_LOAD_DATA_SUCCESS_PAYLOAD) => ({
        type: SYNC_LOAD_DATA_SUCCESS as typeof SYNC_LOAD_DATA_SUCCESS,
        payload
    }),
    syncLoadDataFail: (payload: SYNC_LOAD_DATA_FAIL_PAYLOAD) => ({
        type: SYNC_LOAD_DATA_FAIL as typeof SYNC_LOAD_DATA_FAIL,
        payload
    }),
    dataCustomerPass: (payload: DATA_CUSTOMER_PASS_PAYLOAD, context: Object) => ({
        type: DATA_CUSTOMER_PASS as typeof DATA_CUSTOMER_PASS,
        payload,
        context
    })
};
