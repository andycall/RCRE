/// <reference path="../global.ts" />
import react from 'react';
import reactdom from 'react-dom';
import {filter} from './core/util/filter';
import {createChild} from './core/util/createChild';
import * as vm from './core/util/vm';

import './index.css';
import * as Container from './core/Container';
import * as DataProvider from './core/DataProvider/index';
import * as Trigger from './core/Trigger';
import * as Connect from './core/Connect';
import * as types from './types';
import * as Form from './core/Form';
import {Render, JSONRender} from './core/JSONRender';

import './core/Layout/Div/Div';
import './core/Layout/Text/Text';
import './core/Layout/ForEach/Foreach';
import './core/Hosts';
import './core/Layout/Row/Row';
import {dataProviderEvent} from './core/Events/dataProviderEvent';

export * from './types';
export * from './core/Container/AbstractContainer';
export * from './core/util/util';
export * from './core/Service/api';
export * from './core/Container/BasicComponent';
export * from './core/Events';
export * from './core/Events/dataProviderEvent';
export * from './core/DataCustomer/index';
export * from './core/util/componentLoader';
export * from './core/util/stringToPath';
export * from './data/events';
export * from './core/RCREProvider';
export * from './core/context';

export * from './data/reducers';
export * from './data/store';

export function clearStore() {
    dataProviderEvent.clear();
}

export {
    Container,
    Trigger,
    DataProvider,
    createChild,
    filter,
    vm,
    Form,
    Render,
    JSONRender,
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

export const version = __VERSION__;
export const React = react;
export const ReactDOM = reactdom;
