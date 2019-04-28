import {containerReducer} from '../../../../packages/rcre/src/core/Container/reducer';
import {containerActionCreators} from '../../../../packages/rcre/src/core/Container/action';
import {setWith, deleteWith, Events, createReduxStore, RunTimeContextCollection, DataProviderEvent} from 'rcre';

describe('Container State', () => {
    let initState: {
        TEST: Object
    };
    let KEY = 'TEST';

    beforeEach(() => {
        initState = {
            TEST: {}
        };
    });

    const context: RunTimeContextCollection = {
        rcre: {
            $global: {},
            $location: {
                query: '123'
            },
            $query: {},
            debug: false,
            lang: '',
            loadMode: 'default',
            dataProviderEvent: new DataProviderEvent(),
            events: new Events(),
            store: createReduxStore(),
            containerGraph: new Map(),
            mode: 'React'
        },
        // @ts-ignore
        container: {},
        // @ts-ignore
        form: {},
        // @ts-ignore
        iterator: {}
    };

    it('setData', () => {
        let updateAction = containerActionCreators.setData({
            name: 'datepicker',
            value: '2017-12-20'
            // @ts-ignore
        }, KEY, context);
        let state = containerReducer(initState, updateAction);

        expect(state[KEY]).toEqual({
            datepicker: '2017-12-20'
        });
    });

    it('setData with array path', () => {
        let updateAction = containerActionCreators.setData({
            name: 'datepicker.0.year',
            value: '2018'
            // @ts-ignore
        }, KEY, context);
        let state = containerReducer(initState, updateAction);

        expect(state[KEY]).toEqual({
            datepicker: {
                0: {
                    year: '2018'
                }
            }
        });
    });

    it('setData with number path', () => {
        let updateAction = containerActionCreators.setData({
            name: 'datepicker.0.year',
            value: '2018'
            // @ts-ignore
        }, KEY, context);
        let state = containerReducer(initState, updateAction);

        expect(state[KEY]).toEqual({
            datepicker: {
                0: {
                    year: '2018'
                }
            }
        });
    });

    it('multiSetData return difference model', () => {
        let oneUpdate = containerActionCreators.setData({
            name: 'str',
            value: 'a'
            // @ts-ignore
        }, KEY, context);

        let twoUpdate = containerActionCreators.setData({
            name: 'str',
            value: 'b'
            // @ts-ignore
        }, KEY, context);

        let state = containerReducer(initState, oneUpdate);
        expect(initState[KEY] === state).toBe(false);
        expect(containerReducer(state, twoUpdate) === state).toBe(false);
    });

    it('setDataWithRepeat', () => {
        let updateAction = containerActionCreators.setData({
            name: 'datepicker',
            value: '2017-12-20'
            // @ts-ignore
        }, KEY, context);
        let repeatAction = containerActionCreators.setData({
            name: 'datepicker',
            value: '2018-01-01'
            // @ts-ignore
        }, KEY, context);
        let state = containerReducer(initState, updateAction);
        state = containerReducer(state, repeatAction);
        expect(state[KEY]).toEqual({
            datepicker: '2018-01-01'
        });
    });

    it('setData with invalid model', () => {
        let updateAction = containerActionCreators.setData({
            name: 'datepicker',
            value: '2017-12-20'
            // @ts-ignore
        }, 'UNKNOWN', context);
        let state = containerReducer(initState, updateAction);

        expect(state).toEqual(state);
    });

    it('setData nameGroup', () => {
        let updateAction = containerActionCreators.setData({
            name: 'datepicker.startTime.timestamp',
            value: '2017-12-20'
            // @ts-ignore
        }, KEY, context);
        let repeateAction = containerActionCreators.setData({
            name: 'datepicker.startTime.timestamp',
            value: '2018-01-01'
            // @ts-ignore
        }, KEY, context);

        let state = containerReducer(initState, updateAction);
        state = containerReducer(state, repeateAction);

        expect(state[KEY]).toEqual({
            datepicker: {
                startTime: {
                    timestamp: '2018-01-01'
                }
            }
        });
    });

    it('asyncLoadProgress', () => {
        let updateAction = containerActionCreators.asyncLoadDataProgress({
            model: KEY
        });
        let state = containerReducer(initState, updateAction);
        expect(state[KEY]).toEqual({$loading: true});
    });

    it('asyncLoadFail', () => {
        let updateAction = containerActionCreators.asyncLoadDataFail({
            model: KEY,
            error: 'you got an error'
        });
        let state = containerReducer(initState, updateAction);
        expect(state[KEY]).toEqual({
            $loading: false,
            $error: 'you got an error'
        });
    });

    it('asynLoadDataSuccess', () => {
        let updateAction = containerActionCreators.asyncLoadDataSuccess({
            model: KEY,
            data: {
                name: 1
            },
            // @ts-ignore
            context: context
        });
        let state = containerReducer(initState, updateAction);
        expect(state[KEY]).toEqual({
            name: 1,
            $error: null,
            $loading: false
        });
    });

    it('syncLoadSuccess', () => {
        let updateAction = containerActionCreators.syncLoadDataSuccess({
            model: KEY,
            data: {
                name: 1
            },
            // @ts-ignore
            context: context
        });
        let state = containerReducer(initState, updateAction);
        expect(state[KEY]).toEqual({
            name: 1
        });
    });

    it('syncLoadFail', () => {
        let updateAction = containerActionCreators.syncLoadDataFail({
            model: KEY,
            error: 'you got an error'
        });
        let state = containerReducer(initState, updateAction);
        expect(state[KEY]).toEqual({
            $error: 'you got an error'
        });
    });

    it('dataCustomerPass', () => {
        let updateAction = containerActionCreators.dataCustomerPass({
            model: KEY,
            data: {
                name: 1
            }
            // @ts-ignore
        }, context);
        let state = containerReducer(initState, updateAction);
        expect(state[KEY]).toEqual({
            name: 1
        });
    });

    it('removeData', () => {
        let addAction = containerActionCreators.setData({
            name: 'name',
            value: 1
            // @ts-ignore
        }, KEY, context);
        let updateAction = containerActionCreators.clearData({
            model: KEY,
            // @ts-ignore
            context: context
        });
        let state = containerReducer(initState, addAction);
        state = containerReducer(state, updateAction);
        expect(state[KEY]).toEqual(undefined);
    });

    it('clearData', () => {
        let addAction = containerActionCreators.setData({
            name: 'name',
            value: 1
            // @ts-ignore
        }, KEY, context);
        let updateAction = containerActionCreators.clearData({
            model: KEY,
            // @ts-ignore
            context: context
        });
        let state = containerReducer(initState, addAction);
        state = containerReducer(state, updateAction);
        expect(state).toEqual({});
    });

    it('deleteData', () => {
        let addAction = containerActionCreators.setData({
            name: 'name',
            value: 1
            // @ts-ignore
        }, KEY, context);
        let deleteAction = containerActionCreators.deleteData({
            name: 'name'
            // @ts-ignore
        }, KEY, context);
        let state = containerReducer(initState, addAction);
        state = containerReducer(state, deleteAction);
        expect(state[KEY]).toEqual({});
    });

    it('deleteData with paths', () => {
        let addAction = containerActionCreators.setData({
            name: 'name.age.a.b.c.d',
            value: 1
            // @ts-ignore
        }, KEY, context);
        let deleteAction = containerActionCreators.deleteData({
            name: 'name.age.a.b.c.d'
            // @ts-ignore
        }, KEY, context);
        let state = containerReducer(initState, addAction);
        state = containerReducer(state, deleteAction);
        expect(state[KEY]).toEqual({
            name: {
                age: {
                    a: {
                        b: {
                            c: {}
                        }
                    }
                }
            }
        });
    });

    it('deleteWith', () => {
        let obj = {
            name: 'andycall',
            arr: {
                name: 'yhtree',
                some: {
                    nest: 2
                }
            },
            11111: {
                name: 2
            },
            number: {
                123456: 'aaa'
            },
            testArr: [{
                name: '1'
            }, 2, 3, {name: 1}, 5]
        };

        let retObj = deleteWith(obj, 'name');
        expect(retObj['11111'] === obj['11111']).toBe(true);

        let retObj2 = deleteWith(obj, 'arr.name');
        expect(retObj2['11111'] === retObj['11111']).toBe(true);
        expect(retObj2.arr === retObj.arr).toBe(false);
        expect(retObj2.arr.some === retObj.arr.some).toBe(true);

        let retObj3 = deleteWith(retObj2, 'testArr[0]');
        expect(retObj3.testArr[0]).toBe(undefined);
        expect(retObj3.testArr[3] === retObj.testArr[3]).toBe(true);
    });

    it('[setWith] point path', () => {
        let object = {
            name: {
                age: '22'
            },
            other: {
                text: '1234'
            }
        };

        let obj = setWith(object, 'name.age', 1);
        expect(object).toEqual({
            name: {
                age: '22'
            },
            other: {
                text: '1234'
            }
        });

        expect(obj).toEqual({
            name: {
                age: 1
            },
            other: {
                text: '1234'
            }
        });

        expect(object.name === obj['name']).toBe(false);
        expect(object.other === obj['other']).toBe(true);
    });

    it('[setWith] arr path', () => {
        let object = {
            arr: [
                1,
                {
                    name: '1234'
                }
            ],
            other: {
                text: '1234'
            },
            bad: null
        };

        let copy: any = setWith(object, 'arr[0]', 2);
        expect(copy.arr[0]).toBe(2);
        expect(copy.arr[1] === object.arr[1]).toBe(true);
        expect(copy.other === object.other).toBe(true);

        copy = setWith(copy, 'arr[1].name', '4567');
        expect(copy.arr[1].name).toBe('4567');
        expect(copy.arr[1] !== object.arr[1]).toBe(true);
        expect(copy.other === object.other).toBe(true);

        copy = setWith(copy, 'a.b.c.d.e.f.g', 10);
        expect(copy.a.b.c.d.e.f.g).toBe(10);

        copy = setWith(copy, 'unknown', 100);
        expect(copy.unknown).toBe(100);

        copy = setWith(copy, 'bad', undefined);
        expect(copy.bad).toBe(undefined);

        copy = setWith(copy, 'bad.bad', undefined);
        expect(copy.bad.bad).toBe(undefined);

        copy = setWith(copy, 'number.0', 1);
        expect(copy.number).toEqual({
            0: 1
        });

        copy = setWith(object, 'number2.0[0]', 1);
        expect(copy.number2).toEqual({
            0: [1]
        });

        copy = setWith(object, 'number3.1.2.3.4.5[10][0]', 1);
        expect(copy.number3).toEqual({
            1: {
                2: {
                    3: {
                        4: {
                            5: [
                                undefined, undefined, undefined, undefined, undefined,
                                undefined, undefined, undefined, undefined, undefined,
                                [1]
                            ]
                        }
                    }
                }
            }
        });

        copy = setWith(object, 'a[0][1]', 10);
        expect(copy.a).toEqual([[undefined, 10]]);
    });
});
