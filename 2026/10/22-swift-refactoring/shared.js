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
  track((location.pathname.split("/").filter(Boolean).pop() || "home") + "/copy-for-claude");
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

// Anonymous stats: GoatCounter, no cookies, no personal data. Only counts on the live site, not localhost.
// track("fix/start") records one event. trackRound() records a finished round: score band, misses, mix-ups.
(function(){
  const s = document.createElement("script");
  s.async = true; s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://abdussalam.goatcounter.com/count");
  s.onload = () => { const q = window.__gcq || []; window.__gcq = []; q.forEach(f => f()); };
  document.head.appendChild(s);
})();
const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function track(path){
  const send = () => { try { window.goatcounter.count({ path: "swift-refactoring/" + path, title: path, event: true }); } catch(e){} };
  if(window.goatcounter && window.goatcounter.count) send(); else (window.__gcq = window.__gcq || []).push(send);
}
// A round only counts as started once the first answer is given, not when the page loads.
let pendingStart = null;
function roundBegin(path){ pendingStart = path; }
function roundTouched(){ if(pendingStart){ track(pendingStart); pendingStart = null; } }
function trackRound(page, score, total, missed, mixups){
  if(!total) return;
  track(page + "/finish");
  track(page + "/score/" + Math.floor(score / total * 10) * 10 + "pct");
  [...new Set(missed || [])].forEach(m => track(page + "/missed/" + slug(m)));
  (mixups || []).forEach(([right, picked]) => track(page + "/mixup/" + slug(right) + "--picked--" + slug(picked)));
}

// "← Previous": keeps a read-only copy of every card you've answered this round, so you can look back.
//   const review = mountReview($("card"));  review.snap() before moving on, review.reset() on a new round.
function mountReview(card){
  const snaps = [];
  let at = -1, cardWasHidden = false;
  const bar = document.createElement("div");
  bar.className = "revnav"; bar.hidden = true;
  bar.innerHTML = '<button class="btn" type="button">← Previous</button>';
  const view = document.createElement("section");
  view.className = "card reviewview"; view.hidden = true;
  view.innerHTML = '<div class="revbar"><button class="btn" type="button" data-a="older">← Earlier</button>'
    + '<span class="revlabel"></span><button class="btn" type="button" data-a="newer">Later →</button>'
    + '<button class="btn primary" type="button" data-a="close">Back to where I was</button></div><div class="revbody" inert></div>';
  card.parentNode.insertBefore(bar, card);
  card.parentNode.insertBefore(view, card);
  const paint = () => {
    view.querySelector(".revbody").replaceChildren(snaps[at].cloneNode(true));
    view.querySelector(".revlabel").textContent = "Reviewing " + (at + 1) + " of " + snaps.length;
    view.querySelector('[data-a="older"]').disabled = at === 0;
    view.querySelector('[data-a="newer"]').disabled = at === snaps.length - 1;
  };
  const open = () => {
    if(!snaps.length) return;
    cardWasHidden = card.hidden; at = snaps.length - 1;
    card.hidden = true; bar.hidden = true; view.hidden = false; paint();
    window.scrollTo({ top: 0 });
  };
  const close = () => { view.hidden = true; card.hidden = cardWasHidden; bar.hidden = !snaps.length; };
  bar.querySelector("button").onclick = open;
  view.querySelector('[data-a="older"]').onclick = () => { if(at > 0){ at--; paint(); } };
  view.querySelector('[data-a="newer"]').onclick = () => { if(at < snaps.length - 1){ at++; paint(); } };
  view.querySelector('[data-a="close"]').onclick = close;
  return {
    snap(){
      const c = card.cloneNode(true);
      c.removeAttribute("id"); c.hidden = false;
      c.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
      c.querySelectorAll("button, input, textarea").forEach(el => el.setAttribute("tabindex", "-1"));
      snaps.push(c); bar.hidden = false;
    },
    reset(){ snaps.length = 0; view.hidden = true; bar.hidden = true; }
  };
}
