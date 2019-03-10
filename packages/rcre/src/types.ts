import {ContainerConfig} from './core/Container/AbstractContainer';
import {BasicConfig, BasicContainerPropsInterface} from './core/Container/types';
import {RowConfig} from './core/Layout/Row/Row';
import {DivConfig} from './core/Layout/Div/Div';
import {BasicConnectProps} from './core/Connect/basicConnect';
import {TextConfig} from './core/Layout/Text/Text';
import {FormConfig, FormItemConfig} from './core/Form';

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
