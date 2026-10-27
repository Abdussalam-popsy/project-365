// The test drill: pick weeks and a mode, answer, then see results by topic with "Copy results for Claude".
// Open with ?topic=Laws%20of%20UX to practise one topic (the study notes link here that way).

const MODE_NAMES = { lec:"Richard's questions", all:"Practice all", exam:"Mock test", q10:"Quick 10", miss:"My misses", retry:"Retry misses", topic:"Topic practice" };
const EXAM_SIZE = 30;
const QUICK_SIZE = 10;

const app = $("#app");
let weeks = store.get("weeks", [1, 2, 3]);
let missed = new Set(store.get("missed", []));
let topic = new URLSearchParams(location.search).get("topic");
if(topic && !TOPIC_ORDER.includes(topic)) topic = null;
let S = null; // the round in progress

function pool(){ return QUESTIONS.filter(q => weeks.includes(q.wk) && (!topic || q.topic === topic)); }
function saveMissed(){ store.set("missed", [...missed]); }

function home(){
  S = null;
  const p = pool(), lec = p.filter(q => q.lec), miss = p.filter(q => missed.has(q.id));
  const wk = w => '<button class="chip" aria-pressed="' + weeks.includes(w) + '" data-w="' + w + '">Week ' + w + ' · ' + WEEK_NAMES[w] + '</button>';
  const mode = (m, title, text, n, extra) =>
    '<button class="mode ' + (extra || "") + '" data-m="' + m + '" ' + (n ? "" : "disabled") + '><b>' + title + '</b><span>' + text + '</span><span class="n">' + n + '</span></button>';
  app.innerHTML = `
  <header>
    <div class="eyebrow">CO6210 · Weeks 1 to 3</div>
    <h1>Test <em>drill</em></h1>
    <p class="lede">Pick the weeks, then a mode. Use <kbd>A</kbd>–<kbd>D</kbd> to answer and <kbd>Enter</kbd> for next.</p>
  </header>
  ${topic ? `<section><div class="topic-note">Only <b>${esc(topic)}</b> questions. <button id="allTopics">Show all topics</button></div></section>` : ""}
  <section>
    <div class="label">Weeks</div>
    <div class="chips">${wk(1)}${wk(2)}${wk(3)}</div>
  </section>
  <section>
    <div class="label">Mode</div>
    <div class="modes">
      ${mode("lec", "Richard's questions", "The questions from his slides, with his answer key. Most likely to reappear.", lec.length && lec.length + " questions · instant feedback", "primary")}
      ${mode("all", "Practice all", "Everything in the selected weeks, shuffled. Explanation after each answer.", p.length && p.length + " questions · instant feedback")}
      ${mode("exam", "Mock test", "30 random questions, marked like Friday: +1 right, −⅓ wrong, 0 blank. Skip and come back.", p.length && Math.min(EXAM_SIZE, p.length) + " questions · timed · negative marking")}
      ${mode("q10", "Quick 10", "Ten random questions. Good for a last check before you walk in.", p.length && Math.min(QUICK_SIZE, p.length) + " questions")}
      ${mode("miss", "My misses", "Only questions you got wrong before. Right answers drop off the list.", miss.length && miss.length + " saved")}
    </div>
  </section>`;
  app.querySelectorAll(".chip").forEach(b => b.onclick = () => {
    const w = +b.dataset.w;
    const next = weeks.includes(w) ? weeks.filter(x => x !== w) : [...weeks, w].sort();
    weeks = next.length ? next : [w];   // always keep at least one week
    store.set("weeks", weeks); home();
  });
  app.querySelectorAll(".mode").forEach(b => b.onclick = () => start(b.dataset.m));
  const all = $("#allTopics");
  if(all) all.onclick = () => { topic = null; history.replaceState(null, "", location.pathname); home(); };
}

function pickQuestions(m){
  const p = pool();
  if(m === "lec") return shuffle(p.filter(q => q.lec));
  if(m === "exam") return shuffle(p).slice(0, EXAM_SIZE);
  if(m === "q10") return shuffle(p).slice(0, QUICK_SIZE);
  if(m === "miss") return shuffle(p.filter(q => missed.has(q.id)));
  return shuffle(p);
}

