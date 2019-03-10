import {EventEmitter} from 'events';
import {EventNode} from './Node';
import {values} from 'lodash';

export class Events extends EventEmitter {
    public roots: EventNode[];
    private nodes: {
        [model: string]: EventNode
    };
    private eventTick: {
        [event: string]: {
            [model: string]: boolean;
        }
    };

    constructor() {
        super();
        this.roots = [];
        this.nodes = {};
        this.eventTick = {};
        this.eventDispatcher = this.eventDispatcher.bind(this);
    }

    private getKeyCount(object: object) {
        return Object.keys(object).length;
    }

    private eventDispatcher(model: string, event: string, ...args: any[]) {
        if (!this.eventTick[event]) {
            this.eventTick[event] = {};
        }

        this.eventTick[event][model] = true;
        this.dispatchMasterEvent(event);
    }

    private dispatchMasterEvent(event: string) {
        let tick = this.eventTick[event];
        let nodeLength = this.getKeyCount(this.nodes);
        let triggedNodes = this.getKeyCount(tick);

        if (nodeLength !== triggedNodes) {
            return;
        }

        let tickValue = values(tick);
        if (tickValue.every(t => t)) {
            this.emit(event);
            delete this.eventTick[event];
        }
    }

    public mountContainer(model: string, parent?: string) {
        let node = new EventNode(model);

        node.on('_SECRET_EVENT_', this.eventDispatcher);

        this.nodes[model] = node;

        // if (!parent) {
        //     this.roots.push(node);
        // } else {
        //     let parentNode = this.nodes[parent];
        //     node.parent = parentNode;
        //     parentNode.childs.push(node);
        // }

        return node;
    }
}