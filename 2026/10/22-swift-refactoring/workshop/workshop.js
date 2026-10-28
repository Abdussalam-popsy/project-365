// Refactoring Workshop: you write the After code, with help that fades level by level.
let level = 1, deck = [], i = 0, log = [], state = null;

const TYPES = new Set("String Int Double Bool Date UUID Player GamePiece Location Property Utility Rentable Group CartItem OrderStatus MemberStatus AlertPriority WeatherService Logging GameEventHandler".split(" "));
const codeHTML = code => codeBlockHTML(code, TYPES);
const modelAnswer = e => e.model || e.after.replace(/«([^»|]*)[^»]*»/g, "$1");
const norm = s => s.replace(/\s+/g, "");

function start(list){
  deck = list.slice(); i = 0; log = [];
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
  if(e.level < 3){
    $("after").hidden = false; $("editor").hidden = true;
    $("afterTitle").textContent = e.level === 1 ? "After: fill the blank words" : "After: write the missing lines";
    renderBlanks(e);
    const first = document.querySelector(".blank"); if(first) first.focus({preventScroll:true});
  } else {
    $("after").hidden = true; $("editor").hidden = false;
    $("afterTitle").textContent = "After: edit the code below";
    $("editor").value = e.before;
    $("checks").innerHTML = e.checks.map(c => '<li><i>·</i>'+esc(c.label)+'</li>').join("");
    $("checks").hidden = false;
  }
}

function renderBlanks(e){
  let n = 0;
  $("after").innerHTML = e.after.split("\n").map(line => {
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
  log.push({ e, result, tries: state.tries, hints: state.hintsUsed, wrong: state.lastWrong, code: state.lastCode || "", answer: state.answer ?? typedAnswer(e) });
  $("checkBtn").hidden = true; $("nextBtn").hidden = false; $("mineBtn").hidden = true;
  $("hintBtn").hidden = true; $("revealBtn").hidden = true;
  $("score").textContent = log.filter(x => x.result === "first try").length + " first try";
  if(e.level === 3 || result === "revealed"){ $("modelCode").innerHTML = codeHTML(modelAnswer(e)); $("model").hidden = false; }
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
      if(!alts.some(a => norm(a) === norm(b.value))){ b.value = alts[0]; b.classList.remove("ok", "no"); b.classList.add("shown"); }   // yellow = filled in for you, not "wrong"
    });
  }
  if(!state.lastWrong) state.lastWrong = "revealed before checking";
  state.lastCode = e.level === 3 ? $("editor").value : "";
  feedback(false, "Here's the answer. The yellow blanks were filled in for you. Read them, then redo this one later from the results screen.");
  finish("revealed");
}

function next(){
  if(i < deck.length - 1){ i++; show(); return; }
  $("bar").style.width = "100%";
  $("ex").hidden = true; $("results").hidden = false;
  const first = log.filter(x => x.result === "first try").length;
  $("final").textContent = first + " / " + log.length;
  $("verdict").textContent = "First-try correct, no hints. " + (first === log.length ? "Ready for the next level." : first >= log.length * 0.75 ? "Nearly there. Redo the struggles, then move up a level." : "Redo the ones you struggled with before moving up.");
  $("summary").innerHTML = log.map(x => "<li><b>" + esc(x.e.technique) + "</b><span>" + esc(x.result) + (x.hints ? ", " + x.hints + " hint" + (x.hints>1?"s":"") : "") + "</span></li>").join("");
  $("retryBtn").hidden = log.every(x => x.result === "first try");
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
  const hard = log.filter(x => x.result !== "first try");
  if(hard.length){
    t += "=== STRUGGLED WITH (" + hard.length + ") ===\n\n";
    hard.forEach((x, n) => {
      t += (n+1) + ". " + x.e.technique + " | " + x.result + " | tries: " + x.tries + " | hints: " + x.hints + "\n";
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
$("retryBtn").onclick = () => start(log.filter(x => x.result !== "first try").map(x => x.e));
$("copyBtn").onclick = () => copyForClaude(report(), $("copyBox"), $("copyStatus"));
$("editor").addEventListener("keydown", ev => {
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
