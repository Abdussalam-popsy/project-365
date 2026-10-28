// Builds the cheat sheet HTML from techniques.js. Used by the full Cheat Sheet page and by the popup on every other page.
// Layout copies the spreadsheet: one table, a dark header row, a coloured band per group, the technique in its own bold column.

function codeBits(text){
  // Wrap Swift words and symbols people should look for in <code>.
  return esc(text).replace(/\b(func|let|var|private\(set\)|private|protocol|enum|set\.\.\.)(?=[\s,./]|$)|(\[ \]|\( \))/g, m => "<code>" + m + "</code>");
}

function techniqueRowHTML(t){
  const list = t.see.length > 1
    ? (t.seeLabel ? '<span class="see-label">' + esc(t.seeLabel) + ':</span>' : "") + "<ul>" + t.see.map(s => "<li>" + codeBits(s) + "</li>").join("") + "</ul>"
    : "<p>" + codeBits(t.see[0]) + "</p>";
  return '<tr class="tech" data-search="' + esc((t.technique + " " + (t.idea || "") + " " + t.see.join(" ")).toLowerCase()) + '">'
    + '<td class="what">' + (t.idea ? '<p class="idea">' + esc(t.idea) + "</p>" : "") + list + "</td>"
    + '<td class="name">' + esc(t.technique) + "</td>"
    + '<td class="ex">' + esc(t.example || "") + "</td></tr>";
}

// One <tbody> per group, in the order GROUPS lists them. Each starts with a full-width band naming the group.
function cheatsheetHTML(){
  return '<table class="cs">'
    + '<thead><tr><th scope="col">What you see change</th><th scope="col">Technique name</th><th scope="col">Example from your Week 2 quiz</th></tr></thead>'
    + GROUPS.map(g =>
        '<tbody class="group tone-' + g.tone + '"><tr class="band"><th colspan="3" scope="rowgroup">' + esc(g.name) + "</th></tr>"
        + TECHNIQUES.filter(t => t.group === g.name).map(techniqueRowHTML).join("") + "</tbody>").join("")
    + "</table>";
}

// Hides rows that don't contain the search text, then hides groups left empty. Returns how many rows are visible.
function filterCheatsheet(root, query){
  const needle = query.trim().toLowerCase();
  let shown = 0;
  root.querySelectorAll(".tech").forEach(row => {
    const hit = !needle || row.dataset.search.includes(needle);
    row.hidden = !hit; if(hit) shown++;
  });
  root.querySelectorAll(".group").forEach(body => { body.hidden = !body.querySelector(".tech:not([hidden])"); });
  return shown;
}

// ── Swift basics: comparison tables from basics.js ──────────────────────────────
// Each table is drawn twice: as a real table (wide screens) and as one card per column (narrow, e.g. the popup).
// CSS shows whichever fits, by the width of its container, so you never scroll sideways.

const TWINS_KEY = "swift-refactoring-twins";

// **word** → bold. Escapes first, so only our own <b> tags get through.
function basicsText(s){ return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }

function basicsCell(row, text){
  if(!text) return '<span class="bx-none">–</span>';
  return row.code ? "<code>" + esc(text) + "</code>" : basicsText(text);
}

function basicsTableHTML(t){
  const rowClass = r => r.twin ? ' class="twin"' : "";
  const table = '<div class="bx-wide"><table class="bx-table"><thead><tr><th></th>'
    + t.cols.map(c => '<th scope="col"><code>' + esc(c) + "</code></th>").join("") + "</tr></thead><tbody>"
    + t.rows.map(r => "<tr" + rowClass(r) + '><th scope="row">' + esc(r.label) + "</th>"
        + r.cells.map(c => "<td>" + basicsCell(r, c) + "</td>").join("") + "</tr>").join("")
    + "</tbody></table></div>";
  const cards = '<div class="bx-cards">' + t.cols.map((c, i) =>
      '<div class="bx-card"><div class="bx-name"><code>' + esc(c) + "</code></div><dl>"
      + t.rows.map(r => r.cells[i] ? "<div" + rowClass(r) + "><dt>" + esc(r.label) + "</dt><dd>" + basicsCell(r, r.cells[i]) + "</dd></div>" : "").join("")
      + "</dl></div>").join("") + "</div>";
  const search = (t.title + " " + t.cols.join(" ") + " " + t.rows.map(r => r.cells.join(" ")).join(" ")).toLowerCase();
  return '<section class="bx" data-search="' + esc(search) + '"><h3>' + esc(t.title) + "</h3>"
    + '<p class="bx-intro">' + basicsText(t.intro) + "</p>" + table + cards + "</section>";
}

function basicsHTML(){
  return '<label class="twins-toggle"><input type="checkbox" class="twins-cb"> Show JavaScript / Python</label>'
    + '<div class="bx-list">' + BASICS.map(basicsTableHTML).join("") + "</div>";
}

// Hides whole tables that don't mention the search text. Returns how many are left.
function filterBasics(root, query){
  const needle = query.trim().toLowerCase();
  let shown = 0;
  root.querySelectorAll(".bx").forEach(s => { const hit = !needle || s.dataset.search.includes(needle); s.hidden = !hit; if(hit) shown++; });
  return shown;
}

// JS / Python rows: off unless you turn them on. The choice is remembered and applies on every page.
function twinsOn(){ try { return localStorage.getItem(TWINS_KEY) === "on"; } catch(err){ return false; } }
function setTwins(on){
  document.documentElement.classList.toggle("show-twins", on);
  try { localStorage.setItem(TWINS_KEY, on ? "on" : "off"); } catch(err){ /* not saved, still applies now */ }
  document.querySelectorAll(".twins-cb").forEach(cb => cb.checked = on);
}
// Call after adding a toggle to the page so it starts in the right state and works.
function bindTwinsToggles(){
  document.querySelectorAll(".twins-cb").forEach(cb => { cb.checked = twinsOn(); cb.onchange = () => setTwins(cb.checked); });
}
document.documentElement.classList.toggle("show-twins", twinsOn());
