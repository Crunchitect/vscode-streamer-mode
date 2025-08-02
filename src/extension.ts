import * as vscode from 'vscode';
import { SecretDirentDecorationProvider } from './dirent_decorator';
import { TabManager } from './tab_manager';
import { streamerModeConfig } from './config';
import { getAllGitIgnoredFiles, getAllStreamerIgnoredFiles } from './parse_gitignore';
import find from 'find-process';

const hiddenDirents: vscode.Uri[] = [];
const secretDirentDecorationProvider = new SecretDirentDecorationProvider(hiddenDirents);

let tabManager: TabManager;
let workspaceState: vscode.Memento;

function toggleDirentVisibility(dirent: vscode.Uri, _: vscode.Uri[]) {
    const hiddenDirentPaths = hiddenDirents.map((uri) => uri.path);
    if (hiddenDirentPaths.includes(dirent.path)) hiddenDirents.splice(hiddenDirentPaths.indexOf(dirent.path), 1);
    else hiddenDirents.push(dirent);

    secretDirentDecorationProvider.updateDirentDecorations([dirent]);
    tabManager?.updateTabs(hiddenDirents);
    workspaceState?.update(
        'streamerMode.hiddenDirents',
        hiddenDirents.map((uri) => uri.path)
    );
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

async function hideStreamerIgnoredFiles() {
    const streamerIgnoredFiles = await getAllStreamerIgnoredFiles();
    await secretDirentDecorationProvider.updateGitIgnoredFiles();
    secretDirentDecorationProvider.updateDirentDecorations(streamerIgnoredFiles);
    tabManager.updateTabs([...hiddenDirents, ...streamerIgnoredFiles]);
}

async function showStreamerIgnoredFiles() {
    const streamerIgnoredFiles = await getAllStreamerIgnoredFiles();
    await secretDirentDecorationProvider.updateGitIgnoredFiles();
    secretDirentDecorationProvider.updateDirentDecorations(streamerIgnoredFiles);
    tabManager.updateTabs(hiddenDirents);
}

function clearStreamerData() {
    workspaceState?.update('streamerMode.hiddenDirents', []);
}

const lastOpenedProcesses: string[] = [];
async function monitoringFunc() {
    const processNames = ['obs32', 'obs64', 'obs', 'xsplit.core'];
    for (const processName of processNames)
        await find('name', processName).then((process) => {
            if (!process.length) {
                if (lastOpenedProcesses.indexOf(processName) !== -1)
                    lastOpenedProcesses.splice(lastOpenedProcesses.indexOf(processName), 1);
                return;
            }
            if (lastOpenedProcesses.includes(processName)) return;
            lastOpenedProcesses.push(processName);
            enableStreamerMode();
        });
}

export async function activate(context: vscode.ExtensionContext) {
    const monitoring = setInterval(monitoringFunc, 3000);
    workspaceState = context.workspaceState;
    if (workspaceState.get('streamerMode.hiddenDirents')) {
        const importedHiddenDirents = <string[]>workspaceState.get('streamerMode.hiddenDirents');
        hiddenDirents.push(...importedHiddenDirents.map((path) => vscode.Uri.file(path)));
    }

    tabManager = new TabManager(context);
    if (streamerModeConfig.enableStreamerMode)
        if (streamerModeConfig.hideGitIgnoredFiles)
            tabManager?.updateTabs([...hiddenDirents, ...(await getAllGitIgnoredFiles())]);
        else tabManager?.updateTabs(hiddenDirents);
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
            if (streamerModeConfig.hideStreamerIgnoredFiles) hideStreamerIgnoredFiles();
            else showStreamerIgnoredFiles();
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.enable', enableStreamerMode));
    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.disable', disableStreamerMode));
    context.subscriptions.push(vscode.commands.registerCommand('streamerMode.clearData', clearStreamerData));
}

export async function deactivate() {}
