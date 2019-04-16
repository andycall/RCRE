import React from 'react';
import createReactContext from 'create-react-context';
import URL from 'url';
import {Events} from './Events/index';
import createReduxStore from '../data/store';
import {
    RCREContextType,
    ContainerContextType,
    FormContextType,
    IteratorContextType,
    TriggerContextType, FormItemContextType
} from '../types';

export const RCREContext = createReactContext<RCREContextType>({
    $global: {},
    $location: URL.parse(''),
    lang: '',
    $query: {},
    debug: false,
    loadMode: 'default',
    // lang: PropsTypes.string,
    events: new Events(),
    store: createReduxStore(),
    options: {},
    mode: 'React',
    containerGraph: new Map()
});

export const ContainerContext = createReactContext<ContainerContextType>({
    model: '',
    $data: null,
    $parent: null,
    dataCustomer: null,
    $setData: (name: string, value: any) => {},
    $getData: (name: string, isTmp?: boolean) => {},
    $deleteData: (name: string, isTmp?: boolean) => {},
    $setMultiData: (items: { name: string, value: any, isTmp: boolean }[]) => {}
});

export const TriggerContext = createReactContext<TriggerContextType>({
    eventHandle: async (eventName, args, options) => {},
    $trigger: null
});

export const FormContext = createReactContext<FormContextType>({
    $form: null,
    $setFormItem: payload => {},
    $getFormItem: formItemName => ({
        formItemName: '',
        valid: false,
        required: false,
        rules: [],
        errorMsg: '',
        status: ''
    }),
    $setFormItems: payload => {},
    $deleteFormItem: itemName => {},
    $handleSubmit: () => {},
    $resetForm: () => {}
});

export const FormItemContext = createReactContext<FormItemContextType>({
    $addNameSet: (name: string) => {},
    $handleBlur: () => {},
    valid: false,
    errmsg: ''
});

export const withRCREContext = (Component: any) => (
    (props: any) => (
        <RCREContext.Consumer>
            {context => <Component rcreContext={context} {...props} />}
        </RCREContext.Consumer>
    )
);

export const withContainerContext = (Component: any) => (
    (props: any) => (
        <ContainerContext.Consumer>
            {context => <Component containerContext={context} {...props} />}
        </ContainerContext.Consumer>
    )
);

export const withFormContext = (Component: any) => (
    (props: any) => (
        <FormContext.Consumer>
            {context => <Component formContext={context} {...props} />}
        </FormContext.Consumer>
    )
);

export const withTriggerContext = (Component: any) => (
    (props: any) => (
        <TriggerContext.Consumer>
            {context => <Component triggerContext={context} {...props} />}
        </TriggerContext.Consumer>
    )
);

export const IteratorContext = createReactContext<IteratorContextType>({
    $item: null,
    $index: -1
});

export type RunTimeContextCollection = {
    container: ContainerContextType;
    rcre: RCREContextType;
    iterator: IteratorContextType;
    form?: FormContextType;
};