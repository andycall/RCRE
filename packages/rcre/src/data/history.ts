import {AnyAction, Reducer} from 'redux';
import {RCRE_ASYNC_LOAD_DATA_FAIL, RCRE_ASYNC_LOAD_DATA_SUCCESS, RCRE_DATA_CUSTOMER_PASS, RCRE_DELETE_DATA, RCRE_REDO_STATE, RCRE_SET_DATA, RCRE_SET_MULTI_DATA, RCRE_UNDO_STATE} from '../core/Container/action';

const validUNDOAction = [
    RCRE_SET_DATA,
    RCRE_SET_MULTI_DATA,
    RCRE_ASYNC_LOAD_DATA_SUCCESS,
    RCRE_ASYNC_LOAD_DATA_FAIL,
    RCRE_DELETE_DATA,
    RCRE_DATA_CUSTOMER_PASS
];

export class ContainerStateHistory<T> {
    private historyIndex: number;
    private history: T[];

    constructor() {
        this.history = [];
        this.historyIndex = 0;

        this.canRedoContainerState = this.canRedoContainerState.bind(this);
        this.canUndoContainerState = this.canUndoContainerState.bind(this);
    }

    undo(state: T): T {
        this.history[this.historyIndex] = state;
        this.historyIndex--;
        return this.history[this.historyIndex];
    }

    forward(state: T) {
        this.history[this.historyIndex] = state;
        this.historyIndex++;
        return this.history[this.historyIndex];
    }

    middleware(state: T, action: AnyAction) {
        if (validUNDOAction.includes(action.type)) {
            if (this.history.length > 100) {
                this.history.shift();
            }

            this.history[this.historyIndex++] = state;
        }
    }

    canUndoContainerState(): boolean {
        return this.historyIndex > 0;
    }

    canRedoContainerState(): boolean {
        return this.historyIndex < this.history.length - 1;
    }
}

export function createContainerStateHistory<T>() {
    return new ContainerStateHistory<T>();
}

export function undoable<T, A>(reducer: Reducer<T>, externalHistory?: ContainerStateHistory<T>): Reducer<T> {
    let history = externalHistory || new ContainerStateHistory<T>();

    return (state, action) => {
        switch (action.type) {
            case RCRE_UNDO_STATE: {
                let prevState = history.undo(state);
                if (!prevState) {
                    return state;
                }

                return prevState;
            }
            case RCRE_REDO_STATE: {
                let nextState = history.forward(state);

                if (!nextState) {
                    return state;
                }

                return nextState;
            }
            default: {
                history.middleware(state, action);
                return reducer(state, action);
            }
        }
    };
}