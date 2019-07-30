/// <reference path="../global.ts" />
import react from 'react';
import reactdom from 'react-dom';
import {filter} from './core/util/filter';
import {createChild} from './core/util/createChild';
import * as vm from './core/util/vm';

import './index.css';
import * as Connect from './core/Connect';
import * as types from './types';
import {Render, JSONRender} from './core/JSONRender';

import './core/Layout/Div/Div';
import './core/Layout/Text/Text';
import './core/Layout/ForEach/Foreach';
import './core/Hosts';
import './core/Layout/Row/Row';

export * from './types';
export * from './core/util/util';
export * from './core/Service/api';
export * from './core/Events';
export * from './core/Events/dataProviderEvent';
export * from './core/DataCustomer/index';
export * from './core/DataProvider/index';
export * from './core/util/componentLoader';
export * from './core/util/stringToPath';
export * from './data/events';
export * from './core/RCREProvider';
export * from './core/context';
export * from './core/Trigger';
export * from './core/ErrorBoundary';
export * from './jsx-support';
export * from './data/reducers';
export * from './data/store';
export * from './core/externalApi';

let hasWarn = false;
export function clearStore() {
    if (!hasWarn) {
        hasWarn = true;
        console.warn('clearStore is deprecated, please remove it from your code');
    }
}


export {
    createChild,
    filter,
    vm,
    Render,
    JSONRender,
    Connect,
    types
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

export const version = __VERSION__;
export const React = react;
export const ReactDOM = reactdom;
