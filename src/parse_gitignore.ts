import * as vscode from 'vscode';

export async function getAllGitIgnoredFiles() {
    const gitIgnoreFiles = await vscode.workspace.findFiles('**/.gitignore');
    const textDecoder = new TextDecoder();

    const ignoredFiles: vscode.Uri[] = [];
    for (const gitIgnoreFile of gitIgnoreFiles) {
        const parentPath = gitIgnoreFile.path.replace('.gitignore', '');
        const parentUri = vscode.Uri.file(parentPath);
        const gitIgnoreContents = await vscode.workspace.fs.readFile(gitIgnoreFile);
        const gitIgnorePatterns = textDecoder
            .decode(gitIgnoreContents)
            .split('\n')
            .filter((pattern) => !pattern.trimStart().startsWith('#'));
        for (const pattern of gitIgnorePatterns) {
            const relativePattern = new vscode.RelativePattern(parentUri, pattern);
            ignoredFiles.push(...(await vscode.workspace.findFiles(relativePattern)));
        }
    }
    return ignoredFiles;
}

export async function getAllStreamerIgnoredFiles() {
    const streamerIgnoreFiles = await vscode.workspace.findFiles('**/.streamerignore');
    const textDecoder = new TextDecoder();

    const ignoredFiles: vscode.Uri[] = [];
    for (const streamerIgnoreFile of streamerIgnoreFiles) {
        const parentPath = streamerIgnoreFile.path.replace('.streamerignore', '');
        const parentUri = vscode.Uri.file(parentPath);
        const streamerIgnoreContents = await vscode.workspace.fs.readFile(streamerIgnoreFile);
        const streamerIgnorePatterns = textDecoder
            .decode(streamerIgnoreContents)
            .split('\n')
            .filter((pattern) => !pattern.trimStart().startsWith('#'));
        for (const pattern of streamerIgnorePatterns) {
            const relativePattern = new vscode.RelativePattern(parentUri, pattern);
            ignoredFiles.push(...(await vscode.workspace.findFiles(relativePattern)));
        }
    }
    return ignoredFiles;
}
