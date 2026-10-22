// The full Cheat Sheet page: draws every group, then filters as you type.

$("groups").innerHTML = cheatsheetHTML();
$("total").textContent = TECHNIQUES.length + " techniques";
$("q").addEventListener("input", e => { $("empty").hidden = filterCheatsheet($("groups"), e.target.value) > 0; });
