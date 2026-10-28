// The full Cheat Sheet page: Techniques (what changed → technique name) and Swift basics (comparison tables).
// The filter box searches whichever view is showing. Open with #basics in the URL to land on Swift basics.

$("groups").innerHTML = cheatsheetHTML();
$("basics").innerHTML = basicsHTML();
bindTwinsToggles();

let view = location.hash === "#basics" ? "basics" : "tech";

function applyFilter(){
  const q = $("q").value;
  const shown = view === "tech" ? filterCheatsheet($("groups"), q) : filterBasics($("basics"), q);
  $("empty").hidden = shown > 0;
}

function showView(v){
  view = v;
  $("techView").hidden = v !== "tech";
  $("basicsView").hidden = v !== "basics";
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
  $("title").textContent = v === "tech" ? "What changed → technique name" : "Swift basics";
  $("total").textContent = v === "tech" ? TECHNIQUES.length + " techniques" : BASICS.length + " comparison tables";
  $("q").placeholder = v === "tech" ? "Filter, e.g. private(set)" : "Filter, e.g. dictionary, guard";
  applyFilter();
}

document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => showView(b.dataset.view));
$("q").addEventListener("input", applyFilter);
showView(view);
