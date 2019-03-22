import {parse} from 'acorn';
import * as ESTree from 'estree';
import {Expression, Statement} from 'estree';
import {execBinaryExpression} from './expression/binarayExpression';
import {execMemberExpression} from './expression/memberExpression';
import {execConditionExpression} from './expression/conditionalExpression';
import {execObjectExpression} from './expression/objectExpression';
import {execThisExpression} from './expression/thisExpression';
import {execArrayExpression} from './expression/arrayExpression';
import {execUnaryExpression} from './expression/unaryExpression';
import {execLogicalExpression} from './expression/logicalExpression';
import {execCallExpression} from './expression/callExpression';
import {execNewExpression} from './expression/newExpression';

const ASTCache: Map<string, ESTree.Program> = new Map();

function execStatement(statement: Statement, context: Object) {
    switch (statement.type) {
        case 'ExpressionStatement':
            return execExpression(statement.expression, context);
        default:
            throw new Error(`type: ${statement.type} is not supported`);
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

export function evaluation(code: string, context: Object) {
    let ast = ASTCache.get(code);

    if (!ast) {
        ast = parse(code);
        ASTCache.set(code, ast);
    }

    let body = ast.body;

    if (body.length === 0) {
        return null;
    }

    let firstLine = body[0];

    if (firstLine.type === 'ImportDeclaration' ||
        firstLine.type === 'ExportNamedDeclaration' ||
        firstLine.type === 'ExportDefaultDeclaration' ||
        firstLine.type === 'ExportAllDeclaration') {
        throw new Error('module declaration is not supported in expressionString');
    }

    if (firstLine.type === 'ExpressionStatement') {
        let exp = firstLine.expression;

        if (exp.type === 'Identifier') {
            let name = exp.name;

            if (context && !(name in context)) {
                throw new TypeError(name + ' is not defined');
            }

            return context[name];
        }
    }

    return execStatement(firstLine, context);
}
