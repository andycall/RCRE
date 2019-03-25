import {CSSProperties} from 'react';
import {ContainerConfig} from './core/Container/AbstractContainer';
import {
    GridItem
} from './core/Container/BasicComponent';
import {DataCustomer} from './core/DataCustomer/index';
import {RowConfig} from './core/Layout/Row/Row';
import {DivConfig} from './core/Layout/Div/Div';
import {BasicConnectProps} from './core/Connect/basicConnect';
import {TextConfig} from './core/Layout/Text/Text';
import {FormConfig, FormItemConfig} from './core/Form';
import moment from 'moment';
import {RCREOptions} from './core/Page';
import {TriggerEventItem} from './core/Trigger/Trigger';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Overwrite<T, U> = Omit<T, Extract<keyof T, keyof U>> & U;

// 扩展原有的类型
export type ExtendType<T1, extendType> = {
    [P in keyof T1]: T1[P] | extendType;
};

export enum CoreKind {
    container = 'container',
    text = 'text',
    row = 'row',
    div = 'div',
    form = 'form',
    formItem = 'formItem'
}

export type COREConfig<T> =
    ContainerConfig<T>
    | TextConfig
    | RowConfig<T>
    | DivConfig<T>
    | FormConfig<T>
    | FormItemConfig<T>;

export type ConfigFactory<Config, Extend> = BasicConfig & ExtendType<Overwrite<Config, Extend>, string> & Extend;
export type DriverPropsFactory<Config extends BasicConfig, Props, Collection extends BasicConfig, Extend = {}> =
    BasicConfig &
    Props &
    Extend &
    BasicConnectProps<BasicContainerPropsInterface<Config>, Collection>;

export type RunTimeType = runTimeType;
export type runTimeType = {
    $data: any;
    $query?: Object;
    $global?: any;
    $item?: Object;
    $trigger?: {
        $SELF_PASS_CUSTOMER?: Object;
        $PARENT_PASS_CUSTOMER?: Object;
    };
    $index?: number;
    $now?: moment.Moment;
    $moment?: typeof moment;
    $args?: Object;
    $output?: Object;
    $iterator?: Object;
    $parent?: Object;
    $form?: Object;
    $prev?: any;
};

export type ExpressionStringType = string;

export class BasicConfig extends GridItem {
    /**
     * 组件类型
     */
    type: string;

    /**
     * 是否隐藏
     */
    hidden?: boolean | ExpressionStringType;

    /**
     * 字级数据Key
     */
    name?: string;

    /**
     * 默认数据
     */
    defaultValue?: any;

    /**
     * 延迟同步数据
     */
    debounce?: number | ExpressionStringType;

    /**
     * 关闭组件数据自清空的功能
     */
    disabledAutoClear?: boolean;

    /**
     * 是否禁用
     */
    disabled?: boolean | ExpressionStringType;

    /**
     * 不作为表单提交侦测的表单元素
     */
    notFormItem?: boolean;

    /**
     * 停止使用name进行数据同步
     */
    disableSync?: boolean;

    /**
     * 如果设置了disableSync，直接使用value传值
     */
    value?: any;

    /**
     * 是否显示
     */
    show?: boolean | ExpressionStringType;

    /**
     * 组件从container传值和组件向组件传值中的过滤器
     * @deprecated
     */
    transform?: {
        in: string;
        out: string;
    };

    /**
     * 父级属性映射
     */
    parentMapping?: Object;

    /**
     * CSS class
     */
    className?: string;

    /**
     * HTML ID 属性
     */
    id?: string;

    /**
     * 内联CSS属性
     */
    style?: CSSProperties;

    /**
     * 事件触发
     */
    trigger?: TriggerEventItem[];

    /**
     * 关闭当组件被销毁时，就自动清除在container中的值
     */
    disableClearWhenDestroy?: boolean;

    /**
     * 当组件被销毁是，清除container中的值
     */
    clearWhenDestroy?: boolean;

    /**
     * 只清除表单数据不清楚container中的数据
     */
    clearFormStatusOnlyWhenDestroy?: boolean;

    /**
     * 是否作为表单输入元素
     */
    formItem?: boolean;

    __TEST_NAME__?: string;
}

export type BasicContainerSetDataOptions = {
    /**
     * 强制触发刷新
     */
    forceUpdate?: boolean;
    /**
     * 设置值到TMP_STORE
     */
    isTmp?: boolean;

    /**
     * 是否是分页
     */
    pagination?: {
        paginationQueryParams: string[];
    };

    /**
     * 自定义同步的Key值
     */
    name?: string;

    /**
     * 跳过debounce缓存，直接设置container的值
     */
    skipDebounce?: boolean;

    /**
     * 不使用transform
     */
    noTransform?: boolean;
};

export class BasicContainerPropsInterface<Config extends BasicConfig> {
    // 调试模式
    debug?: boolean;

    info: Config;

    /**
     * 当前Container的数据模型对象
     */
    $data?: Object;

    /**
     * 父级Container组件的数据模型对象
     */
    $parent?: Object;

    /**
     * RCRE 渲染配置
     */
    options?: RCREOptions;

    /**
     * Trigger组件的数据模型对象
     */
    $trigger?: Object;

    /**
     * 通过表格组件, 渲染之后, 获取到的每一行的数据
     */
    $item?: Object;

    /**
     * 通过表格组件, 渲染之后, 获取到的第几行
     */
    $index?: number;

    /**
     * 表单状态变量
     */
    $form?: {
        layout?: string;
        name?: string;
        control?: any;
    };

    /**
     * React组件Key
     */
    key?: string | number;

    /**
     * 底层组件设置数据模型值使用
     */
    $setData?: (name: string, value: any, options?: BasicContainerSetDataOptions) => void;

    /**
     * 底层组件获取数据模型值使用
     */
    $getData?: (name: string | number, props: BasicContainerPropsInterface<Config>, isTmp?: boolean) => any | null;

    /**
     * 底层组件清除某个字段的数据
     */
    $deleteData?: (name: string, isTmp?: boolean) => void;

    /**
     * 清除Form的数据
     */
    $deleteFormItem?: (name: string) => void;

    /**
     * 底层组件设置多组数据模型值
     */
    $setMultiData?: (items: { name: string, value: any, isTmp?: boolean }[]) => void;

    /**
     * Trigger注入的通用事件处理函数, 所有事件处理都走这里
     */
    eventHandle?: (eventName: string, args: Object, options?: object) => void;

    /**
     * 来自Container的数据消耗者实例
     */
    dataCustomer?: DataCustomer<any>;

    /**
     * 父级的数据模型Key
     */
    model?: string;

    /**
     * Trigger组件自动生成的回调函数
     */
    injectEvents: {
        [fc: string]: Function
    };
}