import * as vscode from 'vscode';
import { SecretFileDecorationProvider } from './file_decorator';
import { TabManager } from './tab_manager';

const hiddenFiles: vscode.Uri[] = [];
const secretFileDecorationProvider = new SecretFileDecorationProvider(hiddenFiles);
const secretFileDecorationDisposable = vscode.window.registerFileDecorationProvider(secretFileDecorationProvider);
const tabManager = new TabManager();

function toggleFileVisibility(file: vscode.Uri, _: vscode.Uri[]) {
    const hiddenFilePaths = hiddenFiles.map((uri) => uri.path);
    if (hiddenFilePaths.includes(file.path)) hiddenFiles.splice(hiddenFilePaths.indexOf(file.path), 1);
    else hiddenFiles.push(file);

    // vscode.window.showInformationMessage('hides:', hiddenFiles.toString());

    secretFileDecorationProvider.updateFileDecorations([file]);
    tabManager.updateTabs(hiddenFiles);
}

const toggleFileVisibilityDisposable = vscode.commands.registerCommand('streamer-mode.toggle', toggleFileVisibility);

export async function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Streamer Mode Active!');

    context.subscriptions.push(secretFileDecorationDisposable);
    context.subscriptions.push(toggleFileVisibilityDisposable);
}

export async function deactivate() {}
