/* RadTerm — New Tab logic */

const { DEFAULT_BRANDS, loadBrands, loadBrandsFast, saveBrands, resetBrands,
        onBrandsChanged, storageGet, storageSet } = window.RadTermConfig;

/* Fallback used only when topSites API is unavailable AND user has no stored list. */
const HARDCODED_FALLBACK_SHORTCUTS = [
  { name: "Google",   url: "https://www.google.com" },
  { name: "YouTube",  url: "https://www.youtube.com" },
  { name: "Gmail",    url: "https://mail.google.com" },
  { name: "GitHub",   url: "https://github.com" },
  { name: "Reddit",   url: "https://www.reddit.com" },
  { name: "Maps",     url: "https://maps.google.com" },
  { name: "Drive",    url: "https://drive.google.com" },
  { name: "Wiki",     url: "https://en.wikipedia.org" },
];

const STORAGE_KEY_SHORTCUTS = "radterm_shortcuts";
const MAX_TOP_SITES = 10;

/* Derive a short terminal-style label from a URL (used for topSites items). */
function shortcutLabelFromUrl(url, fallbackTitle) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const parts = host.split(".");
    const label = parts.length >= 2 ? parts[parts.length - 2] : host;
    return label.toUpperCase().slice(0, 14) || "LINK";
  } catch (e) {
    return (fallbackTitle || "LINK").slice(0, 14).toUpperCase();
  }
}

/* Fetch Chrome's most-visited sites. Returns [] if unavailable. */
async function fetchTopSites() {
  try {
    if (typeof chrome !== "undefined" && chrome?.topSites?.get) {
      const raw = await chrome.topSites.get();
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.slice(0, MAX_TOP_SITES).map(s => ({
          name: shortcutLabelFromUrl(s.url, s.title),
          url: s.url,
        }));
      }
    }
  } catch (e) {
    console.warn("topSites fetch failed:", e);
  }
  return [];
}

/* ============ BRAND / CONFIG ============ */
let brands = { ...DEFAULT_BRANDS };

/**
 * Safe lightweight template renderer:
 * - Supports <b>bold</b> and <bar>...</bar> as shorthand — nothing else.
 * - All other HTML is escaped.
 */
function renderBrandValue(raw) {
  if (raw == null) return "";
  const escape = (s) => s.replace(/&/g, "&amp;")
                         .replace(/</g, "&lt;")
                         .replace(/>/g, "&gt;");
  let s = escape(String(raw));
  s = s.replace(/&lt;b&gt;/gi, '<span class="bright">')
       .replace(/&lt;\/b&gt;/gi, '</span>')
       .replace(/&lt;bar&gt;/gi, '<span class="bar">')
       .replace(/&lt;\/bar&gt;/gi, '</span>');
  return s;
}

function applyBrands() {
  document.querySelectorAll("[data-brand]").forEach((el) => {
    const key = el.dataset.brand;
    if (brands[key] !== undefined) {
      if (el.tagName === "TITLE") {
        el.textContent = brands[key];
      } else {
        el.innerHTML = renderBrandValue(brands[key]);
      }
    }
  });
  document.querySelectorAll("[data-brand-attr]").forEach((el) => {
    const spec = el.dataset.brandAttr;
    const [key, attr] = spec.split(":");
    if (brands[key] !== undefined && attr) {
      el.setAttribute(attr, String(brands[key]));
    }
  });
  if (brands.tabTitle) document.title = brands.tabTitle;
  applyColorScheme(brands.colorScheme || "green");
}

function applyColorScheme(name) {
  document.documentElement.setAttribute("data-scheme", name);
}

/* React to changes made from the options page */
onBrandsChanged((next) => {
  brands = { ...DEFAULT_BRANDS, ...(next || {}) };
  applyBrands();
});

/* ============ SHORTCUTS ============ */
let shortcuts = [];
let editMode = false;
const grid = document.getElementById("shortcuts");

async function loadShortcuts() {
  // 1. User's custom list (once they've added/removed anything)
  const stored = await storageGet(STORAGE_KEY_SHORTCUTS, null);
  if (Array.isArray(stored) && stored.length > 0) {
    shortcuts = stored;
    return;
  }
  // 2. Chrome's most-visited sites
  const top = await fetchTopSites();
  if (top.length > 0) {
    shortcuts = top;
    return;
  }
  // 3. Hardcoded fallback (API unavailable, e.g. dev-preview context)
  shortcuts = HARDCODED_FALLBACK_SHORTCUTS.slice();
}
async function saveShortcuts() {
  // Any add/remove commits to a stored "user" list.
  // If it ends up empty, we remove the key so topSites takes over again.
  if (shortcuts.length === 0) {
    try {
      if (chrome?.storage?.local) {
        await chrome.storage.local.remove(STORAGE_KEY_SHORTCUTS);
      } else {
        localStorage.removeItem(STORAGE_KEY_SHORTCUTS);
      }
    } catch (e) { /* ignore */ }
    // Refresh with topSites for immediate visual feedback
    await loadShortcuts();
    return;
  }
  await storageSet(STORAGE_KEY_SHORTCUTS, shortcuts);
}

