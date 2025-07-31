import * as vscode from 'vscode';
import { SecretDirentDecorationProvider } from './dirent_decorator';
import { TabManager } from './tab_manager';
import { streamerModeConfig } from './config';
import { getAllGitIgnoredFiles } from './parse_gitignore';

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

async function enableStreamerMode() {
    await secretDirentDecorationProvider.updateGitIgnoredFiles();
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

async function hideGitIgnoredFiles() {
    const gitIgnoredFiles = await getAllGitIgnoredFiles();
    await secretDirentDecorationProvider.updateGitIgnoredFiles();
    secretDirentDecorationProvider.updateDirentDecorations(gitIgnoredFiles);
    tabManager.updateTabs([...hiddenDirents, ...gitIgnoredFiles]);
}

async function showGitIgnoredFiles() {
    const gitIgnoredFiles = await getAllGitIgnoredFiles();
    await secretDirentDecorationProvider.updateGitIgnoredFiles();
    secretDirentDecorationProvider.updateDirentDecorations(gitIgnoredFiles);
    tabManager.updateTabs(hiddenDirents);
}

export async function activate(context: vscode.ExtensionContext) {
    tabManager = new TabManager(context);
    await secretDirentDecorationProvider.updateGitIgnoredFiles();

    vscode.window.showInformationMessage('Streamer Mode Active!');
    if (streamerModeConfig.enableStreamerMode) enableStreamerMode();
    else disableStreamerMode();

    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('streamerMode')) {
            if (streamerModeConfig.enableStreamerMode) enableStreamerMode();
            else disableStreamerMode();
            if (streamerModeConfig.hideGitIgnoredFiles) hideGitIgnoredFiles();
            else showGitIgnoredFiles();
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.enable', enableStreamerMode));
    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.disable', disableStreamerMode));
}

export async function deactivate() {}
