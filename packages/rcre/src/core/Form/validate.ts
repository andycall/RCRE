import {isEmpty, isNil} from 'lodash';
import {ValidateRules} from "./types";

const spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function strLength(str: string) {
    return str.replace(spRegexp, '_').length;
}

function unicodeLength(str: string) {
    if (TextEncoder) {
        return new TextEncoder().encode(str).length;
    }

    if (Blob) {
        return new Blob([str]).size;
    }

    let s = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
        let code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) {
            s++;
        } else if (code > 0x7ff && code <= 0xffff) {
            s += 2;
        }
        if (code >= 0xDC00 && code <= 0xDFFF) {
            i--;
        }
    }
    return s;
}

function chineseLength(str: string) {
    return str && str.replace(/[^\x00-\xFF]/g, '**').length || 0;
}

export function applyRule(rule: ValidateRules, data: null | undefined | string | number | any[]):
    { valid: boolean; message: string; } {

    if (!isNil(rule.len) && !(String(data).length === rule.len)) {
        return {
            valid: false,
            message: rule.message || '长度不满足要求'
        };
    }

    if (!isNil(rule.max) && Number(data) > rule.max) {
        return {
            valid: false,
            message: rule.message || `不能大于${rule.max}`
        };
    }

    if (!isNil(rule.min) && Number(data) < rule.min) {
        return {
            valid: false,
            message: rule.message || `不能小余${rule.min}`
        };
    }

    if (!isNil(rule.maxLength) &&
        typeof data === 'string' &&
        strLength(data) > rule.maxLength) {
        return {
            valid: false,
            message: rule.message || `长度不能大于${rule.maxLength}`
        };
    }

    if (!isNil(rule.maxUnicodeLength) &&
        typeof data === 'string' &&
        unicodeLength(data) > rule.maxUnicodeLength
    ) {
        return {
            valid: false,
            message: rule.message || `Unicode字节长度不能大于${rule.maxUnicodeLength}`
        };
    }

    if (!isNil(rule.maxChineseLength) &&
        typeof data === 'string' &&
        chineseLength(data) > rule.maxChineseLength
    ) {
        return {
            valid: false,
            message: rule.message || `长度不能大于${rule.maxChineseLength}`
        };
    }

    if (!isNil(rule.minLength) &&
        typeof data === 'string' &&
        strLength(data) < rule.minLength) {
        return {
            valid: false,
            message: rule.message || `长度不能小余${rule.minLength}`
        };
    }

    if (!isNil(rule.minUnicodeLength) &&
        typeof data === 'string' &&
        unicodeLength(data) < rule.minUnicodeLength
    ) {
        return {
            valid: false,
            message: rule.message || `Unicode字节长度不能小于${rule.maxUnicodeLength}`
        };
    }

    if (!isNil(rule.minChineseLength) && typeof data === 'string' && chineseLength(data) < rule.minChineseLength) {
        return {
            valid: false,
            message: rule.message || `长度不能小于${rule.minChineseLength}`
        };
    }

    if (rule.required) {
        let isValid = true;

        if (typeof data === 'string') {
            if (!rule.whitespace) {
                data = data.trim();
            }

            if (data.length === 0) {
                isValid = false;
            }
        }

        if (data === null || data === undefined) {
            isValid = false;
        }

        if (typeof data === 'object' && data !== null) {
            isValid = !isEmpty(data);
        }

        if (typeof data === 'boolean') {
            isValid = data;
        }

        if (!isValid) {
            return {
                valid: false,
                message: rule.message || '不能为空'
            };
        }
    }

    if (rule.pattern) {
        // @ts-ignore
        if (rule.pattern instanceof RegExp && !rule.pattern.test(data)) {
            return {
                valid: false,
                message: rule.message || '输入不满足规则'
            };
        }

        // @ts-ignore
        if (typeof rule.pattern === 'string' && !new RegExp(rule.pattern).test(data)) {
            return {
                valid: false,
                message: rule.message || '输入不满足规则'
            };
        }
    }

    return {
        valid: true,
        message: ''
    };
}
