import {
    ArrayExpression,
    BinaryExpression,
    CallExpression,
    ConditionalExpression,
    Expression,
    LogicalExpression, MemberExpression, NewExpression, ObjectExpression, SpreadElement, ThisExpression, UnaryExpression
} from 'estree';

export function execArrayExpression(exp: ArrayExpression, context: Object) {
    let arr: any[] = [];

    exp.elements.forEach(element => {
        if (element.type === 'SpreadElement') {
            execSpreadElement(element, arr, context);
        } else {
            let value = execExpression(element, context);

            if (context && value in context) {
                value = context[value];
            }

            arr.push(value);
        }
    });

    return arr;
}

export function execBinaryExpression(exp: BinaryExpression, context: Object): string | boolean | number | null {
    let left: any = execExpression(exp.left, context);
    let right: any = execExpression(exp.right, context);
    let operator = exp.operator;

    if (context) {
        if (context.hasOwnProperty(left) && exp.left.type === 'Identifier') {
            left = context[left];
        }

        if (context.hasOwnProperty(right) && exp.right.type === 'Identifier') {
            right = context[right];
        }
    }

    switch (operator) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '**':
            return left ** right;
        case '/':
            return left / right;
        case '^':
            return left ^ right;
        case '&':
            return left & right;
        case 'in':
            return left in right;
        case 'instanceof':
            return left instanceof right;
        case '%':
            return left % right;
        case '>>':
            return left >> right;
        case '>>>':
            return left >>> right;
        case '<<':
            return left << right;
        case '>':
            return left > right;
        case '>=':
            return left >= right;
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        case '|':
            return left | right;
        case '==':
            /* tslint:disable */
            return left == right;
        /* tslint:enable */
        case '===':
            return left === right;
        case '!=':
            /* tslint:disable */
            return left != right;
        /* tslint:enable */
        case '!==':
            return left !== right;
        default:
            return null;
    }
}

export function execCallExpression(exp: CallExpression, context: Object) {
    let callee = exp.callee;

    if (callee.type === 'Super') {
        throw new TypeError('super function in expression string is not supported');
    }

    let interpret = execExpression(callee, context);

    let args = exp.arguments;
    let retArgs: any[] = [];

    args.forEach(arg => {
        if (arg.type === 'SpreadElement') {
            execSpreadElement(arg, retArgs, context);
        } else {
            let value = execExpression(arg, context);

            if (arg.type !== 'Literal') {
                if (context && value in context) {
                    value = context[value];
                }
            }

            retArgs.push(value);
        }
    });

    let f;

    if (typeof interpret === 'string') {
        if (context && !(interpret in context)) {
            throw new TypeError('ReferenceError: ' + interpret + ' is not defined');
        }

        f = context[interpret];

        if (typeof f !== 'function') {
            throw new TypeError('TypeError: ' + f + ' is not a functions');
        }
    } else if (interpret.type && interpret.type === '__RCRE_RUNTIME_FUNCTION__') {
        let object = interpret.object;
        let property = interpret.property;

        if (property === 'call') {
            return object.call(retArgs[0], ...retArgs.slice(1));
        }

        if (property === 'apply') {
            return object.apply(retArgs[0], retArgs.slice(1));
        }

        return object[property](...retArgs);
    } else if (typeof callee !== 'function') {
        throw new TypeError('callee is not a function');
    }

    return f.apply(context, retArgs);
}

export function execConditionExpression(exp: ConditionalExpression, context: Object) {
    let test = execExpression(exp.test, context);

    if (test) {
        return execExpression(exp.consequent, context);
    } else {
        return execExpression(exp.alternate, context);
    }
}

export function execLogicalExpression(exp: LogicalExpression, context: Object) {
    let operator = exp.operator;
    let left = execExpression(exp.left, context);

    switch (operator) {
        case '||':
            if (!!left) {
                return left;
            } else {
                return execExpression(exp.right, context);
            }
        case '&&':
            if (!left) {
                return false;
            } else {
                let right = execExpression(exp.right, context);
                return !!right ? right : false;
            }
        default:
            break;
    }
}

