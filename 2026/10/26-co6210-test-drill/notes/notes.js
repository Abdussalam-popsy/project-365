// Study notes: key facts per topic, then that topic's questions with the answer behind a <details>.
// Shares the drill's selected weeks, so filtering here filters there too.

let noteWeeks = store.get("weeks", [1, 2, 3]);

const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function questionHTML(q){
  return '<details class="qa"><summary><span class="qmeta"><span class="tag">W' + q.wk + '</span>'
    + (q.lec ? '<span class="tag lec">From Richard</span>' : "") + '</span>'
    + '<span class="qq">' + esc(q.q) + '</span></summary>'
    + '<ol class="qopts" type="A">' + q.opts.map((o, i) => '<li' + (i === q.a ? ' class="right"' : "") + '>' + esc(o) + '</li>').join("") + '</ol>'
    + '<p class="qwhy"><b>Answer: ' + esc(q.opts[q.a]) + '.</b> ' + esc(q.why) + '</p></details>';
}

function topicHTML(t, qs){
  return '<section class="topic" id="' + slug(t) + '">'
    + '<div class="thead"><h2>' + esc(t) + '</h2><a class="drill-link" href="../drill/?topic=' + encodeURIComponent(t) + '">Drill this topic →</a></div>'
    + '<ul class="facts">' + (FACTS[t] || []).map(f => '<li>' + esc(f) + '</li>').join("") + '</ul>'
    + '<div class="label">' + qs.length + ' question' + (qs.length === 1 ? "" : "s") + '</div>'
    + qs.map(questionHTML).join("")
    + '</section>';
}

function renderNotes(){
  $("#weeks").innerHTML = [1, 2, 3].map(w =>
    '<button class="chip" aria-pressed="' + noteWeeks.includes(w) + '" data-w="' + w + '">Week ' + w + ' · ' + WEEK_NAMES[w] + '</button>').join("");
  $("#weeks").querySelectorAll(".chip").forEach(b => b.onclick = () => {
    const w = +b.dataset.w;
    const next = noteWeeks.includes(w) ? noteWeeks.filter(x => x !== w) : [...noteWeeks, w].sort();
    noteWeeks = next.length ? next : [w];
    store.set("weeks", noteWeeks);
    renderNotes();
  });

  const shown = TOPIC_ORDER
    .map(t => ({ t, qs: QUESTIONS.filter(q => q.topic === t && noteWeeks.includes(q.wk)) }))
    .filter(x => x.qs.length);
  $("#toc").innerHTML = shown.map(x => '<a href="#' + slug(x.t) + '">' + esc(x.t) + ' <span>' + x.qs.length + '</span></a>').join("");
  $("#topics").innerHTML = shown.map(x => topicHTML(x.t, x.qs)).join("");
}
