import {CustomerParams} from '../index';
import {isObjectLike} from 'lodash';
import {isExpression, parseExpressionString, safeStringify} from '../../util/vm';

export interface PassCustomerExecConfig {
    /**
     * 设置的值
     */
    groups: {key: string; value: string}[];

    /**
     * 动作
     */
    action?: 'SET' | 'DELETE';
}

export async function localStoreCustomer(config: PassCustomerExecConfig, params: CustomerParams) {
    let groups = config.groups;
    let {
        runTime
    } = params;

    if (isExpression(groups)) {
        groups = parseExpressionString(groups, runTime);
    }

    if (groups instanceof Array) {
        return groups.map(group => {
            let key = group.key;
            let value = group.value;

            if (isExpression(key)) {
                key = parseExpressionString(key, runTime);
            }

            if (isExpression(value)) {
                value = parseExpressionString(value, runTime);
            }

            if (isObjectLike(value)) {
                value = safeStringify(value);
            }

            let action = config.action || 'SET';

            switch (action) {
                default:
                case 'SET':
                    try {
                        localStorage.setItem(key, value);
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case 'DELETE':
                    try {
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.error(e);
                    }
                    break;
            }

            return {key: key, value: value};
        });
    } else {
        throw new Error('LocalStorage的groups需要是一个数组');
    }
}
