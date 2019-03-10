import {memoize, isPlainObject} from 'lodash';
import {evaluation} from './evaluation';
import LRUCache from 'lru-cache';
import {filter} from '../../core/util/filter';

const runTimeCache: LRUCache<string, LRUCache<Object, any>> = new LRUCache({
    max: 300
});

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

    injectFilterIntoContext(context);

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

/**
 * 把RCRE的filter函数变量注入到context中
 *
 * @param {Object} context
 */
export const injectFilterIntoContext: (context: object) => void = memoize((context: Object) => {
    Object.assign(context, filter.store);
});