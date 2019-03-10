import {RootState} from './reducers';
import {IContainerAction} from '../core/Container';
import {ITriggerAction} from '../core/Trigger';
import {IFormActions} from '../core/Form';

export interface ListenerFnItem {
    (action: IContainerAction & ITriggerAction & IFormActions, state: RootState): void;
}

interface Listener {
    [eventName: string]: ListenerFnItem[];
}

let listeners: Listener = {};

export function addEventListener(eventName: string, fn: ListenerFnItem) {
    if (!listeners[eventName]) {
        listeners[eventName] = [];
    }

    listeners[eventName].push(fn);
}

export function removeEventListener(eventName: string, fn: ListenerFnItem) {
    if (!listeners[eventName]) {
        return;
    }

    for (let i = 0 ; i < listeners[eventName].length; i ++) {
        if (listeners[eventName][i] === fn) {
            delete listeners[eventName][i];
        }
    }
}

export function removeAllEventListener() {
    listeners = {};
}

export function removeAllEventListenerByEventName(eventName: string) {
    delete listeners[eventName];
}

export const triggerEvents = (store: any) => (next: any) => (action: any) => {
    let type = action.type;

    if (Array.isArray(listeners[type]) && listeners[type].length > 0) {
        // 确保事件触发完成时，state已经被更新
        // reducer 内部都要识同步操作，异步都要在触发action之前完成
        Promise.resolve().then(() => {
            listeners[type].forEach(fn => fn(action, store.getState()));
        });
    }

    return next(action);
};
