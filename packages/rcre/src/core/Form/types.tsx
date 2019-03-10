// import {ColProps} from '@baidu/native-ads-antd/lib/grid/col';
import {BasicConfig} from '../Container';
import {COREConfig, CoreKind} from '../../types';

export interface ValidateRules {
    /**
     * 字段长度
     */
    len?: number;

    /**
     * 最大值
     */
    max?: number;

    /**
     * 最大长度
     */
    maxLength?: number;

    /**
     * 最大unicode字符长度
     */
    maxUnicodeLength?: number;

    /**
     * 最大中文字符长度
     */
    maxChineseLength?: number;

    /**
     * 最小值
     */
    min?: number;

    /**
     * 最小长度
     */
    minLength?: number;

    /**
     * 最小unicode长度
     */
    minUnicodeLength?: number;

    /**
     * 最小中文字符长度
     */
    minChineseLength?: number;

    /**
     * 校验文案
     */
    message?: string;

    /**
     * 正则表达式
     */
    pattern?: string | RegExp;

    /**
     * 是否必须
     */
    required?: boolean;

    /**
     * 必须时，空格是否会被认为是错误
     */
    whitespace?: boolean;
}

export type ApiRule = {
    /**
     * 地址
     */
    url: string;
    /**
     * 请求方法
     */
    method: string;
    /**
     * 请求的数据
     */
    data: string | Object;

    /**
     * 使用ExpressionString， 验证接口返回值是否合格
     */
    validate: string;

    /**
     * 表单模式提交
     */
    formSubmit?: boolean;

    /**
     * 在指定条件才会请求接口验证
     */
    condition?: string | boolean;

    /**
     * 错误信息
     */
    errmsg?: string;

    /**
     * 把API验证的返回值写入到数据模型中
     */
    export?: {
        [name: string]: string;
    }

    /**
     * 在验证失败的时候，不写入数据到数据模型
     */
    noExportWhenInvalid?: boolean;
};

export class FormItemConfig<Config> extends BasicConfig {
    type: CoreKind.formItem;
    /**
     * 表单文字
     */
    label?: string;

    /**
     * label 标签布局
     */
    labelCol?: any;

    /**
     * 需要为输入控件设置布局样式时，使用该属性，用法同 labelCol
     */
    wrapperCol?: any;

    /**
     * 使用内置的验证规则
     */
    rules?: ValidateRules[];

    /**
     * 使用ExpressionString来验证
     */
    filterRule?: string;

    /**
     * 使用ExpressionString验证失败的错误信息
     */
    filterErrMsg?: string;

    /**
     * 使用API来验证输入
     */
    apiRule?: ApiRule;

    /**
     * 是否是纯文字类型的表单元素，验证状态默认会设置成true
     */
    isTextFormItem?: boolean;

    /**
     * 是否必须
     */
    required?: boolean;

    /**
     * 是否有反馈提示
     */
    hasFeedBack?: boolean;

    /**
     * 控制的表单元素
     */
    control: (Config | COREConfig<Config>) | (Config | COREConfig<Config>)[];

    /**
     * 额外的说明文字
     */
    extra?: string;
}
