import {getRuntimeContext, runTimeType} from "rcre";
import {parseExpressionString} from '../../../packages/rcre/src/core/util/vm';
import {getParamsFromFuncCall, isExpressionString} from 'rcre-runtime';

describe('parseExpressString', () => {
    let runTime: runTimeType;

    beforeEach(() => {
        runTime = getRuntimeContext({
            info: {
                type: 'null'
            }
        }, {});
    });

    it('#ES{1 + 1}', () => {
        let ret = parseExpressionString('#ES{1 + 1}', runTime);
        expect(ret).toBe(2);
    });

    it('a#ES{1 + 1}', () => {
        let ret = parseExpressionString('a#ES{1 + 1}', runTime);
        expect(ret).toBe('a2');
    });

    it('#ES{1} + #ES{2}', () => {
        let ret = parseExpressionString('#ES{1} + #ES{2}', runTime);
        expect(ret).toBe('1 + 2');
    });

    it('#ES{"1"} + #ES{1}', () => {
        let ret = parseExpressionString('#ES{"1"} + #ES{1}', runTime);
        expect(ret).toBe('1 + 1');
    });

    it('#ES{1}es', () => {
        let ret = parseExpressionString('#ES{1}es', runTime);
        expect(ret).toBe('1es');
    });

    it('dataIndex_#ES{0}', () => {
        let ret = parseExpressionString('dataIndex_#ES{0}', runTime);
        expect(ret).toBe('dataIndex_0');
    });

    it('#ES{1 + 1}es', () => {
        let ret = parseExpressionString('#ES{1 + 1}es', runTime);
        expect(ret).toBe('2es');
    });

    it('you are the #ES{1 + 1}th', () => {
        let ret = parseExpressionString('you are the #ES{1 + 1}th', runTime);
        expect(ret).toBe('you are the 2th');
    });

    it('#ES{[1,2,3,4][0]}', () => {
        let ret = parseExpressionString('#ES{[1,2,3,4][0]}', runTime);
        expect(ret).toBe(1);
    });

    it('#ES{[1,"2",3,4][1]}', () => {
        let ret = parseExpressionString('#ES{[1,"2",3,4][1]}', runTime);
        expect(ret).toBe('2');
    });

    it('#ES{{name: 1}}', () => {
        let ret = parseExpressionString('#ES{{name: 1}}', runTime);
        expect(ret).toEqual({name: 1});
    });

    it('#ES{$data}', () => {
        runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: {
                name: 1
            }
        }, {});

        let ret = parseExpressionString('#ES{$data}', runTime);
        expect(JSON.stringify(ret)).toBe('{"name":1}');
    });

    it('#ES{$data["name"]}', () => {
        runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: {
                name: 1
            }
        }, {});

        let ret = parseExpressionString('#ES{$data["name"]}', runTime);
        expect(ret).toBe(1);
    });

    it('#ES{$data["name"]}', () => {
        runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: {
                name: 1
            }
        }, {});

        let ret = parseExpressionString('#ES{$data["name"]}', runTime);
        expect(ret).toBe(1);
    });

    it('#ES{{arr: [{name: 1}, {name: 2}]}["arr"]}', () => {
        runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: {
                arr: [
                    {
                        name: 1
                    },
                    {
                        name: 2
                    }
                ]
            }
        }, {});

        let ret = parseExpressionString('#ES{$data.arr[0]}', runTime);
        expect(ret).toEqual({name: 1});
    });

    it('#ES{{arr: [{name: 1}, {name: 2}]}["arr"].length}', () => {
        runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: {
                arr: [
                    {
                        name: 1
                    },
                    {
                        name: 2
                    }
                ]
            }
        }, {});

        let ret = parseExpressionString('#ES{$data.arr.length}', runTime);
        expect(ret).toBe(2);
    });

    it('#ES{Object.keys({name: 1, age: 2})}', () => {
        let ret = parseExpressionString('#ES{Object.keys({name: 1, age: 2})}', runTime);
        expect(ret.length).toBe(2);
        expect(ret[0]).toBe('name');
        expect(ret[1]).toBe('age');
    });

    it('#ES{$data[0]["name"][1]["age"]}', () => {
        runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: [
                {
                    name: [
                        {},
                        {
                            age: 10
                        }
                    ]
                }
            ]
        }, {});

        let ret = parseExpressionString('#ES{$data[0]["name"][1]["age"]}', runTime);
        expect(ret).toBe(10);
    });
});

describe('getParamsFromFuncCall', () => {
    it('number params from func(1,2,3,4)', () => {
        let params = getParamsFromFuncCall('func(1,2,3,4,5)');
        expect(params).toEqual([1, 2, 3, 4, 5]);
    });

    it('number and string params from func(1,2,3,4, $data)', () => {
        let params = getParamsFromFuncCall('func(1,2,3,4, $data)');
        expect(params).toEqual([1, 2, 3, 4, '$data']);
    });

    it('string params from func($data.name, $data1, $vn2)', () => {
        let params = getParamsFromFuncCall('func($data.name, $data1, $vn2)');
        expect(params).toEqual(['$data.name', '$data1', '$vn2']);
    });

    it('boolean params from func(1, $data.name)', () => {
        let params = getParamsFromFuncCall('func(true, 1, $data.name)');
        expect(params).toEqual([true, 1, '$data.name']);
    });

    it('null params from func(1, null, $data.name)', () => {
        let params = getParamsFromFuncCall('func(true, null, undefined, 1, $data.name)');
        expect(params).toEqual([true, null, undefined, 1, '$data.name']);
    });

    it('nest func call', () => {
        let params = getParamsFromFuncCall('func(1, func(2, func(3)), 4)');
        expect(params).toEqual([1, 2, 3, 4]);
    });

    it('strange nest func call', () => {
        let params = getParamsFromFuncCall('func(func(func(func(func(true,name,$data.name,4,5),6),7),8)');
        expect(params).toEqual([true, 'name', '$data.name', 4, 5, 6, 7, 8]);
    });
});

describe('isExpressionString', () => {
    it('valid expressionString', () => {
        let result = isExpressionString('#ES{1 + 1}');
        expect(result).toBe(true);
    });

    it('invalid expressionString', () => {
        let result = isExpressionString('1 + "#5BC49F"}');
        expect(result).toBe(false);
    });
});
