import {combineReducers, Reducer} from 'redux';
import {IContainerState, containerReducer, TMP_MODEL} from '../core/Container/reducer';
import {TriggerState, triggerReducers} from '../core/Trigger/reducers';
// import {FormState, formReducer} from '../core/Form/reducers';

export interface RootState {
    $rcre: RCREState;
}

export interface RCREState {
    container: IContainerState;
    trigger: TriggerState;
    // form: FormState;
}

const appReducer: Reducer<RootState> = combineReducers<RootState>({
    container: containerReducer,
    trigger: triggerReducers,
    // form: formReducer
});

export const rcreReducer: Reducer<any> = (state, action) => {
    if (action.type === '_RESET_STORE_') {
        return {
            container: {
                [TMP_MODEL]: {}
            },
            trigger: {},
            form: {}
        };
    }

    return appReducer(state, action);
};
