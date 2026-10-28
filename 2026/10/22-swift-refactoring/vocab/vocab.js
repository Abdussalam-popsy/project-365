// Swift Vocabulary: Browse mode (search, group filter, hide-meanings self test) and Quiz mode
// (one word or meaning, pick from four, or skip). The words themselves live in words.js.
// JS / Python twins use the shared "Show JavaScript / Python" switch from cheatsheet/render.js.

const VOCAB_TYPES = new Set("String Int Double Bool UUID Date CartItem Player Property Rentable Jail Location GamePiece".split(" "));
const groupById = Object.fromEntries(VOCAB_GROUPS.map(g => [g.id, g]));

function shuffle(a){ a = a.slice(); for(let j = a.length - 1; j > 0; j--){ const k = Math.floor(Math.random()*(j+1)); [a[j], a[k]] = [a[k], a[j]]; } return a; }

$("total").textContent = VOCAB_WORDS.length + " words and symbols from the zip and the Monopoly code, sorted by the job they do.";

/* ── Mode switch ───────────────────────────────────────────── */

document.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => {
  document.querySelectorAll("[data-mode]").forEach(x => x.setAttribute("aria-pressed", x === b));
  $("browse").hidden = b.dataset.mode !== "browse";
  $("quiz").hidden = b.dataset.mode !== "quiz";
  if(b.dataset.mode === "quiz" && !round.length) startRound();
});

/* ── Browse ────────────────────────────────────────────────── */

const view = { group: "all", q: "", hide: false };
const revealed = new Set();   // cards you've clicked open while meanings are hidden

$("groupChips").innerHTML = [{ id: "all", title: "All" }].concat(VOCAB_GROUPS)
  .map(g => '<button data-group="'+g.id+'" aria-pressed="'+(g.id === "all")+'">'+esc(g.title)+'</button>').join("");
document.querySelectorAll("[data-group]").forEach(b => b.onclick = () => {
  view.group = b.dataset.group;
  document.querySelectorAll("[data-group]").forEach(x => x.setAttribute("aria-pressed", x === b));
  renderBrowse();
});
$("q").addEventListener("input", e => { view.q = e.target.value.trim().toLowerCase(); renderBrowse(); });
$("hideMeaning").addEventListener("change", e => { view.hide = e.target.checked; revealed.clear(); renderBrowse(); });

function matches(w){
  if(view.group !== "all" && w.group !== view.group) return false;
  if(!view.q) return true;
  return [w.word, w.meaning, w.js, w.py, w.example, groupById[w.group].title].join(" ").toLowerCase().includes(view.q);
}

// The JS / Python lines. Always in the page, but hidden by CSS until twins are switched on.
function twinsHTML(w){
  if(!w.js && !w.py) return "";
  return '<div class="twin twins">'
    + (w.js ? '<span><b>JS</b> <code>'+esc(w.js)+'</code></span>' : "")
    + (w.py ? '<span><b>Python</b> <code>'+esc(w.py)+'</code></span>' : "")
    + '</div>';
}

function cardHTML(w, i){
  const hidden = view.hide && !revealed.has(i);
  const tag = view.hide ? "button" : "div";
  return '<'+tag+' class="word" data-i="'+i+'"'+(view.hide ? ' type="button" aria-label="Reveal '+esc(w.word)+'"' : "")+'>'
    + '<span class="w">'+esc(w.word)+'</span>'
    + '<p class="m'+(hidden ? " hidden" : "")+'">'+esc(w.meaning)+'</p>'
    + (hidden ? "" : twinsHTML(w))
    + '<pre>'+codeBlockHTML(w.example, VOCAB_TYPES)+'</pre>'
    + '</'+tag+'>';
}

