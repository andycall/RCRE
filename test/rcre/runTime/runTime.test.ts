import {evaluation} from 'rcre-runtime';

function loopCases(cases: any[], context: Object = {}) {
    for (let i = 0; i < cases.length; i++) {
        let title = cases[i][0];
        let result = cases[i][1];

        it(title, () => {
            let ret = evaluation(title, context);
            expect(ret).toBe(result);
        });
    }
}

describe('Compiler test', () => {
    describe('Error Report', () => {
        expect(() => evaluation('aaaa', {})).toThrow();
    });

    describe('BinaryExpression Test', () => {
        const cases: [string, number | string | boolean][] = [
            ['1 + 1 * 2', 3],
            ['1 * 4', 4],
            ['8 % 3', 2],
            ['8 / 2', 4],
            ['2 ** 3', 8],
            ['2 in [1,2,3,4]', true],
            ['10 >>> 1', 5],
            ['10 >= 10', true],
            ['12 > 10', true],
            ['10 <= 10', true],
            ['12 < 14', true],
            ['true == 1', true],
            ['1 + "2"', '12'],
            ['null + null', 0],
            ['111 + 222', 333],
            ['1 + 1 > 0', true],
            ['-1 + 1', 0]
        ];
        loopCases(cases);
    });

    describe('Literal and Identifier Test', () => {
        let context: Object;
        beforeEach(() => {
            context = {
                x: 4
            };
        });

        it('x + 1', () => {
            let ret = evaluation('x + 1', context);
            expect(ret).toBe(5);
        });

        it('x + x', () => {
            let ret = evaluation('x + x', context);
            expect(ret).toBe(8);
        });

        it('$data.username', () => {
            context = {
                $data: {
                    username: '$data'
                }
            };

            let code = '$data.username + 1';
            expect(evaluation(code, context)).toBe('$data1');
        });
    });

    describe('memberExpression Test', () => {
        let context = {
            obj: {
                age: 10,
                inner: {
                    deep: 2
                },
                innerArr: [5, 6, 7, 8, 9, 10]
            },
            arr: [1, 2, 3, 4, 5],
            str: '0'
        };

        it('obj.age === 10', () => {
            let ret = evaluation('obj.age', context);
            expect(ret).toBe(10);
        });

        it('obj.age + obj.age === 20', () => {
            let ret = evaluation('obj.age + obj.age', context);
            expect(ret).toBe(20);
        });

        it('obj.inner.deep === 2', () => {
            let ret = evaluation('obj.inner.deep', context);
            expect(ret).toBe(2);
        });

        it('obj.arr[0] === 1', () => {
            let ret = evaluation('arr[0]', context);
            expect(ret).toBe(1);
        });

        it('obj.innerArr[0]', () => {
            expect(evaluation('obj.innerArr[0]', context)).toBe(5);
        });

        it('$data', () => {
            let result = evaluation('$data', {
                $data: {
                    name: 1
                }
            });
            expect(result).toEqual({name: 1});
        });

        it('str', () => {
            let result = evaluation('obj.str', {
                obj: {
                    str: '0'
                }
            });
            expect(result).toBe('0');
        });

        it('a', () => {
            let result = evaluation('a', {
                a: 10
            });
            expect(result).toBe(10);
        });

        // it('$data.dynamicSelect + "value"', () => {
        //     let result = evaluation('$data.dynamicSelect + "value"', {
        //         '$data': {
        //             'dynamicSelect': '$parent',
        //             'username': '$thisvalue'
        //         }
        //     });
        //
        //     console.log(result);
        // });
    });

    describe('ObjectExpression', () => {
        it('{name: 1, age: 2}', () => {
            let origin = {
                name: 1,
                age: 2
            };

            expect(typeof evaluation('({name: 1, age: 2})', {})).toBe('object');
            expect(JSON.stringify(evaluation('({name: 1, age: 2})', {}))).toBe(JSON.stringify(origin));
        });

        it('{name: x, age: y}', () => {
            let context = {
                x: 1,
                y: 2
            };

            let ret = {
                name: 1,
                age: 2
            };

            expect(JSON.stringify(evaluation('({name: x, age: y})', context))).toBe(JSON.stringify(ret));
        });

        it('$data.str.split()', () => {
            let context = {
                $data: {
                    str: 'a,b,c,d,e'
                }
            };

            expect(
                evaluation('String.prototype.split.call($data.str, ",")', context))
                .toEqual(['a', 'b', 'c', 'd', 'e']);
        });

        it('$args.value.length === 0', () => {
            let ret = evaluation('$args.value.length === 0', {
                $args: {
                    value: ''
                }
            });
            expect(ret).toBe(true);
        });

        it('Object.prototype.toString.call', () => {
            let result = evaluation('Object.prototype.toString({name: 1})', {});
            expect(result).toBe('[object Object]');
        });

        it('[].slice', () => {
            let result = evaluation('[1,2,3,4,5,6].slice(3)', {});
            expect(result).toEqual([4, 5, 6]);
        });

        it('Array.prototype.slice.call', () => {
            let result = evaluation('Array.prototype.slice.call([1,2,3,4,5,6], 2)', {});
            expect(result).toEqual([3, 4, 5, 6]);
        });

        it('Array.prototype.slice.apply', () => {
            let result = evaluation('Array.prototype.slice.apply([1,2,3,4,5,6], [2])', {});
            expect(result).toEqual([3, 4, 5, 6]);
        });

        it('JSON.stringify({name: 1, age: 2})', () => {
            let result = evaluation('JSON.stringify({name: 1, age: 2})', {});
            expect(result).toBe(JSON.stringify({name: 1, age: 2}));
        });
    });

    describe('ConditionExpression', () => {
        it('1 + 1 > 0 ? true : false', () => {
            expect(evaluation('1 + 1 > 0 ? true : false', {})).toBe(true);
        });

        it('1 + 1 < 0 ? true : false', () => {
            expect(evaluation('1 + 1 < 0 ? true : false', {})).toBe(false);
        });

        it('({name: true}).name ? true : false', () => {
            expect(evaluation('({name: true}).name ? true : false', {})).toBe(true);
        });

        it('1 > 0 ? sumAll(prev, next) : sumAll(-prev, -next)', () => {
            const sumAll = (...args: number[]) => args.reduce((total, next) => total + next, 0);
            let context = {
                prev: 1,
                next: 2,
                sumAll: sumAll
            };

            let result = evaluation('1 > 0 ? sumAll(prev, next) : sumAll(-prev, -next)', context);
            expect(result).toBe(3);
        });

        it('1 < 0 ? sumAll(prev, next) : sumAll(-prev, -next)', () => {
            let sumAll = (a: number, b: number) => {
                return a + b;
            };

            let context = {
                prev: 1,
                next: 2,
                sumAll: sumAll
            };

            let result = evaluation('1 < 0 ? sumAll(prev, next) : sumAll(-prev, -next)', context);
            expect(result).toBe(-3);
        });

        it('str length', () => {
            let context = {
                $data: {
                    str: 'helloworld'
                },
                $nest: {
                    $data: [{str: 'helloworld'}]
                }
            };

            let result = evaluation('$data.str.length', context);
            expect(evaluation('$nest.$data[0].str.length', context)).toBe(10);
            expect(evaluation('$nest.$notFound', context)).toBe(undefined);
            expect(result).toBe(10);
        });

        it('call Number.prototype property', () => {
            let context = {
                $data: {
                    number: 10
                }
            };
            expect(evaluation('$data.number.toFixed(2)', context)).toBe('10.00');
        });

        it('call String.prototype property', () => {
            let context = {
                $data: {
                    str: 'helloworld'
                }
            };
            expect(evaluation('$data.str.toUpperCase()', context)).toBe('HELLOWORLD');
        });
    });

    describe('ArrayExpression', () => {
        it('[1,2,3,4]', () => {
            let result = evaluation('[1,2,3,4]', {});
            expect(result.length).toBe(4);
            expect(Array.isArray(result)).toBe(true);
            expect(result[0]).toBe(1);
            expect([1, 2, 3, 4]).toEqual([1, 2, 3, 4]);
        });

        it('[1,2,3, ..."hello"]', () => {
            let result = evaluation('[1,2,3, ..."hello"]', {});
            expect(result.length).toBe(8);
            expect(result).toEqual([1, 2, 3, 'h', 'e', 'l', 'l', 'o']);
        });

        it('[a, b, c, d, e, f, g]', () => {
            let context = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5,
                f: 6,
                g: 7
            };
            let result = evaluation('[a, b, c, d, e, f, g]', context);
            expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });

        it('[[],[],[[[]]]]', () => {
            let context = {
                arr: []
            };

            let result = evaluation('[arr, arr, [arr], [[arr]]]', context);
            expect(result).toEqual([[], [], [[]], [[[]]]]);
        });
    });

    // describe('UpdateExpression', () => {
    //     it('a++', () => {
    //         let context = {
    //             a: 1
    //         };
    //         let result = evaluation('a++', context);
    //         expect(result).toBe(1);
    //         expect(context.a).toBe(2);
    //     });
    //
    //     it('++a', () => {
    //         let context = {
    //             a: 1
    //         };
    //         let result = evaluation('++a', context);
    //         expect(result).toBe(2);
    //         expect(context.a).toBe(2);
    //     });
    //
    //     it('[a, ++a, ++a, ++a, ++a]', () => {
    //         let context = {
    //             a: 1
    //         };
    //         let result = evaluation('[a, ++a, ++a, ++a, ++a]', context);
    //         expect(result).toEqual([1, 2, 3, 4, 5]);
    //     });
    // });

    describe('complex example', () => {
        let context = {
            $data: {
                dateDiff: '1',
                dataKind: 1
            }
        };
        it('#ES{$data.dateDiff === "1" && $data.dataKind === 1}', () => {
            expect(evaluation('$data.dateDiff === "1" && $data.dataKind === 1', context)).toBe(true);
        });

        it('#ES{!($data.dateDiff === "1" && $data.dataKind === 1)}', () => {
            expect(evaluation('!($data.dateDiff === "1" && $data.dataKind === 1)', context)).toBe(false);
        });
    });

    describe('UnaryExpression', () => {
        it('!a', () => {
            let context = {
                a: true
            };
            let result = evaluation('!a', context);
            expect(result).toBe(false);
        });
        it('-a', () => {
            let context = {
                a: 1
            };
            let result = evaluation('-a', context);
            expect(result).toBe(-1);
        });
    });

    describe('LogicExpression', () => {
        it('true || 0', () => {
            let result = evaluation('true || 0', {});
            expect(result).toBe(true);
        });

        it('1 + 1 > 0 || false', () => {
            let result = evaluation('1 + 1 > 0 || false', {});
            expect(result).toBe(true);
        });

        it('1 + 1 < 0 || -1', () => {
            let result = evaluation('1 + 1 < 0 || - 1', {});
            expect(result).toBe(-1);
        });

        it('1 + 1 > 0 && 1', () => {
            let result = evaluation('1 + 1 > 0 && 1', {});
            expect(result).toBe(1);
        });
    });

    describe('FunctionExpression', () => {
        it('sum(1, 1)', () => {
            let context = {
                sum: (a: number, b: number) => a + b
            };
            let result = evaluation('sum(1, 1)', context);
            expect(result).toBe(2);
        });

        it('sum(sum(sum(sum(1, 2), sum(3, 4)), sum(5, 6)), sum(7, 8)))', () => {
            let context = {
                sum: (a: number, b: number) => a + b
            };
            let result = evaluation('sum(sum(sum(sum(1, 2), sum(3, 4)), sum(5, 6)), sum(7, 8))', context);
            expect(result).toBe(36);
        });

        it('$data.sum', () => {
            let context = {
                $data: {
                    sum: (a: number, b: number) => a + b
                }
            };
            let result = evaluation('$data.sum(1, 1)', context);
            expect(result).toBe(2);
        });
    });

    describe('NewExpression', () => {
        it('new F(1,2,3,4)', () => {
            class F {
                private a: number;
                private b: number;
                private c: number;
                private d: number;

                constructor(a: number, b: number, c: number, d: number) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                    this.d = d;
                }

                public getValue() {
                    return {
                        a: this.a,
                        b: this.b,
                        c: this.c,
                        d: this.d
                    };
                }
            }

            let ret = evaluation('new F(1, 2, 3, 4)', {F: F});
            expect(ret).toEqual({a: 1, b: 2, c: 3, d: 4});
        });
    });

    describe('Regexp', () => {
        it('/\\d+/.test(1)', () => {
            let ret = evaluation('/1462853203791|1462853496485|1462854074707|1462854136999/.test("1462853496485")', {});
            expect(ret).toEqual(true);
        });
    });

    describe('Literal as argument', () => {
        it('function key in context', () => {
            let context = {
                concat: (a: string, b: string) => a + b,
                sum: (a: number, b: number) => a + b
            };
            let ret = evaluation('concat("1", "sum")', context);
            expect(ret).toEqual('1sum');
        });

        it('string key in context', () => {
            let context = {
                concat: (a: string, b: string) => a + b,
                name: '1'
            };
            let ret = evaluation('concat("1", "name")', context);
            expect(ret).toEqual('1name');
        });

        it('key not in context', () => {
            let context = {
                concat: (a: string, b: string) => a + b
            };
            let ret = evaluation('concat("1", "sum")', context);
            expect(ret).toEqual('1sum');
        });
    });
});
