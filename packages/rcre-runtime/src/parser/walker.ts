/**
 * @file class util used to read source code
 * @author dongtiancheng, thanks to erik
 */

export class Walker {
    private code: string;
    private length: number;
    public index: number;

    constructor(code: string) {
        this.code = code;
        this.length = code.length;
        this.index = 0;
    }

    /**
     * 获取当前字符的unicode码
     *
     * @param {number} index
     * @returns {number}
     */
    public charCode(index: number) {
        return this.code.charCodeAt(index);
    }

    /**
     * 获取当前指向的字节码
     * @returns {number}
     */
    public currentCode() {
        if (this.index >= this.length) {
            return -1;
        }

        return this.charCode(this.index);
    }

    /**
     * 获取片段
     *
     * @param {number} start
     * @param {number} end
     * @returns {string}
     */
    public cut(start: number, end: number) {
        return this.code.slice(start, end);
    }

    /**
     * 重置指向
     */
    public reset() {
        this.index = 0;
    }

    /**
     * 向右读取字符串
     * @param {number} distance
     */
    public go(distance: number) {
        this.index += distance;
    }

    /**
     * 是否到达尾部
     * @returns {boolean}
     */
    public isEnd() {
        return this.index >= this.length;
    }

    /**
     * 获取下一个字符
     * @returns {number}
     */
    public nextCode() {
        this.go(1);
        return this.currentCode();
    }

    /**
     * 向右边读取字符，直到遇到指定字符再停止
     * @param {string} char 目标字符
     * @param {string} repeatStr 需要绕过的成对字符
     * @returns {number}
     */
    public findCharUtil(char?: string, repeatStr?: string) {
        let code;
        let charCode = -1;

        if (char) {
            charCode = char.charCodeAt(0);
        }

        let repeatCount = 0;
        let repeatCharCode = -1;

        if (repeatStr) {
            repeatCharCode = repeatStr.charCodeAt(0);
        }

        while (this.index < this.length && (code = this.currentCode())) {
            switch (code) {
                case 32:
                case 9:
                    this.index++;
                    break;
                case repeatCharCode:
                    repeatCount++;
                    this.index++;
                    break;
                default:
                    if (code === charCode) {
                        if (repeatCount > 0) {
                            repeatCount--;
                        }

                        if (repeatCount === 0) {
                            return this.index;
                        }
                    }
                    this.index++;
            }
        }

        return -1;
    }

    /**
     * 移动到右边包含一下字符串的位置
     * @param {string} str
     */
    public findStrUtil(str: string) {
        let code;
        let strCharCode = str.split('').map(word => word.charCodeAt(0));

        while (this.index < this.length && (code = this.currentCode())) {
            if (code === strCharCode[0]) {
                let isMatch = true;
                for (let index = 1; index < strCharCode.length; index++) {
                    if (this.charCode(this.index + index) !== strCharCode[index]) {
                        isMatch = false;
                    }
                }

                if (isMatch) {
                    this.go(-1);
                    return this.index;
                }
            }

            this.index++;
        }

        return -1;
    }
}
