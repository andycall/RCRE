import {applyMiddleware, createStore, Store, compose, combineReducers} from 'redux';
import {rcreReducer, RootState} from './reducers';
import {triggerEvents} from './events';

const composeEnhancers = ((
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
) || compose)(applyMiddleware(
    triggerEvents
));

function configureStore(): Store<RootState> {
    return createStore<RootState>(
        combineReducers({
            $rcre: rcreReducer
        }),
        composeEnhancers
    );
}

export default configureStore;
