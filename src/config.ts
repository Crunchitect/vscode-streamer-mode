import * as vscode from 'vscode';

export const streamerModeConfig: { [k: string]: any } = new Proxy(
    {},
    {
        has(_, prop) {
            return vscode.workspace.getConfiguration('streamerMode').has(<string>prop);
        },
        get(_, prop) {
            return vscode.workspace.getConfiguration('streamerMode').get(<string>prop);
        },
    }
);
