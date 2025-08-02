<div style="text-align: center;">
    <img src='readme-assets/streamer-mode-icon.png' />
    <p><i>Say cheese, cheese, cheese!</i></p>
    <h1>Streamer Mode</h1>
</div>

Disable opening files to ***not*** let viewers see your *`.env`s*!

## How do I use this?

Right click and you'll see the `Streamer Mode: Toggle Visibility` option.

![Hide](/readme-assets/Hide1.png)

After clicking, all tabs opening the file will close- the active tab will change into the `No Peeking!` panel.

This is indicated by the `X` mark next to the file.
![No Peeking](/readme-assets/Hide2.png)

It will automatically hide `.gitignore`d files! Here's are the additional marks next to the file/folder.

![Decorations](/readme-assets/Decorations.png)

## Settings

### Enable Streamer Mode: `streamerMode.enableStreamerMode`

Self explanatory, I hope.

### Show Blocking Panel: `streamerMode.showBlockingPanel`

Show the `No Peeking!` panel.

***WARNING***: The panel only shows up for tabs opened *after* it is hidden, if the tab is active (It's just a `tab.isActive` check in the code). Super hacky, Beware!

### Blocking Panel: `streamerMode.blockingPanel`

The settings of the `No Peeking!` panel.

![Blocking Panel](/readme-assets/BlockingPanel.png)

There's also *optionally* a `Show Anyway` option!

![Blocking Panel Buttons](/readme-assets/BlockingPanelButtons.png)

## Commands

### Enable Streamer Mode: `streamerMode.enable`

Changing the `streamerMode.enableStreamerMode` setting will also call this command.

### Disable Streamer Mode: `streamerMode.disable`

Changing the `streamerMode.enableStreamerMode` setting will also call this command.

### Clear Streamer Mode Data: `streamerMode.clearData`

The files/folders hidden in persist in each workspace (it stores an array of paths in `workspaceState`). This will clear all the data (basically just `state.hiddenFiles = []`).

That's it! Thanks!
~ crunchi
