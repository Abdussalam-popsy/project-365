// Walkthrough: step 0 is the original code, steps 1..N each apply one technique, the last screen is the recap.
const TYPES = new Set("String Int Bool Player GamePiece Location Property Utility Rentable Group ColourGroup GameEventHandler ConsoleHandler Road Go Jail Chance CommunityChest TaxLocation Station Dice MonopolyGame".split(" "));
const CONTEXT = 3;           // unchanged lines kept around each change in "Just the change"
const STEP_KEY = "walkthrough-step", VIEW_KEY = "walkthrough-view";

// Build every version of the code once: VERSIONS[0] is the original, VERSIONS[i] is after step i.
const VERSIONS = [BASE];
STEPS.forEach(s => {
  let code = VERSIONS[VERSIONS.length - 1];
  (s.edits || []).forEach(([find, rep]) => { code = code.replace(find, () => rep); });
  VERSIONS.push(code);
});
const LAST = STEPS.length + 1;   // index of the recap screen

let at = 0, view = "change";
try { at = Math.min(LAST, Math.max(0, +localStorage.getItem(STEP_KEY) || 0)); view = localStorage.getItem(VIEW_KEY) || "change"; } catch(e){}

function lineDiff(a0, b0){
  const a = a0.split("\n"), b = b0.split("\n");
  const m = a.length, n = b.length, L = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for(let x = m - 1; x >= 0; x--) for(let y = n - 1; y >= 0; y--) L[x][y] = a[x] === b[y] ? L[x+1][y+1] + 1 : Math.max(L[x+1][y], L[x][y+1]);
  const out = []; let x = 0, y = 0;
  while(x < m && y < n){
    if(a[x] === b[y]){ out.push([" ", b[y]]); x++; y++; }
    else if(L[x+1][y] >= L[x][y+1]) out.push(["-", a[x++]]);
    else out.push(["+", b[y++]]);
  }
  while(x < m) out.push(["-", a[x++]]);
  while(y < n) out.push(["+", b[y++]]);
  return out;
}

const lineHTML = (sign, text) => '<span class="ln' + (sign === "+" ? " add" : sign === "-" ? " del" : "") + '"><i>' + (sign === " " ? "" : sign) + '</i>' + (highlightSwift(text, TYPES) || " ") + '</span>';

// Rows to show: every diff row, or just changed rows with a little context and "unchanged" gaps.
function codeHTML(rows, onlyChange){
  if(!onlyChange) return rows.map(r => lineHTML(r[0], r[1])).join("");
  const keep = rows.map(() => false);
  rows.forEach((r, i) => { if(r[0] !== " ") for(let k = Math.max(0, i - CONTEXT); k <= Math.min(rows.length - 1, i + CONTEXT); k++) keep[k] = true; });
  // Trim the indentation every shown line shares, so changes fit on a phone.
  const shown = rows.filter((r, i) => keep[i] && r[1].trim());
  const cut = shown.length ? Math.min(...shown.map(r => r[1].match(/^ */)[0].length)) : 0;
  rows = rows.map(r => [r[0], r[1].slice(Math.min(cut, r[1].match(/^ */)[0].length))]);
  let out = "", gap = 0;
  const flush = () => { if(gap){ out += '<span class="gap">⋯ ' + gap + ' unchanged line' + (gap > 1 ? "s" : "") + '</span>'; gap = 0; } };
  rows.forEach((r, i) => { if(keep[i]){ flush(); out += lineHTML(r[0], r[1]); } else gap++; });
  flush();
  return out;
}

const listHTML = items => '<ol class="did">' + items.map(t => '<li>' + esc(t) + '</li>').join("") + '</ol>';

