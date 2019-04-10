import querystring from 'querystring';
import React from 'react';
import {Store} from 'redux';
import {Provider} from 'react-redux';
import URL from 'url';
import {RootState} from '../data/reducers';
import createReduxStore from '../data/store';
import {BasicContextType, RCREOptions} from '../types';
import {dataProviderEvent} from './Events/dataProviderEvent';
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
    private contextValue: BasicContextType;
    public events: Events;
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

        this.contextValue = {
            ...location,
            lang: '',
            $global: props.global || {},
            debug: props.debug || false,
            store: store,
            mode: 'React',
            options: props.options || {},
            events: this.events,
            containerGraph: this.containerGraph
        };
    }

    componentWillUnmount(): void {
        this.store.dispatch({
            type: '_RESET_STORE_'
        });
        dataProviderEvent.clear();
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