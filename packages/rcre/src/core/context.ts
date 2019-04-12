import createReactContext from 'create-react-context';
import URL from 'url';
import {DataCustomer} from './DataCustomer/index';
import {Events} from './Events/index';
import createReduxStore from '../data/store';
import {BasicContextType, ComponentContextType} from '../types';

export const RCREContext = createReactContext<BasicContextType>({
    $global: {},
    $location: URL.parse(''),
    lang: '',
    $query: {},
    debug: false,
    // lang: PropsTypes.string,
    events: new Events(),
    store: createReduxStore(),
    options: {},
    mode: 'React',
    containerGraph: new Map()
});

export const ComponentContext = createReactContext<ComponentContextType>({
    model: '',
    $data: null,
    $tmp: null,
    dataCustomer: new DataCustomer(),
    $setData: (name: string, value: any, options: any) => {},
    $getData: (nameStr: string, props: any, isTmp?: boolean) => {},
    $deleteData: (name: string, isTmp?: boolean) => {},
    $setMultiData: (items: { name: string, value: any, isTmp: boolean }[]) => {}
});