function render(){
  try { localStorage.setItem(STEP_KEY, at); } catch(e){}
  $("count").textContent = at === 0 ? "Start" : at === LAST ? "Done" : "Step " + at + " of " + STEPS.length;
  $("jump").value = at;
  $("bar").style.width = (at / LAST * 100) + "%";
  $("backBtn").disabled = at === 0;
  $("nextBtn").textContent = at === 0 ? "Start →" : at === STEPS.length ? "Finish →" : at === LAST ? "Start again" : "Next →";
  document.querySelectorAll(".view button").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === view));

  const ex = $("explain"), viewBar = document.querySelector(".codehead");
  $("pre").classList.remove("wrapped");
  if(at === 0){
    ex.innerHTML = '<span class="tag">The original code</span><h2>MonopolyGame, before any changes</h2>'
      + '<p>This is the code from the test briefing. There are ' + STEPS.length + ' steps. Each one fixes one problem and is one named technique.</p>'
      + '<p class="hint">Each step tells you what was wrong, what got moved or added, and why it has that name. Green lines are new, red lines are gone.</p>';
    viewBar.hidden = true;
    $("pre").innerHTML = codeHTML(lineDiff(BASE, BASE), false);
  } else if(at === LAST){
    ex.innerHTML = '<span class="tag">All done</span><h2>Every technique, in the order you saw it</h2>'
      + '<ol class="recap">' + STEPS.map((s, i) => '<li><button class="linkbtn" data-go="' + (i + 1) + '"><b>' + esc(s.tech) + '</b> <span>' + esc(s.where) + '</span></button></li>').join("") + '</ol>'
      + '<p class="hint">Below is the whole file after every change. Next: try the <a href="../mock/">Mock Test</a> without looking.</p>';
    ex.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(+b.dataset.go));
    viewBar.hidden = true;
    $("pre").innerHTML = codeHTML(lineDiff(VERSIONS[STEPS.length], VERSIONS[STEPS.length]), false);
  } else {
    const s = STEPS[at - 1];
    ex.innerHTML = '<span class="tag">' + esc(s.where) + '</span>'
      + '<h2 class="tech">' + esc(s.tech) + '</h2>'
      + '<div class="part"><h3>What was wrong</h3><p>' + esc(s.spot) + '</p></div>'
      + '<div class="part"><h3>What I did</h3>' + listHTML(s.did) + '</div>'
      + '<div class="part why"><h3>Why it\'s called ' + esc(s.tech) + '</h3><p>' + esc(s.why) + '</p></div>';
    if(s.note){
      viewBar.hidden = true;
      $("pre").innerHTML = '<span class="gap">Not part of this file. Here\'s what the fix looks like:</span>' + codeHTML(s.snippet.split("\n").map(l => ["+", l]), false);
    } else {
      viewBar.hidden = false;
      $("pre").innerHTML = codeHTML(lineDiff(VERSIONS[at - 1], VERSIONS[at]), view === "change");
      $("pre").classList.toggle("wrapped", view === "change");
    }
  }
  if(at === 1) roundTouched();
  if(at === LAST) track("walkthrough/finish");
}

function go(n){
  at = (n + LAST + 1) % (LAST + 1);
  render();
  const first = document.querySelector("#pre .add, #pre .del");
  if(view === "full" && first) first.scrollIntoView({ block: "center", behavior: "smooth" });
  else $("explain").scrollIntoView({ block: "start", behavior: "smooth" });
}

$("jump").innerHTML = '<option value="0">Start: original code</option>'
  + STEPS.map((s, i) => '<option value="' + (i + 1) + '">' + (i + 1) + '. ' + esc(s.tech) + ' (' + esc(s.where) + ')</option>').join("")
  + '<option value="' + LAST + '">Done: final code</option>';
$("jump").onchange = e => go(+e.target.value);
$("backBtn").onclick = () => go(at - 1);
$("nextBtn").onclick = () => go(at === LAST ? 0 : at + 1);
document.querySelectorAll(".view button").forEach(b => b.onclick = () => {
  view = b.dataset.view;
  try { localStorage.setItem(VIEW_KEY, view); } catch(e){}
  render();
});
document.addEventListener("keydown", e => {
  if(e.target.closest("select, input, textarea")) return;
  if(e.key === "ArrowRight") go(Math.min(LAST, at + 1));
  if(e.key === "ArrowLeft") go(Math.max(0, at - 1));
});

roundBegin("walkthrough/start");
render();
mountReferencePanel();
