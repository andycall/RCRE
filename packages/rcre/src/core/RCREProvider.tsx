import querystring from 'querystring';
import React from 'react';
import {Store} from 'redux';
import {Provider} from 'react-redux';
import URL from 'url';
import createReduxStore from '../data/store';
import {BasicContextType} from '../types';
import {Events} from './Events/index';
import {RCREOptions} from './Page';

export const RCREContext = React.createContext<BasicContextType>({
    $global: {},
    $location: URL.parse(''),
    lang: '',
    $query: {},
    debug: false,
    // lang: PropsTypes.string,
    events: new Events(),
    store: createReduxStore(),
    options: {},
    containerGraph: new Map()
});

export interface RCREProviderProps {
    $global?: any;
    debug?: boolean;
    events?: Events;
    store?: Store<any>;
    options?: RCREOptions;
}

export class RCREProvider extends React.Component<RCREProviderProps, {}> {
    private contextValue: BasicContextType;
    public store: Store<any>;

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

        this.contextValue = {
            ...location,
            lang: '',
            $global: props.$global || {},
            debug: props.debug || false,
            store: store,
            options: props.options || {},
            events: props.events || new Events(),
            containerGraph: new Map()
        };
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