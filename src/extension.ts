import * as vscode from 'vscode';
import { SecretDirentDecorationProvider } from './dirent_decorator';
import { TabManager } from './tab_manager';

const hiddenDirents: vscode.Uri[] = [];
const secretDirentDecorationProvider = new SecretDirentDecorationProvider(hiddenDirents);

let tabManager: TabManager;

function toggleDirentVisibility(dirent: vscode.Uri, _: vscode.Uri[]) {
    const hiddenDirentPaths = hiddenDirents.map((uri) => uri.path);
    if (hiddenDirentPaths.includes(dirent.path)) hiddenDirents.splice(hiddenDirentPaths.indexOf(dirent.path), 1);
    else hiddenDirents.push(dirent);

    secretDirentDecorationProvider.updateDirentDecorations([dirent]);
    tabManager?.updateTabs(hiddenDirents);
}

let secretDirentDecorationDisposable: vscode.Disposable;
let toggleDirentVisibilityDisposable: vscode.Disposable;
let isSteamerMode = false;

function enableStreamerMode() {
    if (isSteamerMode) return;
    isSteamerMode = true;
    secretDirentDecorationDisposable = vscode.window.registerFileDecorationProvider(secretDirentDecorationProvider);
    toggleDirentVisibilityDisposable = vscode.commands.registerCommand('streamerMode.toggle', toggleDirentVisibility);
    vscode.commands.executeCommand('setContext', 'streamerMode.enabled', true);
}

function disableStreamerMode() {
    if (!isSteamerMode) return;
    isSteamerMode = false;
    secretDirentDecorationDisposable.dispose();
    tabManager?.disposable.dispose();
    toggleDirentVisibilityDisposable.dispose();
    vscode.commands.executeCommand('setContext', 'streamerMode.enabled', false);
}

const streamModeConfig: { [k: string]: any } = new Proxy(
    {},
    {
        has(_, prop) {
            return vscode.workspace.getConfiguration('streamerMode').has(<string>prop);
        },
        get(_, prop) {
            return vscode.workspace.getConfiguration('streamerMode').get(<string>prop);
        },
    }
);

export async function activate(context: vscode.ExtensionContext) {
    tabManager = new TabManager(context, streamModeConfig);

    vscode.window.showInformationMessage('Streamer Mode Active!');
    if (streamModeConfig.enableStreamerMode) enableStreamerMode();
    else disableStreamerMode();

    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('streamerMode'))
            if (streamModeConfig.enableStreamerMode) enableStreamerMode();
            else disableStreamerMode();
    });

    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.enable', enableStreamerMode));
    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.disable', disableStreamerMode));
}

export async function deactivate() {}
