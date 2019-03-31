import { compileExpressionString } from '../../../packages/rcre/src/core/util/vm';
import { filter } from '../../../packages/rcre/src/core/util/filter';
import {runInContext} from 'rcre-runtime';
import {getRuntimeContext} from 'rcre';

describe('runInContext', () => {
    it('should throw ReferenceError', () => {
        let context = {};

        let ret = () => runInContext(`aaaaaa`, context);
        expect(ret).toThrow();
    });

    it('get Object value through props', () => {
        let context = {
            $data: {
                name: {
                    age: 21
                }
            }
        };

        let ret = runInContext('$data.name.age', context);

        expect(ret).toBe(21);
    });

    it('Throw an error when get Object value which is unreachable', () => {
        let context = {
            $data: {
                name: {
                    age: 21
                }
            }
        };

        let ret = () => runInContext('$data.age.xx', context);

        expect(ret).toThrow();
    });

    it('inject count filter', () => {
        filter.setFilter('count', (prev: number, next: number) => prev + next);

        let context = {
            prev: 1,
            next: 2
        };

        let ret = runInContext('count(prev, next)', context);

        expect(ret).toBe(3);
    });

    it('filter return value changed with params change', () => {
        filter.setFilter('count', (prev: number, next: number) => {
            return prev + next;
        });

        let p = runInContext('count(prev, next)', {prev: 1, next: 2});
        let n = runInContext('count(prev, next)', {prev: 2, next: 1});

        expect(p).toEqual(n);
    });

    it('inject same filter', () => {
        filter.setFilter('count', (prev: number, next: number) => prev + next);

        expect(() =>
            filter.setFilter('count', (prev: number, next: number) => prev + next)
        ).toThrow();
    });

    it('two filter call', () => {
        const sum = (prev: number, next: number) => prev + next;
        const multiply = (prev: number, next: number) => prev * next;

        filter.setFilter('sum', sum);
        filter.setFilter('multiply', multiply);

        let context = {
            prev: 1,
            next: 2
        };

        let ret = runInContext('multiply(sum(prev, next), sum(prev, next))', context);

        expect(ret).toBe(9);
    });

    it('pass number as argument', () => {
        const sum = (prev: number, next: number) => prev + next;
        const multiply = (prev: number, next: number, other: number) => prev * next * other;

        filter.setFilter('sum', sum);
        filter.setFilter('multiply', multiply);

        let context = {
            prev: 1,
            next: 2
        };

        let ret = runInContext('multiply(sum(prev, next), sum(prev, next), 3)', context);
        expect(ret).toBe(27);
    });

    it('use args in filter func', () => {
        const sumAll = (...args: number[]) => args.reduce((total, next) => total + next, 0);

        filter.setFilter('sumAll', sumAll);

        let context = {
            prev: 1,
            next: 2
        };

        let ret = runInContext('sumAll(prev, next, 3, 4, 5, 6, 7, 8)', context);

        expect(ret).toBe(36);
    });

    it('use ternary operator before filter call', () => {
        const sumAll = (...args: number[]) => args.reduce((total, next) => total + next, 0);

        filter.setFilter('sumAll', sumAll);

        let context = {
            prev: 1,
            next: 2
        };

        let ret = runInContext('1 > 0 ? sumAll(prev, next) : sumAll(-prev, -next)', context);
        let reverse = runInContext('1 < 0 ? sumAll(prev, next) : sumAll(-prev, -next)', context);

        expect(ret).toBe(3);
        expect(reverse).toBe(-3);
    });

    afterEach(() => {
        filter.clearFilter();
    });
});

