import {applyMiddleware, createStore, Store, compose} from 'redux';
import {rootReducer, RootState} from './reducers';
import {triggerEvents} from './events';

const composeEnhancers = ((
    window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
) || compose)(applyMiddleware(
    triggerEvents
));

function configureStore(): Store<RootState> {
    return createStore<RootState>(
        rootReducer,
        composeEnhancers
    );
}

export default configureStore;
