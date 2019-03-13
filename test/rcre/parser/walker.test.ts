import {Walker} from 'rcre-runtime';

describe('Walker', () => {
    const code = `var example = 'helloworld';
        console.log(example);
    `;
    const walker = new Walker(code);

    it('charCode()', () => {
        expect(walker.charCode(0)).toBe(118);
    });

    it('currentNode()', () => {
        expect(walker.currentCode()).toBe(118);
        walker.go(1);
        expect(walker.currentCode()).toBe(97);
    });

    it('cut(0, 1)', () => {
        expect(walker.cut(0, 1)).toBe('v');
    });

    it('go(1)', () => {
        walker.reset();
        walker.go(2);
        expect(walker.currentCode()).toBe(114);
    });

    it('isEnd()', () => {
        walker.go(code.length);
        expect(walker.isEnd()).toBe(true);
    });

    it('nextCode()', () => {
        walker.reset();
        expect(walker.currentCode()).toBe(118);
        expect(walker.nextCode()).toBe(97);
        expect(walker.nextCode()).toBe(114);
    });

    it('findCharUtil()', () => {
        walker.reset();

        walker.findCharUtil('=');
        expect(walker.currentCode()).toBe(61);
    });

    it('findCharUtil("{", "}")', () => {
        const str = '{{{name: 1}}}';
        const walk = new Walker(str);
        walk.findCharUtil('}', '{');
        expect(str.substring(0, walk.index + 1)).toBe(str);
    });

    it('findStrUtil()', () => {
        walker.reset();

        walker.findStrUtil('helloworld');
        expect(walker.currentCode()).toBe(39);
    });
});
