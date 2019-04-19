import * as React from 'react';
import {RootState} from '../../data/reducers';
import {
    FormItemState, BasicProps, TriggerContextType
} from '../../types';
import {FormContext} from '../context';
import {formActions, SET_FORM_ITEM_PAYLOAD} from './actions';

export interface FormProps extends BasicProps {
    /**
     * 表单的数据模型，会包含整个表单内部所有元素的数据
     */
    name: string;

    /**
     * 延迟表单提交的时间，可用于阻止表单多次提交
     */
    debounce?: number;

    /**
     * 提交之后清除表单数据
     */
    clearAfterSubmit?: boolean;

    /**
     * 当某一规则校验不通过时，是否停止剩下的规则的校验
     */
    validateFirst?: boolean;

    triggerContext?: TriggerContextType;

    children?: any;
}

export class RCREForm extends React.Component<FormProps, {}> {
    private isSubmitting: boolean;

    constructor(props: FormProps) {
        super(props);

        this.isSubmitting = false;

        let name = props.name;

        if (!name) {
            return;
        }

        props.rcreContext.store.dispatch(formActions.initForm({
            name: name,
            data: {
                name: name,
                valid: false,
                validateFirst: props.validateFirst || false,
                clearAfterSubmit: props.clearAfterSubmit || false,
                control: {}
            }
        }));
    }

    componentWillUnmount() {
        this.props.rcreContext.store.dispatch(formActions.deleteForm({
            name: this.props.name
        }));
    }

    private $setFormItem = (payload: FormItemState) => {
        this.props.rcreContext.store.dispatch(formActions.setFormItem({
            formName: this.props.name,
            formItemName: payload.formItemName!,
            ...payload
        }));
    }

    private $getFormItem = (formItemName: string) => {
        let state: RootState = this.props.rcreContext.store.getState();
        let formState = state.$rcre.form[this.props.name];
        return formState.control[formItemName];
    }

    private $setFormItems = (payload: SET_FORM_ITEM_PAYLOAD[]) => {
        payload = payload.map(pay => ({
            formName: this.props.name,
            formItemName: pay.formItemName,
            ...pay
        }));

        this.props.rcreContext.store.dispatch(formActions.setFormItems(payload));
    }

    private $deleteFormItem = (itemName: string) => {
        this.props.rcreContext.store.dispatch(formActions.deleteFormItem({
            formName: this.props.name,
            formItemName: itemName
        }));
    }

    private getFormItems = () => {
        let state: RootState = this.props.rcreContext.store.getState();
        let formState = state.$rcre.form[this.props.name];
        return Object.keys(formState.control);
    }

    private resetForm = () => {
        let formItems = this.getFormItems();
        let values = formItems.map(key => ({name: key, value: undefined}));
        this.props.containerContext.$setMultiData(values);
    }

    public handleSubmit = async (preventSubmit: boolean = false) => {
        debugger;
        if (!this.props.name) {
            return;
        }

        if (this.isSubmitting) {
            return;
        }

        let name = this.props.name;
        let state: RootState = this.props.rcreContext.store.getState();
        let $form = state.$rcre.form[name];
        // let info = this.getPropsInfo(this.props.info);
        let control = $form.control;

        let invalidItems: SET_FORM_ITEM_PAYLOAD[] = [];
        let submitData = {};

        for (let itemName in control) {
            if (control.hasOwnProperty(itemName)) {
                let item: SET_FORM_ITEM_PAYLOAD = control[itemName];
                let valid = item.valid;

                let data = this.props.containerContext.$getData(itemName);
                submitData[itemName] = data;

                // 设置validateFirst只验证第一个表单控件
                if (!valid && name) {
                    invalidItems.push({
                        formName: name,
                        formItemName: itemName,
                        $validate: true
                    });
                }
            }
        }

        if (invalidItems.length > 0) {
            this.props.rcreContext.store.dispatch(formActions.setFormItems(invalidItems));
            this.forceUpdate();
            return;
        }

        if (this.props.clearAfterSubmit) {
            this.resetForm();
        }

        this.isSubmitting = true;

        if (!this.props.triggerContext) {
            return;
        }

        let ret = await this.props.triggerContext.eventHandle('onSubmit', submitData, {
            preventSubmit: preventSubmit
        });

        this.isSubmitting = false;

        return ret;
    }

    render() {
        let name = this.props.name;
        let state = this.props.rcreContext.store.getState();

        if (!name) {
            return <div>Form组件需要一个name属性</div>;
        }

        let $form = state.$rcre.form[this.props.name] || {};

        return (
            <FormContext.Provider
                value={{
                    $form: $form,
                    $setFormItem: this.$setFormItem,
                    $setFormItems: this.$setFormItems,
                    $deleteFormItem: this.$deleteFormItem,
                    $getFormItem: this.$getFormItem,
                    $resetForm: this.resetForm,
                    $handleSubmit: this.handleSubmit
                }}
            >
                {this.props.children}
            </FormContext.Provider>
        );
    }
}