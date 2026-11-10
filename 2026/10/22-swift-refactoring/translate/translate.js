// Translate: browse the words, or quiz yourself with instant right or wrong.
// Two question types: "what does this word mean?" and "what does your course call it?".

const NOT_ON_LIST = "Not on your course list";
const ROUND = 12;

// ── The list ──
let kindFilter = "all";

function renderList(){
  const items = WORDS.filter(w => kindFilter === "all" || w.kind === kindFilter);
  $("tlist").innerHTML = items.map(w =>
    '<li class="card titem ' + w.kind + '">'
    + '<span class="tag">' + esc(KIND_LABEL[w.kind]) + '</span>'
    + '<h3>' + esc(w.word) + '</h3>'
    + '<p class="plain">' + esc(w.plain) + '</p>'
    + (w.course ? '<p class="course"><span>Course name</span><b>' + esc(w.course) + '</b></p>'
                : (w.kind !== "swift" ? '<p class="course off"><span>Course name</span><b>' + NOT_ON_LIST + '</b></p>' : ''))
    + (w.bonus ? '<p class="bonus">' + esc(w.bonus) + '</p>' : '')
    + (w.where ? '<p class="where"><span>In Monopoly</span>' + esc(w.where) + '</p>' : '')
    + '</li>').join("");
}

document.querySelectorAll(".kinds button").forEach(b => b.onclick = () => {
  kindFilter = b.dataset.kind;
  document.querySelectorAll(".kinds button").forEach(x => x.setAttribute("aria-pressed", x === b));
  renderList();
});

// ── Quiz ──
const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const COURSE_NAMES = [...new Set(WORDS.map(w => w.course).filter(Boolean))];

// Every possible question, built once.
function allQuestions(){
  const qs = [];
  WORDS.forEach(w => {
    // What does it mean?
    const wrongPlain = shuffle(WORDS.filter(o => o !== w && o.plain !== w.plain).map(o => o.plain)).slice(0, 3);
    qs.push({ id: w.word + "/meaning", w, tag: "What does it mean?",
      text: w.word, answer: w.plain, options: shuffle([w.plain, ...wrongPlain]) });
    // What does your course call it? (smells and fixes only)
    if(w.kind !== "swift" && w.word !== "Code smell"){
      const answer = w.course || NOT_ON_LIST;
      const pool = COURSE_NAMES.filter(n => n !== answer);
      const wrong = shuffle(pool).slice(0, answer === NOT_ON_LIST ? 3 : 2);
      if(answer !== NOT_ON_LIST) wrong.push(NOT_ON_LIST);
      qs.push({ id: w.word + "/course", w, tag: "Your course calls it",
        text: w.word + ": " + w.plain, answer, options: shuffle([answer, ...wrong]) });
    }
  });
  return qs;
}

let deck = [], pos = 0, right = 0, log = [];

function startRound(list){
  deck = list; pos = 0; right = 0; log = [];
  $("done").hidden = true; $("qcard").hidden = false;
  roundBegin("translate/start");
  showQ();
}

function showQ(){
  const q = deck[pos];
  $("count").textContent = (pos + 1) + " / " + deck.length;
  $("bar").style.width = (pos / deck.length * 100) + "%";
  $("score").textContent = right + " right";
  $("qtag").textContent = q.tag;
  $("qtext").textContent = q.text;
  $("qfb").hidden = true; $("nextBtn").hidden = true;
  $("opts").innerHTML = q.options.map((o, i) =>
    '<button class="opt" data-i="' + i + '"><span class="dot"></span><span>' + esc(o) + '</span></button>').join("");
  $("opts").querySelectorAll(".opt").forEach(b => b.onclick = () => answer(q, q.options[+b.dataset.i], b));
}

function answer(q, pick, btn){
  roundTouched();
  const ok = pick === q.answer;
  if(ok) right++;
  log.push({ q, pick, ok });
  $("opts").querySelectorAll(".opt").forEach(b => {
    b.disabled = true;
    if(q.options[+b.dataset.i] === q.answer) b.classList.add("right");
  });
  if(!ok) btn.classList.add("wrong");
  const fb = $("qfb");
  fb.className = "feedback " + (ok ? "good" : "bad");
  fb.innerHTML = '<b>' + (ok ? "Right." : "Not quite. It's: " + esc(q.answer)) + '</b>'
    + esc(q.w.word) + ': ' + esc(q.w.plain)
    + (q.w.course ? '<br>Course name: <b class="inline">' + esc(q.w.course) + '</b>' : '')
    + (q.w.bonus ? '<br>' + esc(q.w.bonus) : '');
  fb.hidden = false;
  $("score").textContent = right + " right";
  $("nextBtn").hidden = false;
  $("nextBtn").textContent = pos + 1 < deck.length ? "Next" : "See results";
  $("nextBtn").focus();
}

$("nextBtn").onclick = () => { pos++; pos < deck.length ? showQ() : finish(); };

function finish(){
  $("qcard").hidden = true; $("done").hidden = false;
  $("bar").style.width = "100%";
  $("final").textContent = right + " / " + deck.length;
  const misses = log.filter(x => !x.ok);
  try { localStorage.setItem("translate-misses", JSON.stringify(misses.map(x => x.q.id))); } catch(e){}
  $("review").innerHTML = misses.length
    ? '<p class="rev-h">What you missed</p><ul class="rev">' + misses.map(x =>
        '<li><span class="pair">' + esc(x.q.w.word) + ': <s>' + esc(x.pick) + '</s> → <em>' + esc(x.q.answer) + '</em></span>'
        + '<span class="why">' + esc(x.q.tag) + '</span></li>').join("") + '</ul>'
    : '<p class="sub">Clean round. Try another, the questions shuffle.</p>';
  $("againMiss").hidden = !misses.length;
  trackRound("translate", right, deck.length, misses.map(x => x.q.id));
}

$("againMiss").onclick = () => startRound(shuffle(log.filter(x => !x.ok).map(x => x.q)));
$("againAll").onclick = () => startRound(shuffle(allQuestions()).slice(0, ROUND));
$("copyBtn").onclick = () => copyForClaude(report(), $("copyBox"), $("copyStatus"));

function report(){
  const misses = log.filter(x => !x.ok);
  return "Translate round (refactoring words in plain English): " + right + "/" + deck.length + "\n\n"
    + (misses.length ? "Missed:\n" + misses.map(x => "- " + x.q.w.word + " [" + x.q.tag + "]: I picked \"" + x.pick + "\", answer \"" + x.q.answer + "\"").join("\n")
                     : "No misses.")
    + "\n\nPlease explain the ones I missed in plain English with a Monopoly example.";
}

// ── Mode switch ──
document.querySelectorAll(".modes button").forEach(b => b.onclick = () => {
  const quiz = b.dataset.mode === "quiz";
  document.querySelectorAll(".modes button").forEach(x => x.setAttribute("aria-pressed", x === b));
  $("listView").hidden = quiz; $("quizView").hidden = !quiz;
  if(quiz && !deck.length) startRound(shuffle(allQuestions()).slice(0, ROUND));
});

renderList();
mountReferencePanel();
