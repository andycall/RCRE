import * as ts from 'typescript';
import {isExpressionString, parseExpressionToken, TokenItem} from 'rcre-runtime';
import {templateParse} from './templateParse';

export * from './templateParse';

const TOKEN_PLACEHOLDER = '__TOKEN__ITEM__';

type BlackList = {
    [key: string]: boolean;
};

/**
 * 生成节点的操作 递归
 * @param node {ts.node} 当前节点
 * @param blackList {BlackList} 属性黑名单
 * @param isInBlackList {boolean} 表达式是否在属性黑名单中
 * @param parentNode {ts.node} 节点的父节点
 * @param isKey {boolean} 是否是key 用于判断是否需要添加runTime
 * @return node {ts.node} 处理后的节点
 */
function generateNode(node: ts.Node, blackList: BlackList, isInBlackList: boolean, parentNode?: ts.Node, isKey?: boolean): any {
    isInBlackList = isInBlackList || blackList[node.getText()];
    switch (node.kind) {
        case ts.SyntaxKind.PropertyAccessExpression:
        case ts.SyntaxKind.ElementAccessExpression:
            return createAccessExpression(node, blackList, isInBlackList);
        case ts.SyntaxKind.ParenthesizedExpression:
            // 括号
            return ts.createParen(
                generateNode(node.getChildren()[1], blackList, isInBlackList)
            );
        case ts.SyntaxKind.BinaryExpression:
            // && || 表达式
            return ts.createBinary(
                generateNode(node.getChildren()[0], blackList, isInBlackList, node),
                generateNode(node.getChildren()[1], blackList, isInBlackList, node),
                generateNode(node.getChildren()[2], blackList, isInBlackList, node)
            );
        case ts.SyntaxKind.ConditionalExpression:
            // ? 条件表达式
            return ts.createConditional(
                generateNode(node.getChildren()[0], blackList, isInBlackList),
                generateNode(node.getChildren()[2], blackList, isInBlackList),
                generateNode(node.getChildren()[4], blackList, isInBlackList)
            );
        case ts.SyntaxKind.PrefixUnaryExpression:
            // 前缀符号
            return ts.createPrefix(
                node['operator'],
                generateNode(node.getChildren()[1], blackList, isInBlackList)
            );
        case ts.SyntaxKind.CallExpression:
            // 函数
            let funcArgs: any = [];
            node.getChildAt(2).getChildren().forEach((argument: ts.Node) => {
                if (argument.kind !== ts.SyntaxKind.CommaToken) {
                    funcArgs.push(generateNode(argument, blackList, isInBlackList));
                }
            });

            return ts.createCall(
                generateNode(node.getChildren()[0], blackList, isInBlackList),
                undefined,
                funcArgs
            );
        case ts.SyntaxKind.Identifier:
            // 变量
            if (!isKey && !isInBlackList) {
                return ts.createIdentifier('runTime.' + node.getText());
            } else {
                return ts.createIdentifier(node.getText());
            }
        case ts.SyntaxKind.ObjectLiteralExpression:
            // {} 对象类型
            let properties: any = [];
            node.getChildren()[1].getChildren().forEach((curNode: ts.Node) => {
                if (curNode.kind !== ts.SyntaxKind.CommaToken) {
                    properties.push(generateNode(curNode, blackList, isInBlackList));
                }
            });
            return ts.createObjectLiteral(
                properties
            );
        case ts.SyntaxKind.PropertyAssignment:
            // 对象的属性
            return ts.createPropertyAssignment(
                generateNode(node.getChildren()[0], blackList, isInBlackList, node, true),
                generateNode(node.getChildren()[2], blackList, isInBlackList)
            );
        case ts.SyntaxKind.NewExpression:
            // new
            let newArgs: any = [];
            node.getChildAt(3).getChildren().forEach((argument: ts.Node) => {
                if (argument.kind !== ts.SyntaxKind.CommaToken) {
                    newArgs.push(generateNode(argument, blackList, isInBlackList));
                }
            });

            return ts.createNew(
                ts.createIdentifier('runTime.' + node.getChildren()[1].getText()),
                undefined,
                newArgs
            );
        case ts.SyntaxKind.ArrayLiteralExpression:
            // [] 数组类型
            let elements: any = [];
            node.getChildren()[1].getChildren().forEach((curNode: ts.Node) => {
                if (curNode.kind !== ts.SyntaxKind.CommaToken) {
                    elements.push(generateNode(curNode, blackList, isInBlackList));
                }
            });
            return ts.createArrayLiteral(
                elements
            );
        case ts.SyntaxKind.RegularExpressionLiteral:
            // 正则表达式
            return ts.createRegularExpressionLiteral(node.getText());
        case ts.SyntaxKind.AmpersandAmpersandToken:
            // 符号
            return node.kind;
        case ts.SyntaxKind.NumericLiteral:
            // 数字
            return ts.createNumericLiteral(node.getText());
        case ts.SyntaxKind.SpreadElement:
            // ...
            return ts.createSpread(
                generateNode(node.getChildAt(1), blackList, isInBlackList)
            );
        case ts.SyntaxKind.StringLiteral:
            // 字符串
            return ts.createStringLiteral(node.getText().slice(1, node.getText().length - 1));
        default:
            return node;
    }
}

