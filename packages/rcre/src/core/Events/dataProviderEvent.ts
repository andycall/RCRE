import {EventEmitter} from 'events';

class DataProviderEvent extends EventEmitter {
    public stack: {key: string, done: boolean}[];
    constructor() {
        super();

        this.stack = [];
    }

    addToList(key: string) {
        this.stack.push({
            key: key,
            done: false
        });
    }

    setToDone(key: string) {
        let isFinished = true;

        for (let i = 0; i < this.stack.length; i ++) {
            let item = this.stack[i];
            if (item.key === key) {
                this.stack[i].done = true;
            }

            if (!this.stack[i].done && isFinished) {
                isFinished = false;
            }
        }

        if (isFinished) {
            this.emit('done');
            this.clear();
        }
    }

    clear() {
        this.stack = [];
        this.removeAllListeners('done');
    }
}

export const dataProviderEvent = new DataProviderEvent();