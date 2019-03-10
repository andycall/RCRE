/**
 * 判断一个对象是否是Promise
 *
 * @param object
 * @returns {boolean}
 */
import {dataProviderEvent} from '../Events/dataProviderEvent';
import {clone, isObject} from 'lodash';
import {stringToPath} from './stringToPath';

export function isPromise(object: any): boolean {
    if (Promise && Promise.resolve) {
        return Promise.resolve(object) === object;
    }

    return false;
}

export function waitForDataProviderComplete() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (dataProviderEvent.stack.length === 0) {
                return resolve();
            }

            dataProviderEvent.on('done', () => {
                resolve();
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

    for (let i = 0; i < pathList.length - 1; i ++) {
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

    for (let i = 0; i < pathList.length - 1; i ++) {
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

/**
 * 对路径字符串进行转换，数组和点运算符统一成点运算符形式
 *
 * 对于数字路径的处理：
 * normalizedPath(name.age.city) ==> name.age.city
 * normalizedPath(name[0].1]) ==> name.0.1
 * normalizedPath(name[0][1]) ==> name.0.1
 *
 * @param pathString
 */

export function normalizedPathString(pathString: string) {
    let pathBlackList = stringToPath(pathString);
    return pathBlackList.map((pathItem: string) => {
        let isArrayName = pathItem.slice(0, 1) === '[' && pathItem.slice(-1) === ']';

        if (isArrayName) {
            return pathItem.slice(1, -1);
        } else {
            return pathItem;
        }
    }).join('.');
}