/**
 * 根据传入的kind创建不同的表达式
 * @param kind {number}
 * @return {Expression}
 */
function createAccessExpressionByKind(kind: number, keyExpression: ts.Expression, valueExpression: any) {
    if (kind === ts.SyntaxKind.PropertyAccessExpression) {
        return ts.createPropertyAccess(
            keyExpression,
            valueExpression
        );
    } else {
        return ts.createElementAccess(
            keyExpression,
            valueExpression
        );
    }
}

/**
 * a.b.c.d => runTime.a.b.c.d 类似的类型生成逻辑
 * 左侧加runTime时 所有结合方式改变 树需要重新生成
 * ((a.b).c).d => (((runTime.a).b).c).d
 * @param node {ts.Node}
 * @param blackList {BlackList}
 * @return {Expression}
 */
function createAccessExpression(node: ts.Node, blackList: BlackList, isInBlackList: boolean) {
    // 使用栈存储树结构
    // stack存储节点
    // accessStack存储链接节点的方式
    let stack: any = [];
    let accessStack: any = [];
    let curNode = node;

    while (curNode.kind === ts.SyntaxKind.PropertyAccessExpression || curNode.kind === ts.SyntaxKind.ElementAccessExpression) {
        accessStack.push(curNode.kind);
        stack.push(curNode.getChildAt(2));
        curNode = curNode.getChildAt(0);
    }

    let newAccessExpression = createAccessExpressionByKind(
        accessStack.pop(),
        generateNode(curNode, blackList, isInBlackList, undefined, blackList[node.getText()]),
        generateNode(stack.pop(), blackList, isInBlackList, undefined, true)
    );

    while (stack.length > 0) {
        let cur = stack.pop();
        newAccessExpression = createAccessExpressionByKind(
            accessStack.pop(),
            newAccessExpression,
            generateNode(cur, blackList, isInBlackList, undefined, true)
        );
    }
    return newAccessExpression;
}

export function createNodeFromSource(sourceCode: string, blackList: BlackList) {
    let sourceFile: ts.SourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.ES2015,
        true,
        ts.ScriptKind.TS
    );

    return generateNode(sourceFile.statements[0].getChildAt(0), blackList, false, undefined, undefined);
}

function createNodeFromExpressionString(esString: string, blackList: BlackList) {
    esString = esString.trim();
    let tokens = parseExpressionToken(esString);
    let code: string = '';

    let generatedCode;

    if (tokens.length === 1 && tokens[0].token) {
        code = tokens[0].token!;
        return createNodeFromSource(code, blackList);
    } else if (tokens.length > 1) {
        let strSplits: string[] = [];
        let index = 0;
        for (let i = 0; i < tokens.length; i ++) {
            if (tokens[i].token) {
                strSplits.push(esString.slice(index, tokens[i].start));
                strSplits.push(TOKEN_PLACEHOLDER);
                index = tokens[i].end;
            }
        }

        if (index < esString.length) {
            strSplits.push(esString.slice(index, esString.length));
        }

        generatedCode = createTemplateLiteral(strSplits, tokens.filter(token => !!token.token), blackList);
    } else {
        return null;
    }

    return generatedCode;
}

/**
 * 生成箭头函数
 * @param node {ts.Node} 源文件
 * @return {ArrowFunction}
 */
function makeArrowFunction(node: ts.Expression) {
    // 生成箭头函数参数
    let parameters = [
        ts.createParameter(
            undefined,
            undefined,
            undefined,
            'runTime',
            undefined,
            ts.createTypeReferenceNode('any', [])
        )
    ];

    // 生成箭头函数body
    let body = ts.createBlock(
        [ts.createReturn(node)],
        true
    );

    // 生成箭头函数语句
    let arrowFunction = ts.createArrowFunction(
        undefined,
        undefined,
        parameters,
        undefined,
        undefined,
        body
    );

    // 生成包裹as any的定义
    return ts.createAsExpression(
        ts.createParen(arrowFunction),
        ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
    );
}

