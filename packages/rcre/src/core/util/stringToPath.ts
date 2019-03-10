import {memoize} from 'lodash';

const charCodeOfDot = '.'.charCodeAt(0);
const reEscapeChar = /\\(\\)?/g;
const patten = /[^.[\]]+|\[(?:([^"'].*)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

const MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func: (...args: any[]) => any[]) {
    const result = memoize(func, (key) => {
        const { cache } = result;
        if (cache['size'] === MAX_MEMOIZE_SIZE && typeof cache.clear === 'function') {
            cache.clear();
        }
        return key;
    });

    return result;
}

export const stringToPath: (str: string) => string[]  = memoizeCapped((str: string) => {
    const result: string[] = [];
    if (str.charCodeAt(0) === charCodeOfDot) {
        result.push('');
    }
    // @ts-ignore
    str.replace(patten, (match, expression, quote, subString) => {
        let key = match;
        if (quote) {
            key = subString.replace(reEscapeChar, '$1');
        }

        if (/\]\[/.test(key)) {
            let groups = key.match(/\[\d+\]/g);
            if (groups) {
                groups.forEach(k => result.push(k));
            }
        } else {
            result.push(key);
        }
    });
    return result;
});