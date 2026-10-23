// Helpers every exercise page uses: escaping, Swift syntax colouring, and the "Copy results for Claude" button.

const $ = id => document.getElementById(id);

function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

const SWIFT_KEYWORDS = new Set("class struct enum protocol func var let init return if else guard private for in self case true false nil".split(" "));

// Colours one line of Swift. `types` is the set of type names this page wants tinted.
function highlightSwift(line, types){
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b([A-Za-z_][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?)\b/g;
  let out = "", last = 0, m;
  while((m = re.exec(line))){
    out += esc(line.slice(last, m.index));
    if(m[1]) out += '<span class="c">'+esc(m[1])+'</span>';
    else if(m[2]) out += '<span class="s">'+esc(m[2])+'</span>';
    else if(m[3]) out += SWIFT_KEYWORDS.has(m[3]) ? '<span class="k">'+m[3]+'</span>' : types.has(m[3]) ? '<span class="t">'+m[3]+'</span>' : esc(m[3]);
    else if(m[4]) out += '<span class="n">'+m[4]+'</span>';
    last = re.lastIndex;
  }
  return out + esc(line.slice(last));
}

// A whole block of Swift as <span class="ln"> lines, ready to drop inside a <pre>.
function codeBlockHTML(code, types){
  return code.split("\n").map(l => '<span class="ln">'+(highlightSwift(l, types)||" ")+'</span>').join("");
}

// Copies the report to the clipboard; if the browser refuses, shows it selected in the box instead.
function copyForClaude(text, box, status){
  box.value = text; box.hidden = false;
  const done = msg => { status.textContent = msg; status.hidden = false; };
  const fallback = () => { box.focus(); box.select(); done("Selected below. Press Cmd+C to copy."); };
  try {
    navigator.clipboard.writeText(text).then(() => done("Copied. Paste it into the chat with Claude."), fallback);
  } catch(err){ fallback(); }
}

// ── Top bar: back link on the left; theme toggle (and the cheat sheet button, from panel.js) on the right ──

const THEME_KEY = "swift-refactoring-theme";
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

// The theme on screen right now: the one you picked, or else what the system prefers.
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

function mountTopbar(){
  const wrap = document.querySelector(".wrap");
  if(!wrap) return;
  const bar = document.createElement("div");
  bar.className = "topbar";
  const crumb = wrap.querySelector(":scope > .crumb");
  bar.appendChild(crumb || document.createElement("span"));   // the span keeps the actions on the right
  bar.insertAdjacentHTML("beforeend", '<div class="top-actions" id="topActions"><button class="icon-btn" id="themeBtn" type="button"></button></div>');
  wrap.prepend(bar);

  const btn = $("themeBtn");
  paintThemeButton(btn);
  btn.onclick = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch(err){ /* not saved; still switches for this visit */ }
    paintThemeButton(btn);
  };
  // If you haven't picked one and the Mac switches appearance, keep the icon honest.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => paintThemeButton(btn));
}

mountTopbar();