/**
 * 生成闭包包裹的箭头函数
 * @param node {ts.Node} 源文件
 * @return {ArrowFunction}
 */
function makeClosureArrowFunction(node: ts.Expression) {
    let arrowFunction = makeArrowFunction(node);

    // 生成闭包函数
    let closureFunction = ts.createCall(
        ts.createParen(arrowFunction),
        undefined,
        []
    );

    // 生成[]包裹
    return ts.createComputedPropertyName(
        closureFunction
    );
}

/**
 * 创建模板字符串
 * @param strSplits 模板片段
 * @param tokens 代码片段
 * @param blackList 黑名单变量
 */
function createTemplateLiteral(strSplits: string[], tokens: TokenItem[], blackList: BlackList) {
    let headStr;

    if (strSplits[0] === TOKEN_PLACEHOLDER) {
        headStr = '';
    } else {
        headStr = strSplits.shift() || '';
    }

    let head = ts.createTemplateHead(headStr);
    let spans = [];

    for (let i = 0; i < tokens.length; i ++) {
        let code = tokens[i].token!;

        if (i < tokens.length - 1) {
            let node = createNodeFromSource(code, blackList);
            strSplits.shift();
            let middleText = strSplits.shift() || '';
            let middle = ts.createTemplateMiddle(middleText);
            let span = ts.createTemplateSpan(node, middle);
            spans.push(span);
        } else {
            let node = createNodeFromSource(code, blackList);
            strSplits.shift();
            let tailText = strSplits.shift() || '';
            let tail = ts.createTemplateTail(tailText);
            let span = ts.createTemplateSpan(node, tail);
            spans.push(span);
        }
    }

    return ts.createTemplateExpression(head, spans);
}

/**
 * 将ES表达式中的内容根据自定义函数进行转换
 * @param esString {string} ES表达式中的内容
 * @return {string} 表达式转换成箭头函数
 */
export function transform(esString: string) {
    let sourceFile: ts.SourceFile = ts.createSourceFile(
        'test.ts',
        esString,
        ts.ScriptTarget.ES2015,
        true,
        ts.ScriptKind.TS
    );

    let expression = generateNode(sourceFile.statements[0].getChildAt(0), {}, false);
    let node = makeArrowFunction(expression);
    let printer: ts.Printer = ts.createPrinter();
    let result = printer.printNode(
        ts.EmitHint.Unspecified,
        node,
        sourceFile
    );

    return result;
}

const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
    function visit(node: ts.Node): ts.Node {
        node = ts.visitEachChild(node, visit, context);

        switch (node.kind) {
            case ts.SyntaxKind.PropertyAssignment: {
                let assignment = node as ts.PropertyAssignment;
                let name = assignment.name;
                let initializer = assignment.initializer;

                if (name.kind === ts.SyntaxKind.StringLiteral) {
                    let text = name.text.trim();
                    if (isExpressionString(text)) {
                        let generateCode = createNodeFromExpressionString(text, {});

                        if (!generateCode) {
                            return node;
                        }

                        let key = makeClosureArrowFunction(generateCode);
                        return ts.createPropertyAssignment(key, initializer);
                    }
                } else if (name.kind === ts.SyntaxKind.ComputedPropertyName) {
                    if (name.expression.kind === ts.SyntaxKind.StringLiteral) {
                        let text = name.expression['text'];
                        if (isExpressionString(text)) {
                            let generateCode = createNodeFromExpressionString(text, {});

                            if (!generateCode) {
                                return node;
                            }

                            let key = makeClosureArrowFunction(generateCode);
                            return ts.createPropertyAssignment(key, initializer);
                        }
                    }
                    if (name.expression.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
                        || name.expression.kind === ts.SyntaxKind.TemplateExpression) {
                        let text = name.expression.getText().trim();
                        let {
                            code,
                            blackList
                        } = templateParse(text);
                        code = code.slice(1, -1);

                        if (isExpressionString(code)) {
                            let generatedNode = createNodeFromExpressionString(code, blackList);

                            if (!generatedNode) {
                                return node;
                            }

                            let key =  makeClosureArrowFunction(generatedNode);
                            return ts.createPropertyAssignment(key, initializer);
                        }
                    }
                }
                break;
            }
            case ts.SyntaxKind.TemplateExpression:
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
                if (node.parent.kind === ts.SyntaxKind.ComputedPropertyName && (node.parent as ts.ComputedPropertyName).expression === node) {
                    break;
                }
                let text = node.getText().trim();
                let {
                    code,
                    blackList
                } = templateParse(text);
                code = code.slice(1, -1);

                if (isExpressionString(code)) {
                    let generatedNode = createNodeFromExpressionString(code, blackList);

                    if (!generatedNode) {
                        return node;
                    }

                    return makeArrowFunction(generatedNode);
                }
                break;
            }
            case ts.SyntaxKind.StringLiteral: {
                if ((node.parent.kind === ts.SyntaxKind.PropertyAssignment && (node.parent as ts.PropertyAssignment).name === node)
                    || (node.parent.kind === ts.SyntaxKind.ComputedPropertyName && (node.parent as ts.ComputedPropertyName).expression === node)) {
                    break;
                }

                let text = node.getText().slice(1, -1).trim();
                if (isExpressionString(text)) {
                    let generatedNode = createNodeFromExpressionString(text, {});

                    if (!generatedNode) {
                        return node;
                    }

                    return makeArrowFunction(generatedNode);
                }
                break;
            }
            default:
        }

        return node;
    }

    return ts.visitNode(rootNode, visit);
};

