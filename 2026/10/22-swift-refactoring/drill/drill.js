// Refactoring Drill: shows a Before/After pair, you pick the technique.
let set = "all", exam = false, deck = [], i = 0, score = 0, picked = null, missed = [], answered = false, log = [];

function shuffle(a){a=a.slice();for(let j=a.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[a[j],a[k]]=[a[k],a[j]];}return a;}

const TYPES = new Set("String Int Double Bool Date Player GamePiece Location Property Role PaymentGateway GameEventHandler".split(" "));

function renderCode(el, code, compare, showDiff){
  const other = new Set(compare.split("\n").map(s=>s.trim()));
  el.innerHTML = code.split("\n").map(l=>{
    const chg = showDiff && l.trim() !== "" && !other.has(l.trim());
    return '<span class="ln'+(chg?' chg':'')+'">'+(highlightSwift(l, TYPES)||" ")+'</span>';
  }).join("");
}

function start(questions){
  deck = shuffle(questions); i = 0; score = 0; missed = []; log = [];
  $("copyBox").hidden = true; $("copyStatus").hidden = true;
  $("results").hidden = true; $("quiz").hidden = false; show();
}
function pool(){ if(set === "10") return shuffle(QUESTIONS).slice(0, 10); return set === "all" ? QUESTIONS : QUESTIONS.filter(q => String(q.round) === set); }

function show(){
  const q = deck[i]; answered = false; picked = null;
  $("count").textContent = (i+1) + " / " + deck.length;
  $("bar").style.width = (i / deck.length * 100) + "%";
  $("score").textContent = score + " correct";
  $("qtag").textContent = "Round " + q.round;
  $("note").hidden = !q.note; $("note").textContent = q.note || "";
  renderCode($("before"), q.before, q.after, false);
  renderCode($("after"), q.after, q.before, false);
  const opts = exam ? shuffle(ALL_OPTIONS) : shuffle(q.options);
  $("opts").innerHTML = "";
  opts.forEach((o, idx) => {
    const b = document.createElement("button");
    b.className = "opt"; b.id = "opt-" + idx; b.dataset.value = o;
    b.innerHTML = '<span class="dot"></span><span>'+esc(o)+'</span>';
    b.onclick = () => { if(answered) return; picked = o;
      document.querySelectorAll(".opt").forEach(x => x.classList.toggle("picked", x === b));
      $("checkBtn").disabled = false; };
    $("opts").appendChild(b);
  });
  $("hint").hidden = true; $("hint").textContent = q.hint;
  $("feedback").hidden = true; $("hintBtn").hidden = false;
  $("diffBtn").hidden = true; $("diffBtn").textContent = "Highlight what changed";
  $("checkBtn").hidden = false; $("checkBtn").disabled = true; $("nextBtn").hidden = true;
}

function check(){
  if(!picked) return;
  const q = deck[i]; answered = true;
  const ok = picked === q.answer;
  if(ok) score++; else missed.push({q, picked});
  log.push({q, picked, ok, hint: !$("hint").hidden});
  document.querySelectorAll(".opt").forEach(b => {
    b.disabled = true;
    if(b.dataset.value === q.answer) b.classList.add("right");
    else if(b.dataset.value === picked) b.classList.add("wrong");
  });
  const fb = $("feedback");
  fb.className = "feedback " + (ok ? "good" : "bad");
  fb.innerHTML = "<b>" + (ok ? "Correct: " : "Not quite. Answer: ") + esc(q.answer) + "</b>" + esc(q.explanation);
  fb.hidden = false;
  $("score").textContent = score + " correct";
  $("checkBtn").hidden = true; $("nextBtn").hidden = false; $("hintBtn").hidden = true;
  $("diffBtn").hidden = false;
  $("nextBtn").textContent = i === deck.length - 1 ? "See results" : "Next question";
  $("nextBtn").focus();
}

let diffOn = false;
function toggleDiff(){
  const q = deck[i]; diffOn = !diffOn;
  renderCode($("before"), q.before, q.after, diffOn);
  renderCode($("after"), q.after, q.before, diffOn);
  $("diffBtn").textContent = diffOn ? "Hide highlights" : "Highlight what changed";
}

