import * as React from 'react';
import {
    FormItemState, BasicProps, TriggerContextType
} from '../../types';
import {FormContext} from '../context';
import {getActiveElement} from '../util/util';
import warning from 'warning';
import {RCREFormItem} from './FormItem';

export interface FormProps {
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

export interface RCREFormState {
    name: string;
    valid: boolean;
    validateFirst?: boolean;
    clearAfterSubmit?: boolean;
    errors: {
        [key: string]: any
    };
    touched: {
        [key: string]: any
    };
    control: {
        [s: string]: FormItemState
    };
    isValidating: boolean;
    isSubmitting: boolean;
}

export class RCREForm extends React.Component<FormProps & BasicProps, RCREFormState> {
    private didMount: boolean;
    private formItems: {
        [name: string]: RCREFormItem;
    };

    constructor(props: FormProps & BasicProps) {
        super(props);

        this.didMount = false;
        let name = props.name;

        this.formItems = {};

        this.state = {
            name: name,
            errors: {},
            touched: {},
            valid: false,
            isValidating: false,
            isSubmitting: false,
            validateFirst: props.validateFirst || false,
            clearAfterSubmit: props.clearAfterSubmit || false,
            control: {}
        };
    }

    componentDidMount() {
        this.didMount = true;
    }

    componentWillUnmount() {
        this.didMount = false;
    }

    private $setFormItem = (payload: FormItemState) => {
        let name = payload.formItemName;
        let control = this.state.control;
        control[name] = {
            ...control[name],
            ...payload
        };

        this.setState({
            control: control,
            valid: this.isFormValid(control)
        });
    }

    private $getFormItem = (formItemName: string) => {
        return this.state.control[formItemName];
    }

    private isFormValid = (control: any) => {
        let keys = Object.keys(control);

        return keys.every(key => control[key].valid);
    }

    private $setFormItems = (payload: FormItemState[]) => {
        let control = this.state.control;
        payload.forEach(pay => {
            control[pay.formItemName] = pay;
        });

        this.setState({
            control: control,
            valid: this.isFormValid(control)
        });
    }

    private $deleteFormItem = (itemName: string) => {
        let control = this.state.control;
        delete control[itemName];
        this.setState({
            control: control,
            valid: this.isFormValid(control)
        });
    }

    private getFormItems = () => {
        return Object.keys(this.state.control);
    }

    private resetForm = () => {
        let formItems = this.getFormItems();
        let values = formItems.map(key => ({name: key, value: undefined}));
        this.props.containerContext.$setMultiData(values);
    }

    private registerFormItem = (name: string, component: RCREFormItem) => {
        this.formItems[name] = component;
    }

    public runValidations = async () => {
        let names = Object.keys(this.formItems);
        let valid = true;
        for (let name of names) {
            let formItem = this.formItems[name];

            if (formItem.controlElements[name].disabled) {
                continue;
            }

            let data = this.props.containerContext.$getData(name);
            let v = await formItem.validateFormItem(name, data, {
                apiRule: false
            });

            if (!v) {
                valid = false;
            }
        }

        return valid;
    }

    public submitForm = async () => {
        let control = this.state.control;

        await this.runValidations();

        let submitData = {};
        for (let itemName in control) {
            if (control.hasOwnProperty(itemName)) {
                let data = this.props.containerContext.$getData(itemName);
                submitData[itemName] = data;
            }
        }

        if (!this.didMount) {
            return;
        }

        if (this.props.clearAfterSubmit) {
            this.resetForm();
        }

        if (!this.props.triggerContext) {
            return;
        }

        this.setState({
            isSubmitting: true
        });

        let ret = await this.props.triggerContext.eventHandle('onSubmit', submitData);

        this.setState({
            isSubmitting: false
        });

        return ret;
    }

    public handleSubmit = async (e: React.FormEvent<HTMLFormElement> | undefined, preventSubmit: boolean = false) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        // copy and paste from formik
        // Warn if form submission is triggered by a <button> without a
        // specified `type` attribute during development. This mitigates
        // a common gotcha in forms with both reset and submit buttons,
        // where the dev forgets to add type="button" to the reset button.
        if (
            process.env.NODE_ENV !== 'production' &&
            typeof document !== 'undefined'
        ) {
            // Safely get the active element (works with IE)
            const activeElement = getActiveElement();
            if (
                activeElement !== null &&
                activeElement instanceof HTMLButtonElement
            ) {
                warning(
                    !!(
                        activeElement.attributes &&
                        activeElement.attributes.getNamedItem('type')
                    ),
                    'You submitted a form using a button with an unspecified `type` attribute.  Most browsers default button elements to `type="submit"`. If this is not a submit button, please add `type="button"`.'
                );
            }
        }

        return await this.submitForm();
    }

    render() {
        let $form = this.state;

        return (
            <FormContext.Provider
                value={{
                    $form: $form,
                    $setFormItem: this.$setFormItem,
                    $setFormItems: this.$setFormItems,
                    $deleteFormItem: this.$deleteFormItem,
                    $getFormItem: this.$getFormItem,
                    $resetForm: this.resetForm,
                    $handleSubmit: this.handleSubmit,
                    $registerFormItem: this.registerFormItem,
                    $runValidations: this.runValidations
                }}
            >
                {this.props.children}
            </FormContext.Provider>
        );
    }
}