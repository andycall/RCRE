import {isPlainObject} from 'lodash';
import {evaluation} from './evaluation';
import LRUCache from 'lru-cache';
import * as _ from "lodash";

const runTimeCache: LRUCache<string, LRUCache<Object, any>> = new LRUCache({
    max: 300
});

export const Global = {
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
    RegExp: RegExp,
    Boolean: Boolean,
    Date: Date,
    Math: Math,
    alert: alert,
    confirm: confirm,
    prompt: prompt,
    parseInt: parseInt,
    parseFloat: parseFloat,
    encodeURI: encodeURI,
    decodeURI: decodeURI,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    document: document,
    JSON: JSON,
    _: _,
    console: console
};

/**
 * 安全运行沙箱
 *
 * @param {string} code
 * @param {Object} context
 * @returns {any}
 */
export function runInContext(code: string, context: Object) {
    if (!isPlainObject(context)) {
        throw new TypeError('context argument must be an object');
    }

    if (!code) {
        throw new TypeError('code must be a evaluable string');
    }

    if (!runTimeCache.has(code)) {
        runTimeCache.set(code, new LRUCache({
            max: 50
        }));
    }

    let contextCache = runTimeCache.get(code);
    if (!contextCache) {
        throw new Error('LRU Cache error');
    }

    if (!contextCache.has(context)) {
        let result = evaluation('(' + code + ')', context);
        contextCache.set(context, result);
        return result;
    } else {
        return contextCache.get(context);
    }
}
