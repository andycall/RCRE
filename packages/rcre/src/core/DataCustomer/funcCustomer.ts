import {FuncCustomerArgs} from './index';

export class FunsCustomerController {
    private store: Map<string, ($args: FuncCustomerArgs<any>) => any | Promise<any>>;

    constructor() {
        this.store = new Map();
    }

    public setCustomer(key: string, func: ($args: FuncCustomerArgs<any>) => any) {
        if (this.store.has(key)) {
            throw new Error('found exist customer: ' + key);
        }

        this.store.set(key, func);
    }

    public getCustomer(key: string) {
        if (!this.store.has(key)) {
            console.error('can not find dataCustomer: ' + key);
        }

        return this.store.get(key);
    }

    public clearCustomer() {
        this.store.clear();
        return this.store;
    }

    public getAllCustomerName(): Iterator<string> {
        return this.store.keys();
    }

    public delCustomer(funcName: string) {
        this.store.delete(funcName);
    }
}
