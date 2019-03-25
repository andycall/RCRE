import {parse} from 'acorn';
import * as ESTree from 'estree';
import {Statement} from 'estree';
import {execExpression} from './execExpression';

const ASTCache: Map<string, ESTree.Program> = new Map();

function execStatement(statement: Statement, context: Object) {
    switch (statement.type) {
        case 'ExpressionStatement':
            return execExpression(statement.expression, context);
        default:
            throw new Error(`type: ${statement.type} is not supported`);
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
