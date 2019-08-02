import {Store} from 'redux';
import {containerActionCreators} from './Container/action';
import {undoable, createContainerStateHistory} from '../data/history';

/**
 * 回滚container设置的state
 * @param store
 */
export function undoRCREContainerState(store: Store<any>) {
    store.dispatch(containerActionCreators.undoState());
}

/**
 *
 * @param store
 */
export function redoRCREContainerState(store: Store<any>) {
    store.dispatch(containerActionCreators.redoState());
}

export {
    undoable,
    createContainerStateHistory
};