import {ParsedUrlQuery} from 'querystring';
import {CSSProperties} from 'react';
import {Store} from 'redux';
import {UrlWithStringQuery} from 'url';
// import {ContainerConfig} from './core/Container/AbstractContainer';
import {DataCustomer} from './core/DataCustomer/index';
import {DataProviderEvent} from "./core/Events/dataProviderEvent";
import {Events} from './core/Events/index';
// import {RowConfig} from './core/Layout/Row/Row';
// import {DivConfig} from './core/Layout/Div/Div';
// import {BasicConnectProps} from './core/Connect/basicConnect';
// import {TextConfig} from './core/Layout/Text/Text';
import {SET_FORM_ITEM_PAYLOAD} from './core/Form';
import moment from 'moment';
import {gridPositionItems} from './core/Layout/Row/Row';
import {ContainerNode} from './core/Service/ContainerDepGraph';
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

// export type COREConfig<T> =
//     ContainerConfig
//     | TextConfig
//     | RowConfig<T>
//     | DivConfig<T>
//     | FormConfig<T>
//     | FormItemConfig<T>;

// export type ConfigFactory<Config, Extend> = BasicConfig & ExtendType<Overwrite<Config, Extend>, string> & Extend;
// export type DriverPropsFactory<Config extends BasicConfig, Props, Collection extends BasicConfig, Extend = {}> =
//     BasicConfig &
//     Props &
//     Extend &
//     BasicConnectProps<BasicContainerPropsInterface, Collection>;

export type runTimeType = RunTimeType;
type $itemType = {
    $parentItem?: $itemType;
    $parentIndex?: number;
    [key: string]: any;
};
export interface RunTimeType {
    $data: any;
    $query?: any;
    $value?: any;
    $name?: any;
    $global?: any;
    $item?: $itemType;
    $location: any;
    $trigger?: any;
    $index?: number;
    $now?: moment.Moment;
    $moment?: typeof moment;
    $args?: any;
    $output?: any;
    $iterator?: any;
    $parent?: any;
    $form?: any;
    $prev?: any;
}

export interface PropsRunTimeType extends RunTimeType {
    $parent: any;
}

export interface TriggerRunTimeType extends RunTimeType {
    $trigger: any;
}

export interface InteratorRunTimeType extends RunTimeType {
    $item: any;
    $index: number;
}

export type ExpressionStringType = string;

export class BasicConfig {
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

export type ContainerSetDataOption = {
    /**
     * 强制触发刷新
     */
    forceUpdate?: boolean;

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
};

export type rawJSONType = string | number | null | boolean | Object;
export type originJSONType = rawJSONType | rawJSONType[];

export type defaultData = {
    [s: string]: ESFunc | any;
};

export type BindItem = {
    child: string;
    parent: string;
    transform?: string
};

export interface ContainerNodeOptions {
    /**
     * 同步删除无状态数据到父级
     */
    syncDelete?: boolean;

    /**
     * 使用字符串的export属性，并强制清除当前container和父级container相关的Key
     */
    forceSyncDelete?: boolean;

    /**
     * 当前container组件被销毁的时候，同步清除父级和当前container所有相关的key
     */
    clearDataToParentsWhenDestroy?: boolean;

    /**
     * 不允许同步undefined或者null到父级的container上
     */
    noNilToParent?: boolean;
}

export type ESFunc = (runTime: runTimeType) => any;

export class BasicContainerPropsInterface {
    // 调试模式
    debug?: boolean;

    info: any;

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
    $setData?: (name: string, value: any, options?: ContainerSetDataOption) => void;

    /**
     * 底层组件获取数据模型值使用
     */
    $getData?: (name: string | number, props: BasicContainerPropsInterface, isTmp?: boolean) => any | null;

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
    dataCustomer?: DataCustomer;

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

export interface BasicProps {
    /**
     * 来自RCRE的context对象
     */
    rcreContext: RCREContextType;

    /**
     * 来自Foreach组件的context对象
     */
    iteratorContext: IteratorContextType;

    /**
     * 来自Form组件的context对象
     */
    formContext?: FormContextType;

    /**
     * 来自FormItem组件的context对象
     */
    formItemContext?: FormItemContextType;

    /**
     * 来自父级Container的context对象
     */
    containerContext: ContainerContextType;

    /**
     * 来自Trigger组件的context对象
     */
    triggerContext?: TriggerContextType;

