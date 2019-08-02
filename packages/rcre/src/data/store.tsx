import {applyMiddleware, createStore, Store, compose, combineReducers} from 'redux';
import {ContainerStateHistory, undoable} from './history';
import {rcreReducer, RootState} from './reducers';
import {triggerEvents} from './events';

const composeEnhancers = ((
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
) || compose)(applyMiddleware(
    triggerEvents
));

export function createReduxStore(history?: ContainerStateHistory<any>): Store<RootState> {
    return createStore<RootState>(
        combineReducers({
            $rcre: undoable(rcreReducer, history)
        }),
        composeEnhancers
    );
}

export default createReduxStore;
