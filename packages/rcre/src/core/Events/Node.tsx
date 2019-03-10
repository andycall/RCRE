import {EventEmitter} from 'events';

export class EventNode extends EventEmitter {
    public parent: EventNode;
    public childs: EventNode[];
    public model: string;

    constructor(model: string) {
        super();
        this.model = model;
    }

    trigger(event: string | symbol, ...args: any[]): boolean {
        this.emit('_SECRET_EVENT_', this.model, event, ...args);
        this.emit(event, args);
        return true;
    }
}