const stringPreCompileTransFormer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
    function visit(node: ts.Node): ts.Node {
        node = ts.visitEachChild(node, visit, context);
        if (node.kind === ts.SyntaxKind.BinaryExpression) {
            let binary = node as ts.BinaryExpression;

            if (binary.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
                return node;
            }

            let leftKind = binary.left.kind;
            let rightKind = binary.right.kind;

            let left: string = '';
            let right: string = '';

            // 两边都是直接拼接的字符串
            if (
                (leftKind === ts.SyntaxKind.StringLiteral ||
                leftKind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
                leftKind === ts.SyntaxKind.TemplateExpression) &&
                (rightKind === ts.SyntaxKind.StringLiteral ||
                rightKind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
                rightKind === ts.SyntaxKind.TemplateExpression)
            ) {
                if (leftKind === ts.SyntaxKind.TemplateExpression) {
                    let expression = binary.left as ts.TemplateExpression;
                    let head = expression.head.text;
                    let spans = expression.templateSpans.map((span: ts.TemplateSpan) => {
                        let tail = span.literal.text;
                        let body = span.expression.getText();

                        return '${' + body + '}' + tail;
                    });

                    left = head + spans.join('');
                } else if (binary.left.kind === ts.SyntaxKind.StringLiteral || binary.left.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
                    let leftNode = binary.left as ts.StringLiteralLike;
                    left = leftNode.text;
                }

                if (rightKind === ts.SyntaxKind.TemplateExpression) {
                    let expression = binary.right as ts.TemplateExpression;
                    let head = expression.head.text;
                    let spans = expression.templateSpans.map((span: ts.TemplateSpan) => {
                        let tail = span.literal.text;
                        let body = span.expression.getText();

                        return '${' + body + '}' + tail;
                    });

                    right = head + spans.join('');
                } else if (binary.right.kind === ts.SyntaxKind.StringLiteral || binary.right.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
                    let rightNode = binary.right as ts.StringLiteralLike;
                    right = rightNode.text;
                }

                return ts.createNoSubstitutionTemplateLiteral(left + right);
            }
        }
        return node;
    }
    return ts.visitNode(rootNode, visit);
};

function stringPreCompile(code: string, fileKind: string = 'ts') {
    let fileKindMap = {
        'ts': ts.ScriptKind.TS,
        'tsx': ts.ScriptKind.TSX
    };
    const printer: ts.Printer = ts.createPrinter();

    const sourceFile: ts.SourceFile = ts.createSourceFile(
        'test.ts', code, ts.ScriptTarget.ES2015, true, fileKindMap[fileKind]
    );

    const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
        sourceFile, [stringPreCompileTransFormer]
    );

    const transformedSourceFile: ts.SourceFile = result.transformed[0];

    return printer.printFile(transformedSourceFile);
}

/**
 * 将整个文件内容进行转换
 * @param file {string} 文件的内容
 * @return {string} 转换后的文件内容
 */
export function transformFile(file: string, fileKind: string = 'ts') {
    file = stringPreCompile(file, fileKind);
    const printer: ts.Printer = ts.createPrinter();

    let fileKindMap = {
        'ts': ts.ScriptKind.TS,
        'tsx': ts.ScriptKind.TSX
    };

    const sourceFile: ts.SourceFile = ts.createSourceFile(
        'test.ts', file, ts.ScriptTarget.ES2015, true, fileKindMap[fileKind]
    );

    const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
        sourceFile, [transformer]
    );
    const transformedSourceFile: ts.SourceFile = result.transformed[0];

    return printer.printFile(transformedSourceFile);
}
