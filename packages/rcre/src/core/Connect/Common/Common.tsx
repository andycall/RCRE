import React from 'react';
import {BasicConfig, RCREContextType} from '../../../types';
import {BasicConnect, BasicConnectPropsInterface, CommonOptions, WrapperComponentType} from '../basicConnect';

const defaultMappingProps = {};

export function commonConnect(options: CommonOptions = {}):
    (WrapperComponent: WrapperComponentType<any>) => React.ComponentClass {
    return (WrapperComponent) => {
        class CommonConnect<Config extends BasicConfig> extends BasicConnect<Config> {
            static displayName: string;
            private mapping = defaultMappingProps;
            constructor(props: BasicConnectPropsInterface<Config>, context: RCREContextType) {
                super(props, context, options);
                this.mapping = {
                    ...this.mapping,
                    ...options.propsMapping
                };
            }

            render() {
                let {
                    props,
                    info,
                    runTime,
                    registerEvent,
                    updateNameValue,
                    getNameValue
                } = this.prepareRender(options);

                let changeCallBack = options.defaultNameCallBack || 'onChange';
                props[changeCallBack] = (value: any) => updateNameValue(value);

                this.applyPropsMapping(props, this.mapping);

                CommonConnect.displayName = `RCREConnect(${this.props.info.type})`;
                WrapperComponent.displayName = `RCRE(${this.props.info.type})`;

                let children = (
                    <WrapperComponent
                        {...this.props.injectEvents}
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
                            form: {
                                isUnderForm: !!this.props.$form,
                                $setFormItem: this.props.$setFormItem,
                                $deleteFormItem: this.props.$deleteFormItem,
                                $getFormItem: this.getFormItemControl
                            }
                        }}
                    />
                );

                return this.renderChildren(info, children);
            }
        }

        return CommonConnect;
    };
}
