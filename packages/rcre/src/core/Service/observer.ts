import {isPlainObject} from 'lodash';

export class ObserverTrack {
    private object: Object;
    private originalObject: Object;
    private pathIndex: number;
    public path: string[];

    constructor(object: Object) {
        this.originalObject = object;
        this.object = this.applyObserver(object);
        this.path = [];
        this.pathIndex = -1;
        this.applyTracking = this.applyTracking.bind(this);
    }

    private applyObserver(object: Object) {
        if (!isPlainObject(object) && !Array.isArray(object)) {
            return object;
        }

        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                let value = object[key];

                if (isPlainObject(value)) {
                    object[key] = this.applyObserver(value);
                }

                if (Array.isArray(value)) {
                    object[key] = this.applyObserver(
                        value.map(v => this.applyObserver(v))
                    );
                }
            }
        }

        let self = this;

        return new Proxy(object, {
            get(obj: any, prop: string) {
                self.applyTracking(obj, prop);
                return obj[prop];
            }
        });
    }

    private applyTracking(original: object, propKey: string) {
        if (typeof propKey === 'symbol') {
            return;
        }

        if (original === this.originalObject) {
            this.pathIndex++;
        }

        let path = this.path[this.pathIndex] || '';

        if (/^\d+$/.test(propKey)) {
            path += '[' + propKey + ']';
        } else if (path.length === 0) {
            path += propKey;
        } else {
            path += '.' + propKey;
        }

        this.path[this.pathIndex] = path;
    }

    getObserver(): any {
        return this.object;
    }

    exec(fn: Function) {
        this.path = [];
        this.pathIndex = -1;
        fn();
        return this.path;
    }
}