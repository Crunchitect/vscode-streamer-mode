import * as vscode from 'vscode';
import { DirentAccess } from './dirent_fs';

export class SecretDirentDecorationProvider implements vscode.FileDecorationProvider {
    hiddenDirentsReference: vscode.Uri[] = [];

    private _onDidChangeDirentDecorations = new vscode.EventEmitter<vscode.Uri[]>();
    public readonly onDidChangeFileDecorations = this._onDidChangeDirentDecorations.event;

    constructor(hiddenDirentsReference: vscode.Uri[]) {
        this.hiddenDirentsReference = hiddenDirentsReference;
    }

    private async _provideFileDecoration(uri: vscode.Uri): Promise<vscode.FileDecoration> {
        for (const hiddenDirent of this.hiddenDirentsReference)
            if (await DirentAccess.isChildOf(hiddenDirent, uri))
                return {
                    badge: 'X',
                    tooltip: 'No spoofing!',
                    color: new vscode.ThemeColor('disabledForeground'),
                };
        return {};
    }

    public async provideFileDecoration(uri: vscode.Uri, token: vscode.CancellationToken) {
        const cancelPromise = new Promise((res, _) => token.onCancellationRequested(() => res({})));
        const providePromise = this._provideFileDecoration(uri);

        return Promise.any([cancelPromise, providePromise]) as Promise<vscode.FileDecoration>;
    }

    public async updateDirentDecorations(dirents: vscode.Uri[]) {
        for (const dirent of dirents)
            this._onDidChangeDirentDecorations.fire(await DirentAccess.getChildDirents(dirent));
    }
}
