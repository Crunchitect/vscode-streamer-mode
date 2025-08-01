import * as assert from 'assert';
import * as vscode from 'vscode';
import { DirentAccess } from '../dirents/dirent_fs';

suite('DirentAccess', () => {
    vscode.window.showInformationMessage('DirentAccess test');

    test('DirentAccess.getChildDirents: Get Child of File', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders![0].uri;
        const fileUri = vscode.Uri.joinPath(workspaceFolder, 'a.txt');
        const result = await DirentAccess.getChildDirents(fileUri);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].path, fileUri.path);
    });

    test('DirentAccess.getChildDirents: Get Child of Folder', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders![0].uri;
        const fileUri = vscode.Uri.joinPath(workspaceFolder, 'folder');
        const result = await DirentAccess.getChildDirents(fileUri);

        vscode.window.showInformationMessage(result.toString());
        assert.strictEqual(result.length, 8);
    });

    test('DirentAccess.getChildDirents: Get Child of Nested Folder', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders![0].uri;
        const fileUri = vscode.Uri.joinPath(workspaceFolder, 'folder/nested_folder');
        const result = await DirentAccess.getChildDirents(fileUri);

        vscode.window.showInformationMessage(result.toString());
        assert.strictEqual(result.length, 4);
    });
});

suite('TabManager', () => {
    vscode.window.showInformationMessage('TabManager test');

    test('TabManager.isFaultyTab', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders![0].uri;

        const fileUri = vscode.Uri.joinPath(workspaceFolder, 'a.txt');
        vscode.commands.executeCommand('streamerMode.toggle', fileUri);
        await vscode.workspace.openTextDocument(fileUri);

        const amountOfTabs = vscode.window.tabGroups.activeTabGroup.tabs.length;
        assert.strictEqual(amountOfTabs, 0);

        const unRelatedFileUri = vscode.Uri.joinPath(workspaceFolder, 'a.py');
        await vscode.workspace.openTextDocument(unRelatedFileUri);

        const amountOfTabs2 = vscode.window.tabGroups.activeTabGroup.tabs.length;
        assert.strictEqual(amountOfTabs2, 1);

        vscode.commands.executeCommand('streamerMode.toggle', fileUri);
        await vscode.workspace.openTextDocument(fileUri);

        const amountOfTabs3 = vscode.window.tabGroups.activeTabGroup.tabs.length;
        assert.strictEqual(amountOfTabs3, 2);
    });
});
