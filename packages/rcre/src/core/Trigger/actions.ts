export const TRIGGER_SET_DATA = 'RCRE_TRIGGER_SET_DATA';
export const RESET_TRIGGER = 'RCRE_RESET_TRIGGER';

export type TRIGGER_SET_DATA_OPTIONS = {
    /**
     * 是否在发生错误的时候持续执行
     */
    keepWhenError?: boolean;

    /**
     * 阻止表单最终的提交
     */
    preventSubmit?: boolean;
};

export type TRIGGER_SET_DATA_PAYLOAD = {
    /**
     * 数据模型Key
     */
    model: string;
    /**
     * customer的名称
     */
    customer: string;
    /**
     * customer的数据
     */
    data: Object;

    /**
     * 额外配置功能
     */
    options?: TRIGGER_SET_DATA_OPTIONS
};

export type IActions = {
    TRIGGER_SET_DATA: {
        type: typeof TRIGGER_SET_DATA,
        payload: TRIGGER_SET_DATA_PAYLOAD[];
    },
    RESET_TRIGGER: {
        type: typeof RESET_TRIGGER
    }
};

export type ITriggerAction = IActions[keyof IActions];

export const actionCreators = {
    triggerSetData: (payload: TRIGGER_SET_DATA_PAYLOAD[]) => ({
        type: TRIGGER_SET_DATA as typeof TRIGGER_SET_DATA,
        payload
    }),
    resetTrigger: () => ({
        type: RESET_TRIGGER as typeof RESET_TRIGGER
    })
};
