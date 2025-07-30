import * as vscode from 'vscode';
import * as os from 'os';

const hideEntirelyPaths = new Proxy([] as string[], {
    set(target, p, newValue, receiver) {
        Reflect.set(target, p, newValue, receiver);
        if (os.platform() === 'win32') {
            vscode.commands.executeCommand(
                'setContext',
                'shadow-mode.hideEntirelyPaths',
                target.map((path) => path.replaceAll('/', '\\'))
            );
        } else vscode.commands.executeCommand('setContext', 'shadow-mode.hideEntirelyPaths', target);
        vscode.window.showInformationMessage(target.toString());
        return true;
    },
});

class SecretsFileDecorationProvider implements vscode.FileDecorationProvider {
    private fileChangeEvent = new vscode.EventEmitter<vscode.Uri[]>();
    readonly onDidChangeFileDecorations = this.fileChangeEvent.event;

    async provideFileDecoration(uri: vscode.Uri, token?: vscode.CancellationToken) {
        if (!hideEntirelyPaths.includes(uri.path)) return undefined;
        return {
            badge: 'X',
            tooltip: 'No spoofing!',
            color: new vscode.ThemeColor('disabledForeground'),
        } as vscode.FileDecoration;
    }

    async changeStatusFile(uris: string[]) {
        this.fileChangeEvent.fire(uris.map((path) => vscode.Uri.file(path)));
    }
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Streamer Mode Active!');

    const secretsFillHintProvider = new SecretsFileDecorationProvider();
    const secretsFillHintDisposable = vscode.window.registerFileDecorationProvider(secretsFillHintProvider);
    context.subscriptions.push(secretsFillHintDisposable);

    vscode.commands.registerCommand('streamerMode.shadow-hide', async (...args) => {
        if (args.length !== 2) return 'No file selected!';
        const [selectedPath, _] = args as vscode.Uri[];
        hideEntirelyPaths.push(selectedPath.path);
        await secretsFillHintProvider.changeStatusFile(hideEntirelyPaths);
    });

    vscode.commands.registerCommand('streamerMode.shadow-show', async (...args) => {
        if (args.length !== 2) return 'No file selected!';
        const [selectedPath, _] = args as vscode.Uri[];
        hideEntirelyPaths.splice(hideEntirelyPaths.indexOf(selectedPath.path), 1);
        await secretsFillHintProvider.changeStatusFile(hideEntirelyPaths);
    });
}
