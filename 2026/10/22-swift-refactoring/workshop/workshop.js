// Refactoring Workshop: you write the After code, with help that fades level by level.
let level = 1, deck = [], i = 0, log = [], state = null;

const TYPES = new Set("String Int Double Bool Date UUID Player GamePiece Location Property Utility Rentable Group CartItem OrderStatus MemberStatus AlertPriority WeatherService Logging GameEventHandler".split(" "));
const codeHTML = code => codeBlockHTML(code, TYPES);
const modelAnswer = e => e.model || e.after.replace(/«([^»|]*)[^»]*»/g, "$1");
// Whitespace, "self." and semicolons never change the meaning here, so ignore them when marking.
const norm = s => s.replace(/\s+/g, "").replace(/self\./g, "").replace(/;/g, "");

// Level 3 identify step: the right technique plus the three it's most often confused with.
const CONFUSE = {
  "Hide method": ["Encapsulate field", "Remove setting method", "Extract interface"],
  "Rename method": ["Extract method", "Inline method", "Move method"],
  "Inline method": ["Inline temp", "Extract method", "Remove parameter"],
  "Add parameter": ["Introduce explaining variable", "Replace type code with class", "Rename method"],
  "Encapsulate collection": ["Encapsulate field", "Remove setting method", "Hide method"],
  "Encapsulate field": ["Remove setting method", "Encapsulate collection", "Hide method"],
  "Introduce explaining variable": ["Split temporary variable", "Inline temp", "Extract method"],
  "Extract method": ["Hide method", "Extract class", "Move method"],
  "Extract class": ["Extract method", "Extract interface", "Move method"],
  "Move method": ["Extract method", "Extract class", "Hide method"],
  "Remove setting method": ["Encapsulate field", "Hide method", "Encapsulate collection"]
};
const shuffle = a => { a = a.slice(); for(let k = a.length - 1; k > 0; k--){ const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

// Line diff (LCS on trimmed lines) between your code and the model, for the Level 3 review.
function lineDiff(mine, model){
  const a = mine.split("\n"), b = model.split("\n"), A = a.map(x => x.trim()), B = b.map(x => x.trim());
  const m = a.length, n = b.length, L = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for(let x = m - 1; x >= 0; x--) for(let y = n - 1; y >= 0; y--) L[x][y] = A[x] === B[y] ? L[x+1][y+1] + 1 : Math.max(L[x+1][y], L[x][y+1]);
  const out = []; let x = 0, y = 0;
  while(x < m && y < n){
    if(A[x] === B[y]){ out.push([" ", b[y]]); x++; y++; }
    else if(L[x+1][y] >= L[x][y+1]) out.push(["-", a[x++]]);
    else out.push(["+", b[y++]]);
  }
  while(x < m) out.push(["-", a[x++]]);
  while(y < n) out.push(["+", b[y++]]);
  return out.filter(([t, l]) => !(t !== " " && !l.trim()));
}
function diffHTML(mine, model){
  return lineDiff(mine, model).map(([t, l]) => '<span class="ln d' + (t === "+" ? "add" : t === "-" ? "del" : "") + '"><i>' + (t === " " ? "" : t) + '</i>' + (highlightSwift(l, TYPES) || " ") + '</span>').join("");
}

let review = null;
function start(list){
  if(!review) review = mountReview($("ex"));
  review.reset();
  deck = list.slice(); i = 0; log = [];
  roundBegin("workshop/start/level-" + level);
  $("results").hidden = true; $("ex").hidden = false;
  $("copyBox").hidden = true; $("copyStatus").hidden = true;
  show();
}
function levelList(){ return EX.filter(e => e.level === level); }

function show(){
  const e = deck[i];
  state = { tries: 0, hintsUsed: 0, revealed: false, done: false, lastWrong: "" };
  $("count").textContent = "Exercise " + (i+1) + " of " + deck.length;
  $("bar").style.width = (i / deck.length * 100) + "%";
  $("score").textContent = log.filter(x => x.result === "first try").length + " first try";
  $("tech").textContent = e.technique;
  $("lvtag").textContent = "Level " + e.level;
  $("task").textContent = e.task;
  $("recipeText").textContent = e.recipe;
  $("note").hidden = !e.note; $("note").textContent = e.note || "";
  $("before").innerHTML = codeHTML(e.before);
  $("hint").hidden = true; $("feedback").hidden = true; $("model").hidden = true; $("checks").hidden = true;
  $("checkBtn").hidden = false; $("nextBtn").hidden = true; $("mineBtn").hidden = true;
  $("hintBtn").hidden = !e.hints.length; $("revealBtn").hidden = false;
  $("recipe").hidden = false; $("afterPane").hidden = false; $("idopts").hidden = true; $("idfb").hidden = true;
  $("resetBtn").hidden = true; $("diff").hidden = true;
  if(e.level < 3){
    $("after").hidden = false; $("editor").hidden = true;
    $("afterTitle").textContent = e.level === 1 ? "After: fill the blank words" : "After: write the missing lines";
    renderBlanks(e);
    const first = document.querySelector(".blank"); if(first) first.focus({preventScroll:true});
  } else {
    $("after").hidden = true; $("editor").hidden = false;
    $("afterTitle").textContent = "After: edit the code below";
    $("editor").value = e.before;
    $("checks").innerHTML = '<li class="pending"><i>·</i>' + e.checks.length + ' checks run when you press Check</li>';
    identifyPhase(e);
  }
  $("ex").classList.toggle("stack", e.level > 1);
}

// Level 3 starts like the test: you get code and a problem, not the technique's name.
function identifyPhase(e){
  state.phase = "identify";
  $("tech").textContent = "Which refactoring fits?";
  $("task").textContent = e.smell || e.task;
  ["recipe", "checks", "hintBtn", "revealBtn", "checkBtn", "resetBtn"].forEach(id => $(id).hidden = true);
  $("afterPane").hidden = true; $("idfb").hidden = true;
  const opts = shuffle([e.technique].concat(CONFUSE[e.technique] || []));
  $("idopts").innerHTML = opts.map((o, k) => '<button class="opt" data-v="' + esc(o) + '"><span class="dot"></span>' + esc(o) + '</button>').join("");
  $("idopts").hidden = false;
  $("idopts").querySelectorAll(".opt").forEach(b => b.onclick = () => pickTechnique(e, b.dataset.v));
}

function pickTechnique(e, v){
  roundTouched();
  state.identified = v === e.technique; state.picked = v;
  $("idopts").querySelectorAll(".opt").forEach(b => {
    b.disabled = true;
    if(b.dataset.v === e.technique) b.classList.add("right");
    else if(b.dataset.v === v) b.classList.add("wrong");
  });
  const fb = $("idfb");
  fb.className = "feedback " + (state.identified ? "good" : "bad");
  fb.innerHTML = "<b>" + (state.identified ? "Right: " : "Not quite. It's ") + esc(e.technique) + "</b>" + esc(e.why || "");
  fb.hidden = false;
  writePhase(e);
}

function writePhase(e){
  state.phase = "write";
  $("tech").textContent = e.technique;
  $("task").textContent = e.task;
  $("recipe").hidden = false; $("afterPane").hidden = false;
  $("checks").hidden = false; $("checkBtn").hidden = false; $("revealBtn").hidden = false; $("resetBtn").hidden = false;
  $("hintBtn").hidden = !e.hints.length;
  $("editor").focus({preventScroll:true});
}

function renderBlanks(e){
  let n = 0;
  $("after").innerHTML = e.after.split("\n").map(line => {
    const whole = line.match(/^(\s*)«([^»]*)»\s*$/);
    if(whole && e.level === 2){
      const indent = whole[1].length, alts = whole[2].split("|");
      return '<span class="ln">' + whole[1] + '<input class="blank wide" id="b'+n+'" data-idx="'+(n++)+'" data-alts="'+esc(JSON.stringify(alts)).replace(/"/g,"&quot;")+'" style="width:calc(100% - '+indent+'ch)" placeholder="write this line" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Missing line"></span>';
    }
    const parts = line.split(/«([^»]*)»/);
    let html = "";
    parts.forEach((p, idx) => {
      if(idx % 2 === 0){ html += highlightSwift(p, TYPES); return; }
      const alts = p.split("|");
      const w = Math.min(Math.max(alts[0].length + 2, 4), 80);
      html += '<input class="blank" id="b'+(n)+'" data-idx="'+(n++)+'" data-alts="'+esc(JSON.stringify(alts)).replace(/"/g,"&quot;")+'" style="width:'+w+'ch" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Blank">';
    });
    return '<span class="ln">'+(html||" ")+'</span>';
  }).join("");
  document.querySelectorAll(".blank").forEach(b => b.addEventListener("keydown", ev => { if(ev.key === "Enter"){ ev.preventDefault(); check(); } }));
}

function check(){
  const e = deck[i]; if(state.done) return;
  roundTouched();
  state.tries++;
  let ok;
  if(e.level < 3){
    const blanks = [...document.querySelectorAll(".blank")];
    const wrong = [];
    blanks.forEach(b => {
      const alts = JSON.parse(b.dataset.alts);
      const good = alts.some(a => norm(a) === norm(b.value));
      b.classList.toggle("ok", good); b.classList.toggle("no", !good);
      if(!good) wrong.push({typed: b.value, expected: alts[0]});
    });
    ok = wrong.length === 0;
    state.lastWrong = wrong.map(w => 'typed "' + w.typed + '", expected "' + w.expected + '"').join("; ");
    feedback(ok, ok ? "Every blank is right." : wrong.length + " blank" + (wrong.length > 1 ? "s" : "") + " not right yet. Fix the red ones and check again, or use a hint.");
    if(!ok && e.level === 2) $("mineBtn").hidden = false;
  } else {
    const code = norm($("editor").value);
    let fails = [];
    $("checks").innerHTML = e.checks.map(c => {
      const re = new RegExp(c.re, "g");
      const n = (code.match(re) || []).length;
      const pass = c.mode === "not" ? n === 0 : c.mode === "count" ? n === c.n : n > 0;
      if(!pass) fails.push(c.label);
      return '<li class="'+(pass?"pass":"fail")+'"><i>'+(pass?"✓":"✗")+'</i>'+esc(c.label)+'</li>';
    }).join("");
    ok = fails.length === 0;
    state.lastWrong = fails.join("; ");
    state.lastCode = $("editor").value;
    feedback(ok, ok ? "All checks pass." : fails.length + " check" + (fails.length > 1 ? "s" : "") + " not passing yet. Edit and check again.");
    if(!ok) $("mineBtn").hidden = false;
  }
  if(ok) finish(state.tries === 1 && state.hintsUsed === 0 ? "first try" : "after retries");
}

function feedback(ok, msg){
  const fb = $("feedback");
  fb.className = "feedback " + (ok ? "good" : "bad");
  fb.innerHTML = "<b>" + (ok ? "Correct" : "Not yet") + "</b>" + esc(msg);
  fb.hidden = false;
}

// Your attempt as code: the After with each blank swapped for what you typed (levels 1-2), or the editor (level 3).
function typedAnswer(e){
  if(e.level === 3) return $("editor").value;
  const typed = [...document.querySelectorAll(".blank")].map(b => b.value.trim() || "____");
  let n = 0;
  return e.after.replace(/«[^»]*»/g, () => typed[n++] ?? "____");
}

function finish(result){
  const e = deck[i];
  state.done = true;
  log.push({ e, identified: state.identified, picked: state.picked, result, tries: state.tries, hints: state.hintsUsed, wrong: state.lastWrong, code: state.lastCode || "", answer: state.answer ?? typedAnswer(e) });
  $("checkBtn").hidden = true; $("nextBtn").hidden = false; $("mineBtn").hidden = true;
  $("hintBtn").hidden = true; $("revealBtn").hidden = true;
  $("score").textContent = log.filter(x => x.result === "first try").length + " first try";
  if(e.level === 3 || result === "revealed"){ $("modelCode").innerHTML = codeHTML(modelAnswer(e)); $("model").hidden = false; }
  if(e.level === 3){ $("diffCode").innerHTML = diffHTML($("editor").value, modelAnswer(e)); $("diff").hidden = false; $("resetBtn").hidden = true; }
  $("nextBtn").textContent = i === deck.length - 1 ? "See results" : "Next exercise";
  $("nextBtn").focus({preventScroll:true});
}

function hint(){
  const e = deck[i];
  if(state.hintsUsed >= e.hints.length) return;
  const h = $("hint");
  h.innerHTML = e.hints.slice(0, ++state.hintsUsed).map((t, n) => "Hint " + (n+1) + ": " + esc(t)).join("<br>");
  h.hidden = false;
  if(state.hintsUsed >= e.hints.length) $("hintBtn").hidden = true;
}

function reveal(){
  const e = deck[i];
  state.answer = typedAnswer(e); // keep what you typed before the blanks get filled in
  if(e.level < 3){
    document.querySelectorAll(".blank").forEach(b => {
      const alts = JSON.parse(b.dataset.alts);
      if(!alts.some(a => norm(a) === norm(b.value))){ b.value = alts[0]; b.classList.remove("ok"); b.classList.add("no"); }
    });
  }
  if(!state.lastWrong) state.lastWrong = "revealed before checking";
  state.lastCode = e.level === 3 ? $("editor").value : "";
  feedback(false, "Here's the answer. Read it, then redo this one later from the results screen.");
  finish("revealed");
}

function next(){
  review.snap();
  if(i < deck.length - 1){ i++; show(); return; }
  $("bar").style.width = "100%";
  $("ex").hidden = true; $("results").hidden = false;
  const first = log.filter(x => x.result === "first try").length;
  $("final").textContent = first + " / " + log.length;
  $("verdict").textContent = "First-try correct, no hints. " + (first === log.length ? "Ready for the next level." : first >= log.length * 0.75 ? "Nearly there. Redo the struggles, then move up a level." : "Redo the ones you struggled with before moving up.");
  trackRound("workshop-l" + level, first, log.length, log.filter(x => x.result !== "first try").map(x => x.e.technique), log.filter(x => x.identified === false).map(x => [x.e.technique, x.picked]));
  const ids = log.filter(x => x.identified !== undefined);
  if(ids.length) $("verdict").textContent += " Named the technique correctly: " + ids.filter(x => x.identified).length + " / " + ids.length + ".";
  $("summary").innerHTML = log.map(x => "<li><b>" + esc(x.e.technique) + "</b><span>" + (x.identified === false ? "picked " + esc(x.picked) + ", " : x.identified ? "named it, " : "") + esc(x.result) + (x.hints ? ", " + x.hints + " hint" + (x.hints>1?"s":"") : "") + "</span></li>").join("");
  $("retryBtn").hidden = log.every(x => x.result === "first try" && x.identified !== false);
}

// What the "Your answers" tab in the popup shows: newest first, the latest one opened.
const RESULT_MARK = { "first try": ["ok", "✓"], "after retries": ["retry", "✓"], "revealed": ["bad", "✗"] };
function answerHistory(){
  return log.map((x, n) => {
    const [cls, mark] = RESULT_MARK[x.result];
    return '<li><details class="ans ' + cls + '"' + (n === log.length - 1 ? " open" : "") + '>'
      + '<summary><span class="mark">' + mark + '</span>'
      + '<span class="what-you"><b>' + esc(x.e.technique) + '</b><span>' + esc(x.result) + (x.hints ? " · " + x.hints + " hint" + (x.hints > 1 ? "s" : "") : "") + '</span></span>'
      + '<span class="num">#' + (n + 1) + '</span></summary>'
      + '<div class="ans-body">'
      + '<p>' + esc(x.e.task) + '</p>'
      + '<div class="pane"><h3>Your answer</h3><pre>' + codeHTML(x.answer) + '</pre></div>'
      + '<div class="pane after"><h3>Model answer</h3><pre>' + codeHTML(modelAnswer(x.e)) + '</pre></div>'
      + '</div></details></li>';
  }).reverse();
}

function report(){
  const first = log.filter(x => x.result === "first try").length;
  let t = "Refactoring Workshop results\nLevel " + level + "\nFirst try (no hints): " + first + " / " + log.length + "\n\n";
  const ids = log.filter(x => x.identified !== undefined);
  if(ids.length){
    t += "Named the technique: " + ids.filter(x => x.identified).length + " / " + ids.length + "\n";
    ids.filter(x => !x.identified).forEach(x => { t += "- Misnamed: correct = " + x.e.technique + " | I picked = " + x.picked + "\n"; });
    t += "\n";
  }
  const hard = log.filter(x => x.result !== "first try" || x.identified === false);
  if(hard.length){
    t += "=== STRUGGLED WITH (" + hard.length + ") ===\n\n";
    hard.forEach((x, n) => {
      t += (n+1) + ". " + x.e.technique + " | " + x.result + (x.identified === false ? " | misnamed as " + x.picked : "") + " | tries: " + x.tries + " | hints: " + x.hints + "\n";
      t += "Task: " + x.e.task + "\n";
      if(x.wrong) t += "Problems: " + x.wrong + "\n";
      if(x.e.level === 3 && x.code) t += "My code:\n" + x.code + "\n";
      t += "\n---\n\n";
    });
  }
  const easy = log.filter(x => x.result === "first try");
  if(easy.length){ t += "=== FIRST TRY (" + easy.length + ") ===\n"; easy.forEach(x => { t += "- " + x.e.technique + "\n"; }); }
  return t;
}

$("checkBtn").onclick = check;
$("nextBtn").onclick = next;
$("hintBtn").onclick = hint;
$("revealBtn").onclick = reveal;
$("mineBtn").onclick = () => { state.lastWrong += " (marked equivalent by me)"; feedback(true, "Counted as correct. Compare with the model answer below to be sure."); finish("after retries"); };
$("restartBtn").onclick = () => start(levelList());
$("retryBtn").onclick = () => start(log.filter(x => x.result !== "first try" || x.identified === false).map(x => x.e));
$("resetBtn").onclick = () => { $("editor").value = deck[i].before; $("editor").focus(); };
$("copyBtn").onclick = () => copyForClaude(report(), $("copyBox"), $("copyStatus"));
$("editor").addEventListener("keydown", ev => {
  if(ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)){ ev.preventDefault(); check(); return; }
  if(ev.key === "Tab"){ ev.preventDefault(); const t = ev.target, s = t.selectionStart;
    t.value = t.value.slice(0, s) + "    " + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 4; }
});
document.querySelectorAll(".seg button").forEach(b => b.onclick = () => {
  level = Number(b.dataset.level);
  document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
  start(levelList());
});
start(levelList());
mountReferencePanel({ history: answerHistory });