    gridCount?: number;
    gridPosition?: gridPositionItems;
    gridPaddingLeft?: number;
    gridPaddingRight?: number;
    gridLeft?: number;
    gridTop?: number;
    gridWidth?: number | string;
    gridHeight?: number | string;
}

/**
 * Provider 对象数据源配置
 */
export interface ProviderSourceConfig {
    /**
     * provider模式
     */
    mode: string;
    /**
     * Provider配置
     */
    config?: any;

    /**
     * 请求发起所依赖的参数
     */
    requiredParams?: string[] | string;

    /**
     * 不仅判断参数的key，同样如果每个参数的value转义之后都是true
     */
    strictRequired?: boolean | string;

    /**
     * 使用ExpressionString来决定是否请起数据
     */
    condition?: string | boolean;

    /**
     * Provider命名空间
     */
    namespace: string;

    /**
     * Provider返回值映射[弃用]
     */
    retMapping?: Object;

    /**
     * Provider返回值映射
     */
    responseRewrite?: Object;

    /**
     * 返回值检查Expression String
     */
    retCheckPattern?: string;

    /**
     * 错误弹出的错误提示
     */
    retErrMsg?: string;

    /**
     * 自动触发
     */
    autoInterval?: number;

    /**
     * 调试默认
     */
    debug?: boolean;
}

export interface CustomerItem {
    /**
     * customer名称
     */
    name: string;

    /**
     * customer执行模式
     */
    mode?: string;

    /**
     * customer配置
     */
    config?: any;

    /**
     * customer 函数
     */
    func?: string;
}

export interface CustomerGroup {
    /**
     * 组合名称
     */
    name: string;

    /**
     * 执行顺序
     */
    steps: string[];

    /**
     * 当发生错误的时候，继续执行
     */
    keepWhenError?: boolean;
}

export interface CustomerSourceConfig {
    /**
     * 单个customer配置
     */
    customers: CustomerItem[];

    /**
     * 业务组合
     */
    groups?: CustomerGroup[];
}

export type RCREOptions = {
    /**
     * 启动0.15.0版本之前的container数据合并策略
     */
    oldNestContainerCompatible?: boolean;

    /**
     * 兼容Safari10的兼容代码
     */
    safari10Layout?: boolean;
};

/**
 * 内部基础组件的context变量
 */
export interface RCREContextType {
    $global: object;
    $location: UrlWithStringQuery;
    $query: ParsedUrlQuery;
    debug: boolean;
    loadMode: string;
    lang: string;
    events: Events;
    dataProviderEvent: DataProviderEvent;
    options?: RCREOptions;
    store: Store<any>;
    containerGraph: Map<string, ContainerNode>;
    mode: 'React' | 'json';
}

/**
 * Container为底层组件提供的Context
 */
export interface ContainerContextType {
    model: string;
    $data: any;
    $parent?: any;
    dataCustomer?: DataCustomer | null;
    $setData: (name: string, value: any, options?: ContainerSetDataOption) => void;
    $getData: (name: string) => any;
    $deleteData: (name: string) => void;
    $setMultiData: (items: { name: string, value: any}[]) => void;
}

type TriggerContextOptions = { index?: number, preventSubmit?: boolean };
export interface TriggerContextType {
    $trigger: any;
    eventHandle: (eventName: string, args: Object, options?: TriggerContextOptions) => Promise<any>;
}

export interface IteratorContextType {
    $item: any;
    $index: number;
    $parentIndex?: number;
    $parentItem?: any;
}

export interface FormItemState {
    valid: boolean;
    formItemName: string;
    rules: any[];
    status: string;
    errorMsg: string;
    $validate?: boolean;
    required?: boolean;
}

export interface FormContextType {
    $form?: any;
    isSubmitting?: boolean;
    $setFormItem: (payload: FormItemState) => void;
    $getFormItem: (formItemName: string) => FormItemState;
    $setFormItems: (payload: SET_FORM_ITEM_PAYLOAD[]) => void;
    $deleteFormItem: (itemName: string) => void;
    $resetForm: () => void;
    $handleSubmit: () => void;
}

export interface FormItemContextType {
    $addNameSet: (name: string) => void;
    $handleBlur: () => void;
    valid: boolean;
    errmsg: string;
}

export interface PageConfig<T extends BasicConfig> {
    title?: string;
    body: T[];
}

export interface PageProps<T extends BasicConfig> extends PageConfig<T> {
    // 外部注入的全局对象
    global?: Object;
    // 调试模式
    debug?: boolean;
    // 报错的信息语言
    lang?: string;
    loadMode?: string;
    options?: RCREOptions;
    events?: Events;
    store: Store<any>;
    containerGraph: Map<string, ContainerNode>;
}