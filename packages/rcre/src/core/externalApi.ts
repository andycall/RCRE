import {Store} from 'redux';
import {containerActionCreators} from './Container/action';

/**
 * 回滚container设置的state
 * @param store
 */
export function undoRCREContainerState(store: Store<any>) {
    store.dispatch(containerActionCreators.undoState());
}