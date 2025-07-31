import * as vscode from 'vscode';
import { DirentAccess } from './dirents/dirent_fs';
import noPeekingPanelContext from './views/no_peeking';

export class TabManager {
    private _disposable: vscode.Disposable = new vscode.Disposable(() => {});
    private flaggedDirents: vscode.Uri[] = [];

    constructor(
        private readonly extensionContext: vscode.ExtensionContext,
        private readonly config: { [k: string]: any }
    ) {}

    public async closeTab(tab: vscode.Tab, faultyUri?: boolean | vscode.Uri) {
        if (typeof faultyUri === 'boolean') return;
        if (this.config.showBlockingPanel && tab.isActive) {
            const mediaPath = vscode.Uri.joinPath(this.extensionContext.extensionUri, 'media');
            vscode.window.showInformationMessage(mediaPath.path);
            const panel = vscode.window.createWebviewPanel(
                'streamerMode.noPeeking',
                'No Peeking!',
                tab.group.viewColumn,
                {
                    localResourceRoots: [mediaPath],
                    enableScripts: true,
                }
            );
            panel.iconPath = vscode.Uri.joinPath(mediaPath, 'barricade.svg');

            panel.webview.html = noPeekingPanelContext(
                this.extensionContext,
                panel.webview,
                mediaPath,
                faultyUri ?? vscode.Uri.from({ scheme: '' })
            );
        }
        await vscode.window.tabGroups.close(tab);
    }

    private async isFaultyTab(tab: vscode.Tab) {
        for (const key in <{ [k: string]: any }>tab.input) {
            const prop = (<{ [k: string]: any }>tab.input)[key];
            if (!(prop instanceof vscode.Uri)) continue;
            for (const flaggedDirent of this.flaggedDirents)
                if (await DirentAccess.isChildOf(flaggedDirent, prop)) return prop;
        }

        return false;
    }

    public async updateTabs(flaggedDirents: vscode.Uri[]) {
        this._disposable.dispose();
        this.flaggedDirents = flaggedDirents;

        for (const tabGroup of vscode.window.tabGroups.all)
            for (const tab of tabGroup.tabs) if (await this.isFaultyTab(tab)) this.closeTab(tab);

        this._disposable = vscode.window.tabGroups.onDidChangeTabs(async (tabEvent) => {
            const { opened: openedTabs, changed: changedTabs } = tabEvent;

            for (const openedTab of openedTabs)
                if (await this.isFaultyTab(openedTab)) this.closeTab(openedTab, await this.isFaultyTab(openedTab));
            for (const changedTab of changedTabs)
                if (await this.isFaultyTab(changedTab)) this.closeTab(changedTab, await this.isFaultyTab(changedTab));
        });
    }

    public get disposable() {
        return this._disposable;
    }
}
