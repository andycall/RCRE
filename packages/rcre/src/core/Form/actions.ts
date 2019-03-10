// import {ValidateRules} from '../../../rcre-components-antd/components/Form/FormItem';

export const SET_FORM_ITEM = 'SET_FORM_ITEM';
export const DELETE_FORM_ITEM = 'DELETE_FORM_ITEM';
export const SET_FORM_ITEMS = 'SET_FORM_ITEMS';
export const FORM_SUBMIT = 'FORM_SUBMIT';
export const INIT_FORM = 'INIT_FORM';
export const SET_FORM = 'SET_FORM';
export const DELETE_FORM = 'DELETE_FORM';
export const RESET_FORM = 'RESET_FORM';

export type SET_FORM_ITEM_PAYLOAD = {
    /**
     * 表单Name
     */
    formName: string;

    /**
     * 表单元素Name
     */
    formItemName: string;

    /**
     * 表单是否合格
     */
    status?: 'success' | 'warning' | 'error' | 'validating' | undefined;

    /**
     * 表单是否合法
     */
    valid?: boolean;

    /**
     * 是否必须
     */
    required?: boolean;

    /**
     * 各种类型的错误
     */
    errorMsg?: string;

    /**
     * 验证规则
     */
    rules?: any[];

    /**
     * 强制触发表单元素进行验证
     */
    $validate?: boolean;
};

export type DELETE_FORM_ITEM_PAYLOAD = {
    /**
     * 表单的Key
     */
    formName: string;
    /**
     * 表单元素的Key
     */
    formItemName: string;
};

export type FORM_SUBMIT_PAYLOAD = {
    name: string;
};

export type INIT_FORM_PAYLOAD = {
    name: string;
    data: Object;
};

export type SET_FORM_PAYLOAD = {
    name: string;
    key: string;
    value: any;
};

export type DELETE_FORM_PAYLOAD = {
    name: string;
};

export type IActions = {
    INIT_FORM: {
        type: typeof INIT_FORM,
        payload: INIT_FORM_PAYLOAD
    },
    SET_FORM: {
        type: typeof SET_FORM,
        payload: SET_FORM_PAYLOAD
    },
    SET_FORM_ITEM: {
        type: typeof SET_FORM_ITEM,
        payload: SET_FORM_ITEM_PAYLOAD,
    },
    DELETE_FORM_ITEM: {
        type: typeof DELETE_FORM_ITEM,
        payload: DELETE_FORM_ITEM_PAYLOAD
    },
    DELETE_FORM: {
        type: typeof DELETE_FORM,
        payload: DELETE_FORM_PAYLOAD
    },
    SET_FORM_ITEMS: {
        type: typeof SET_FORM_ITEMS,
        payload: SET_FORM_ITEM_PAYLOAD[],
    },
    FORM_SUBMIT: {
        type: typeof FORM_SUBMIT,
        payload: FORM_SUBMIT_PAYLOAD
    },
    RESET_FORM: {
        type: typeof RESET_FORM
    }
};

export type IFormActions = IActions[keyof IActions];

export const actionCreators = {
    setFormItem: (payload: SET_FORM_ITEM_PAYLOAD) => ({
        type: SET_FORM_ITEM as typeof SET_FORM_ITEM,
        payload
    }),
    deleteFormItem: (payload: DELETE_FORM_ITEM_PAYLOAD) => ({
        type: DELETE_FORM_ITEM as typeof DELETE_FORM_ITEM,
        payload
    }),
    setFormItems: (payload: SET_FORM_ITEM_PAYLOAD[]) => ({
        type: SET_FORM_ITEMS as typeof SET_FORM_ITEMS,
        payload
    }),
    formSubmit: (payload: FORM_SUBMIT_PAYLOAD) => ({
        type: FORM_SUBMIT as typeof FORM_SUBMIT,
        payload
    }),
    initForm: (payload: INIT_FORM_PAYLOAD) => ({
        type: INIT_FORM as typeof INIT_FORM,
        payload
    }),
    setForm: (payload: SET_FORM_PAYLOAD) => ({
        type: SET_FORM as typeof SET_FORM,
        payload
    }),
    deleteForm: (payload: DELETE_FORM_PAYLOAD) => ({
        type: DELETE_FORM as typeof DELETE_FORM,
        payload
    }),
    resetForm: () => ({
        type: RESET_FORM as typeof RESET_FORM
    })
};
