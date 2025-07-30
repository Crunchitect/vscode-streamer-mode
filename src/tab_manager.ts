import * as vscode from 'vscode';
import { DirentAccess } from './dirent_fs';

export class TabManager {
    private _disposable: vscode.Disposable = new vscode.Disposable(() => {});
    private flaggedDirents: vscode.Uri[] = [];

    public async closeTab(tab: vscode.Tab) {
        await vscode.window.tabGroups.close(tab);
    }

    private isFaultyTab(tab: vscode.Tab) {
        for (const key in <{ [k: string]: any }>tab.input) {
            const prop = (<{ [k: string]: any }>tab.input)[key];
            if (!(prop instanceof vscode.Uri)) continue;
            for (const flaggedDirent of this.flaggedDirents)
                if (DirentAccess.isChildOf(flaggedDirent, prop)) return true;
        }

        return false;
    }

    public async updateTabs(flaggedDirents: vscode.Uri[]) {
        this._disposable.dispose();
        this.flaggedDirents = flaggedDirents;

        for (const tabGroup of vscode.window.tabGroups.all)
            for (const tab of tabGroup.tabs) if (this.isFaultyTab(tab)) this.closeTab(tab);

        this._disposable = vscode.window.tabGroups.onDidChangeTabs(async (tabEvent) => {
            const { opened: openedTabs, changed: changedTabs } = tabEvent;

            for (const openedTab of openedTabs) if (this.isFaultyTab(openedTab)) this.closeTab(openedTab);
            for (const changedTab of changedTabs) if (this.isFaultyTab(changedTab)) this.closeTab(changedTab);
        });
    }

    public get disposable() {
        return this._disposable;
    }
}
