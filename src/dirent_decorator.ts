import * as vscode from 'vscode';
import { DirentAccess } from './dirents/dirent_fs';
import { streamerModeConfig } from './config';
import { getAllGitIgnoredFiles } from './parse_gitignore';

export class SecretDirentDecorationProvider implements vscode.FileDecorationProvider {
    hiddenDirentsReference: vscode.Uri[] = [];

    private _onDidChangeDirentDecorations = new vscode.EventEmitter<vscode.Uri[]>();
    public readonly onDidChangeFileDecorations = this._onDidChangeDirentDecorations.event;
    private gitIgnoredFiles: string[] = [];

    constructor(hiddenDirentsReference: vscode.Uri[]) {
        this.hiddenDirentsReference = hiddenDirentsReference;
    }

    public async updateGitIgnoredFiles() {
        this.gitIgnoredFiles = (await getAllGitIgnoredFiles()).map((uri) => uri.path);
    }

    private async _provideFileDecoration(uri: vscode.Uri): Promise<vscode.FileDecoration> {
        for (const hiddenDirent of this.hiddenDirentsReference)
            if (await DirentAccess.isSame(hiddenDirent, uri))
                return {
                    badge: 'X',
                    tooltip: 'No spoofing!',
                    color: new vscode.ThemeColor('disabledForeground'),
                };
        for (const hiddenDirent of this.hiddenDirentsReference)
            if (await DirentAccess.isChildOf(hiddenDirent, uri))
                return {
                    badge: 'x',
                    tooltip: 'No spoofing!',
                    color: new vscode.ThemeColor('disabledForeground'),
                };
        if (streamerModeConfig.hideGitIgnoredFiles && this.gitIgnoredFiles.includes(uri.path))
            return {
                badge: 'GX',
                tooltip: 'Git Ignored!',
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
