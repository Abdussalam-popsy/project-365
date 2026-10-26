// Helpers every page uses: lookups, escaping, saved progress, shuffling, a toast, and the top bar.

const $ = s => document.querySelector(s);

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

const shuffle = a => {
  const out = a.slice();
  for(let i = out.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

// Saved progress (selected weeks, missed questions). Falls back to defaults when storage is blocked.
const store = {
  get(k, d){ try { const v = localStorage.getItem("co6210:" + k); return v ? JSON.parse(v) : d; } catch(err){ return d; } },
  set(k, v){ try { localStorage.setItem("co6210:" + k, JSON.stringify(v)); } catch(err){ /* not saved; works for this visit */ } }
};

function toast(text){
  let el = $("#toast");
  if(!el){ el = document.createElement("div"); el.className = "toast"; el.id = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = text; el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 1800);
}

// ── Top bar: back link on the left; theme toggle on the right ──

const THEME_KEY = "co6210-theme";
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

function currentTheme(){
  return document.documentElement.dataset.theme
    || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function paintThemeButton(btn){
  const dark = currentTheme() === "dark";
  btn.innerHTML = dark ? ICON_SUN : ICON_MOON;   // show where the click takes you
  btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  btn.title = btn.getAttribute("aria-label");
}

// `back` is { href, label } for the crumb, or nothing on the home page.
function mountTopbar(back){
  const wrap = document.querySelector(".wrap");
  if(!wrap) return;
  const bar = document.createElement("div");
  bar.className = "topbar";
  bar.innerHTML = (back ? '<a class="crumb" href="' + esc(back.href) + '">← ' + esc(back.label) + '</a>' : "<span></span>")
    + '<button class="icon-btn" id="themeBtn" type="button"></button>';
  wrap.prepend(bar);

  const btn = $("#themeBtn");
  paintThemeButton(btn);
  btn.onclick = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch(err){ /* not saved; still switches for this visit */ }
    paintThemeButton(btn);
  };
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => paintThemeButton(btn));
}
