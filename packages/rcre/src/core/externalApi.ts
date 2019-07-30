import {Store} from 'redux';
import {containerActionCreators} from './Container/action';
import {getHistory} from '../data/history';

/**
 * 回滚container设置的state
 * @param store
 */
export function undoRCREContainerState(store: Store<any>) {
    store.dispatch(containerActionCreators.undoState());
}

export {
    getHistory
};