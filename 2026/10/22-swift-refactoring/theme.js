// Loaded in <head> so your saved light/dark choice applies before the page paints (no flash of the wrong theme).
// With nothing saved, the page follows your Mac's appearance. The toggle itself lives in shared.js.
(function(){
  try {
    const saved = localStorage.getItem("swift-refactoring-theme");
    if(saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
  } catch(err){ /* storage blocked (private window): just follow the system */ }
})();
