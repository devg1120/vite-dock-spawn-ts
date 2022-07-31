import { DockManager } from "./DockManager.js";
import { UndockInitiator } from "./UndockInitiator.js";
import { ContainerType } from "./ContainerType.js";
import { EventHandler } from "./EventHandler.js";
import { ISize } from "./interfaces/ISize.js";
import { IDockContainerWithSize } from "./interfaces/IDockContainerWithSize.js";
import { IState } from "./interfaces/IState.js";
import { Point } from "./Point.js";
import { IDockContainer } from "./interfaces/IDockContainer.js";
import { PanelType } from "./enums/PanelType.js";
import { Dialog } from "./Dialog.js";
import { TabPage } from './TabPage.js';
import { DockNode } from "./DockNode.js";
/**
 * This dock container wraps the specified element on a panel frame with a title bar and close button
 */
export declare class PanelContainer implements IDockContainerWithSize {
    static expand_PanelContainer: PanelContainer;
    closePanelContainerCallback: (panelContainer: PanelContainer) => Promise<boolean>;
    onTitleChanged: (panelContainer: PanelContainer, title: string) => void;
    elementPanel: HTMLDivElement;
    elementTitle: HTMLDivElement;
    elementTitleText: HTMLDivElement;
    elementContentHost: HTMLDivElement;
    name: string;
    state: ISize;
    elementContent: HTMLElement & {
        resizeHandler?: any;
        _dockSpawnPanelContainer: PanelContainer;
    };
    elementContentWrapper: HTMLElement;
    dockManager: DockManager;
    title: string;
    containerType: ContainerType;
    icon: string;
    hasChanges: boolean;
    minimumAllowedChildNodes: number;
    isDialog: boolean;
    isExpand: boolean;
    eventListeners: any[];
    undockInitiator: UndockInitiator;
    elementButtonClose: HTMLDivElement;
    elementButtonExpand: HTMLDivElement;
    closeButtonClickedHandler: EventHandler;
    closeButtonTouchedHandler: EventHandler;
    expandButtonClickedHandler: EventHandler;
    expandButtonTouchedHandler: EventHandler;
    mouseDownHandler: EventHandler;
    touchDownHandler: EventHandler;
    panelType: PanelType;
    tabPage?: TabPage;
    backupState: string;
    node: any;
    rootNode: DockNode;
    lastDialogSize?: ISize;
    _floatingDialog?: Dialog;
    _canUndock: boolean;
    _cachedWidth: number;
    _cachedHeight: number;
    _hideCloseButton: boolean;
    _hideExpandButton: boolean;
    _grayOut: HTMLDivElement;
    constructor(elementContent: HTMLElement, dockManager: DockManager, title?: string, panelType?: PanelType, hideCloseButton?: boolean, hideExpandButton?: boolean);
    canUndock(state: boolean): void;
    addListener(listener: any): void;
    removeListener(listener: any): void;
    get floatingDialog(): Dialog;
    set floatingDialog(value: Dialog);
    static loadFromState(state: IState, dockManager: DockManager): PanelContainer;
    saveState(state: IState): void;
    loadState(state: IState): void;
    setActiveChild(): void;
    get containerElement(): HTMLDivElement;
    grayOut(show: boolean): void;
    _initialize(): void;
    onMouseDown(): void;
    hideCloseButton(state: boolean): void;
    hideExpandButton(state: boolean): void;
    destroy(): void;
    /**
     * Undocks the panel and and converts it to a dialog box
     */
    performUndockToDialog(e: any, dragOffset: Point): Dialog;
    /**
    * Closes the panel
    */
    performClose(): void;
    /**
     * Undocks the container and from the layout hierarchy
     * The container would be removed from the DOM
     */
    performUndock(): void;
    prepareForDocking(): void;
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    resize(width: number, height: number): void;
    _setPanelDimensions(width: number, height: number): void;
    setTitle(title: string): void;
    setTitleIcon(icon: string): void;
    setHasChanges(changes: boolean): void;
    setCloseIconTemplate(closeIconTemplate: string): void;
    setExpandIconTemplate(expandIconTemplate: string): void;
    _updateTitle(): void;
    getRawTitle(): string;
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void;
    onCloseButtonClicked(e: Event): void;
    onExpandButtonClicked(e: Event): void;
    close(): Promise<void>;
}
