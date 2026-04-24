/* RadTerm Options Page */

const { DEFAULT_BRANDS, loadBrands, saveBrands, resetBrands } = window.RadTermConfig;

const form = document.getElementById("config-form");
const resetBtn = document.getElementById("reset-btn");
const statusMsg = document.getElementById("status");

let current = { ...DEFAULT_BRANDS };

function populateForm(brands) {
  form.querySelectorAll("[data-config-key]").forEach((input) => {
    const key = input.dataset.configKey;
    input.value = brands[key] !== undefined ? brands[key] : "";
  });
  applyPreviewColorScheme(brands.colorScheme || "green");
}

/* Give the options page itself a live preview of the chosen scheme */
function applyPreviewColorScheme(name) {
  document.documentElement.setAttribute("data-scheme", name);
}

function showStatus(text, kind = "ok") {
  statusMsg.textContent = text;
  statusMsg.dataset.kind = kind;
  statusMsg.classList.add("visible");
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => {
    statusMsg.classList.remove("visible");
  }, 2400);
}

/* Live-update the color scheme preview as the user changes the select */
form.addEventListener("change", (ev) => {
  if (ev.target.dataset?.configKey === "colorScheme") {
    applyPreviewColorScheme(ev.target.value);
  }
});

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const updated = { ...current };
  form.querySelectorAll("[data-config-key]").forEach((input) => {
    updated[input.dataset.configKey] = input.value;
  });
  current = updated;
  try {
    await saveBrands(current);
    showStatus("✓ CONFIGURATION SAVED", "ok");
  } catch (e) {
    showStatus("✗ SAVE FAILED: " + (e?.message || "unknown"), "err");
  }
});

resetBtn.addEventListener("click", async () => {
  if (!confirm("Reset all branding to factory defaults?")) return;
  current = await resetBrands();
  populateForm(current);
  showStatus("✓ DEFAULTS RESTORED", "ok");
});

/* Boot */
(async () => {
  current = await loadBrands();
  populateForm(current);
})();
