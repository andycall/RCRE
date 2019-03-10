import {combineReducers, Reducer} from 'redux';
import {IContainerState, reducer as container, TMP_MODEL} from '../core/Container/reducer';
import {IState as ITriggerState, reducer as trigger} from '../core/Trigger/reducers';
import {IState as IFormState, reducer as form} from '../core/Form/reducers';

export interface RootState {
    container: IContainerState;
    trigger: ITriggerState;
    form: IFormState;
}

export const appReducer: Reducer<RootState> = combineReducers<RootState>({
    container,
    trigger,
    form
});

export const rootReducer: Reducer<RootState> = (state, action) => {
    if (action.type === '_RESET_STORE_') {
        // @ts-ignore
        return {
            container: {
                [TMP_MODEL]: {}
            },
            form: {},
            trigger: {}
        };
    }

    return appReducer(state, action);
};