describe('compileExpressionString', () => {
    it('{name: "#ES{1 + 1}"}', () => {
        let info = {
            name: '#ES{1 + 1}'
        };
        let runTime = getRuntimeContext({
            info: {
                type: 'null'
            }
        }, {});
        let ret = compileExpressionString(info, runTime);
        expect(typeof ret).toBe('object');
        expect(ret.name).toBe(2);
    });

    it('{$data: [{name: 1}, {name: 2}]}', () => {
        let runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: [
                {
                    name: 1
                },
                {
                    name: 2
                }
            ],
        }, {});

        let ret = compileExpressionString({
            data: '#ES{$data}'
        }, runTime);

        expect(ret.data).toBe(runTime.$data);
    });

    it('nest compiled', () => {
        let $data = {
            'name': 'test',
            'columns': [{ 'title': '姓名', 'dataIndex': 'name' }, { 'title': '年龄', 'dataIndex': 'age' }],
            'dataSource': [{ 'name': 'andycall', 'age': 21 }, {
                'name': 'dongtiancheng',
                'age': 21
            }, { 'name': 'dongtiancheng', 'age': 21 }]
        };
        let runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: $data,
        }, {
            $query: {},
            $global: { 'pageId': '4567', 'username': 'dongtiancheng', 'proxy': 'http://localhost:8800/proxy' }
        });

        let info = {
            'type': 'table',
            'columns': '#ES{$data.columns}',
            'dataSource': '#ES{$data.dataSource}',
            'columnControls': [{
                'title': '下来框',
                'dataIndex': 'dropdown',
                'controls': '#ES{$data.dataSource[0]}'
            }]
        };

        let ret = compileExpressionString(info, runTime, [], true);

        expect(ret.type).toBe('table');
        expect(ret.columns).toEqual($data.columns);
        expect(ret.dataSource).toEqual($data.dataSource);
        expect(ret.columnControls[0].controls).toEqual($data.dataSource[0]);
        expect(info.type).toEqual('table');
        expect(info.columns).toBe('#ES{$data.columns}');
        expect(info.dataSource).toBe('#ES{$data.dataSource}');
        expect(info.columnControls[0].controls).toBe('#ES{$data.dataSource[0]}');
    });

    it('blackList', () => {
        let $data = [
            {
                name: 1
            },
            {
                name: 2
            }
        ];

        let runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: $data,
        }, {
            $query: {},
            $global: { 'pageId': '4567', 'username': 'dongtiancheng', 'proxy': 'http://localhost:8800/proxy' }
        });

        let info = {
            name: {
                arr: ['#ES{$data}', '#ES{$data}', '#ES{$data}', '#ES{$data}'],
                text: '#ES{$data[0].name}'
            },
            age: '#ES{$data[0].name}',
            city: '#ES{$data[0].name}'
        };

        let black = compileExpressionString(info, runTime, ['name.arr', 'age'], true);
        expect(black).toEqual({
            name: {
                arr: ['#ES{$data}', '#ES{$data}', '#ES{$data}', '#ES{$data}'],
                text: 1
            },
            age: '#ES{$data[0].name}',
            city: 1
        });
    });

    it('blackList with array', () => {
        let $data = [
            {
                name: 1
            },
            {
                name: 2
            }
        ];

        let runTime = getRuntimeContext({
            info: {
                type: 'null'
            },
            $data: $data,
        }, {
            $query: {},
            $global: { 'pageId': '4567', 'username': 'dongtiancheng', 'proxy': 'http://localhost:8800/proxy' }
        });

        let info = {
            name: {
                arr: [{
                    arrName: '#ES{$data.name}'
                }, {
                    arrAge: '#ES{$data.name}'
                }, {
                    arrCity: '#ES{$data[0].name}'
                }],
                text: '#ES{$data[0].name}'
            }
        };

        let black = compileExpressionString(info, runTime, ['name.arr[0]', 'name.arr.1'], true);
        expect(black).toEqual({
            name: {
                arr: [{
                    arrName: '#ES{$data.name}'
                }, {
                    arrAge: '#ES{$data.name}'
                }, {
                    arrCity: 1
                }],
                text: 1
            }
        });
    });
});
