import * as React from 'react';
import {BasicConfig, BasicContainer, BasicContainerPropsInterface} from '../Container/types';
import {connect} from 'react-redux';
import {RootState} from '../../data/reducers';
import {bindActionCreators, Dispatch} from 'redux';
import {actionCreators, IFormActions, SET_FORM_ITEM_PAYLOAD} from './actions';
import {filterExpressionData} from '../util/vm';
import {isEmpty, clone} from 'lodash';
import {COREConfig, CoreKind} from '../../types';

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
     * 表单布局
     */
    layout?: 'horizontal' | 'vertical' | 'inline';

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

export interface FormProps<Config extends BasicConfig> extends FormPropsInterface<Config> {
    /**
     * 当前Form的数据模型
     */
    $form: FormState;

    /**
     * 设置Form数据
     */
    setFormItem: typeof actionCreators.setFormItem;

    /**
     * 清除某个FormItem的数据
     */
    deleteFormItem: typeof actionCreators.deleteFormItem;

    /**
     * 批量设置Form数据
     */
    setFormItems: typeof actionCreators.setFormItems;

    /**
     * 表单提交
     */
    formSubmit: typeof actionCreators.formSubmit;

    /**
     * 初始化表单
     */
    initForm: typeof actionCreators.initForm;

    /**
     * 删除表单
     */
    deleteForm: typeof actionCreators.deleteForm;

    /**
     * 更新Form组件的属性
     */
    setForm: typeof actionCreators.setForm;
}

class RCREFormContainer<Config extends FormConfig<Config>> extends BasicContainer<Config, FormProps<Config>, {}> {
    constructor(props: FormProps<Config>) {
        super(props);

        let info = this.props.info;
        let name = info.name;

        if (!name) {
            return;
        }

        info = filterExpressionData(info);
        this.props.initForm({
            name,
            data: {
                name: info.name,
                layout: info.layout || 'horizontal',
                validateFirst: info.validateFirst || false,
                clearAfterSubmit: info.clearAfterSubmit || false,
                control: {}
            }
        });

        this.$setFormItem = this.$setFormItem.bind(this);
        this.$setFormItems = this.$setFormItems.bind(this);
        this.$deleteFormItem = this.$deleteFormItem.bind(this);
    }

    componentWillReceiveProps(nextProps: FormProps<Config>) {
        let info = this.getPropsInfo(nextProps.info, nextProps);

        if (info.layout && info.layout !== nextProps.$form['layout']) {
            this.props.setForm({
                name: info.name!,
                key: 'layout',
                value: info.layout
            });
        }
    }

    componentWillUnmount() {
        let info = this.getPropsInfo(this.props.info);

        if (info.name) {
            this.props.deleteForm({
                name: info.name
            });
        }
    }

    private $setFormItem(payload: SET_FORM_ITEM_PAYLOAD) {
        if (this.props.info.name) {
            this.props.setFormItem({
                formName: this.props.info.name,
                formItemName: payload.formItemName!,
                ...payload
            });
        }
    }

    private $setFormItems(payload: SET_FORM_ITEM_PAYLOAD[]) {
        if (this.props.info.name) {
            payload = payload.map(pay => ({
                formName: this.props.info.name,
                formItemName: pay.formItemName,
                ...pay
            }));

            this.props.setFormItems(payload);
        }
    }

    private $deleteFormItem(itemName: string) {
        if (this.props.info.name) {
            this.props.deleteFormItem({
                formName: this.props.info.name,
                formItemName: itemName
            });
        }
    }

    render() {
        let info = this.getPropsInfo(this.props.info);
        let $form = this.props.$form;

        if (!info.name) {
            return <div>Form组件需要一个name属性</div>;
        }

        if (isEmpty($form)) {
            return <div />;
        }

        let children = React.Children.map(this.props.children, (child: React.ReactElement<any>) => {
            return React.cloneElement(child, {
                ...this.props,
                $form: clone($form),
                $setFormItem: this.$setFormItem,
                $setFormItems: this.$setFormItems,
                $deleteFormItem: this.$deleteFormItem,
                $formSubmit: this.props.formSubmit,
                $initForm: this.props.initForm
            });
        });

        return (
            <div
                className={'rcre-form-container ' + (info.className || '')}
                style={info.style}
            >
                {children}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: FormPropsInterface<any>) => {
    if (!ownProps.info.name) {
        console.error('Form组件需要name属性作为数据存储Key');
        return {
            $form: {}
        };
    }

    return {
        $form: state.form[ownProps.info.name] || {}
    };
};

const mapDispatchToProps = (dispatch: Dispatch<IFormActions>) => bindActionCreators({
    setFormItem: actionCreators.setFormItem,
    deleteFormItem: actionCreators.deleteFormItem,
    formSubmit: actionCreators.formSubmit,
    initForm: actionCreators.initForm,
    setForm: actionCreators.setForm,
    deleteForm: actionCreators.deleteForm,
    setFormItems: actionCreators.setFormItems
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RCREFormContainer);
