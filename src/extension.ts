import * as vscode from 'vscode';
import { SecretDirentDecorationProvider } from './dirent_decorator';
import { TabManager } from './tab_manager';

const hiddenDirents: vscode.Uri[] = [];
const secretDirentDecorationProvider = new SecretDirentDecorationProvider(hiddenDirents);
const secretDirentDecorationDisposable = vscode.window.registerFileDecorationProvider(secretDirentDecorationProvider);

const tabManager = new TabManager();
const tabManagerDisposable = tabManager.disposable;

function toggleDirentVisibility(dirent: vscode.Uri, _: vscode.Uri[]) {
    const hiddenDirentPaths = hiddenDirents.map((uri) => uri.path);
    if (hiddenDirentPaths.includes(dirent.path)) hiddenDirents.splice(hiddenDirentPaths.indexOf(dirent.path), 1);
    else hiddenDirents.push(dirent);

    // vscode.window.showInformationMessage('hides:', hiddenFiles.toString());

    secretDirentDecorationProvider.updateDirentDecorations([dirent]);
    tabManager.updateTabs(hiddenDirents);
}

const toggleDirentVisibilityDisposable = vscode.commands.registerCommand(
    'streamer-mode.toggle',
    toggleDirentVisibility
);

export async function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Streamer Mode Active!');

    context.subscriptions.push(secretDirentDecorationDisposable);
    context.subscriptions.push(toggleDirentVisibilityDisposable);
    context.subscriptions.push(tabManagerDisposable);
}

export async function deactivate() {}