function faviconUrl(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${u.hostname}`;
  } catch {
    return "";
  }
}

function renderShortcuts() {
  grid.innerHTML = "";
  grid.classList.toggle("edit-mode", editMode);

  shortcuts.forEach((s, idx) => {
    const el = document.createElement("a");
    el.className = "shortcut";
    el.href = s.url;
    el.title = s.url;

    const iconWrap = document.createElement("div");
    iconWrap.className = "shortcut-icon";
    const img = document.createElement("img");
    img.src = faviconUrl(s.url);
    img.alt = "";
    img.onerror = () => { iconWrap.textContent = s.name.charAt(0).toUpperCase(); };
    iconWrap.appendChild(img);

    const name = document.createElement("div");
    name.className = "shortcut-name";
    name.textContent = s.name;

    const removeBtn = document.createElement("button");
    removeBtn.className = "shortcut-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      shortcuts.splice(idx, 1);
      await saveShortcuts(); // may refill with topSites if list went empty
      renderShortcuts();
    });

    el.addEventListener("click", (ev) => {
      if (editMode) ev.preventDefault();
    });

    el.appendChild(iconWrap);
    el.appendChild(name);
    el.appendChild(removeBtn);
    grid.appendChild(el);
  });

  const addTile = document.createElement("div");
  addTile.className = "shortcut add-tile";
  addTile.tabIndex = 0;
  addTile.innerHTML = `
    <div class="shortcut-icon">+</div>
    <div class="shortcut-name">ADD NEW</div>
  `;
  addTile.addEventListener("click", openAddModal);
  addTile.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") openAddModal();
  });
  grid.appendChild(addTile);
}

/* ============ ADD-SHORTCUT MODAL ============ */
const modal = document.getElementById("modal-backdrop");
const form = document.getElementById("shortcut-form");
const nameInput = document.getElementById("new-name");
const urlInput = document.getElementById("new-url");

function openAddModal() {
  nameInput.value = "";
  urlInput.value = "";
  modal.classList.remove("hidden");
  setTimeout(() => nameInput.focus(), 0);
}
function closeAddModal() {
  modal.classList.add("hidden");
  document.getElementById("search-input").focus();
}

document.getElementById("cancel-btn").addEventListener("click", closeAddModal);
modal.addEventListener("click", (ev) => {
  if (ev.target === modal) closeAddModal();
});

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  let url = urlInput.value.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const name = nameInput.value.trim().toUpperCase() || "LINK";
  shortcuts.push({ name, url });
  saveShortcuts();
  renderShortcuts();
  closeAddModal();
});

/* ============ CONFIG MODAL (in-page) ============ */
const configBackdrop = document.getElementById("config-backdrop");
const configForm = document.getElementById("config-form");
const configBtn = document.getElementById("config-btn");
const configCancelBtn = document.getElementById("config-cancel-btn");
const configResetBtn = document.getElementById("config-reset-btn");

function openConfigModal() {
  configForm.querySelectorAll("[data-config-key]").forEach((input) => {
    const key = input.dataset.configKey;
    input.value = brands[key] !== undefined ? brands[key] : "";
  });
  configBackdrop.classList.remove("hidden");
}
function closeConfigModal() {
  configBackdrop.classList.add("hidden");
}

configBtn.addEventListener("click", openConfigModal);
configCancelBtn.addEventListener("click", closeConfigModal);
configBackdrop.addEventListener("click", (ev) => {
  if (ev.target === configBackdrop) closeConfigModal();
});

configForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const updated = { ...brands };
  configForm.querySelectorAll("[data-config-key]").forEach((input) => {
    updated[input.dataset.configKey] = input.value;
  });
  brands = updated;
  await saveBrands(brands);
  applyBrands();
  closeConfigModal();
});

configResetBtn.addEventListener("click", async () => {
  if (!confirm("Reset all branding to defaults?")) return;
  brands = await resetBrands();
  applyBrands();
  closeConfigModal();
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    if (!modal.classList.contains("hidden")) closeAddModal();
    else if (!configBackdrop.classList.contains("hidden")) closeConfigModal();
  }
});

/* ============ SEARCH ============ */
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

searchForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  const isUrl = /^(https?:\/\/)/i.test(q) ||
    /^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(q);
  if (isUrl) {
    const target = /^https?:\/\//i.test(q) ? q : "https://" + q;
    window.location.href = target;
  } else {
    try {
      if (chrome?.search?.query) {
        chrome.search.query({ text: q, disposition: "CURRENT_TAB" });
        return;
      }
    } catch (e) { /* fall through */ }
    window.location.href =
      "https://www.google.com/search?q=" + encodeURIComponent(q);
  }
});

/* ============ EDIT TOGGLE ============ */
const editBtn = document.getElementById("edit-toggle");
editBtn.addEventListener("click", () => {
  editMode = !editMode;
  editBtn.classList.toggle("active", editMode);
  editBtn.textContent = editMode ? "DONE" : "EDIT";
  renderShortcuts();
});

/* ============ CLOCK & DATE ============ */
const PAD = (n) => String(n).padStart(2, "0");
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
function tick() {
  const d = new Date();
  document.getElementById("clock").textContent =
    `${PAD(d.getHours())}:${PAD(d.getMinutes())}:${PAD(d.getSeconds())}`;
  document.getElementById("date").textContent =
    `${PAD(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
tick();
setInterval(tick, 1000);

/* ============ BOOT ============ */
/* Step 1 (synchronous): apply cached brands immediately so the first paint is correct.
   This happens the moment this script is parsed — before chrome.storage comes back. */
brands = loadBrandsFast();
// Apply once DOM is parsed enough to have the elements we target.
// Script is loaded at end of body so all elements already exist.
applyBrands();
document.documentElement.classList.remove("brands-loading");
document.documentElement.classList.add("brands-ready");

/* Step 2 (async): refresh from chrome.storage (authoritative) and reapply if newer. */
(async () => {
  const fresh = await loadBrands();
  const changed = JSON.stringify(fresh) !== JSON.stringify(brands);
  if (changed) {
    brands = fresh;
    applyBrands();
  }
  await loadShortcuts();
  renderShortcuts();
})();
