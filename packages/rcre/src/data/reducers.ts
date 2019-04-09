import {combineReducers, Reducer} from 'redux';
import {IContainerState, reducer as container, TMP_MODEL} from '../core/Container/reducer';
import {IState as ITriggerState, reducer as trigger} from '../core/Trigger/reducers';
import {IState as IFormState, reducer as form} from '../core/Form/reducers';

export interface RootState {
    $rcre: RCREState;
}

export interface RCREState {
    container: IContainerState;
    trigger: ITriggerState;
    form: IFormState;
}

const appReducer: Reducer<RootState> = combineReducers<RootState>({
    container,
    trigger,
    form
});

export const rcreReducer: Reducer<any> = (state, action) => {
    if (action.type === '_RESET_STORE_') {
        console.log('reset');
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
