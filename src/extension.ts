import * as vscode from 'vscode';
import { SecretDirentDecorationProvider } from './dirent_decorator';
import { TabManager } from './tab_manager';

const hiddenDirents: vscode.Uri[] = [];
const secretDirentDecorationProvider = new SecretDirentDecorationProvider(hiddenDirents);

const tabManager = new TabManager();

function toggleDirentVisibility(dirent: vscode.Uri, _: vscode.Uri[]) {
    const hiddenDirentPaths = hiddenDirents.map((uri) => uri.path);
    if (hiddenDirentPaths.includes(dirent.path)) hiddenDirents.splice(hiddenDirentPaths.indexOf(dirent.path), 1);
    else hiddenDirents.push(dirent);

    secretDirentDecorationProvider.updateDirentDecorations([dirent]);
    tabManager.updateTabs(hiddenDirents);
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
    tabManager.disposable.dispose();
    toggleDirentVisibilityDisposable.dispose();
    vscode.commands.executeCommand('setContext', 'streamerMode.enabled', false);
}

const isStreamerModeConfig = () => vscode.workspace.getConfiguration('streamerMode').get('enableStreamerMode');

export async function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Streamer Mode Active!');
    if (isStreamerModeConfig()) enableStreamerMode();
    else disableStreamerMode();

    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('streamerMode')) {
            if (isStreamerModeConfig()) enableStreamerMode();
            else disableStreamerMode();
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.enable', enableStreamerMode));
    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.disable', disableStreamerMode));
}

export async function deactivate() {}
