# RadTerm Privacy Policy

_Last updated: 2026-04-27_

RadTerm is a Chrome extension that replaces the new tab page with a customizable retro terminal interface. This document explains what data the extension touches.

## Data we collect

**None.** RadTerm does not collect, transmit, or share any personal data, usage analytics, telemetry, or browsing information. There is no account system, no remote backend, and no analytics SDK.

## Data stored locally on your device

The following are stored in your browser via `chrome.storage.local` and never leave your device:

- Your customized hero title, header banner, status bars, search prompt, and other branding text
- Your selected phosphor color scheme (green, amber, blue, red, or white)
- Your shortcut tiles, when you add or remove sites manually

This data persists across browser sessions and is removed when you uninstall the extension.

## Permissions used

- `storage` — to save your customizations between sessions
- `topSites` — to populate the shortcut grid with your most-visited sites by default

The `topSites` data is read locally only. It is never transmitted off your device.

## Third-party requests

The favicon images shown on shortcut tiles are loaded from Google's public favicon service (`google.com/s2/favicons`). When a shortcut tile renders, your browser sends the destination hostname to that service so it can return the icon. RadTerm does not control or influence this beyond choosing the favicon source. If a favicon fails to load, the tile falls back to a letter glyph and no further request is made.

This is the only outbound network request the extension causes.

## Changes to this policy

Updates will be published at this URL with a revised date. Material changes will be reflected in the extension's release notes on the Chrome Web Store.

## Contact

For questions or to report issues, open an issue at https://github.com/nikoewe/pip-boy-chrome/issues
