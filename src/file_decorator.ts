import * as vscode from 'vscode';

export class SecretFileDecorationProvider implements vscode.FileDecorationProvider {
    hiddenFilesReference: vscode.Uri[] = [];

    private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri[]>();
    public readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

    constructor(hiddenFileReference: vscode.Uri[]) {
        this.hiddenFilesReference = hiddenFileReference;
    }

    private _provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration {
        const hiddenFilePaths = this.hiddenFilesReference.map((uri) => uri.path);
        if (!hiddenFilePaths.includes(uri.path)) return {};
        return {
            badge: 'X',
            tooltip: 'No spoofing!',
            color: new vscode.ThemeColor('disabledForeground'),
        };
    }

    public async provideFileDecoration(uri: vscode.Uri, token: vscode.CancellationToken) {
        const cancelPromise = new Promise((res, _) => token.onCancellationRequested(() => res({})));
        const providePromise = Promise.resolve(this._provideFileDecoration(uri));

        return Promise.any([cancelPromise, providePromise]) as Promise<vscode.FileDecoration>;
    }

    public updateFileDecorations(files: vscode.Uri[]) {
        this._onDidChangeFileDecorations.fire(files);
    }
}
