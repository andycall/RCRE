import {js_beautify} from 'js-beautify';
import {transform, transformFile} from 'rcre-runtime-syntax-transform';

describe('ExpressionString代码转转', () => {
    it('BinaryExpression', () => {
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

        for (let i = 0; i < cases.length; i++) {
            let code = (transform(cases[i][0]));
            expect(code).toBe(js_beautify(`((runTime: any) => {
                return ${cases[i][0]};
            }) as any`));
        }
    });

    describe('Literal and Identifier Test', () => {
        it('x + 1', () => {
            let code = 'x + 1';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.x + 1;
            }) as any`));
        });

        it('1 - x', () => {
            let code = '1 - x';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 - runTime.x;
            }) as any`));
        });
    });

    describe('memberExpression Test', () => {
        it('obj.age === 10', () => {
            let code = 'obj.age === 10';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.obj.age === 10; 
            }) as any`));
        });

        it('obj.age + obj.age === 20', () => {
            let code = 'obj.age + obj.age === 20';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.obj.age + runTime.obj.age === 20;
            }) as any`));
        });

        it('obj.inner.deep === 2', () => {
            let code = 'obj.inner.deep === 2';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.obj.inner.deep === 2;
            }) as any`));
        });

        it('obj.arr[0] === 1', () => {
            let code = 'obj.arr[0] === 1';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.obj.arr[0] === 1;
            }) as any`));
        });

        it('obj.arr[obj.index] === 1', () => {
            let code = 'obj.arr[obj.index] === 1';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.obj.arr[runTime.obj.index] === 1;
            }) as any`));
        });

        it('$data', () => {
            let code = '$data';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.$data;
            }) as any`));
        });
    });

    describe('ObjectExpression', () => {
        it('({name: 1, age: 2})', () => {
            let code = '({name: 1, age: 2})';
            expect(js_beautify(transform(code))).toBe(js_beautify(`((runTime: any) => {
                return ({name: 1, age: 2});
            }) as any`));
        });

        it('({name: x, age: y})', () => {
            let code = '({name: x, age: y})';
            expect(js_beautify(transform(code))).toBe(js_beautify(`((runTime: any) => {
                return ({name: runTime.x, age: runTime.y});
            }) as any`));
        });

        it('$data.str.split()', () => {
            let code = '$data.str.split()';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.$data.str.split();
            }) as any`));
        });

        it('String.prototype.split.call($data.str, ",")', () => {
            let code = 'String.prototype.split.call($data.str, ",")';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.String.prototype.split.call(runTime.$data.str, ",");
            }) as any`));
        });

        it('$args.value.length === 0', () => {
            let code = '$args.value.length === 0';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.$args.value.length === 0;
            }) as any`));
        });

        it('[1,2,3,4,5,6].slice(3)', () => {
            let code = '[1,2,3,4,5,6].slice(3)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return [1,2,3,4,5,6].slice(3);
            }) as any`));
        });

        it('Array.prototype.slice.call([1,2,3,4,5,6], 2)', () => {
            let code = 'Array.prototype.slice.call([1,2,3,4,5,6], 2)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.Array.prototype.slice.call([1,2,3,4,5,6], 2);
            }) as any`));
        });

        it('Array.prototype.slice.apply([1,2,3,4,5,6], [2])', () => {
            let code = 'Array.prototype.slice.apply([1,2,3,4,5,6], [2])';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.Array.prototype.slice.apply([1,2,3,4,5,6], [2]);
            }) as any`));
        });

        it('JSON.stringify({name: 1, age: 2})', () => {
            let code = 'JSON.stringify({name: 1, age: 2})';
            expect(js_beautify(transform(code))).toBe(js_beautify(`((runTime: any) => {
                return runTime.JSON.stringify({name: 1, age: 2});
            }) as any`));
        });
    });

    describe('ConditionExpression', () => {
        it('1 + 1 > 0 ? true : false', () => {
            let code = '1 + 1 > 0 ? true : false';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 + 1 > 0 ? true : false;
             }) as any`));
        });

        it('1 + 1 < 0 ? true : false', () => {
            let code = '1 + 1 < 0 ? true : false';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 + 1 < 0 ? true : false;
            }) as any`));
        });

        it('({name: true}).name ? true : false', () => {
            let code = '({name: true}).name ? true : false';
            expect(js_beautify(transform(code))).toBe(js_beautify(`((runTime: any) => {
                return ({name: true}).name ? true : false;
            }) as any`));
        });

        it('1 > 0 ? sumAll(prev, next) : sumAll(-prev, -next)', () => {
            let code = '1 > 0 ? sumAll(prev, next) : sumAll(-prev, -next)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 > 0 ? runTime.sumAll(runTime.prev, runTime.next) : runTime.sumAll(-runTime.prev, -runTime.next);
            }) as any`));
        });

        it('1 < 0 ? sumAll(prev, next) : sumAll(-prev, -next)', () => {
            let code = '1 < 0 ? sumAll(prev, next) : sumAll(-prev, -next)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 < 0 ? runTime.sumAll(runTime.prev, runTime.next) : runTime.sumAll(-runTime.prev, -runTime.next);
            }) as any`));
        });

        it('$data.str.length', () => {
            let code = '$data.str.length';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.$data.str.length;
            }) as any`));
        });

        it('$data.number.toFixed(2)', () => {
            let code = '$data.number.toFixed(2)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.$data.number.toFixed(2);
            }) as any`));
        });
    });

    describe('ArrayExpression', () => {
        it('[1,2,3,4]', () => {
            let code = '[1,2,3,4]';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return [1,2,3,4];
            }) as any`));
        });

        it('[1,2,3, ..."hello"]', () => {
            let code = '[1,2,3, ..."hello"]';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return [1,2,3, ..."hello"];
            }) as any`));
        });

        it('[a, b, c, d, e, f, g]', () => {
            let code = '[a, b, c, d, e, f, g]';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return [runTime.a, runTime.b, runTime.c, runTime.d, runTime.e, runTime.f, runTime.g];
            }) as any`));
        });

        it('[[],[],[[[]]]]', () => {
            let code = '[[],[],[[[a]]]]';
            expect(js_beautify(transform(code))).toBe(js_beautify(`((runTime: any) => {
                return [[],[],[[[runTime.a]]]];
            }) as any`));
        });
    });

    describe('complex example', () => {
        it('$data.dateDiff === "1" && $data.dataKind === 1', () => {
            let code = '$data.dateDiff === "1" && $data.dataKind === 1';
            expect(js_beautify(transform(code))).toBe(js_beautify(`((runTime: any) => {
                return runTime.$data.dateDiff === "1" && runTime.$data.dataKind === 1;
            }) as any`));
        });

        it('!($data.dateDiff === "1" && $data.dataKind === 1)', () => {
            let code = '!($data.dateDiff === "1" && $data.dataKind === 1)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return !(runTime.$data.dateDiff === "1" && runTime.$data.dataKind === 1);
            }) as any`));
        });
    });

    describe('UnaryExpression', () => {
        it('!1', () => {
            let code = '!1';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return !1;
            }) as any`));
        });

        it('!a', () => {
            let code = '!a';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return !runTime.a;
            }) as any`));
        });

        it('-a', () => {
            let code = '-a';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return -runTime.a;
            }) as any`));
        });

        it('+a', () => {
            let code = '+a';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return +runTime.a;
            }) as any`));
        });
    });

    describe('LogicExpression', () => {
        it('true || 0', () => {
            let code = 'true || 0';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return true || 0;
            }) as any`));
        });

        it('1 + 1 > 0 || false', () => {
            let code = '1 + 1 > 0 || false';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 + 1 > 0 || false;
            }) as any`));
        });

        it('1 + 1 < 0 || -1', () => {
            let code = '1 + 1 < 0 || -1';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 + 1 < 0 || -1;
            }) as any`));
        });

        it('1 + 1 > 0 && 1', () => {
            let code = '1 + 1 > 0 && 1';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 + 1 > 0 && 1;
            }) as any`));
        });

        it('1 + 1 > 0 && 1', () => {
            let code = '1 + 1 > 0 && 1';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 + 1 > 0 && 1;
            }) as any`));
        });

        it('1 + 1 > 0 && 1', () => {
            let code = '1 + 1 > 0 && a';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return 1 + 1 > 0 && runTime.a;
            }) as any`));
        });
    });

    describe('FunctionExpression', () => {
        it('sum(1, 1)', () => {
            let code = 'sum(1, 1)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.sum(1, 1);
            }) as any`));
        });

        it('sum(sum(sum(sum(1, 2), sum(3, 4)), sum(5, 6)), sum(7, 8)))', () => {
            let code = 'sum(sum(sum(sum(1, 2), sum($data.name, 4)), sum(5, 6)), sum(7, 8)))';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.sum(runTime.sum(runTime.sum(runTime.sum(1, 2), runTime.sum(runTime.$data.name, 4)), runTime.sum(5, 6)), runTime.sum(7, 8));
            }) as any`));
        });

        it('$data.sum', () => {
            let code = '$data.sum';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.$data.sum;
            }) as any`));
        });
    });

    describe('Regexp', () => {
        it('/1462853203791|1462853496485|1462854074707|1462854136999/.test("1462853496485")', () => {
            let code = '/1462853203791|1462853496485|1462854074707|1462854136999/.test("1462853496485")';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return /1462853203791|1462853496485|1462854074707|1462854136999/.test("1462853496485");
            }) as any`));
        });

        it('concat("1", "sum")', () => {
            let code = 'concat("1", "sum")';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return runTime.concat("1", "sum");
            }) as any`));
        });
    });

    describe('NewExpression', () => {
        it('new F(1,2,3,4)', () => {
            let code = 'new F(1,2,3,4)';
            expect(transform(code)).toBe(js_beautify(`((runTime: any) => {
                return new runTime.F(1,2,3,4);
            }) as any`));
        });
    });

    // describe('反斜杠字符串', () => {
    //     it('反斜杠"', () => {
    //         let code = '$data.calendarTotal.enabledReserveTotal === 0 ? \\"gd-inquiry-cell-danger\\" : \\"gd-inquiry-cell-success\\"';
    //         console.log(transform(code));
    //     });
    // });
});

describe('transformFile', () => {
    it('只有一个ExpressionString的代码', () => {
        let code = `var body = {
            body: [{
                type: 'button',
                text: '#ES{$data.name}'
            }]
        };`;

        expect(js_beautify(transformFile(code))).toEqual(js_beautify(`var body = {
            body: [{
                type: 'button',
                text: (((runTime: any) => {
                    return runTime.$data.name;
                }) as any)
            }]
        };`));
    });

    it('2个ExpressionString代码', () => {
        let code = `var body = {
            body: [{
                type: 'button',
                text: '#ES{$data.name}'
            }, {
                type: 'text',
                text: '#ES{$moment.unix($data.startTime).format("YYYY-MM-DD")}'
            }]
        };`;

        expect(js_beautify(transformFile(code))).toEqual(js_beautify(`
            var body = {
                body: [{
                    type: 'button',
                    text: (((runTime: any) => {
                        return runTime.$data.name;
                    }) as any)
                }, {
                    type: 'text',
                    text: (((runTime: any) => {
                        return runTime.$moment.unix(runTime.$data.startTime).format("YYYY-MM-DD");
                    }) as any)
                }]
            };
        `));
    });

    it('带有空格的ExpressionString', () => {
        let code = `var body = {
            body: [{
                type: 'button',
                text: '#ES{$data.name}'
            }, {
                type: 'text',
                text: \`#ES{
                    $moment.unix(
                        $data.startTime
                        )
                        .format("YYYY-MM-DD")}
                \`
            }]
        };`;

        expect(js_beautify(transformFile(code))).toEqual(js_beautify(`var body = {
            body: [{
                    type: 'button',
                    text: (((runTime: any) => {
                        return runTime.$data.name;
                    }) as any)
                }, {
                    type: 'text',
                    text: (((runTime: any) => {
                        return runTime.$moment.unix(runTime.$data.startTime).format("YYYY-MM-DD");
                    }) as any)
                }]
        };`));
    });

    it('一个字符串有2个ExpressionString', () => {
        let code = `
            import a from 'a';
        var code = {
            body: [{
                type: 'text',
                text: '唉  #ES{$data.name} W的 #ES{$data.age} W的'
            }]
        }`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify('import a from \'a\'; \n var code = {\n' +
            '        body: [{\n' +
            '                type: \'text\',\n' +
            '                text: (((runTime: any) => {\n' +
            '                    return `\\u5509  ${runTime.$data.name} W\\u7684 ${runTime.$data.age} W\\u7684`;\n' +
            '                }) as any)\n' +
            '            }]\n' +
            '    };'));
    });

    it('一个字符串3个ExpressionString', () => {
        let code = `
         var code = {
            body: [{
                type: 'text',
                text: '#ES{$data.name} W的 #ES{$data.age}'
            }, {
                type: 'text',
                text: 'EE #ES{$data.username} BB #ES{$data.namespace} AA #ES{$data.code} DD'
            }]
        }`;
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            body: [{
                    type: 'text',
                    text: (((runTime: any) => {
                        return \`\${runTime.$data.name} W\\u7684 \${runTime.$data.age}\`;
                    }) as any)
                }, {
                    type: 'text',
                    text: (((runTime: any) => {
                        return \`EE \${runTime.$data.username} BB \${runTime.$data.namespace} AA \${runTime.$data.code} DD\`;
                    }) as any)
                }]
        };`));
    });

    it('属性访问模式的模板字符串', () => {
        let code = `var code = {
            body: [{
                type: 'text',
                text: \`#ES{$data.\${KEY}.name}\`
            }]
        }`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            body: [{
                    type: 'text',
                    text: (((runTime: any) => {
                        return runTime.$data[KEY].name;
                    }) as any)
                }]
        };`));
    });

    it('字符串模式的模板字符串', () => {
        let code = `var code = {
            body: [{
                type: 'text',
                text: \`#ES{$data.\${KEY}.name + "abcdefg\${STRING_KEY}"}\`
            }]
        }`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            body: [{
                    type: 'text',
                    text: (((runTime: any) => {
                        return runTime.$data[KEY].name + ("abcdefg" + STRING_KEY + "");
                    }) as any)
                }]
        };`));
    });

    it('普通模板的模板字符串', () => {
        let code = `var code = {
            body: [{
                type: 'text',
                text: \`#ES{\${FLAG} ? \${CPT} : \${CPM}}\`
            }]
        }`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            body: [{
                    type: 'text',
                    text: (((runTime: any) => {
                        return FLAG ? CPT : CPM;
                    }) as any)
                }]
        };`));
    });

    it('常见情况的模板字符串', () => {
        let code = `var code = {
            type: 'checkbox',
            name: 'creationDownCheckbox',
            model: 'format',
            groups: \`#ES{getCreationItems(
                checkboxHasSel([
                    \${config.plan} ? $data.planDownCheckbox : false,
                    \${config.unit} ? $data.unitDownCheckbox : false,
                    false
                ]), hasPermission('gd_download_creations_playdata_show')
            )}\`
        }`;
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            type: 'checkbox',
            name: 'creationDownCheckbox',
            model: 'format',
            groups: (((runTime: any) => {
                return runTime.getCreationItems(runTime.checkboxHasSel(` +
            `[config.plan ? runTime.$data.planDownCheckbox : false, config.unit ? runTime.$data.unitDownCheckbox : false, false]),` +
            `runTime.hasPermission(\"gd_download_creations_playdata_show\"));
            }) as any)
        };`));
    });

    it('实例代码Two', () => {
        let code = `var code = {
            show: \`#ES{$item.mode == "\${CPM}"}\`
        };`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            show: (((runTime: any) => {
                return runTime.$item.mode == ("" + CPM + "");
            }) as any)
        };`));
    });

    it('BinaryExpression & StringLiteral', () => {
        let code = `var code = {
            className: '#ES{$data.calendarTotal.enabledReserveTotal === 0 ? ' +
            '"gd-inquiry-cell-danger" : "gd-inquiry-cell-success"}'
        }`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            className: (((runTime: any) => {
                return runTime.$data.calendarTotal.enabledReserveTotal === 0 ? "gd-inquiry-cell-danger" : "gd-inquiry-cell-success";
            }) as any)
        };`));
    });

    it('BinaryExpression & TemplateExpression', () => {
        let code = `var code = {
            className: \`#ES{$data.\${CPM}}\` + 'abcd' + \`#ES{$data.test}\`
        }`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            className: (((runTime: any) => {
                return \`\${runTime.$data[CPM]}abcd\${runTime.$data.test}\`;
            }) as any)
        };`));
    });

    it('TemplateExpression + TemplateExpression', () => {
        let code = `var code = {
            className: \`#ES{$data.\${CPM}}\` + \`#ES{$data.\${CPT}}\`
        };`;
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            className: (((runTime: any) => {
                return \`\${runTime.$data[CPM]}\${runTime.$data[CPT]}\`;
            }) as any)
        };`));
    });

    it('TemplateExpression + Template + Template', () => {
        let code = `var code = {
            className: \`#ES{$data.\${CPM}}\` + \`#ES{$data.\${CPT}}\` + \`#ES{$data.\${ABC}}\`
        };`;
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            className: (((runTime: any) => {
                return \`\${runTime.$data[CPM]}\${runTime.$data[CPT]}\${runTime.$data[ABC]}\`;
            }) as any)
        };`));
    });

    it('object key is ExpressionString', () => {
        let code = `var code = {
            'key#ES{$data.key}qwewqe': 'abcd#ES{$data.name}eefrg'
        };`;

        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            [(((runTime: any) => {
                return \`key\${runTime.$data.key}qwewqe\`;
            }) as any)()]: (((runTime: any) => {
                return \`abcd\${runTime.$data.name}eefrg\`;
            }) as any)
        };`));

        console.log(transformFile(code));
    });

    it('object key with computedExpressionString', () => {
        let code = `var code = {
            ['key#ES{$data.key}qweq']: 'abc#ES{$data.anme}qweqwe'
        }`;
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            [(((runTime: any) => {
                return \`key\${runTime.$data.key}qweq\`;
            }) as any)()]: (((runTime: any) => {
                return \`abc\${runTime.$data.anme}qweqwe\`;
            }) as any)
        };`));
    });

    it('object key with computed TemplateString', () => {
        let code = `var code = {
            [\`key#ES{$data.\${KEY}}qwd\`]: 'abc#ES{$data.name}qweqwe'
        };`;
        // transformFile(code);
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
            [(((runTime: any) => {
                return \`key\${runTime.$data[KEY]}qwd\`;
            }) as any)()]: (((runTime: any) => {
                return \`abc\${runTime.$data.name}qweqwe\`;
            }) as any)
        };`));
    });

    it('complex expressionString', () => {
        let code = `var code = {
            show: \`#ES{
                $data.sales_type !== "-1"
                && $data.mode === '\${CPM}'
                && !/1481698145541|1481698231751/.test($data.place_id)
                && $data.special_mode !== "\${ORDER_CHASE}"
            }\`,
        }`;
        /* tslint-disable */
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
        show: (((runTime: any) => {
                return runTime.$data.sales_type !== "-1" && runTime.$data.mode === ("" + CPM + "") && !/1481698145541|1481698231751/.test(runTime.$data.place_id) && runTime.$data.special_mode !== ("" + ORDER_CHASE + "");
            }) as any),
        };`));
    });

    it('Template object in function', () => {
        let code = `var code = {
            show: \`#ES{
                $data.filterMode === '\${CPT}' ? \${JSON.stringify(filterCPTSaleTypeConfig)}
                : $data.filterMode === '\${CPM}' ? \${JSON.stringify(filterCPMSaleTypeConfig.CPT)}
                : \${JSON.stringify(filterAllSaleTypeConfig)}
            }\`,
        }`;
        /* tslint-disable */
        expect(js_beautify(transformFile(code))).toBe(js_beautify(`var code = {
        show: (((runTime: any) => {
                return runTime.$data.filterMode === ("" + CPT + "") ? JSON.stringify(filterCPTSaleTypeConfig) : runTime.$data.filterMode === ("" + CPM + "") ? JSON.stringify(filterCPMSaleTypeConfig.CPT) : JSON.stringify(filterAllSaleTypeConfig);
            }) as any),
        };`));
    });
});
