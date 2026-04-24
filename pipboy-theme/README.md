# Pip-Boy 3000 Chrome Theme

A Fallout-inspired CRT phosphor theme. ROBCO Industries (TM) TermLink Protocol.

## Installation

Chrome no longer lets you install unpacked themes via drag-and-drop, so you need developer mode:

1. **Unzip** `pipboy-theme.zip` somewhere permanent (e.g. `~/ChromeThemes/pipboy-theme`). Don't delete the folder after — Chrome reads it from there.
2. Open Chrome and go to `chrome://extensions`
3. Toggle **Developer mode** on (top-right)
4. Click **Load unpacked** and select the unzipped `pipboy-theme` folder
5. Chrome will ask to keep the theme — click **Keep**

To revert: `chrome://settings/appearance` → **Reset to default**.

## What's included

- `manifest.json` — theme definition, colors, tints
- `images/theme_frame.png` — browser chrome background
- `images/theme_toolbar.png` — toolbar strip
- `images/theme_tab_background.png` — inactive tab background
- `images/theme_ntp_background.png` — new tab page CRT terminal

## Customizing

Want a different shade of green? Edit `manifest.json` — the `colors` block uses `[R, G, B]` values 0–255. To regenerate the images, run `generate_theme.py` with your palette tweaks.

Stay out of the Glowing Sea.
