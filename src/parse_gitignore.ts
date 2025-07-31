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
            console.log('pattern', pattern);
            const relativePattern = new vscode.RelativePattern(parentUri, pattern);
            ignoredFiles.push(...(await vscode.workspace.findFiles(relativePattern)));
        }
    }
    return ignoredFiles;
}
