/// <reference path="../global.ts" />
import react from 'react';
import reactdom from 'react-dom';
import configureStore from './data/store';
import {filter} from './core/util/filter';
import {createChild} from './core/util/createChild';
import {Store} from 'redux';
import {RootState} from './data/reducers';
import * as vm from './core/util/vm';

import './index.css';
import {containerGraph} from './core/Service/ContainerDepGraph';
import * as Container from './core/Container';
import * as DataProvider from './core/DataProvider/index';
import * as Trigger from './core/Trigger';
import * as Connect from './core/Connect';
import * as types from './types';
import * as Form from './core/Form';
import {Render} from './render';

import './core/Container/AbstractContainer';
import './core/Layout/Div/Div';
import './core/Layout/Text/Text';
import './core/Layout/Row/Row';
import {dataProviderEvent} from './core/Events/dataProviderEvent';

export * from './types';
export * from './core/util/util';
export * from './services/api';
export * from './core/Events';
export * from './core/Page';
export * from './core/Events/dataProviderEvent';
export * from './core/DataCustomer/index';
export * from './core/util/componentLoader';
export * from './services/log';
export * from './core/util/stringToPath';
export * from './language/parser/index';
export * from './data/events';

export * from './data/reducers';

export let store: Store<RootState> = configureStore();

export function clearStore() {
    store.dispatch({
        type: '_RESET_STORE_'
    });
    dataProviderEvent.clear();
    containerGraph.clear();
}

export {
    Container,
    Trigger,
    DataProvider,
    createChild,
    filter,
    containerGraph,
    vm,
    Form,
    Render,
    types,
    Connect
};

if (process.env.REMOTE_DEBUG) {
    let script = document.querySelector('script');
    let url;

    if (script) {
        url = script.src;
    }

    let msg = `you are in remote debug mode, please copy and past <script src="${url}"></script> into your webpages.`;
    console.log(msg);
}

// if (process.env.NODE_ENV !== 'test') {
//     if (isUnsupportedBrowser({
//         msie: '10',
//         chrome: '55',
//         safari: '11',
//         firefox: '10'
//     }, false, window && window.navigator.userAgent)) {
//         console.error('检测到你正在使用低版本的浏览器，请使用最新版Chrome浏览器或者Firefox浏览器');
//     }
// }
//
// if (process.env.NODE_ENV === 'test') {
//     let oldRCRE = require('@baidu/rcre-core');
//     oldRCRE.registerAddFilterCallback((name: string, fn: any) => {
//         filter.setFilter(name, fn);
//     });
//
//     // 将0.18的FuncCustomer同步到0.19
//     oldRCRE.setFucCustomerCallback((name: string, fn: any) => {
//         DataCustomer.funcCustomer.setCustomer(name, fn);
//     });
// }

export const version = __VERSION__;
export const React = react;
export const ReactDOM = reactdom;
