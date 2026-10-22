// Builds the cheat sheet HTML from techniques.js. Used by the full Cheat Sheet page and by the popup on every other page.

function codeBits(text){
  // Wrap Swift words and symbols people should look for in <code>.
  return esc(text).replace(/\b(func|let|var|private\(set\)|private|protocol|enum|set\.\.\.)(?=[\s,./]|$)|(\[ \]|\( \))/g, m => "<code>" + m + "</code>");
}

function techniqueRowHTML(t){
  const list = t.see.length > 1
    ? (t.seeLabel ? '<span class="see-label">' + esc(t.seeLabel) + ':</span>' : "") + "<ul>" + t.see.map(s => "<li>" + codeBits(s) + "</li>").join("") + "</ul>"
    : "<p>" + codeBits(t.see[0]) + "</p>";
  return '<li class="tech" data-search="' + esc((t.technique + " " + (t.idea || "") + " " + t.see.join(" ")).toLowerCase()) + '">'
    + '<div class="what">' + (t.idea ? '<p class="idea">' + esc(t.idea) + "</p>" : "") + list + "</div>"
    + '<div class="name"><span class="pill">' + esc(t.technique) + "</span>"
    + (t.example ? '<span class="ex">' + esc(t.example) + "</span>" : "") + "</div></li>";
}

// One card per group, in the order GROUPS lists them.
function cheatsheetHTML(){
  return GROUPS.map(g =>
    '<section class="card group"><h2>' + esc(g) + '</h2><ul class="techs">'
    + TECHNIQUES.filter(t => t.group === g).map(techniqueRowHTML).join("") + "</ul></section>").join("");
}

// Hides rows that don't contain the search text, then hides groups left empty. Returns how many rows are visible.
function filterCheatsheet(root, query){
  const needle = query.trim().toLowerCase();
  let shown = 0;
  root.querySelectorAll(".tech").forEach(li => {
    const hit = !needle || li.dataset.search.includes(needle);
    li.hidden = !hit; if(hit) shown++;
  });
  root.querySelectorAll(".group").forEach(sec => { sec.hidden = !sec.querySelector(".tech:not([hidden])"); });
  return shown;
}
