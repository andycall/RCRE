import {Reducer} from 'redux';
import {ITriggerAction, RESET_TRIGGER, TRIGGER_SET_DATA} from './actions';
import {setWith} from '../util/util';

export type TriggerState = any;

export const triggerInitState: TriggerState = {};

export const triggerReducers: Reducer<TriggerState> = (state: TriggerState = triggerInitState, actions: ITriggerAction): TriggerState => {
    switch (actions.type) {
        case TRIGGER_SET_DATA: {
            let payload = actions.payload;
            payload.forEach(pay => {
                let model = pay.model;

                if (!(model in state)) {
                    state = setWith(state, model, {});
                }

                let customer = pay.customer;
                let value = pay.data;

                state = setWith(state, model + '.' + customer, value);
            });

            return state;
        }
        case RESET_TRIGGER: {
            state = {};
            return state;
        }
        default:
            return state;
    }
};
