import * as vscode from 'vscode';
const html = String.raw;

const streamModeConfig: { [k: string]: any } = new Proxy(
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

export default function (
    ctx: vscode.ExtensionContext,
    webview: vscode.Webview,
    mediaPath: vscode.Uri,
    uri: vscode.Uri
) {
    const barrierFileOnDisk = vscode.Uri.joinPath(mediaPath, 'barricade.svg');
    const barrierUri = webview.asWebviewUri(barrierFileOnDisk);

    return html`
        <!DOCTYPE html>
        <html lang="en" style="width: 100%; height: 100%;">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>No Peeking!</title>
            </head>
            <body style="width: 100%; height: 100%;">
                <div
                    style="width: 100%; height: 100%; display: flex; flex-flow: column wrap; align-items: center; justify-content: center;"
                >
                    <img src="${barrierUri}" style="width: 15%" />
                    <h1>${streamModeConfig.blockingPanel.title}</h1>
                    <p>
                        ${streamModeConfig.blockingPanel.subtitle
                            .replace('{filename}', uri.path.split('/').at(-1))
                            .replace('{fullPath}', uri.path)}
                    </p>
                </div>
            </body>
        </html>
    `;
}
