// The reference popup: two buttons in the top bar (see mountTopbar in shared.js) open a side panel.
//   "Cheat sheet" (or the ? key)   opens the Techniques tab: what changed → technique name
//   "Swift basics" (or the b key)  opens the Swift basics tab: side-by-side comparison tables
// A third tab, "Your answers", appears when the page passes a `history` function.
//
//   mountReferencePanel();                          // Techniques + Swift basics
//   mountReferencePanel({ history: () => [...] });  // plus the answers tab
//
// `history` returns an array of HTML strings, newest first. It runs every time the panel opens,
// so it always shows what you've answered so far.
// Needs cheatsheet/techniques.js, cheatsheet/basics.js and cheatsheet/render.js loaded first.

function mountReferencePanel(options = {}){
  const history = options.history || null;
  let tab = "cheat";

  $("topActions").insertAdjacentHTML("afterbegin",
    '<button class="btn ref-open" id="refOpen" type="button" aria-haspopup="dialog" aria-controls="ref">Cheat sheet<kbd>?</kbd></button>'
    + '<button class="btn ref-open" id="refOpenBasics" type="button" aria-haspopup="dialog" aria-controls="ref">Swift basics<kbd>b</kbd></button>');
  document.body.insertAdjacentHTML("beforeend",
    '<dialog class="ref" id="ref" aria-label="Reference">'
    +   '<div class="ref-head">'
    +     '<div class="ref-tabs" role="tablist">'
    +       '<button role="tab" id="refTab-cheat" data-tab="cheat" aria-selected="true">Techniques</button>'
    +       '<button role="tab" id="refTab-basics" data-tab="basics" aria-selected="false">Swift basics</button>'
    +       (history ? '<button role="tab" id="refTab-history" data-tab="history" aria-selected="false">Your answers <span class="ref-count" id="refCount"></span></button>' : '')
    +     '</div>'
    +     '<button class="ref-close" id="refClose" aria-label="Close">✕</button>'
    +   '</div>'
    +   '<div class="ref-body">'
    +     '<div id="refCheat">'
    +       '<input class="search" id="refQ" type="search" placeholder="Filter, e.g. private(set)" aria-label="Filter techniques" autocomplete="off" spellcheck="false">'
    +       '<div class="cs-box" id="refGroups">' + cheatsheetHTML() + '</div>'
    +       '<p class="empty" id="refEmpty" hidden>No technique matches that.</p>'
    +     '</div>'
    +     '<div id="refBasics" hidden>'
    +       '<input class="search" id="refBQ" type="search" placeholder="Filter, e.g. dictionary, guard" aria-label="Filter Swift basics" autocomplete="off" spellcheck="false">'
    +       '<div id="refBasicsBody">' + basicsHTML() + '</div>'
    +       '<p class="empty" id="refBEmpty" hidden>No table matches that.</p>'
    +     '</div>'
    +     (history ? '<div id="refHistory" hidden></div>' : '')
    +   '</div>'
    + '</dialog>');
  bindTwinsToggles();

  const dialog = $("ref");

  function renderHistory(){
    if(!history) return;
    const items = history();
    $("refCount").textContent = items.length ? String(items.length) : "";
    $("refHistory").innerHTML = items.length
      ? '<ol class="ref-answers">' + items.join("") + '</ol>'
      : '<p class="empty">Nothing answered yet this round. Check an answer and it shows up here.</p>';
  }

  function showTab(name){
    tab = name;
    $("refCheat").hidden = name !== "cheat";
    $("refBasics").hidden = name !== "basics";
    if(history) $("refHistory").hidden = name !== "history";
    dialog.querySelectorAll(".ref-tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
  }

  function open(which){
    renderHistory();
    showTab(which || tab);
    if(!dialog.open) dialog.showModal();
    $("refClose").focus({preventScroll:true});
  }

  $("refOpen").onclick = () => open("cheat");
  $("refOpenBasics").onclick = () => open("basics");
  $("refClose").onclick = () => dialog.close();
  // A click that lands on the dialog itself (not its contents) is a click on the dimmed backdrop.
  dialog.addEventListener("click", e => { if(e.target === dialog) dialog.close(); });
  dialog.querySelectorAll(".ref-tabs button").forEach(b => b.onclick = () => showTab(b.dataset.tab));
  $("refQ").addEventListener("input", e => { $("refEmpty").hidden = filterCheatsheet($("refGroups"), e.target.value) > 0; });
  $("refBQ").addEventListener("input", e => { $("refBEmpty").hidden = filterBasics($("refBasicsBody"), e.target.value) > 0; });

  // "?" opens Techniques, "b" opens Swift basics. Pressing the same key again closes it.
  // Ignored while you're typing in a blank, the editor or a filter box.
  document.addEventListener("keydown", e => {
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    const which = e.key === "?" ? "cheat" : e.key === "b" ? "basics" : null;
    if(!which) return;
    if(e.target.closest("input, textarea, select, [contenteditable]")) return;
    e.preventDefault();
    if(dialog.open && tab === which) dialog.close(); else open(which);
  });
}
