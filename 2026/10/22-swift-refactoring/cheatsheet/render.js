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
