import React from 'react';
import {BasicConnect, BasicConnectProps, CommonOptions, WrapperComponentType} from '../basicConnect';

const defaultMappingProps = {};

export function commonConnect(options: CommonOptions = {}):
    (WrapperComponent: WrapperComponentType<any>) => React.ComponentClass {
    return (WrapperComponent) => {
        class CommonConnect extends BasicConnect {
            static displayName: string;
            private mapping = defaultMappingProps;
            constructor(props: BasicConnectProps) {
                super(props, options);
                this.mapping = {
                    ...this.mapping,
                    ...options.propsMapping
                };
            }

            render() {
                let {
                    props,
                    runTime,
                    registerEvent,
                    updateNameValue,
                    getNameValue
                } = this.prepareRender(options);

                let changeCallBack = options.defaultNameCallBack || 'onChange';
                props[changeCallBack] = (value: any) => updateNameValue(value);

                this.applyPropsMapping(props, this.mapping);

                CommonConnect.displayName = `RCREConnect(${this.props.type})`;
                WrapperComponent.displayName = `RCRE(${this.props.type})`;

                return (
                    <WrapperComponent
                        {...props}
                        tools={{
                            debounceCache: this.debounceCache,
                            isDebouncing: this.isDebouncing,
                            runTime: runTime,
                            env: this.props,
                            clearNameValue: this.clearNameValue,
                            updateNameValue: updateNameValue,
                            registerEvent: registerEvent,
                            createReactNode: this.createReactNode,
                            hasTriggerEvent: this.hasTriggerEvent,
                            getNameValue: getNameValue,
                            form: this.props.formContext
                        }}
                    />
                );
            }
        }

        return CommonConnect;
    };
}
