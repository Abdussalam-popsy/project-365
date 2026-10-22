// Helpers every exercise page uses: escaping, Swift syntax colouring, and the "Copy results for Claude" button.

const $ = id => document.getElementById(id);

function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

const SWIFT_KEYWORDS = new Set("class struct enum protocol func var let init return if else guard private for in self case true false nil".split(" "));

// Colours one line of Swift. `types` is the set of type names this page wants tinted.
function highlightSwift(line, types){
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b([A-Za-z_][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?)\b/g;
  let out = "", last = 0, m;
  while((m = re.exec(line))){
    out += esc(line.slice(last, m.index));
    if(m[1]) out += '<span class="c">'+esc(m[1])+'</span>';
    else if(m[2]) out += '<span class="s">'+esc(m[2])+'</span>';
    else if(m[3]) out += SWIFT_KEYWORDS.has(m[3]) ? '<span class="k">'+m[3]+'</span>' : types.has(m[3]) ? '<span class="t">'+m[3]+'</span>' : esc(m[3]);
    else if(m[4]) out += '<span class="n">'+m[4]+'</span>';
    last = re.lastIndex;
  }
  return out + esc(line.slice(last));
}

// A whole block of Swift as <span class="ln"> lines, ready to drop inside a <pre>.
function codeBlockHTML(code, types){
  return code.split("\n").map(l => '<span class="ln">'+(highlightSwift(l, types)||" ")+'</span>').join("");
}

// Copies the report to the clipboard; if the browser refuses, shows it selected in the box instead.
function copyForClaude(text, box, status){
  box.value = text; box.hidden = false;
  const done = msg => { status.textContent = msg; status.hidden = false; };
  const fallback = () => { box.focus(); box.select(); done("Selected below. Press Cmd+C to copy."); };
  try {
    navigator.clipboard.writeText(text).then(() => done("Copied. Paste it into the chat with Claude."), fallback);
  } catch(err){ fallback(); }
}
