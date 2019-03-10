export type pureFunc = typeof Function;

export class FilterController {
    public store: {
        [key: string]: pureFunc
    };

    constructor() {
        this.store = {};
    }

    private wrapFunc(func: typeof Function) {
        let f = func;
        let cArgs: any[] | null = null;
        let result: any = null;

        return ((...args: any[]) => {
            if (cArgs && cArgs.length === args.length) {
                let isEqual = cArgs.every((cArg, index) => {
                    return cArg === args[index];
                });

                if (isEqual) {
                    return result;
                }
            }
            try {
                result = f(...args);
                cArgs = args;
                return result;
            } catch (e) {
                e.message = e.message + '; function arguments: ' + JSON.stringify(args);
                throw e;
            }
        });
    }

    public setFilter(funcName: string, func: any, force?: boolean) {
        if (this.store.hasOwnProperty(funcName) && !force) {
            throw new Error('found exist func : ' + funcName);
        }

        if (typeof func === 'function') {
            func = this.wrapFunc(func);
        }

        this.store[funcName] = func;
    }

    public setFilterFunc(func: typeof Function) {
        if (typeof func !== 'function') {
            console.error('invalid setFilterFunc params', func);
            return;
        }

        let name = func.name;

        if (this.store.hasOwnProperty(name)) {
            throw new Error('found exist func ：' + name);
        }

        this.store[name] = func;
    }

    public getFilter(funcName: string): Function {
        if (!this.store.hasOwnProperty(funcName)) {
            console.error('can not find target func :' + funcName);
            return (...args: any[]) => args;
        }

        return this.store[funcName];
    }

    public hasFilter(funcName: string) {
        return this.store.hasOwnProperty(funcName);
    }

    public delFilter(funcName: string) {
        delete this.store[funcName];
    }

    public clearFilter() {
        this.store = {};
    }

    public size() {
        return Object.keys(this.store).length;
    }
}

export const filter = new FilterController();
