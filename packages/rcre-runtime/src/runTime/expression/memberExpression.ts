import {MemberExpression} from 'estree';
import {execExpression} from '../evaluation';

// const strBuildInFunc = Object.keys(String.prototype);

export function execMemberExpression(exp: MemberExpression, context: Object)
    : string | boolean | number | Object | null {
    if (exp.object.type === 'Super') {
        throw new TypeError('Super node is not supported');
    }

    let object = execExpression(exp.object, context);
    let property = execExpression(exp.property, context);

    if (object === false || object === undefined || object === null) {
        throw new TypeError('Uncaught TypeError: Cannot read property ' + property + ' of null');
    }

    if (context) {
        if (object in context && (typeof object === 'string' || typeof object === 'number')) {
            object = context[object];
        }
    }

    if ((typeof property === 'string' || typeof property === 'number') &&
        (object !== null && object !== undefined)) {
        const funcFlag = '__RCRE_RUNTIME_FUNCTION__';
        if (object.type === funcFlag) {
            let target = object.object;
            let prop = object.property;
            return {
                type: funcFlag,
                object: target[prop],
                property: property
            };
        }

        // 返回值为函数不做处理
        if (typeof object![property] === 'function') {
            return {
                type: funcFlag,
                object: object,
                property: property
            };
        }

        return object![property];
    }

    return null;
}