function next(){
  diffOn = false;
  if(i < deck.length - 1){ i++; show(); return; }
  $("bar").style.width = "100%";
  $("quiz").hidden = true; $("results").hidden = false;
  $("final").textContent = score + " / " + deck.length;
  const pct = score / deck.length;
  $("verdict").textContent = pct === 1 ? "Perfect round." : pct >= 0.8 ? "Strong. Retry the misses until they stick." : "Retry the misses, then run the full set again tomorrow.";
  $("missed").innerHTML = missed.map(m => "<li><b>" + esc(m.q.answer) + "</b> <span>(you picked " + esc(m.picked) + ")</span></li>").join("");
  $("retryMissed").hidden = missed.length === 0;
}

// What the "Your answers" tab in the popup shows: newest first, the latest one opened.
function answerHistory(){
  return log.map((x, n) =>
    '<li><details class="ans ' + (x.ok ? "ok" : "bad") + '"' + (n === log.length - 1 ? " open" : "") + '>'
    + '<summary><span class="mark">' + (x.ok ? "✓" : "✗") + '</span>'
    + '<span class="what-you"><b>' + esc(x.q.answer) + '</b><span>' + (x.ok ? "You got it" : "You picked " + esc(x.picked)) + (x.hint ? " · used hint" : "") + '</span></span>'
    + '<span class="num">#' + (n + 1) + '</span></summary>'
    + '<div class="ans-body">'
    + '<div class="pane"><h3>Before</h3><pre>' + codeBlockHTML(x.q.before, TYPES) + '</pre></div>'
    + '<div class="pane after"><h3>After</h3><pre>' + codeBlockHTML(x.q.after, TYPES) + '</pre></div>'
    + '<p>' + esc(x.q.explanation) + '</p>'
    + '</div></details></li>').reverse();
}

function buildReport(){
  const setName = set === "all" ? "All " + QUESTIONS.length : set === "10" ? "Quick 10" : "Round " + set;
  let t = "Refactoring Drill results\n";
  t += "Set: " + setName + (exam ? " (exam mode, " + ALL_OPTIONS.length + " options)" : " (4 options)") + "\n";
  t += "Score: " + score + " / " + log.length + "\n\n";
  const wrong = log.filter(x => !x.ok);
  if(wrong.length){
    t += "=== MISSED (" + wrong.length + ") ===\n\n";
    wrong.forEach((x, n) => {
      t += "Missed " + (n+1) + ": correct = " + x.q.answer + " | I picked = " + x.picked + (x.hint ? " | used hint" : "") + "\n";
      if(x.q.note) t += "Note: " + x.q.note + "\n";
      t += "BEFORE:\n" + x.q.before + "\n\nAFTER:\n" + x.q.after + "\n\n---\n\n";
    });
  }
  const right = log.filter(x => x.ok);
  if(right.length){
    t += "=== CORRECT (" + right.length + ") ===\n";
    right.forEach(x => { t += "- " + x.q.answer + (x.hint ? " (used hint)" : "") + "\n"; });
  }
  return t;
}
$("copyBtn").onclick = () => copyForClaude(buildReport(), $("copyBox"), $("copyStatus"));
$("checkBtn").onclick = check;
$("nextBtn").onclick = next;
$("hintBtn").onclick = () => { $("hint").hidden = false; $("hintBtn").hidden = true; };
$("diffBtn").onclick = toggleDiff;
$("restart").onclick = () => $("set-all").textContent = "All " + QUESTIONS.length;
$("optCount").textContent = "all " + ALL_OPTIONS.length;
start(pool());
$("retryMissed").onclick = () => start(missed.map(m => m.q));
document.querySelectorAll(".seg button").forEach(b => b.onclick = () => {
  set = b.dataset.set;
  document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
  start(pool());
});
$("exam").onchange = e => { exam = e.target.checked; if(!answered) show(); };
$("set-all").textContent = "All " + QUESTIONS.length;
$("optCount").textContent = "all " + ALL_OPTIONS.length;
start(pool());
mountReferencePanel({ history: answerHistory });
