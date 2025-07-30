import * as vscode from 'vscode';

export class DirentAccess {
    public static async getChildDirents(dirent: vscode.Uri, recursive = true) {
        const direntStats = await vscode.workspace.fs.stat(dirent);
        if (direntStats.type === vscode.FileType.Unknown) return [];
        if (direntStats.type & vscode.FileType.File) return [dirent];

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(dirent);
        let includePattern: vscode.GlobPattern;

        if (workspaceFolder) {
            const relativePath = vscode.workspace.asRelativePath(dirent, false);
            includePattern = new vscode.RelativePattern(workspaceFolder, `${relativePath}/**/*`);
        } else includePattern = `${dirent.path}/**/*`;

        const subDirents = await vscode.workspace.findFiles(includePattern);
        const result = [dirent, ...subDirents];
        if (recursive) for (const subDirent of subDirents) result.push(...(await this.getChildDirents(subDirent)));
        return result;
    }

    public static isChildOf(potentialParent: vscode.Uri, potentialChild: vscode.Uri) {
        // TODO: make less janky
        return potentialChild.path.startsWith(potentialParent.path);
    }
}
