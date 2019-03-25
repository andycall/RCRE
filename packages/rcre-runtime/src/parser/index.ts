import {Walker} from './walker';
import {runInContext} from '../runTime';
import {isNil, isPlainObject} from 'lodash';
import {safeStringify} from '../util';

export * from './walker';

const tokenMap: Map<string, TokenItem[]> = new Map();

export type TokenItem = {
    start: number;
    end: number;
    str?: string;
    token?: string;
    prev?: boolean;
};

/**
 * 解析ExpressString, 取出#ES{}内部的代码传入到runTime
 *
 * @param {string} str
 * @param {runTimeType} context
 * @returns {any}
 */
export function execExpressString(str: any, context: object) {
    if (typeof str !== 'string') {
        return null;
    }

    str = str && str.trim();
    let tokens = parseExpressionToken(str);
    return execExpressionTokens(tokens, context, str);
}

/**
 * 处理ExpressionString, 得到Token
 *
 * @param {string} str
 * @returns {TokenItem[]}
 */
export function parseExpressionToken(str: string): TokenItem[] {
    if (typeof str !== 'string') {
        return [];
    }

    if (tokenMap.has(str)) {
        let cachedTokens = tokenMap.get(str);
        if (cachedTokens) {
            return cachedTokens;
        }
    }

    let tokens: TokenItem[] = [];
    let walker = new Walker(str);
    let charCode;
    let prevIndex = 0;
    let isFirstMatch = true;

    while (!walker.isEnd()) {
        charCode = walker.currentCode();

        if (charCode === 35 // #
            && walker.nextCode() === 69 // E
            && walker.nextCode() === 83 // S
            && walker.nextCode() === 123 // {
        ) {
            let start = walker.index + 1;
            walker.findCharUtil('}', '{');
            let tokenStr = walker.cut(start, walker.index);
            let prevStr = walker.cut(prevIndex, start - 4);
            if (prevIndex < start - 4 && isFirstMatch) {
                tokens.push({
                    start: prevIndex,
                    end: start - 4,
                    str: prevStr,
                    prev: true
                });
            }

            prevIndex = walker.index + 1;

            tokens.push({
                start: start - 4,
                end: walker.index + 1,
                token: tokenStr
            });
            isFirstMatch = false;

            let afterStart = walker.index + 1;
            walker.findStrUtil('#ES{');
            let afterEnd = walker.index + 1;

            if (afterStart < walker.index) {
                tokens.push({
                    start: afterStart,
                    end: afterEnd,
                    str: walker.cut(afterStart, afterEnd),
                    prev: false
                });
            }

            walker.go(1);
            continue;
        }

        walker.go(1);
    }

    tokenMap.set(str, tokens);

    return tokens;
}

export function reportError(e: Error, token: string) {
    // 由于组件初始化的时候，必然会出现值为空的情况,
    // 屏蔽掉null指针的报错
    if (/Cannot read property/.test(e.message)) {
        return;
    }

    // 屏蔽掉JSON.parse的错误
    if (/Unexpected token \w+ in JSON at position \d/.test(e.message)) {
        return;
    }

    // TODO 临时禁用
    if (/\$args is not defined/.test(e.message)) {
        return;
    }

    console.error(`code: ${token}; \n` + e.stack);
}

/**
 * 执行token, 计算出运行结果
 *
 * @param {TokenItem[]} tokens
 * @param {Object} context
 * @returns {TokenItem}
 */
export function execExpressionTokens(tokens: TokenItem[], context: Object, code: string) {
    return tokens.reduce((total, token) => {
        let nextValue;

        if (token.str) {
            nextValue = token.str;
        } else if (token.token) {
            try {
                nextValue = runInContext(token.token, context);
            } catch (e) {
                reportError(e, code);
                nextValue = null;
            }
        }

        if (typeof nextValue === 'function') {
            return nextValue;
        }

        if (isNil(total)) {
            return nextValue;
        }

        if (isNil(nextValue)) {
            return total;
        }

        if (isPlainObject(nextValue)) {
            nextValue = safeStringify(nextValue);
        }

        return total + nextValue;
    }, null);
}

/**
 * 是否包含函数调用
 *
 * @param {string} code
 * @returns {boolean}
 */
export function isFuncCall(code: string) {
    return /\w+\(([\w\W]+)\)/.test(code);
}

/**
 * 取出函数调用的参数值
 *
 * @param {string} code
 * @returns {(string | number | boolean)[]}
 */
export function getParamsFromFuncCall(code: string): (string | number | boolean | null | undefined) [] {
    let args: string[] = [];
    const regex = /\w+\(([\w\W]+)\)/;

    let group = regex.exec(code);

    if (!group) {
        return args;
    }

    let rawParams = group[1];

    return rawParams.split(',').map(raw => {
        raw = raw.trim();
        raw = raw.replace(/\w+\(/g, '');
        raw = raw.replace(/\)/g, '');

        if (/^\d+$/.test(raw)) {
            return Number(raw);
        }

        if (raw === 'true') {
            return true;
        }

        if (raw === 'false') {
            return false;
        }

        if (raw === 'null') {
            return null;
        }

        if (raw === 'undefined') {
            return undefined;
        }

        return raw;
    });
}

/**
 * 判断一个字符串是否是ExpressionString
 * @param {any} str
 * @return {boolean}
 */
export function isExpressionString(str: any) {
    if (typeof str !== 'string') {
        return false;
    }

    let tokens = parseExpressionToken(str);

    return tokens.length > 0;
}
