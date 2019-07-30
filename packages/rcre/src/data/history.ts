import {
    RCRE_ASYNC_LOAD_DATA_FAIL,
    RCRE_ASYNC_LOAD_DATA_SUCCESS,
    RCRE_DELETE_DATA,
    RCRE_SET_DATA,
    RCRE_SET_MULTI_DATA,
    RCRE_DATA_CUSTOMER_PASS
} from '../core/Container/action';
import {IContainerState} from '../core/Container/reducer';
import {RootState} from './reducers';

let history: IContainerState[]  = [];

export function undo() {
    return history.pop();
}

const validUNDOAction = [
    RCRE_SET_DATA,
    RCRE_SET_MULTI_DATA,
    RCRE_ASYNC_LOAD_DATA_SUCCESS,
    RCRE_ASYNC_LOAD_DATA_FAIL,
    RCRE_DELETE_DATA,
    RCRE_DATA_CUSTOMER_PASS
];

export const listenForHistory = (store: any) => (next: any) => (action: any) => {
    let type = action.type;

    if (validUNDOAction.includes(type)) {
        let state: RootState = store.getState();

        if (history.length > 100) {
            history.shift();
        }

        history.push(state.$rcre.container);
    }

    return next(action);
};

export function getContainerStateHistory() {
    return history.slice();
}