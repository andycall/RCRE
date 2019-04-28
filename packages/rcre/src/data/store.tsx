import {applyMiddleware, createStore, Store, compose, combineReducers} from 'redux';
import {rcreReducer, RootState} from './reducers';
import {triggerEvents} from './events';

const composeEnhancers = ((
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
) || compose)(applyMiddleware(
    triggerEvents
));

export function createReduxStore(): Store<RootState> {
    console.log('create store');
    return createStore<RootState>(
        combineReducers({
            $rcre: rcreReducer
        }),
        composeEnhancers
    );
}

export default createReduxStore;
