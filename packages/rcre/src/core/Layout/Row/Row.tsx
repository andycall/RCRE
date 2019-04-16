import * as React from 'react';
import {CSSProperties} from 'react';
import {isArray} from 'lodash';
import {BasicContainer} from '../../Container/BasicComponent';
import {createChild} from '../../util/createChild';
import {detect} from 'bowser';
import {BasicConfig, BasicContainerPropsInterface, CoreKind} from '../../../types';
import {componentLoader} from '../../util/componentLoader';

export type gridPositionItems = 'top-left' | 'top-center' | 'top-right' |
    'middle-left' | 'middle-center' | 'middle-right' |
    'bottom-left' | 'bottom-center' | 'bottom-right';

type alignCenterItems =
    'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | 'initial' | 'inherit' | 'unset';

type justifyContentItems =
    'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'initial'
    | 'inherit'
    | 'unset';

type CssCombo = {
    justifyContent: justifyContentItems;
    alignItems: alignCenterItems
};

function getCssCombo(position?: gridPositionItems): CssCombo {
    switch (position) {
        case 'top-left':
            return {
                justifyContent: 'initial',
                alignItems: 'initial'
            };

        case 'top-center':
            return {
                justifyContent: 'center',
                alignItems: 'initial'
            };

        case 'top-right':
            return {
                justifyContent: 'flex-end',
                alignItems: 'initial'
            };

        default:
        case 'middle-left':
            return {
                justifyContent: 'initial',
                alignItems: 'center'
            };
        case 'middle-center':
            return {
                justifyContent: 'center',
                alignItems: 'center'
            };
        case 'middle-right':
            return {
                justifyContent: 'flex-end',
                alignItems: 'center'
            };
        case 'bottom-left':
            return {
                justifyContent: 'initial',
                alignItems: 'flex-end'
            };
        case 'bottom-center':
            return {
                alignItems: 'flex-end',
                justifyContent: 'center'
            };

        case 'bottom-right':
            return {
                alignItems: 'flex-end',
                justifyContent: 'flex-end'
            };
    }
}

export type flexDirectionItems = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export class RowConfig<Config> extends BasicConfig {
    type: CoreKind.row;
    /**
     * 每行最小高度
     */
    minHeight?: string;

    /**
     * 宽度
     */
    width?: number | string;

    /**
     * 高度
     */
    height?: number | string;

    /**
     * 测试使用, 显示网格
     */
    showBorder?: boolean;

    /**
     * CSS Class
     */
    className?: string;

    /**
     * 内联CSS属性
     */
    style?: CSSProperties;

    /**
     * 内层Div的CSS属性
     */
    innerGridStyle?: CSSProperties;

    /**
     * 排列顺序
     */
    flexDirection?: flexDirectionItems;

    /**
     * 子级元素
     */
    children: (Config)[];
}

export class RowPropsInterface<Config extends RowConfig<Config>> extends BasicContainerPropsInterface {
    info: Config;
}

export class Row<Config extends RowConfig<Config>> extends BasicContainer<RowPropsInterface<Config>, {}> {
    private static isRowDirection(flexDirection: flexDirectionItems = 'row') {
        return flexDirection === 'row' || flexDirection === 'row-reverse';
    }

    constructor(props: RowPropsInterface<Config>) {
        super(props);
    }

    private getDefaultGridCount(children: Config[]) {
        let cookedGridCount = 0;
        let unCookedCount = 0;

        if (children.length === 0) {
            return 6;
        }

        children.forEach(child => {
            if (child.gridCount) {
                cookedGridCount += child.gridCount;
            } else if (!child.gridWidth) {
                unCookedCount++;
            }
        });

        return (12 - cookedGridCount) / unCookedCount;
    }

    render() {
        let info = this.getPropsInfo(this.props.info);
        if (process.env.NODE_ENV === 'test') {
            // 测试框架支持
            this.TEST_INFO = info;
        }
        let children = info.children as Config[];
        let showBorder = info.showBorder || this.context.debug;

        if (!isArray(children)) {
            return <div>children props is required in Row Component</div>;
        }

        let unHiddenChildren = children.filter((child: Config) => {
            child = this.getPropsInfo(child, this.props, [], false, [
                'show',
                'hidden'
            ]);

            return child.show !== false && child.hidden !== true;
        });

        const defaultGridCount = this.getDefaultGridCount(unHiddenChildren);

        let childElements = children.map((childInfo: Config, index) => {
            childInfo = this.getPropsInfo(childInfo, this.props, [], false, [
                'gridWidth',
                'gridHeight',
                'gridCount',
                'gridPosition',
                'gridPaddingLeft',
                'gridPaddingRight',
                'gridTop',
                'gridLeft',
                'hidden',
                'show'
            ]);
            let gridCount = childInfo.gridCount || defaultGridCount;
            let positionStyle = getCssCombo(childInfo.gridPosition);
            let gridStyles;
            let width = childInfo.gridWidth;

            if (width && childInfo.gridPaddingLeft && typeof width === 'number') {
                width -= childInfo.gridPaddingLeft;
            }

            if (width && childInfo.gridPaddingRight && typeof width === 'number') {
                width -= childInfo.gridPaddingRight;
            }

            if (Row.isRowDirection(info.flexDirection)) {
                gridStyles = {
                    width: childInfo.gridWidth || `${100 / 12 * gridCount}%`,
                    height: childInfo.gridHeight || 'auto',
                    display: 'flex',
                    outline: showBorder ? `1px dashed #FEAB33` : ''
                };

            } else {
                gridStyles = {
                    width: childInfo.gridWidth || '100%',
                    height: childInfo.gridHeight || `${100 / 12 * gridCount}%`,
                    display: 'flex',
                    outline: showBorder ? `1px dashed #FEAB33` : ''
                };
            }

            if (window) {
                let browser = detect(window.navigator.userAgent);

                // fix safari 10,9 bugs
                if (this.props.options && this.props.options.safari10Layout && browser.safari && browser.version < 11) {
                    delete gridStyles.height;
                }
            }

            let innerGridStyle = {
                marginTop: `${childInfo.gridTop || 0}px`,
                marginLeft: `${childInfo.gridLeft || 0}px`,
                paddingLeft: childInfo.gridPaddingLeft,
                paddingRight: childInfo.gridPaddingRight,
                width: width || '100%',
                height: childInfo.gridHeight || 'auto',
                display: 'flex',
                ...positionStyle,
                ...info.innerGridStyle
            };

            let child = createChild(childInfo, {
                ...this.props,
                info: childInfo
            });

            let childElement = (
                <div key={`grid_${childInfo.type}_${index}`} style={gridStyles}>
                    <div style={innerGridStyle}>
                        {child}
                    </div>
                </div>
            );

            return this.renderChildren(childInfo, childElement);
        });

        const rowStyles = {
            display: 'flex',
            width: info.width || '100%',
            height: info.height || 'auto',
            minHeight: info.minHeight,
            flexDirection: info.flexDirection || 'row',
            border: showBorder ? '1px dashed #333' : '',
            ...info.style
        };

        const handleClick = (e: React.MouseEvent<any>) => {
            this.commonEventHandler('onClick', {
                e: e
            });
        };

        let rowElement = (
            <div style={rowStyles} className={info.className} key={'row'} onClick={handleClick}>
                {childElements}
            </div>
        );

        return this.renderChildren(info, rowElement);
    }
}

componentLoader.addComponent('row', Row, '__BUILDIN__');