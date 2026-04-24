/* Runs before <body> paints: applies cached color scheme + tab title
   synchronously to prevent FOUC. The async boot in newtab.js re-applies
   from chrome.storage (source of truth) once it's ready. */
window.RadTermConfig.preApplyBrands();
