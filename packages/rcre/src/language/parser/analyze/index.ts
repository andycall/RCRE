// import {parse} from 'acorn';
// import {walker} from './walker';
//
// /**
//  * 分析调用代码的依赖
//  * @param {string} code
//  * @param {string} base
//  */
// export function analyzeCodeDependencies(code: string, base: string): string[] | null {
//     let ast = parse(code);
//     let body = ast.body;
//
//     if (body.length === 0) {
//         return null;
//     }
//
//     let firstLine = body[0];
//
//     if (firstLine.type === 'ImportDeclaration' ||
//         firstLine.type === 'ExportNamedDeclaration' ||
//         firstLine.type === 'ExportDefaultDeclaration' ||
//         firstLine.type === 'ExportAllDeclaration') {
//         return null;
//     }
//
//     let dependencies: string[] = [];
//
//     switch (firstLine.type) {
//         case 'ExpressionStatement':
//             walker(firstLine.expression, dependencies, base);
//             break;
//         default:
//             return null;
//     }
//
//     return dependencies;
// }