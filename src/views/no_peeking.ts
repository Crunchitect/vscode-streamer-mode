import * as vscode from 'vscode';
import { streamerModeConfig } from '../config';
const html = String.raw;

export default function (ctx: vscode.ExtensionContext, webview: vscode.Webview, uri: vscode.Uri) {
    const codiconStyleFileOnDisk = vscode.Uri.joinPath(
        ctx.extensionUri,
        'node_modules',
        '@vscode/codicons',
        'dist',
        'codicon.css'
    );
    const codiconStyleUri = webview.asWebviewUri(codiconStyleFileOnDisk);

    return html`
        <!DOCTYPE html>
        <style>
            .button {
                all: unset;
                margin: 1rem;
                padding: 0.25rem;
                text-align: center;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                flex: 1;
                white-space: nowrap;
            }

            .button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }

            .secondary-button {
                all: unset;
                margin: 1rem;
                padding: 0.25rem;
                text-align: center;
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                flex: 1;
                white-space: nowrap;
            }

            .secondary-button:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
            }
        </style>
        <html lang="en" style="width: 100%; height: 100%;">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>No Peeking!</title>
                <link href="${codiconStyleUri}" type="text/css" rel="stylesheet" />
            </head>
            <body style="width: 100%; height: 100%;">
                <div
                    style="width: 100%; height: 100%; display: flex; flex-flow: column wrap; align-items: center; justify-content: center;"
                >
                    <span
                        class="codicon codicon-gist-secret"
                        style="font-size: 64px; color: var(--vscode-problemsWarningIcon-foreground)"
                    ></span>
                    <h1>${streamerModeConfig.blockingPanel.title}</h1>
                    <p>
                        ${streamerModeConfig.blockingPanel.subtitle
                            .replace('{filename}', uri.path.split('/').at(-1))
                            .replace('{fullPath}', uri.path)}
                    </p>

                    ${streamerModeConfig.blockingPanel.allowOpenAnyway
                        ? `<div style="display: flex; gap: 1rem; margin: 2rem;">
                            <button id="open" class="secondary-button">${streamerModeConfig.blockingPanel.buttons.openAnywayText}</button>
                            <button id="close" class="button">${streamerModeConfig.blockingPanel.buttons.closeText}</button>
                        </div>`
                        : ''}
                </div>
            </body>
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('open').addEventListener('click', () => {
                    vscode.postMessage('open');
                });
                document.getElementById('close').addEventListener('click', () => {
                    vscode.postMessage('close');
                });
            </script>
        </html>
    `;
}
