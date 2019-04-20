import {Reducer} from 'redux';
import {
    IFormActions, INIT_FORM, SET_FORM, SET_FORM_ITEM, SET_FORM_ITEMS, DELETE_FORM_ITEM,
    DELETE_FORM, RESET_FORM
} from './actions';
import {every, clone} from 'lodash';
import {setWith} from '../util/util';

export type FormState = {
    [s: string]: {
        name: string;
        valid: boolean;
        control: {
            [s: string]: any
        };
    }
};

export const formInitState: FormState = Object.freeze({});

function setFormItem(state: FormState, payload: any, formName: string, formItemName: string) {
    let newState = clone(state);
    if (!(formName in newState)) {
        newState[formName] = {
            name: '',
            valid: false,
            control: {}
        };
    }

    if (!newState[formName].control) {
        newState = setWith(newState, formName + '.control', {});
    }

    newState[formName] = clone(newState[formName]);
    if (!(formItemName in state[formName].control)) {
        newState[formName].control = clone(newState[formName].control);
        newState[formName].control[formItemName] = payload;
    } else {
        newState[formName].control = clone(newState[formName].control);
        newState[formName].control[formItemName] = clone(newState[formName].control[formItemName]);
        Object.assign(newState[formName].control[formItemName], payload);
    }
    newState[formName].valid = every(newState[formName].control, i => i.valid);
    return newState;
}

export const formReducer: Reducer<FormState> = (state: FormState = formInitState, actions: IFormActions): FormState => {
    switch (actions.type) {
        case INIT_FORM: {
            let name = actions.payload.name;

            if (name in state) {
                console.error('检查到Form的name存在冲突, repeat:' + name);
                return state;
            }

            return setWith<FormState>(state, name, actions.payload.data);
        }
        case SET_FORM: {
            let name = actions.payload.name;
            let key = actions.payload.key;

            state[name][key] = actions.payload.value;

            return setWith(state, `${name}.${key}`, actions.payload.value);
        }
        case SET_FORM_ITEM: {
            let payload = actions.payload;
            let formName = payload.formName;
            let formItemName = payload.formItemName;

            if (!(formName in state)) {
                console.error('找不到对应的Form', formName);
                return state;
            }

            return setFormItem(state, payload, formName, formItemName);
        }
        case DELETE_FORM_ITEM: {
            let payload = actions.payload;
            let formName = payload.formName;
            let formItemName = payload.formItemName;

            if (!state[formName]) {
                return state;
            }

            delete state[formName].control[formItemName];

            state[formName].valid = every(state[formName].control, i => i.valid);

            return clone(state);
        }
        case SET_FORM_ITEMS: {
            let payload = actions.payload;
            payload.forEach(pay => {
                let formName = pay.formName;

                if (!(formName in state)) {
                    console.log('找不到对应的Form', formName);
                    return;
                }

                let formItemName = pay.formItemName;
                state = setFormItem(state, pay, formName, formItemName);
            });

            return state;
        }
        case DELETE_FORM: {
            let payload = actions.payload;
            let name = payload.name;
            delete state[name];
            return clone(state);
        }
        case RESET_FORM: {
            state = {};
            return state;
        }
        default:
            return state;
    }
};
