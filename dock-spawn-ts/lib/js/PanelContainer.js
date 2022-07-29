import { Utils } from "./Utils.js";
import { UndockInitiator } from "./UndockInitiator.js";
import { ContainerType } from "./ContainerType.js";
import { EventHandler } from "./EventHandler.js";
import { Point } from "./Point.js";
import { PanelType } from "./enums/PanelType.js";
/**
 * This dock container wraps the specified element on a panel frame with a title bar and close button
 */
export class PanelContainer {
    //constructor(elementContent: HTMLElement, dockManager: DockManager, title?: string, panelType?: PanelType, hideCloseButton?: boolean) {
    constructor(elementContent, dockManager, title, panelType, hideCloseButton, hideExpandButton) {
        if (!title)
            title = 'Panel';
        if (!panelType)
            panelType = PanelType.panel;
        this.panelType = panelType;
        this.elementContent = Object.assign(elementContent, { _dockSpawnPanelContainer: this });
        this.dockManager = dockManager;
        this.title = title;
        this.containerType = ContainerType.panel;
        this.icon = null;
        this.minimumAllowedChildNodes = 0;
        this._floatingDialog = undefined;
        this.isDialog = false;
        this._canUndock = dockManager._undockEnabled;
        this.eventListeners = [];
        this._hideCloseButton = hideCloseButton;
        this._hideExpandButton = hideExpandButton;
        this._initialize();
    }
    canUndock(state) {
        this._canUndock = state;
        this.undockInitiator.enabled = state;
        this.eventListeners.forEach((listener) => {
            if (listener.onDockEnabled) {
                listener.onDockEnabled({ self: this, state: state });
            }
        });
    }
    addListener(listener) {
        this.eventListeners.push(listener);
    }
    removeListener(listener) {
        this.eventListeners.splice(this.eventListeners.indexOf(listener), 1);
    }
    get floatingDialog() {
        return this._floatingDialog;
    }
    set floatingDialog(value) {
        this._floatingDialog = value;
        let canUndock = (this._floatingDialog === undefined);
        this.undockInitiator.enabled = canUndock;
    }
    static loadFromState(state, dockManager) {
        let elementName = state.element;
        let elementContent = document.getElementById(elementName);
        if (elementContent === null) {
            return null;
        }
        let ret = new PanelContainer(elementContent, dockManager);
        ret.loadState(state);
        return ret;
    }
    saveState(state) {
        state.element = this.elementContent.id;
        state.width = this.width;
        state.height = this.height;
        state.canUndock = this._canUndock;
        state.hideCloseButton = this._hideCloseButton;
        state.hideExpandButton = this._hideExpandButton; //GS
        state.panelType = this.panelType;
    }
    loadState(state) {
        this.width = state.width;
        this.height = state.height;
        this.state = { width: state.width, height: state.height };
        this.canUndock(state.canUndock);
        this.hideCloseButton(state.hideCloseButton);
        this.panelType = state.panelType;
    }
    setActiveChild( /*child*/) {
    }
    get containerElement() {
        return this.elementPanel;
    }
    grayOut(show) {
        if (!show && this._grayOut) {
            this.elementContentWrapper.removeChild(this._grayOut);
            this.elementButtonClose.style.display = this._hideCloseButton ? 'none' : 'block';
            this.elementButtonExpand.style.display = this._hideExpandButton ? 'none' : 'block'; //GS
            this._grayOut = null;
            if (!this._hideCloseButton)
                this.eventListeners.forEach((listener) => {
                    if (listener.onHideCloseButton) {
                        listener.onHideCloseButton({ self: this, state: this._hideCloseButton });
                    }
                });
            if (!this._hideExpandButton) //GS
                this.eventListeners.forEach((listener) => {
                    if (listener.onHideExpandButton) {
                        listener.onHideExpandButton({ self: this, state: this._hideExpandButton });
                    }
                });
        }
        else if (show && !this._grayOut) {
            this._grayOut = document.createElement('div');
            this._grayOut.className = 'panel-grayout';
            this.elementButtonClose.style.display = 'none';
            this.elementButtonExpand.style.display = 'none'; //GS
            this.elementContentWrapper.appendChild(this._grayOut);
            this.eventListeners.forEach((listener) => {
                if (listener.onHideCloseButton) {
                    listener.onHideCloseButton({ self: this, state: true });
                }
                if (listener.onHideExpandButton) {
                    listener.onHideExpandButton({ self: this, state: true });
                }
            });
        }
    }
    _initialize() {
        this.name = Utils.getNextId('panel_');
        this.elementPanel = document.createElement('div');
        this.elementPanel.tabIndex = 0;
        this.elementTitle = document.createElement('div');
        this.elementTitleText = document.createElement('div');
        this.elementContentHost = document.createElement('div');
        this.elementButtonClose = document.createElement('div');
        this.elementButtonExpand = document.createElement('div'); //GS
        this.elementPanel.appendChild(this.elementTitle);
        this.elementTitle.appendChild(this.elementTitleText);
        this.elementTitle.appendChild(this.elementButtonClose);
        this.elementTitle.appendChild(this.elementButtonExpand); //GS
        this.elementButtonClose.classList.add('panel-titlebar-button-close');
        this.elementButtonClose.style.display = this._hideCloseButton ? 'none' : 'block';
        this.elementButtonExpand.classList.add('panel-titlebar-button-expand'); //GS
        this.elementButtonExpand.style.display = this._hideExpandButton ? 'none' : 'block'; //GS
        this.elementPanel.appendChild(this.elementContentHost);
        this.elementPanel.classList.add('panel-base');
        this.elementTitle.classList.add('panel-titlebar');
        this.elementTitle.classList.add('disable-selection');
        this.elementTitleText.classList.add('panel-titlebar-text');
        this.elementContentHost.classList.add('panel-content');
        // set the size of the dialog elements based on the panel's size
        let panelWidth = this.elementContent.clientWidth;
        let panelHeight = this.elementContent.clientHeight;
        let titleHeight = this.elementTitle.clientHeight;
        this._setPanelDimensions(panelWidth, panelHeight + titleHeight);
        if (!this._hideCloseButton) {
            this.closeButtonClickedHandler =
                new EventHandler(this.elementButtonClose, 'mousedown', this.onCloseButtonClicked.bind(this));
            this.closeButtonTouchedHandler =
                new EventHandler(this.elementButtonClose, 'touchstart', this.onCloseButtonClicked.bind(this));
        }
        if (!this._hideExpandButton) {
            this.expandButtonClickedHandler =
                new EventHandler(this.elementButtonExpand, 'mousedown', this.onExpandButtonClicked.bind(this));
            this.expandButtonTouchedHandler =
                new EventHandler(this.elementButtonExpand, 'touchstart', this.onExpandButtonClicked.bind(this));
        }
        this.elementContentWrapper = document.createElement("div");
        this.elementContentWrapper.classList.add('panel-content-wrapper');
        this.elementContentWrapper.appendChild(this.elementContent);
        Utils.removeNode(this.elementContentWrapper);
        this.elementContentHost.appendChild(this.elementContentWrapper);
        // Extract the title from the content element's attribute
        let contentTitle = this.elementContent.dataset.panelCaption;
        let contentIcon = this.elementContent.dataset.panelIcon;
        if (contentTitle)
            this.title = contentTitle;
        if (contentIcon)
            this.icon = contentIcon;
        this._updateTitle();
        this.undockInitiator = new UndockInitiator(this.elementTitle, this.performUndockToDialog.bind(this));
        delete this.floatingDialog;
        this.mouseDownHandler = new EventHandler(this.elementPanel, 'mousedown', this.onMouseDown.bind(this));
        this.touchDownHandler = new EventHandler(this.elementPanel, 'touchstart', this.onMouseDown.bind(this));
        this.elementContent.removeAttribute("hidden");
    }
    onMouseDown() {
        this.dockManager.activePanel = this;
    }
    hideCloseButton(state) {
        this._hideCloseButton = state;
        this.elementButtonClose.style.display = state ? 'none' : 'block';
        this.eventListeners.forEach((listener) => {
            if (listener.onHideCloseButton) {
                listener.onHideCloseButton({ self: this, state: state });
            }
        });
    }
    hideExpandButton(state) {
        this._hideExpandButton = state;
        this.elementButtonExpand.style.display = state ? 'none' : 'block';
        this.eventListeners.forEach((listener) => {
            if (listener.onHideExpandButton) {
                listener.onHideExpandButton({ self: this, state: state });
            }
        });
    }
    destroy() {
        if (this.mouseDownHandler) {
            this.mouseDownHandler.cancel();
            delete this.mouseDownHandler;
        }
        if (this.touchDownHandler) {
            this.touchDownHandler.cancel();
            delete this.touchDownHandler;
        }
        Utils.removeNode(this.elementPanel);
        if (this.closeButtonClickedHandler) {
            this.closeButtonClickedHandler.cancel();
            delete this.closeButtonClickedHandler;
        }
        if (this.closeButtonTouchedHandler) {
            this.closeButtonTouchedHandler.cancel();
            delete this.closeButtonTouchedHandler;
        }
    }
    /**
     * Undocks the panel and and converts it to a dialog box
     */
    performUndockToDialog(e, dragOffset) {
        this.isDialog = true;
        this.undockInitiator.enabled = false;
        this.elementContentWrapper.style.display = "block";
        this.elementPanel.style.position = "";
        return this.dockManager.requestUndockToDialog(this, e, dragOffset);
    }
    /**
    * Closes the panel
    */
    performClose() {
        this.isDialog = true;
        this.undockInitiator.enabled = false;
        this.elementContentWrapper.style.display = "block";
        this.elementPanel.style.position = "";
        this.dockManager.requestClose(this);
    }
    /**
     * Undocks the container and from the layout hierarchy
     * The container would be removed from the DOM
     */
    performUndock() {
        this.undockInitiator.enabled = false;
        this.dockManager.requestUndock(this);
    }
    ;
    prepareForDocking() {
        this.isDialog = false;
        this.undockInitiator.enabled = this._canUndock;
    }
    get width() {
        return this._cachedWidth;
    }
    set width(value) {
        if (value !== this._cachedWidth) {
            this._cachedWidth = value;
            this.elementPanel.style.width = value + 'px';
        }
    }
    get height() {
        return this._cachedHeight;
    }
    set height(value) {
        if (value !== this._cachedHeight) {
            this._cachedHeight = value;
            this.elementPanel.style.height = value + 'px';
        }
    }
    resize(width, height) {
        // if (this._cachedWidth === width && this._cachedHeight === height)
        // {
        //     // Already in the desired size
        //     return;
        // }
        this._setPanelDimensions(width, height);
        this._cachedWidth = width;
        this._cachedHeight = height;
        try {
            if (this.elementContent != undefined && (typeof this.elementContent.resizeHandler == 'function'))
                this.elementContent.resizeHandler(width, height - this.elementTitle.clientHeight);
        }
        catch (err) {
            console.log("error calling resizeHandler:", err, " elt:", this.elementContent);
        }
    }
    _setPanelDimensions(width, height) {
        this.elementTitle.style.width = width + 'px';
        this.elementContentHost.style.width = width + 'px';
        this.elementContent.style.width = width + 'px';
        this.elementPanel.style.width = width + 'px';
        let titleBarHeight = this.elementTitle.clientHeight;
        let contentHeight = height - titleBarHeight;
        this.elementContentHost.style.height = contentHeight + 'px';
        this.elementContent.style.height = contentHeight + 'px';
        this.elementPanel.style.height = height + 'px';
    }
    setTitle(title) {
        this.title = title;
        this._updateTitle();
        if (this.onTitleChanged)
            this.onTitleChanged(this, title);
    }
    setTitleIcon(icon) {
        this.icon = icon;
        this._updateTitle();
        if (this.onTitleChanged)
            this.onTitleChanged(this, this.title);
    }
    setHasChanges(changes) {
        this.hasChanges = changes;
        this._updateTitle();
        if (changes) {
            this.elementTitleText.classList.add('panel-has-changes');
        }
        else {
            this.elementTitleText.classList.remove('panel-has-changes');
        }
        if (this.onTitleChanged)
            this.onTitleChanged(this, this.title);
    }
    setCloseIconTemplate(closeIconTemplate) {
        this.elementButtonClose.innerHTML = closeIconTemplate;
    }
    setExpandIconTemplate(expandIconTemplate) {
        this.elementButtonExpand.innerHTML = expandIconTemplate;
    }
    _updateTitle() {
        if (this.icon !== null) {
            this.elementTitleText.innerHTML = '<img class="panel-titlebar-icon" src="' + this.icon + '"><span>' + this.title + '</span>';
            return;
        }
        this.elementTitleText.innerHTML = this.title;
    }
    getRawTitle() {
        return this.elementTitleText.innerHTML;
    }
    performLayout(children, relayoutEvenIfEqual) {
    }
    onCloseButtonClicked(e) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
    }
    onExpandButtonClicked(e) {
        e.preventDefault();
        e.stopPropagation();
        // full screen
        const doc = window.document;
        if (this.isDialog) {
            if (!doc.fullscreen) {
                //this.performUndockToDialog(e, new Point(100,100));
                //this.elementPanel.style.height="100px";
                //this.elementPanel.style.width="100px";
                //this.elementPanel.className = '';
                //this.elementContentHost.className = '';
                //this.elementContent.className = '';
                //this.width(500);
                this.elementPanel.requestFullscreen();
                //this.elementContentHost.className = 'fullPanel';
                //this.elementContent.className = 'fullPanel';
                // panel-content
                this.elementContentHost.style.width = '100%';
                this.elementContentHost.style.height = '100%';
                // user content
                this.elementContent.style.width = '100%';
                this.elementContent.style.height = '100%';
                this.elementContent.style.backgroundColor = "blue";
                //this.elementPanel.requestFullscreen();
                //this.resize(window.screen.width, window.screen.height);
                //this.resize(this.width, this.height);
            }
            else {
                doc.exitFullscreen();
                this.dockManager.dockRight(this.node, this, 50);
            }
        } // end Dialog
        else {
            if (!doc.fullscreen) {
                this.backupState = this.dockManager.saveState();
                //console.log(this.backupState);
                this.node = this.dockManager.findNodeFromContainerElement(this.elementPanel);
                console.log(typeof this.node);
                //this.dockManager.openInDialog(this, e, new Point(0,0));
                this.performUndockToDialog(e, new Point(0, 0));
                this.elementPanel.requestFullscreen();
                // panel-content
                this.elementContentHost.style.width = '100%';
                this.elementContentHost.style.height = '100%';
                this.elementTitle.style.width = '100%';
                // user content
                this.elementContent.style.width = '100%';
                this.elementContent.style.height = '100%';
                this.elementContent.style.backgroundColor = "blue";
                //this.elementPanel.requestFullscreen();
            }
            else {
                doc.exitFullscreen();
                this.isDialog = false;
                this.dockManager.loadState(this.backupState);
                this.dockManager.dockRight(this.node, this, 50);
            }
        }
    }
    async close() {
        let close = true;
        if (this.closePanelContainerCallback)
            close = await this.closePanelContainerCallback(this);
        else if (this.dockManager.closePanelContainerCallback)
            close = await this.dockManager.closePanelContainerCallback(this);
        if (close) {
            if (this.isDialog) {
                if (this.floatingDialog) {
                    //this.floatingDialog.hide();
                    this.floatingDialog.close(); // fires onClose notification
                }
            }
            else {
                this.performClose();
                this.dockManager.notifyOnClosePanel(this);
            }
        }
    }
}
//# sourceMappingURL=PanelContainer.js.map