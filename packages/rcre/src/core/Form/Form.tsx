import * as React from 'react';
import {BasicConfig, BasicContainer, BasicContainerPropsInterface} from '../Container/types';
import {debounce} from 'lodash';
import {COREConfig, CoreKind} from '../../types';
import {formActions, SET_FORM_ITEM_PAYLOAD} from "./actions";
import {createChild, store} from "../../index";

export class FormConfig<Config> extends BasicConfig {
    type: CoreKind.form;
    /**
     * 子级组件
     */
    children: (Config | COREConfig<Config>)[];

    /**
     * 表单的数据模型，会包含整个表单内部所有元素的数据
     */
    name?: string;

    /**
     * 提交之后清除表单数据
     */
    clearAfterSubmit?: boolean;

    /**
     * 当某一规则校验不通过时，是否停止剩下的规则的校验
     */
    validateFirst?: boolean;
}

export class FormPropsInterface<Config extends BasicConfig> extends BasicContainerPropsInterface<Config> {
    /**
     * 传入的数据配置
     */
    info: Config;
}

export interface FormItemState {
    valid: boolean;
    formItemName: string;
    rules: any[];
    status: string;
    errorMsg: string;
    $validate?: boolean;
    required: boolean;
}

export interface FormState {
    name: string;
    layout: string;
    control: {
        [name: string]: FormItemState
    };
}

export interface FormProps<Config extends BasicConfig> extends FormPropsInterface<Config> {}

export type FormConnectOptions = {};

// export const FormContext = React.createContext({
//     $setFormItem: (payload: SET_FORM_ITEM_PAYLOAD) => {},
//     $setFormItems: (payload: SET_FORM_ITEM_PAYLOAD[]) => {},
//     $deleteFormItem: (itemName: string) => {},
//     $formSubmit: (event: React.FormEvent<HTMLFormElement>) => {}
// });

export function formConnect(options: FormConnectOptions = {}): (Wrapper: React.ComponentClass<any>) => React.ComponentClass<any> {
    return (Wrapper) => {
        return class RCREFormContainer<Config extends FormConfig<Config>> extends BasicContainer<Config, FormProps<Config>, {}> {
            static displayName = 'RCREFormConnect(' + Wrapper.name + ')';
            private info: Config;
            private delaySubmit: any;
            private formItemFunctions: any;

            constructor(props: FormProps<Config>) {
                super(props);

                this.formItemFunctions = {
                    $setFormItem: this.$setFormItem,
                    $setFormItems: this.$setFormItems,
                    $deleteFormItem: this.$deleteFormItem,
                    $formSubmit: this.handleSubmit
                };

                this.info = this.getPropsInfo(this.props.info, props);
                let name = this.info.name;

                if (!name) {
                    return;
                }

                store.dispatch(formActions.initForm({
                    name: name,
                    data: {
                        ...this.info,
                        name: name,
                        validateFirst: this.info.validateFirst || false,
                        clearAfterSubmit: this.info.clearAfterSubmit || false,
                        control: {}
                    }
                }));

                this.delaySubmit = debounce(this.triggerSubmit.bind(this), 500, {
                    leading: true,
                    trailing: false
                });
            }

            componentWillUnmount() {
                super.componentWillUnmount();
                if (this.info.name) {
                    store.dispatch(formActions.deleteForm({
                        name: this.info.name
                    }));
                }
            }

            private $setFormItem = (payload: SET_FORM_ITEM_PAYLOAD) => {
                if (this.info.name) {
                    store.dispatch(formActions.setFormItem({
                        formName: this.info.name,
                        formItemName: payload.formItemName!,
                        ...payload
                    }));
                }
            };

            private $setFormItems = (payload: SET_FORM_ITEM_PAYLOAD[]) => {
                if (this.info.name) {
                    payload = payload.map(pay => ({
                        formName: this.info.name,
                        formItemName: pay.formItemName,
                        ...pay
                    }));

                    store.dispatch(formActions.setFormItems(payload));
                }
            };

            private $deleteFormItem = (itemName: string) => {
                if (this.info.name) {
                    store.dispatch(formActions.deleteFormItem({
                        formName: this.info.name,
                        formItemName: itemName
                    }));
                }
            };

            public handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                event.stopPropagation();

                this.delaySubmit();
            };

            public triggerSubmit = async (preventSubmit: boolean = false) => {
                if (!this.info.name) {
                    return;
                }

                let state = store.getState();
                let $form = state.form[this.info.name];
                let info = this.getPropsInfo(this.props.info);
                let control = $form.control;

                let invalidItems: SET_FORM_ITEM_PAYLOAD[] = [];
                let submitData = {};

                for (let itemName in control) {
                    if (control.hasOwnProperty(itemName)) {
                        let item: SET_FORM_ITEM_PAYLOAD = control[itemName];
                        let valid = item.valid;

                        let data = this.getValueFromDataStore(itemName);
                        submitData[itemName] = data;

                        // 设置validateFirst只验证第一个表单控件
                        if (!valid && info.name) {
                            if (info.validateFirst) {
                                store.dispatch(formActions.setFormItem({
                                    formName: info.name,
                                    formItemName: itemName,
                                    $validate: true
                                }));
                                this.forceUpdate();
                                return;
                            }

                            invalidItems.push({
                                formName: info.name,
                                formItemName: itemName,
                                $validate: true
                            });
                        }
                    }
                }

                if (invalidItems.length > 0) {
                    store.dispatch(formActions.setFormItems(invalidItems));
                    this.forceUpdate();
                    return;
                }

                if (this.props.info.clearAfterSubmit && this.props.$setMultiData) {
                    let items = Object.keys(submitData).map(key => ({
                        name: key,
                        value: ''
                    }));

                    this.props.$setMultiData(items);
                }

                return await this.commonEventHandler('onSubmit', submitData, {
                    preventSubmit: preventSubmit
                });
            };

            render() {
                this.info = this.getPropsInfo(this.props.info);
                let state = store.getState();

                if (!this.info.name) {
                    return <div>Form组件需要一个name属性</div>;
                }

                let $form = state.form[this.info.name] || {};

                let children = this.info.children;

                if (!(children instanceof Array)) {
                    return <div>children props should be array</div>;
                }

                let childElement = children.map((child, index) => {
                    child = this.getPropsInfo(child, this.props, [], false, ['show', 'hidden']);

                    let childNode = createChild(child, {
                        ...this.props,
                        formItemFunctions: this.formItemFunctions,
                        info: child,
                        $form: $form,
                        key: `form_element_${index}`
                    });

                    return this.renderChildren(child, childNode);
                });

                let form = (
                    <Wrapper
                        {...this.info}
                        onSubmit={this.handleSubmit}
                    >
                        {childElement}
                    </Wrapper>
                );

                return (
                    <div
                        className={'rcre-form-container ' + (this.info.className || '')}
                        style={this.info.style}
                    >
                        {this.renderChildren(this.info, form)}
                    </div>
                );
            }
        }
    };
}