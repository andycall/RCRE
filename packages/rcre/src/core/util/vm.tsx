import * as _ from 'lodash';
import {execExpressString, isExpressionString, reportError} from 'rcre-runtime';
import {runTimeType} from '../../types';
import {stringToPath} from './stringToPath';
import {deleteWith, setWith} from './util';

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

export function evalInContext(code: string, context: Object) {
    if (!_.isPlainObject(context)) {
        throw new TypeError('context argument must be an object');
    }

    if (typeof code === 'string') {
        if (!/^\s+function/.test(code)) {
            code = `function() { return (${code})}`;
        }
    }

    if (!code) {
        throw new TypeError('code must be a evaluable string');
    }

    let func = new Function('context', `
        var scope = this;
        var window = scope;
        var global = scope;
        with (scope) {
            return (${code}).call(context);
        }
    `);

    return func.call(context);
}

/**
 * 递归处理ExpressionString, 并返回一个新的解析好的对象
 *
 * @param {T} data 数据对象
 * @param {runTimeType} runTime ExpressionString 上下文
 * @param {string[]} blackList 变量名黑名单
 * @param {boolean} isDeep 是否递归解析
 * @param {string[]} whiteList 变量名白名单
 * @param {string} path  属性的访问路径
 * @returns {T}
 */

function recursionExpressionString<T> (data: T,
                                       runTime: runTimeType,
                                       blackList: string[] = [],
                                       isDeep: boolean = false,
                                       whiteList: string[] = [],
                                       path?: string): T {
    let keys = Object.keys(data);
    for (let key of keys) {
        let item = data[key];
        let curPath = '';
        if (path) {
            curPath = path + '.' + key;
        } else {
            curPath = key;
        }
        if (blackList && blackList.indexOf(curPath) >= 0) {
            continue;
        }

        if (_.isArray(whiteList) && whiteList.length > 0) {
            if (whiteList.indexOf(key) < 0) {
                continue;
            }
        }

        if (isExpression(key)) {
            let oldKey = key;
            key = parseExpressionString(key, runTime);
            if (key) {
                data = deleteWith(data, oldKey);
                data = setWith(data, key, item);
            }
        }

        if (isExpression(item)) {
            data = setWith(data, key, parseExpressionString(item, runTime));
        }

        if (isDeep && (_.isObjectLike(item) || _.isArrayLikeObject(item))) {
            data = setWith(data, key, recursionExpressionString(item, runTime, blackList, isDeep, whiteList, curPath));
        }
    }

    return data;
}

/**
 * 遍历对象或者数组的所有属性，处理所有找到的ExpressionString, 并返回一个新的解析好的对象
 *
 * @param {T} data 数据对象
 * @param {runTimeType} runTime ExpressionString 上下文
 * @param {string[]} blackList 变量名黑名单
 * @param {boolean} isDeep 是否递归解析
 * @param {string[]} whiteList 变量名白名单
 * @returns {T}
 */
export function compileExpressionString<T>(data: T,
                                           runTime: runTimeType,
                                           blackList: string[] = [],
                                           isDeep: boolean = false,
                                           whiteList?: string[]): T {
    // 将blackList中的数据标准化成点运算符连接的形式
    let normalizedBlackList = blackList.map(item => normalizedPathString(item));

    let compiledData = recursionExpressionString(data, runTime, normalizedBlackList, isDeep, whiteList, '');

    return compiledData;
}

/**
 * 判断字符串是否是ExpressionString
 * @param {string} str 字符串
 * @returns {boolean}
 */
export function isExpression(str: any) {
    if (typeof str === 'function') {
        return true;
    }

    return isExpressionString(str);
}

/**
 * 过滤掉数据中含有ExpressionString的字段
 * @param {T} obj
 * @returns {T}
 */
export function filterExpressionData<T>(obj: T): T {
    let copy = _.clone(obj);

    function walker(o: Object) {
        _.each(o, (val, name) => {
            if (isExpression(val)) {
                delete o[name];
            }

            if (_.isObjectLike(val)) {
                filterExpressionData(val);
            }
        });
    }

    walker(copy);

    return copy;
}

export function safeStringify(obj: Object) {
    let cache = new WeakMap();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.get(value)) {
                return;
            }

            cache.set(value, true);
        }

        return value;
    });
}

export function parseExpressionString(str: any, context: runTimeType) {
    if (typeof str === 'function') {
        try {
            let result = str(context);
            // @ts-ignore
            context = null;
            return result;
        } catch (e) {
            reportError(e, str.toString());
            return null;
        }
    }

    return execExpressString(str, context);
}