function renderBrowse(){
  let shown = 0;
  $("groups").innerHTML = VOCAB_GROUPS.map(g => {
    const items = VOCAB_WORDS.map((w, i) => [w, i]).filter(([w]) => w.group === g.id && matches(w));
    shown += items.length;
    if(!items.length) return "";
    return '<section class="group"><h2>'+esc(g.title)+'<span>'+esc(g.ask)+'</span></h2>'
      + '<div class="words">'+items.map(([w, i]) => cardHTML(w, i)).join("")+'</div></section>';
  }).join("");
  $("empty").hidden = shown > 0;
  if(view.hide) document.querySelectorAll("button.word").forEach(b => b.onclick = () => {
    const i = Number(b.dataset.i);
    revealed.has(i) ? revealed.delete(i) : revealed.add(i);
    renderBrowse();
  });
}
renderBrowse();

/* ── Quiz ──────────────────────────────────────────────────── */

const ROUND_SIZE = 10;
let dir = "word";          // "word": see the word, pick the meaning. "meaning": see the meaning, pick the word.
let quizGroup = "all";
let round = [], qi = 0, score = 0, missed = [], answered = false;

$("quizGroup").innerHTML = '<option value="all">All groups</option>'
  + VOCAB_GROUPS.map(g => '<option value="'+g.id+'">'+esc(g.title)+'</option>').join("");
$("quizGroup").onchange = e => { quizGroup = e.target.value; startRound(); };
document.querySelectorAll("[data-dir]").forEach(b => b.onclick = () => {
  dir = b.dataset.dir;
  document.querySelectorAll("[data-dir]").forEach(x => x.setAttribute("aria-pressed", x === b));
  startRound();
});

function quizPool(){ return quizGroup === "all" ? VOCAB_WORDS : VOCAB_WORDS.filter(w => w.group === quizGroup); }

function startRound(words){
  round = words ? shuffle(words) : shuffle(quizPool()).slice(0, ROUND_SIZE);
  qi = 0; score = 0; missed = [];
  $("qResults").hidden = true; $("qCard").hidden = false;
  $("qCopyBox").hidden = true; $("qCopyStatus").hidden = true;
  showQuestion();
}

// Three wrong answers: same group first (harder, because they look alike), then anything else.
function distractors(w){
  const key = dir === "word" ? "meaning" : "word";
  const same = shuffle(VOCAB_WORDS.filter(x => x !== w && x.group === w.group));
  const other = shuffle(VOCAB_WORDS.filter(x => x !== w && x.group !== w.group));
  const picked = [], seen = new Set([w[key]]);
  for(const x of same.concat(other)){
    if(picked.length === 3) break;
    if(!seen.has(x[key])){ seen.add(x[key]); picked.push(x); }
  }
  return picked;
}

function showQuestion(){
  const w = round[qi];
  answered = false;
  $("qCount").textContent = (qi + 1) + " / " + round.length;
  $("qBar").style.width = (qi / round.length * 100) + "%";
  $("qScore").textContent = score + " correct";
  $("qGroup").textContent = groupById[w.group].title;

  const prompt = $("qPrompt");
  prompt.textContent = dir === "word" ? w.word : w.meaning;
  prompt.className = "prompt" + (dir === "word" ? "" : " text");
  $("qExample").hidden = dir !== "word";   // the example would give the word away in the other direction
  if(dir === "word") $("qExample").innerHTML = codeBlockHTML(w.example, VOCAB_TYPES);

  const key = dir === "word" ? "meaning" : "word";
  const options = shuffle([w].concat(distractors(w)));
  $("qOpts").innerHTML = options.map((o, n) =>
    '<button class="opt'+(dir === "meaning" ? " mono" : "")+'" id="opt-'+n+'" data-right="'+(o === w)+'">'+esc(o[key])+'</button>').join("");
  document.querySelectorAll(".opt").forEach(b => b.onclick = () => choose(b, w));

  $("qFeedback").hidden = true;
  $("qNext").hidden = true;
  $("qSkip").hidden = false;
}

