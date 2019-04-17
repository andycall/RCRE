import * as React from 'react';
import {CSSProperties} from 'react';
import {isArray} from 'lodash';
import {createChild} from '../../util/createChild';
import {detect} from 'bowser';
import {BasicProps, CoreKind} from '../../../types';
import {componentLoader} from '../../util/componentLoader';
import {getRuntimeContext} from "../../util/util";
import {compileExpressionString} from "../../util/vm";

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

export interface RowProps extends BasicProps {
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
    children: any[];
}

export class Row extends React.Component<RowProps, {}> {
    private static isRowDirection(flexDirection: flexDirectionItems = 'row') {
        return flexDirection === 'row' || flexDirection === 'row-reverse';
    }

    constructor(props: RowProps) {
        super(props);
    }

    private getDefaultGridCount(children: any[]) {
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
        let children = this.props.children;
        let showBorder = this.props.showBorder || this.props.rcreContext.debug;

        if (!isArray(children)) {
            return <div>children props is required in Row Component</div>;
        }

        let runTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            iteratorContext: this.props.iteratorContext
        });

        let unHiddenChildren = children.filter((child) => {
            child = compileExpressionString(child, runTime, [], false, ['show', 'hidden']);

            return child.show !== false && child.hidden !== true;
        });

        const defaultGridCount = this.getDefaultGridCount(unHiddenChildren);

        let childElements = children.map((childInfo, index) => {
            childInfo = compileExpressionString(childInfo, runTime, [], false, [
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

            if (Row.isRowDirection(this.props.flexDirection)) {
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
                if (this.props.rcreContext.options && this.props.rcreContext.options.safari10Layout && browser.safari && browser.version < 11) {
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
                ...this.props.innerGridStyle
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

            if (childInfo.show === false || childInfo.hidden === true) {
                return null;
            }

            return childElement;
        });

        const rowStyles = {
            display: 'flex',
            width: this.props.width || '100%',
            height: this.props.height || 'auto',
            minHeight: this.props.minHeight,
            flexDirection: this.props.flexDirection || 'row',
            border: showBorder ? '1px dashed #333' : '',
            ...this.props.style
        };

        const handleClick = (e: React.MouseEvent<any>) => {
            this.props.triggerContext.eventHandle('onClick', {
                e: e
            });
        };

        let rowElement = (
            <div style={rowStyles} className={this.props.className} key={'row'} onClick={handleClick}>
                {childElements}
            </div>
        );

        return rowElement;
    }
}

componentLoader.addComponent('row', Row, '__BUILDIN__');