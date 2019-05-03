/**
 * 判断一个对象是否是Promise
 *
 * @param object
 * @returns {boolean}
 */
import * as _ from 'lodash';
import {clone, isObject} from 'lodash';
import {Global} from 'rcre-runtime';
import {
    BasicConfig,
    ContainerContextType, FormContextType, FormItemContextType,
    IteratorContextType,
    RCREContextType,
    runTimeType,
    TriggerContextType
} from '../../types';
import {filter} from './filter';
import {stringToPath} from './stringToPath';

/**
 * 把RCRE的filter函数变量注入到context中
 *
 * @param {Object} context
 */
export const injectFilterIntoContext: (context: object) => void = _.memoize((context: Object) => {
    Object.assign(context, filter.store);
});

export function isPromise(object: any): boolean {
    if (Promise && Promise.resolve) {
        return Promise.resolve(object) === object;
    }

    return false;
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
export function setWith<T>(obj: T, path: string, value: any): T {
    let copy: T = clone(obj);
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

/**
 * 拼装key
 * @param keys
 */
export function combineKeys(...keys: any[]) {
    let key = keys[0];

    for (let k of keys.slice(1)) {
        if (typeof k === 'number') {
            key += '[' + key + ']';

        } else if (typeof k === 'string') {
            key += '.' + k;
        }
    }

    return key;
}

export function deleteWith<T>(obj: T, path: string): T {
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
    containerContext: ContainerContextType,
    rcreContext: RCREContextType,
    otherContext?: {
        iteratorContext?: IteratorContextType,
        triggerContext?: TriggerContextType,
        formContext?: FormContextType,
        formItemContext?: FormItemContextType
    }
): runTimeType {
    let runtime: runTimeType = {
        ...Global,
        $global: rcreContext.$global,
        $query: rcreContext.$query,
        $location: rcreContext.$location,
        $data: containerContext.$data,
        $parent: containerContext.$parent,
    };

    injectFilterIntoContext(runtime);

    if (otherContext) {
        if (otherContext.iteratorContext) {
            runtime.$item = otherContext.iteratorContext.$item;
            runtime.$index = otherContext.iteratorContext.$index;
        }

        if (otherContext.triggerContext) {
            runtime.$trigger = otherContext.triggerContext.$trigger;
        }

        if (otherContext.formContext) {
            runtime.$form = otherContext.formContext.$form;
        }

        if (otherContext.formItemContext) {
            runtime.$formItem = otherContext.formItemContext.$formItem;
        }
    }

    return runtime;
}

/**
 * 清理runTime变量,谨防内存泄露
 */
export function recycleRunTime(runTime: runTimeType) {
    let keys = Object.keys(runTime);

    keys.forEach(key => {
        runTime[key] = null;
    });

    return null;
}

// copy and paste from Formik
export function getActiveElement(doc?: Document): Element | null {
    doc = doc || (typeof document !== 'undefined' ? document : undefined);
    if (typeof doc === 'undefined') {
        return null;
    }
    try {
        return doc.activeElement || doc.body;
    } catch (e) {
        return doc.body;
    }
}