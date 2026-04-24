/* Shared config module — used by newtab.js, options.js, and the inline head preload.
   Must be loaded BEFORE the page-specific script. Exposes window.RadTermConfig.

   NOTE: This module dual-writes brand settings to both chrome.storage.local (source
   of truth, cross-tab synced) AND window.localStorage (synchronous fast-path cache
   for FOUC prevention on page load). Reads prefer chrome.storage when available. */
(function (global) {
  "use strict";

  const DEFAULT_BRANDS = {
    heroTitle:         "RADTERM",
    heroSubtitle:      "— SYSTEM READY —",
    headerBanner:      "RADTERM LINK // OS V7.1.0.8",
    tabTitle:          "RADTERM OS V7.1.0.8",
    shortcutsLabel:    "[ BOOKMARKED FREQUENCIES ]",
    searchPrompt:      "> QUERY:",
    searchPlaceholder: "ENTER SEARCH TERM...",
    statusLine1:       "STATUS: <b>ONLINE</b>",
    statusLine2:       "RAD: 000 RAD/S",
    statusLine3:       "HP: <bar>██████████</bar> 100/100",
    statusLine4:       "AP: <bar>████████░░</bar> 85/85",
    colorScheme:       "green",
  };

  const STORAGE_KEY_BRANDS = "radterm_brands";
  const CACHE_KEY = "radterm_brands_cache_v1";

  /* ---------- synchronous cache (FOUC prevention) ---------- */

  function readCacheSync() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function writeCacheSync(brands) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(brands));
    } catch (e) { /* ignore quota/availability issues */ }
  }

  /** Returns best-guess brands immediately (synchronous). Used before first paint. */
  function loadBrandsFast() {
    const cached = readCacheSync();
    return { ...DEFAULT_BRANDS, ...(cached || {}) };
  }

  /* ---------- async canonical storage ---------- */

  async function storageGet(key, fallback) {
    try {
      if (global.chrome?.storage?.local) {
        const data = await global.chrome.storage.local.get(key);
        return data[key] ?? fallback;
      }
    } catch (e) { /* fall through */ }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  async function storageSet(key, value) {
    try {
      if (global.chrome?.storage?.local) {
        await global.chrome.storage.local.set({ [key]: value });
        return;
      }
    } catch (e) { /* fall through */ }
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  async function loadBrands() {
    const stored = await storageGet(STORAGE_KEY_BRANDS, {});
    const merged = { ...DEFAULT_BRANDS, ...(stored || {}) };
    writeCacheSync(merged); // keep cache warm
    return merged;
  }

  async function saveBrands(brands) {
    writeCacheSync(brands); // update sync cache first — next page load is instant
    await storageSet(STORAGE_KEY_BRANDS, brands);
  }

  async function resetBrands() {
    const fresh = { ...DEFAULT_BRANDS };
    writeCacheSync(fresh);
    await storageSet(STORAGE_KEY_BRANDS, fresh);
    return fresh;
  }

  function onBrandsChanged(callback) {
    try {
      if (global.chrome?.storage?.onChanged) {
        global.chrome.storage.onChanged.addListener((changes, area) => {
          if (area === "local" && changes[STORAGE_KEY_BRANDS]) {
            const next = changes[STORAGE_KEY_BRANDS].newValue || { ...DEFAULT_BRANDS };
            writeCacheSync(next);
            callback(next);
          }
        });
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------- pre-paint apply helper ----------
     Called from an inline <head> script BEFORE the body renders.
     Applies the color scheme and document.title synchronously so
     there's no flash of the default theme. */
  function preApplyBrands() {
    const brands = loadBrandsFast();
    if (brands.colorScheme) {
      document.documentElement.setAttribute("data-scheme", brands.colorScheme);
    }
    if (brands.tabTitle) {
      // document.title may not have its element yet at head parse time,
      // but setting it on document works regardless.
      try { document.title = brands.tabTitle; } catch (e) {}
    }
  }

  global.RadTermConfig = {
    DEFAULT_BRANDS,
    STORAGE_KEY_BRANDS,
    storageGet,
    storageSet,
    loadBrands,
    loadBrandsFast,
    saveBrands,
    resetBrands,
    onBrandsChanged,
    preApplyBrands,
  };
})(typeof window !== "undefined" ? window : globalThis);