function start(m, list){
  const qs = list || pickQuestions(m);
  if(!qs.length) return;
  S = { mode: m, exam: m === "exam", qs: qs.map(q => ({ ...q, order: shuffle([0, 1, 2, 3]) })), i: 0, answers: [], t0: Date.now() };
  render();
  window.scrollTo(0, 0);
}

function clock(){ const s = Math.floor((Date.now() - S.t0) / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
setInterval(() => { const c = $("#clock"); if(c && S) c.textContent = clock(); }, 1000);

function optionHTML(q, ans, showFb, oi, k){
  let cls = "opt";
  if(ans !== undefined){
    if(showFb){ if(oi === q.a) cls += " right"; else if(oi === ans) cls += " wrong"; }
    else if(oi === ans) cls += " picked";
  }
  return '<button class="' + cls + '" id="opt' + k + '" data-o="' + oi + '" ' + (showFb ? "disabled" : "") + '><span class="k">' + "ABCD"[k] + '</span><span>' + esc(q.opts[oi]) + '</span></button>';
}

function render(){
  const q = S.qs[S.i], ans = S.answers[S.i], done = ans !== undefined;
  const showFb = done && !S.exam;
  const last = S.i === S.qs.length - 1;
  app.innerHTML = `
  <div class="qbar">
    <button class="quit" id="quit">Exit</button>
    <div class="track"><i style="width:${(S.i / S.qs.length) * 100}%"></i></div>
    <div class="count">${S.i + 1} / ${S.qs.length}${S.exam ? ' · <span id="clock">' + clock() + '</span>' : ""}</div>
  </div>
  <div class="qmeta"><span class="tag">Week ${q.wk}</span><span class="tag">${esc(q.topic)}</span>${q.lec ? '<span class="tag lec">From Richard</span>' : ""}</div>
  <div class="qtext" id="qtext">${esc(q.q)}</div>
  <div class="opts" role="group" aria-labelledby="qtext">${q.order.map((oi, k) => optionHTML(q, ans, showFb, oi, k)).join("")}</div>
  ${showFb ? `<div class="why ${ans === q.a ? "" : "no"}" role="status"><b>${ans === q.a ? "Correct." : "Answer: " + esc(q.opts[q.a])}</b><p>${esc(q.why)}</p></div>` : ""}
  <div class="actions">
    ${S.exam && S.i > 0 ? '<button class="btn ghost" id="prev">Back</button>' : ""}
    ${S.exam ? examButtons(done) : `<button class="btn" id="next" ${done ? "" : "disabled"}>${last ? "See results" : "Next"}</button>`}
  </div>
  ${S.exam ? examNav() : ""}
  <p class="hint">Keys: <kbd>A</kbd>–<kbd>D</kbd> or <kbd>1</kbd>–<kbd>4</kbd> to answer, <kbd>Enter</kbd> for ${S.exam ? "next or skip" : "next"}.</p>`;
  app.querySelectorAll(".opt").forEach(b => b.onclick = () => pick(+b.dataset.o));
  $("#next").onclick = next;
  $("#quit").onclick = () => { if(S.answers.some(a => a !== undefined)) results(); else home(); };
  const prev = $("#prev");
  if(prev) prev.onclick = () => { S = { ...S, i: S.i - 1 }; render(); };
  if(S.exam){
    app.querySelectorAll(".nq").forEach(b => b.onclick = () => { S = { ...S, i: +b.dataset.j }; render(); });
    $("#finish").onclick = results;
    const clear = $("#clear");
    if(clear) clear.onclick = () => { const answers = S.answers.slice(); answers[S.i] = undefined; S = { ...S, answers }; render(); };
  }
}

// Mock test only. Like Friday: a blank scores 0, a wrong answer scores −⅓, so skipping is allowed.
function examButtons(done){
  return (done ? '<button class="btn ghost" id="clear">Clear answer</button>' : "")
    + '<button class="btn" id="next">' + (done ? "Next" : "Skip") + '</button>'
    + '<button class="btn ghost" id="finish">Finish test</button>';
}
function examNav(){
  const answered = S.answers.filter(a => a !== undefined).length;
  return '<div class="nav" aria-label="Jump to question">' + S.qs.map((x, j) => {
    const a = S.answers[j] !== undefined;
    return '<button class="nq' + (a ? " a" : "") + (j === S.i ? " cur" : "") + '" data-j="' + j + '" aria-label="Question ' + (j + 1) + (a ? ", answered" : ", blank") + '">' + (j + 1) + '</button>';
  }).join("") + '</div>'
    + '<p class="hint">' + answered + ' answered · ' + (S.qs.length - answered) + ' blank. Blank scores 0, wrong scores −⅓.</p>';
}

function pick(o){
  if(!S || S.finished) return;
  if(S.answers[S.i] !== undefined && !S.exam) return;
  const answers = S.answers.slice(); answers[S.i] = o;
  S = { ...S, answers };
  const q = S.qs[S.i];
  if(!S.exam){
    if(o === q.a) missed.delete(q.id); else missed.add(q.id);
    saveMissed();
  }
  render();
  if(!S.exam) $("#next").focus();
}

function next(){
  if(S.answers[S.i] === undefined && !S.exam) return;
  if(S.i < S.qs.length - 1){ S = { ...S, i: S.i + 1 }; render(); window.scrollTo(0, 0); return; }
  // End of a mock test: send them back to the first blank once, the way you'd check before handing in.
  const firstBlank = S.qs.findIndex((x, j) => S.answers[j] === undefined);
  if(S.exam && firstBlank >= 0 && !S.wrapped){
    S = { ...S, i: firstBlank, wrapped: true }; render(); window.scrollTo(0, 0);
    toast("Back to your first blank: question " + (firstBlank + 1));
    return;
  }
  results();
}

// Score per topic, weakest first.
function topicScores(qs, answers){
  const by = {};
  qs.forEach((q, i) => {
    if(answers[i] === undefined) return;
    const t = by[q.topic] || { r: 0, n: 0 };
    by[q.topic] = { r: t.r + (answers[i] === q.a ? 1 : 0), n: t.n + 1 };
  });
  const topics = TOPIC_ORDER.filter(t => by[t]).sort((a, b) => by[a].r / by[a].n - by[b].r / by[b].n);
  return { by, topics };
}

function verdictFor(pc, weak){
  if(pc >= 85) return "Ready. Skim the misses below and stop there.";
  if(pc >= 70) return "Close. Spend ten minutes on " + (weak.slice(0, 2).join(" and ") || "your misses") + " and run it again.";
  return "Not there yet. Go through " + (weak.slice(0, 3).join(", ") || "the misses") + " in the study notes first, then retry the misses.";
}

function results(){
  const { qs, answers } = S;
  const n = answers.filter(a => a !== undefined).length;
  if(S.exam){
    qs.forEach((q, i) => { const a = answers[i]; if(a === undefined) return; if(a === q.a) missed.delete(q.id); else missed.add(q.id); });
    saveMissed();
  }
  const right = qs.filter((q, i) => answers[i] === q.a).length;
  const pc = n ? Math.round(right / n * 100) : 0;
  const { by, topics } = topicScores(qs, answers);
  const wrong = qs.map((q, i) => ({ q, a: answers[i] })).filter(x => x.a !== undefined && x.a !== x.q.a);
  const weak = topics.filter(t => by[t].r / by[t].n < 0.7);
  const mins = Math.round((Date.now() - S.t0) / 60000);
  const modeName = MODE_NAMES[S.mode] + (topic ? " (" + topic + ")" : "");
  // Friday's marking: +1 right, −⅓ wrong, 0 blank.
  const wrongN = n - right, blank = qs.length - n, net = right - wrongN / 3;
  const markLine = "Negative-marked: " + net.toFixed(1) + " / " + qs.length + " (" + Math.max(0, Math.round(net / qs.length * 100)) + "%) · "
    + right + " right, " + wrongN + " wrong (−" + (wrongN / 3).toFixed(1) + "), " + blank + " blank";
  const verdict = S.exam && wrongN / 3 >= 2
    ? "Wrong answers cost you " + (wrongN / 3).toFixed(1) + " marks. On Friday, only answer when you can rule out at least one option."
    : verdictFor(pc, weak);
  const copyText = [
    "CO6210 drill results: " + right + "/" + n + " (" + pc + "%) · " + modeName + " · weeks " + weeks.join(", ") + " · " + mins + " min",
    markLine,
    "By topic: " + topics.map(t => t + " " + by[t].r + "/" + by[t].n).join(" · "),
    wrong.length ? "Missed:" : "No misses.",
    ...wrong.map(x => "- [W" + x.q.wk + " " + x.q.topic + "] " + x.q.q + " | I picked: " + x.q.opts[x.a] + " | Correct: " + x.q.opts[x.q.a])
  ].join("\n");

  app.innerHTML = `
  <header>
    <div class="eyebrow">${esc(modeName)} · Weeks ${weeks.join(", ")}</div>
    <div class="score"><span class="big">${pc}%</span><span class="of">${right} of ${n} correct${n < qs.length ? " · stopped at " + n : ""}</span></div>
    <p class="netline">${esc(markLine)}</p>
    <p class="verdict">${esc(verdict)}</p>
  </header>
  <div class="actions">
    ${wrong.length ? `<button class="btn" id="retry">Retry ${wrong.length} missed</button>` : ""}
    <button class="btn ghost" id="copy">Copy results for Claude</button>
    <button class="btn ghost" id="again">Back to modes</button>
  </div>
  <textarea class="copybox" id="copybox" readonly hidden>${esc(copyText)}</textarea>
  <section>
    <div class="label">By topic, weakest first</div>
    <div class="topics">${topics.map(t => {
      const r = by[t].r / by[t].n;
      const col = r >= .85 ? "var(--good)" : r >= .6 ? "var(--ink)" : "var(--bad)";
      return `<div class="trow"><span>${esc(t)}</span><span class="tb"><i style="width:${r * 100}%;background:${col}"></i></span><span class="pc">${by[t].r}/${by[t].n}</span></div>`;
    }).join("")}</div>
  </section>
  ${wrong.length ? `<section><div class="label">What you missed</div>${wrong.map(x => `
    <div class="miss"><div class="tag">W${x.q.wk} · ${esc(x.q.topic)}</div>
    <div class="q">${esc(x.q.q)}</div>
    <div class="you">You: ${esc(x.q.opts[x.a])}</div>
    <div class="ans">Answer: ${esc(x.q.opts[x.q.a])}</div>
    <div class="ex">${esc(x.q.why)}</div></div>`).join("")}</section>` : ""}`;

  const retry = $("#retry");
  if(retry) retry.onclick = () => start("retry", shuffle(wrong.map(x => QUESTIONS.find(q => q.id === x.q.id))));
  $("#again").onclick = home;
  $("#copy").onclick = () => {
    const fallback = () => { const t = $("#copybox"); t.hidden = false; t.focus(); t.select(); toast("Select and copy the text below."); };
    try { navigator.clipboard.writeText(copyText).then(() => toast("Copied. Paste it into Claude."), fallback); }
    catch(err){ fallback(); }
  };
  S = { ...S, finished: true };
  window.scrollTo(0, 0);
}

document.addEventListener("keydown", e => {
  if(!S || S.finished || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const idx = "abcd".includes(k) ? "abcd".indexOf(k) : "1234".indexOf(k);
  if(k.length === 1 && idx >= 0){
    const b = $("#opt" + idx);
    if(b && !b.disabled){ e.preventDefault(); pick(+b.dataset.o); }
  } else if(e.key === "Enter" && (S.answers[S.i] !== undefined || S.exam)
      && !["quit", "finish", "clear", "prev"].includes(document.activeElement?.id)
      && !document.activeElement?.classList.contains("nq")){
    e.preventDefault(); next();
  }
});

function boot(){ home(); }
