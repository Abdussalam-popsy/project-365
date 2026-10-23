// The reference popup: a "Cheat sheet" button in the top bar (see mountTopbar in shared.js) that opens a side panel.
// Tab 1 is the cheat sheet. Tab 2, "Your answers", appears when the page passes a `history` function.
//
//   mountReferencePanel();                          // cheat sheet only
//   mountReferencePanel({ history: () => [...] });  // plus the answers tab
//
// `history` returns an array of HTML strings, newest first. It runs every time the panel opens,
// so it always shows what you've answered so far.

function mountReferencePanel(options = {}){
  const history = options.history || null;
  let tab = "cheat";

  $("topActions").insertAdjacentHTML("afterbegin",
    '<button class="btn ref-open" id="refOpen" type="button" aria-haspopup="dialog" aria-controls="ref">Cheat sheet<kbd>?</kbd></button>');
  document.body.insertAdjacentHTML("beforeend",
    '<dialog class="ref" id="ref" aria-label="Reference">'
    +   '<div class="ref-head">'
    +     (history
          ? '<div class="ref-tabs" role="tablist">'
            + '<button role="tab" id="refTab-cheat" data-tab="cheat" aria-selected="true">Cheat sheet</button>'
            + '<button role="tab" id="refTab-history" data-tab="history" aria-selected="false">Your answers <span class="ref-count" id="refCount"></span></button>'
            + '</div>'
          : '<h2 class="ref-title">Cheat sheet</h2>')
    +     '<button class="ref-close" id="refClose" aria-label="Close">✕</button>'
    +   '</div>'
    +   '<div class="ref-body">'
    +     '<div id="refCheat">'
    +       '<input class="search" id="refQ" type="search" placeholder="Filter, e.g. private(set)" aria-label="Filter techniques" autocomplete="off" spellcheck="false">'
    +       '<div class="cs-box" id="refGroups">' + cheatsheetHTML() + '</div>'
    +       '<p class="empty" id="refEmpty" hidden>No technique matches that.</p>'
    +     '</div>'
    +     '<div id="refHistory" hidden></div>'
    +   '</div>'
    + '</dialog>');

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
    $("refHistory").hidden = name !== "history";
    dialog.querySelectorAll(".ref-tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
  }

  function open(){
    renderHistory();
    showTab(tab);
    dialog.showModal();
    $("refClose").focus({preventScroll:true});
  }

  $("refOpen").onclick = open;
  $("refClose").onclick = () => dialog.close();
  // A click that lands on the dialog itself (not its contents) is a click on the dimmed backdrop.
  dialog.addEventListener("click", e => { if(e.target === dialog) dialog.close(); });
  dialog.querySelectorAll(".ref-tabs button").forEach(b => b.onclick = () => showTab(b.dataset.tab));
  $("refQ").addEventListener("input", e => { $("refEmpty").hidden = filterCheatsheet($("refGroups"), e.target.value) > 0; });

  // "?" opens or closes it, unless you're typing in a blank, the editor or the filter box.
  document.addEventListener("keydown", e => {
    if(e.key !== "?" || e.metaKey || e.ctrlKey) return;
    if(e.target.closest("input, textarea, [contenteditable]")) return;
    e.preventDefault();
    if(dialog.open) dialog.close(); else open();
  });
}
