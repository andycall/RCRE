import React from 'react';
import {createStore} from 'redux';
import URL from 'url';
import {DataCustomer} from './DataCustomer/index';
import {DataProviderEvent} from './Events/dataProviderEvent';
import {Events} from './Events/index';
import {
    RCREContextType,
    ContainerContextType,
    FormContextType,
    IteratorContextType,
    TriggerContextType, FormItemContextType
} from '../types';

export const RCREContext = React.createContext<RCREContextType>({
    $global: {},
    $location: URL.parse(''),
    lang: '',
    $query: {},
    debug: false,
    loadMode: 'default',
    // lang: PropsTypes.string,
    events: new Events(),
    dataProviderEvent: new DataProviderEvent(),
    store: createStore((state) => state),
    options: {},
    mode: 'React',
    containerGraph: new Map()
});
// @ts-ignore
RCREContext.displayName = 'RCREContext';

export const ContainerContext = React.createContext<ContainerContextType>({
    model: '',
    $data: {},
    $parent: null,
    dataCustomer: new DataCustomer(),
    $setData: (name: string, value: any) => {
    },
    $getData: (name: string, isTmp?: boolean) => {
    },
    $deleteData: (name: string, isTmp?: boolean) => {
    },
    $setMultiData: (items: { name: string, value: any, isTmp: boolean }[]) => {
    }
});
// @ts-ignore
ContainerContext.displayName = 'ContainerContext';

export const TriggerContext = React.createContext<TriggerContextType>({
    eventHandle: async (eventName, args, options) => {
    },
    execTask: async (eventName, args) => {
        console.log('exec', eventName);
    },
    $trigger: null
});
// @ts-ignore
TriggerContext.displayName = 'TriggerContext';

export const FormContext = React.createContext<FormContextType>({
    $form: null as any,
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
    $handleSubmit: async (e: React.FormEvent<HTMLFormElement> | undefined) => {},
    $runValidations: async () => false,
    $registerFormItem: () => {},
    $resetForm: () => {}
});
// @ts-ignore
FormContext.displayName = 'FormContext';

export const FormItemContext = React.createContext<FormItemContextType>({
    $validateFormItem: (name: string, value: any) => {},
    $handleBlur: () => {},
    $deleteFormItem: () => {},
    $setFormItem: payload => {},
    updateControlElements: () => {},
    deleteControlElements: () => {},
    initControlElements: () => {},
    $formItem: {
        valid: false,
        errmsg: '',
        validating: false
    },
    isUnderFormItem: false
});
// @ts-ignore
FormItemContext.displayName = 'FormItemContext';

export const withRCREContext: any = (Component: any) => {
    return (props: any) => (
        <RCREContext.Consumer>
            {context => <Component rcreContext={context} {...props} />}
        </RCREContext.Consumer>
    );
};

export const withContainerContext: any = (Component: any) => (
    (props: any) => (
        <ContainerContext.Consumer>
            {context => <Component containerContext={context} {...props} />}
        </ContainerContext.Consumer>
    )
);

export const withFormContext: any = (Component: any) => (
    (props: any) => (
        <FormContext.Consumer>
            {context => <Component formContext={context} {...props} />}
        </FormContext.Consumer>
    )
);

export const withTriggerContext: any = (Component: any) => (
    (props: any) => (
        <TriggerContext.Consumer>
            {context => <Component triggerContext={context} {...props} />}
        </TriggerContext.Consumer>
    )
);

export const withIteratorContext: any = (Component: any) => (
    (props: any) => (
        <IteratorContext.Consumer>
            {context => <Component iteratorContext={context} {...props} />}
        </IteratorContext.Consumer>
    )
);

export const IteratorContext = React.createContext<IteratorContextType>({
    $item: null,
    $index: -1
});

// @ts-ignore
IteratorContext.displayName = 'IteratorContext';

export type RunTimeContextCollection = {
    container: ContainerContextType;
    rcre: RCREContextType;
    iterator?: IteratorContextType;
    form?: FormContextType;
};