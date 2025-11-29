# CHANGELOG

## v1.1.1 CHANGELOG

- Fixed the bugs of treating newlines as wildcards in .gitignore and .streamerignore

## v1.1.0 CHANGELOG

Added an Open Anyway... option in the blockingPanel webview with 3 options:
streamerMode.blockingPanel.allowOpenAnyway: A boolean that enable/disables the buttons
streamerMode.blockingPanel.buttons:
2.1. streamerMode.blockingPanel.buttons.openAnywayText: A string for the HTML in the Open Anyway... button.
2.2. streamerMode.blockingPanel.buttons.closeText: A string for the HTML in the Close button.
Added .streamerignore files, same syntax as .gitignore- just only for the extension to ignore and not git. (Code was copy-pasted)
