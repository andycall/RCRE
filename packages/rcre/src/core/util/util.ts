/**
 * 判断一个对象是否是Promise
 *
 * @param object
 * @returns {boolean}
 */
import {clone, isObject} from 'lodash';
import {Global} from 'rcre-runtime';
import {BasicConfig, BasicContainerPropsInterface, runTimeType} from '../../types';
import {dataProviderEvent} from '../Events/dataProviderEvent';
import {filter} from './filter';
import {stringToPath} from './stringToPath';
import {injectFilterIntoContext} from './vm';

export function isPromise(object: any): boolean {
    if (Promise && Promise.resolve) {
        return Promise.resolve(object) === object;
    }

    return false;
}

export function waitForDataProviderComplete() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let timeout = setTimeout(() => {
                let pendingNamespaces = dataProviderEvent.stack.map(m => m.key).join('\n,');
                clearTimeout(timeout);
                reject(new Error('dataProvider request timeout \n pending namespace: ' + pendingNamespaces));
            }, 100000);

            if (dataProviderEvent.stack.length === 0) {
                clearTimeout(timeout);
                return resolve();
            }

            dataProviderEvent.on('done', () => {
                clearTimeout(timeout);
                resolve();
            });

            dataProviderEvent.on('error', err => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    });
}

/**
 * Immutable版本的setWith
 * 自动依据路径，对访问路径进行浅拷贝吗，以防止通过多级路径访问对象时，无法保存原先对象引用副本
 * let object = { inner: {test : 1}, other: {foo: 1} };
 * let copy = setWith(object, 'inner.test', 2);
 *
 * object === copy // false
 * object.inner === copy.inner // false
 * object.inner.test // 1
 * copy.inner.test // 2
 * object.other === copy.other // true
 *
 *
 * 对于数字路径的处理：
 * setWith({}, name.0.1, 'test') ==> { name: {0: 1: 'test'} }
 * setWith({}, name[0][1], 'test') ==> { name: [undefined, ['test']]}
 *
 * @param obj
 * @param path
 * @param value
 */
export function setWith(obj: Object, path: string, value: any) {
    let copy = clone(obj);
    let pathList = stringToPath(path);
    let target = copy;

    for (let i = 0; i < pathList.length - 1; i++) {
        let name = pathList[i];
        if (!name) {
            break;
        }

        let isArrayName = name.slice(0, 1) === '[' && name.slice(-1) === ']';

        if (isArrayName) {
            name = name.slice(1, -1);
        }

        let nextValue = target[name];

        if (isObject(nextValue)) {
            target[name] = clone(target[name]);
        } else {
            target[name] = /^\[\d+\]$/.test(pathList[i + 1]) ? [] : {};
        }

        target = target[name];
    }

    let lastName = pathList[pathList.length - 1];
    if (lastName.slice(0, 1) === '[' && lastName.slice(-1) === ']') {
        lastName = lastName.slice(1, -1);
    }

    target[lastName] = value;
    return copy;
}

export function deleteWith<T>(path: string, obj: T): T {
    if (!obj) {
        return obj;
    }

    let copy = clone(obj);
    let pathList = stringToPath(path);
    let target = copy;

    for (let i = 0; i < pathList.length - 1; i++) {
        let name = pathList[i];
        if (!name) {
            break;
        }

        let isArrayName = name.slice(0, 1) === '[' && name.slice(-1) === ']';

        if (isArrayName) {
            name = name.slice(1, -1);
        }

        let nextValue = target[name];

        if (isObject(nextValue)) {
            target[name] = clone(target[name]);
        } else {
            target[name] = /^\[\d+\]$/.test(pathList[i + 1]) ? [] : {};
        }

        target = target[name];
    }

    let lastName = pathList[pathList.length - 1];
    if (lastName.slice(0, 1) === '[' && lastName.slice(-1) === ']') {
        lastName = lastName.slice(1, -1);
    }

    delete target[lastName];

    return copy;
}

export function getRuntimeContext<T extends BasicConfig>(
    props: BasicContainerPropsInterface<T> | any,
    context: any
): runTimeType {
    let runtime: runTimeType = {
        ...Global,
        $data: {},
    };

    injectFilterIntoContext(runtime);

    if (props.$data) {
        runtime.$data = Object.assign({}, props.$data);
    }

    if (props.$parent) {
        runtime.$parent = Object.assign({}, props.$parent);
    }

    if (props.hasOwnProperty('$item')) {
        runtime.$item = props.$item;
    }

    if (props.hasOwnProperty('$index')) {
        runtime.$index = props.$index;
    }

    if (props.$trigger) {
        runtime.$trigger = props.$trigger;
    }

    if (props.$form) {
        runtime.$form = props.$form;
    }

    if (context && context.$query) {
        runtime.$query = context.$query;
    }

    if (context && context.$global) {
        runtime.$global = context.$global;
    }

    return runtime;
}

/**
 * 清理runTime变量,谨防内存泄露
 */
export function recycleRunTime(runTime: runTimeType) {
    delete runTime.$data;
    delete runTime.$parent;
    delete runTime.$item;
    delete runTime.$global;
    delete runTime.$args;
    delete runTime.$form;
    delete runTime.$index;
    delete runTime.$parent;
    delete runTime.$trigger;

    let globalKeys = Object.keys(Global);

    for (let key of globalKeys) {
        delete runTime[key];
    }

    let filterKeys = Object.keys(filter.store);

    for (let key of filterKeys) {
        delete runTime[key];
    }

    // @ts-ignore
    runTime = null;

    return null;
}
