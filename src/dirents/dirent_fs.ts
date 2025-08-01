import * as vscode from 'vscode';

export class DirentAccess {
    public static async getChildDirents(dirent: vscode.Uri, recursive = true) {
        const direntStats = await vscode.workspace.fs.stat(dirent);
        if (direntStats.type === vscode.FileType.Unknown) return [];
        if (direntStats.type & vscode.FileType.File) return [dirent];
        const subPaths = await vscode.workspace.fs.readDirectory(dirent);
        const subDirents = subPaths.map(([subpath, _]) => vscode.Uri.joinPath(dirent, subpath));
        const result = [dirent, ...subDirents];
        const subFolders: vscode.Uri[] = [];
        for (const subdirent of subDirents) {
            const stats = await vscode.workspace.fs.stat(subdirent);
            if (stats.type === vscode.FileType.Directory) subFolders.push(subdirent);
        }
        if (recursive) for (const subFolder of subFolders) result.push(...(await this.getChildDirents(subFolder)));
        return result;
    }

    public static async isChildOf(potentialParent: vscode.Uri, potentialChild: vscode.Uri) {
        // TODO: make less janky
        return (
            potentialChild.path.startsWith(`${potentialParent.path}/`) || potentialParent.path === potentialChild.path
        );
    }

    public static async isSame(a: vscode.Uri, b: vscode.Uri) {
        return a.path === b.path;
    }
}
