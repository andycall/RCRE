import querystring from 'querystring';
import React from 'react';
import {Store} from 'redux';
import {Provider} from 'react-redux';
import URL from 'url';
import {RootState} from '../data/reducers';
import createReduxStore from '../data/store';
import {RCREContextType, RCREOptions} from '../types';
import {DataProviderEvent} from './Events/dataProviderEvent';
import {Events} from './Events/index';
import {RCREContext} from './context';
import {ContainerNode} from './Service/ContainerDepGraph';

export interface RCREProviderProps {
    global?: any;
    debug?: boolean;
    events?: Events;
    store?: Store<any>;
    options?: RCREOptions;
}

export class RCREProvider extends React.Component<RCREProviderProps, {}> {
    private contextValue: RCREContextType;
    public events: Events;
    private dataProviderEvent: DataProviderEvent;
    private store: Store<RootState>;
    private containerGraph: Map<string, ContainerNode>;

    constructor(props: RCREProviderProps) {
        super(props);

        let location = this.getLocationService();
        let store: Store<any>;

        if (props.store) {
            store = props.store;
        } else {
            store = createReduxStore();
        }

        // for test use
        this.store = store;
        this.containerGraph = new Map();
        this.events = props.events || new Events();
        this.dataProviderEvent = new DataProviderEvent();

        this.contextValue = {
            ...location,
            lang: '',
            loadMode: 'default',
            $global: props.global || {},
            debug: props.debug || false,
            store: store,
            mode: 'React',
            dataProviderEvent: this.dataProviderEvent,
            options: props.options || {},
            events: this.events,
            containerGraph: this.containerGraph
        };
    }

    public waitForDataProviderComplete = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let timeout = setTimeout(() => {
                    let pendingNamespaces = this.dataProviderEvent.stack.map(m => m.key).join('\n,');
                    clearTimeout(timeout);
                    reject(new Error('dataProvider request timeout \n pending namespace: ' + pendingNamespaces));
                }, 100000);

                if (this.dataProviderEvent.stack.length === 0) {
                    clearTimeout(timeout);
                    return resolve();
                }

                this.dataProviderEvent.on('done', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                this.dataProviderEvent.on('error', err => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });
        });
    }

    componentWillUnmount(): void {
        this.store.dispatch({
            type: '_RESET_STORE_'
        });
        this.dataProviderEvent.clear();
        this.containerGraph.clear();
        // @ts-ignore
        this.containerGraph = null;
        // @ts-ignore
        this.store = null;
    }

    getLocationService() {
        let $location = URL.parse(location.href);
        let $query = {};

        if ($location.query && typeof $location.query === 'string') {
            $query = querystring.parse($location.query);
        }

        return {
            $location,
            $query
        };
    }

    render() {
        return (
            <Provider store={this.contextValue.store}>
                <RCREContext.Provider value={this.contextValue}>
                    {this.props.children}
                </RCREContext.Provider>
            </Provider>
        );
    }
}