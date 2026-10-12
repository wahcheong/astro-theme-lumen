/** Inlined before first paint so the stored theme never flashes. */
export const THEME_INIT_SCRIPT = `(function(){try{var k="lumen-theme";var s=localStorage.getItem(k);var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

/** Storage key shared by the init script and the toggle. */
export const THEME_STORAGE_KEY = "lumen-theme";