export function execNewExpression(exp: NewExpression, context: Object) {
    let callee = exp.callee;

    if (callee.type !== 'Identifier') {
        throw new TypeError('declaring function in expression string is not supported');
    }

    callee = execExpression(callee, context);

    let args = exp.arguments;
    let retArgs: any[] = [];

    args.forEach(arg => {
        if (arg.type === 'SpreadElement') {
            execSpreadElement(arg, retArgs, context);
        } else {
            let value = execExpression(arg, context);

            if (context && value in context) {
                value = context[value];
            }

            retArgs.push(value);
        }
    });

    if (typeof callee !== 'string') {
        throw new TypeError('invalid callee function of filters');
    }

    if (context && !(callee in context)) {
        throw new TypeError('ReferenceError: ' + callee + ' is not defined');
    }

    let f = context[callee];

    if (typeof f !== 'function') {
        throw new TypeError('TypeError: ' + callee + ' is not a function');
    }
    // @ts-ignore
    return new f(...retArgs);
}

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

export function execObjectExpression(exp: ObjectExpression, context: Object) {
    let properties = exp.properties;
    let newObject = {};

    for (let prop of properties) {
        if (prop.value.type === 'ObjectPattern'
            || prop.value.type === 'ArrayPattern'
            || prop.value.type === 'RestElement'
            || prop.value.type === 'AssignmentPattern') {
            throw new Error('ES6 Pattern syntax is not supported');
        }

        let key = execExpression(prop.key, context);
        let value = execExpression(prop.value, context);

        if (context && key in context) {
            key = context[key];
        }

        if (context && value in context) {
            value = context[value];
        }

        if (key === null || key === undefined || typeof key === 'boolean' || key instanceof RegExp) {
            continue;
        }
        newObject[key] = value;
    }

    return newObject;
}

export function execThisExpression(exp: ThisExpression, context: Object) {
    return context;
}

export function execUnaryExpression(exp: UnaryExpression, context: Object) {
    let operator = exp.operator;
    let argument = exp.argument;

    let ret = execExpression(argument, context);

    if (context && ret in context) {
        ret = context[ret];
    }

    switch (operator) {
        case '-':
            return -ret;
        case '+':
            return +ret;
        case '!':
            return !ret;
        case '~':
            return ~ret;
        case 'typeof':
            return typeof ret;
        default:
            throw new TypeError('UnaryExpression: ' + operator + ' operator is not supported');
    }
}

export function execSpreadElement(element: SpreadElement, arr: any[], context: Object) {
    let args = element.argument;
    let spread = execExpression(args, context);
    if (!spread[Symbol.iterator]) {
        throw new TypeError(spread + '[Symbol.iterator is not a function]');
    }

    let iterator = spread[Symbol.iterator]();
    let next = iterator.next();

    while (!next.done) {
        arr.push(next.value);
        next = iterator.next();
    }
}

export function execExpression(exp: Expression, context: Object): any {
    switch (exp.type) {
        case 'BinaryExpression':
            return execBinaryExpression(exp, context);
        case 'MemberExpression':
            return execMemberExpression(exp, context);
        case 'Literal':
            return exp.value;
        case 'Identifier':
            return exp.name;
        case 'ConditionalExpression':
            return execConditionExpression(exp, context);
        case 'ObjectExpression':
            return execObjectExpression(exp, context);
        case 'ThisExpression':
            return execThisExpression(exp, context);
        case 'ArrayExpression':
            return execArrayExpression(exp, context);
        case 'UnaryExpression':
            return execUnaryExpression(exp, context);
        // case 'UpdateExpression':
        //     return execUpdateExpression(exp, context);
        case 'LogicalExpression':
            return execLogicalExpression(exp, context);
        case 'CallExpression':
            return execCallExpression(exp, context);
        case 'NewExpression':
            return execNewExpression(exp, context);
        case 'AssignmentExpression':
        case 'TemplateLiteral':
        case 'ClassExpression':
        case 'MetaProperty':
        case 'TaggedTemplateExpression':
        case 'AwaitExpression':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'YieldExpression':
        case 'SequenceExpression':
        default:
            throw new TypeError(exp.type + ' is not supported');
    }
}