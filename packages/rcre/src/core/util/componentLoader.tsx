import {isEmpty} from 'lodash';

let defaultLoadMode = 'default';

export function setDefaultLoadMode(mode: string) {
    defaultLoadMode = mode;
}

const buildInModule = [
    'container',
    'div',
    'row',
    'text'
];

interface ComponentCache {
    [type: string]: {
        [mode: string]: any;
    };
}

export class ComponentLoader {
    private cache: ComponentCache;

    constructor() {
        this.cache = {};
    }

    getComponent(type: string, mode?: string) {
        if (buildInModule.includes(type)) {
            return this.cache[type]['__BUILDIN__'];
        }

        if (!mode) {
            mode = defaultLoadMode;
        }

        let item = this.cache[type];

        if (item && !item[mode]) {
            mode = defaultLoadMode;
        }

        if (!item || !item[mode]) {
            console.log(defaultLoadMode);
            throw new Error('can not find module, type:' + type + '; mode: ' + mode);
        }

        return item[mode];
    }

    addComponent(type: string, component: any, mode?: string) {
        if (!component) {
            throw new Error('ComponentLoader: component of type is null type: ' + type);
        }

        if (!mode) {
            mode = defaultLoadMode;
        }

        if (typeof mode !== 'string') {
            throw new Error('invalid component mode: ' + mode);
        }

        if (!this.cache[type]) {
            this.cache[type] = {};
        }

        this.cache[type][mode] = component;
    }

    removeComponent(type: string, mode?: string) {
        if (!mode) {
            mode = defaultLoadMode;
        }

        if (!this.cache[type] || !this.cache[type][mode]) {
            return;
        }

        delete this.cache[type][mode];

        if (isEmpty(this.cache[type])) {
            delete this.cache[type];
        }
    }
}

export const componentLoader = new ComponentLoader();