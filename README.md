# Pip-Boy 3000 + RadTerm for Chrome

A retro CRT terminal new tab page with a matching browser theme. Two pieces:

1. **`pipboy-theme/`** — Pip-Boy 3000 Chrome theme. Tints the browser chrome (tabs, toolbar, frame, address bar) with phosphor green.
2. **`radterm/`** — RadTerm new tab override extension. Replaces Chrome's new tab page with a customizable CRT terminal featuring search, shortcut tiles, a live clock, and status bars.

You can install either on its own, but both together gives you the full experience.

---

## Installation

Chrome requires developer mode to load unpacked extensions.

1. **Unzip** the package somewhere permanent (e.g. `~/ChromeExtensions/`). Don't delete the folders after — Chrome reads from where they live.
2. Open `chrome://extensions`
3. Toggle **Developer mode** on (top-right)
4. Click **Load unpacked** and select the `pipboy-theme` folder — click **Keep** when prompted.
5. Click **Load unpacked** again and select the `radterm` folder.

Open a new tab. You're in.

---

## Using the new tab page

- **Search**: type and press Enter. Looks like a URL? It navigates directly. Otherwise it searches Google (or your default search engine if Chrome's `chrome.search` API is available).
- **Shortcuts**: click any tile to navigate. Favicons auto-load, tinted to match your color scheme.
- **Add a shortcut**: click the dashed **+ ADD NEW** tile, enter a name and URL.
- **Remove a shortcut**: click **EDIT** in the shortcuts header, then the × on any tile. Click **DONE** when finished.
- **Customize branding**: three ways to access the settings:
  1. Click **CONFIG** in the top status bar of the new tab (thematic, quickest)
  2. Go to `chrome://extensions`, find RadTerm, click **Details** → **Extension options**
  3. Right-click the extension icon in Chrome's toolbar → **Options**

  You can change every piece of visible text — hero title, subtitle, header banner, status lines, search prompt — plus the phosphor color (green, amber, blue, red, or mono white). Changes save locally and propagate to any open new tabs instantly.

All shortcuts and customizations persist via `chrome.storage.local`, so they survive restarts.

---

## Customizing beyond the Config panel

**Status lines support two shorthand tags:**
- `<b>text</b>` — bright/highlight color (e.g. `STATUS: <b>ONLINE</b>`)
- `<bar>████░░</bar>` — rendered as a solid bar for HP/AP style meters

All other HTML is escaped for safety.

**Change default shortcuts**: edit `HARDCODED_FALLBACK_SHORTCUTS` at the top of `radterm/newtab.js`.

**Change default brand text**: edit `DEFAULT_BRANDS` at the top of `radterm/config-shared.js`. These are what the CONFIG panel's **RESET DEFAULTS** button restores to.

**Change theme colors**: edit `pipboy-theme/manifest.json` — the `colors` block uses `[R, G, B]` values 0–255.

**Add a new phosphor color scheme**: in `radterm/newtab.css`, copy one of the `:root[data-scheme="..."]` blocks, change the phosphor values, and add it to the `<select>` in `newtab.html` and the favicon hue table at the bottom of the CSS.

---

## Uninstalling

- **Theme**: `chrome://settings/appearance` → **Reset to default**.
- **New tab**: `chrome://extensions` → find "RadTerm" → **Remove**.
