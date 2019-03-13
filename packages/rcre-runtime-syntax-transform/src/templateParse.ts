const TEMPLATE_TOKEN = '__TEMPLATE_TOKEN__';

export interface ParseRet {
    code: string;
    blackList: {
        [key: string]: boolean
    };
}

enum ParseKind {
    String = 0,
    Property = 1,
    Normal = 2,
}

type CodeItem = {
    code: string;
    index: number;
    strIndex: number;
};

/**
 * 提取模板字符串
 * @param code
 */
function getTemplateToken(code: string) {
    let reg = /(\${([^}]+)})/g;

    let patten = reg.exec(code);
    let blocks = [];
    let strIndex = 0;
    let codeList: CodeItem[] = [];

    while (patten) {
        let index = patten.index;
        let origin = patten[1];
        let source = patten[2];

        blocks.push(code.substring(strIndex, index));
        blocks.push(TEMPLATE_TOKEN);

        strIndex = index + origin.length;

        codeList.push({
            code: source,
            index: blocks.length - 1,
            strIndex: index
        });

        let nextPatten = reg.exec(code);

        if (!nextPatten) {
            blocks.push(code.substring(strIndex));
            break;
        } else {
            patten = nextPatten;
        }
    }

    return {
        blocks,
        codeList
    };
}

/**
 * 处理模板字符串
 * @param code
 */
export function templateParse(code: string): ParseRet {
    let {
        blocks,
        codeList
    } = getTemplateToken(code);

    let blackList = {};

    if (blocks.length === 0) {
        return {
            code: code,
            blackList: blackList
        };
    }

    for (let i = 0; i < codeList.length; i ++) {
        let codeItem = codeList[i];
        let kind = detectCodeKind(code, codeItem);

        switch (kind) {
            default:
            case ParseKind.Normal: {
                let codeIndex = codeItem.index;
                blocks[codeIndex] = codeItem.code;
                blackList[codeItem.code] = true;
            }
                break;
            case ParseKind.Property: {
                let codeIndex = codeItem.index;
                let prevStr = blocks[codeIndex - 1];
                if (!prevStr) {
                    break;
                }

                blocks[codeIndex - 1] = prevStr.slice(0, -1);
                blocks[codeIndex] = '[' + codeItem.code + ']';
                blackList[codeItem.code] = true;
            }
                break;
            case ParseKind.String: {
                let codeIndex = codeItem.index;
                let prevStr = blocks[codeIndex - 1];
                let nextStr = blocks[codeIndex + 1];
                let prevDoubleCommaIndex = prevStr.lastIndexOf('"');
                let prevSingleCommaIndex = prevStr.lastIndexOf('\'');
                let prevCommaIndex = prevDoubleCommaIndex;
                if (prevDoubleCommaIndex < prevSingleCommaIndex) {
                    prevCommaIndex = prevSingleCommaIndex;
                }

                if (prevDoubleCommaIndex < 0 && prevSingleCommaIndex < 0) {
                    break;
                }

                let nextDoubleCommaIndex = nextStr.indexOf('"');
                let nextSingleCommaIndex = nextStr.indexOf('\'');
                let nextCommaIndex = nextDoubleCommaIndex;

                if (nextSingleCommaIndex >= 0 && nextSingleCommaIndex < nextDoubleCommaIndex) {
                    nextCommaIndex = nextSingleCommaIndex;
                }

                if (nextCommaIndex < 0) {
                    nextCommaIndex = nextStr.indexOf('\'');
                }

                let prevChunk = blocks[codeIndex - 1].substring(prevCommaIndex + 1);
                let nextChunk = blocks[codeIndex + 1].substring(0, nextCommaIndex);

                blocks[codeIndex - 1] = blocks[codeIndex - 1].substring(0, prevCommaIndex);
                blocks[codeIndex + 1] = blocks[codeIndex + 1].substring(nextCommaIndex + 1);

                blocks[codeIndex] = `('${prevChunk}' + ${codeItem.code} + '${nextChunk}')`;
                blackList[codeItem.code] = true;

                break;
            }
        }

    }

    return {
        code: blocks.join(''),
        blackList: blackList
    };
}

/**
 * 判断代码类型
 * @param source
 * @param codeItem
 */
function detectCodeKind(source: string, codeItem: CodeItem): number {
    let codeIndex = codeItem.strIndex;

    if (codeIndex === 0) {
        return ParseKind.Normal;
    }

    // 使用 . 访问
    if (source[codeIndex - 1] === '.') {
        return ParseKind.Property;
    }

    let index = codeIndex - 1;
    let isString = false;
    while (index >= 0) {
        let char = source[index];

        if (char === '\'' || char === '"') {
            isString = !isString;
        }

        index--;
    }

    if (isString) {
        return ParseKind.String;
    }

    return ParseKind.Normal;
}