// Marks the right option, shows the explanation and the Next button. Shared by choose() and skip().
function reveal(w, title, good){
  document.querySelectorAll(".opt").forEach(b => {
    b.disabled = true;
    if(b.dataset.right === "true") b.classList.add("right");
  });
  const fb = $("qFeedback");
  fb.className = "feedback " + (good ? "good" : "bad");
  fb.innerHTML = "<b>" + title + " <code>" + esc(w.word) + "</code></b>" + esc(w.meaning) + twinsHTML(w)
    + '<pre class="example">' + codeBlockHTML(w.example, VOCAB_TYPES) + "</pre>";
  fb.hidden = false;
  $("qScore").textContent = score + " correct";
  $("qSkip").hidden = true;
  $("qNext").textContent = qi === round.length - 1 ? "See results" : "Next";
  $("qNext").hidden = false;
  $("qNext").focus();
}

// "I don't know": counts as a miss (labelled skipped), and shows the answer straight away.
function skip(){
  if(answered) return;
  answered = true;
  const w = round[qi];
  missed.push({ w, picked: "(skipped)", skipped: true });
  reveal(w, "Skipped. Here it is:", false);
}
$("qSkip").onclick = skip;

function choose(btn, w){
  if(answered) return;
  answered = true;
  const ok = btn.dataset.right === "true";
  if(ok) score++; else missed.push({ w, picked: btn.textContent });
  if(!ok) btn.classList.add("wrong");
  reveal(w, ok ? "Correct." : "Not quite.", ok);
}

$("qNext").onclick = () => {
  if(qi < round.length - 1){ qi++; showQuestion(); return; }
  $("qBar").style.width = "100%";
  $("qCard").hidden = true; $("qResults").hidden = false;
  $("qFinal").textContent = score + " / " + round.length;
  $("qMissed").innerHTML = missed.map(m => '<li><code>'+esc(m.w.word)+'</code>'+(m.skipped ? ' <span class="skipped">skipped</span>' : "")+': '+esc(m.w.meaning)+'</li>').join("");
  $("qRetry").hidden = missed.length === 0;
};
$("qRetry").onclick = () => startRound(missed.map(m => m.w));
$("qRestart").onclick = () => startRound();

function report(){
  let t = "Swift Vocabulary quiz results\n";
  t += "Direction: " + (dir === "word" ? "word → meaning" : "meaning → word") + "\n";
  t += "Group: " + (quizGroup === "all" ? "all" : groupById[quizGroup].title) + "\n";
  t += "Score: " + score + " / " + round.length + "\n\n";
  const skipped = missed.filter(m => m.skipped), wrong = missed.filter(m => !m.skipped);
  if(wrong.length){
    t += "=== WRONG (" + wrong.length + ") ===\n";
    wrong.forEach(m => { t += "- " + m.w.word + " | right answer: " + (dir === "word" ? m.w.meaning : m.w.word) + " | I picked: " + m.picked + "\n"; });
    t += "\n";
  }
  if(skipped.length){
    t += "=== SKIPPED, DIDN'T KNOW (" + skipped.length + ") ===\n";
    skipped.forEach(m => { t += "- " + m.w.word + " | " + m.w.meaning + "\n"; });
  }
  return t;
}
$("qCopy").onclick = () => copyForClaude(report(), $("qCopyBox"), $("qCopyStatus"));

// Keys in the quiz: 1-4 pick an option, s skips, Enter goes to the next question.
document.addEventListener("keydown", e => {
  if($("quiz").hidden || $("qCard").hidden || e.metaKey || e.ctrlKey || e.altKey) return;
  if(e.target.closest("input, textarea, select")) return;
  if(!answered && /^[1-4]$/.test(e.key)){ const b = $("opt-" + (Number(e.key) - 1)); if(b){ e.preventDefault(); b.click(); } }
  else if(!answered && e.key === "s"){ e.preventDefault(); skip(); }
});

mountReferencePanel();
