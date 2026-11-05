// Spot the Change: each card shows what changed, you name the technique.
// Flashcards: flip, then say if you got it. Quiz: pick from 4 look-alikes, instant right or wrong.
// To add a card, copy one object in CARDS. `group` is new, gone, locked or moved.
const TYPES = new Set("String Int Double Bool Player Property Station Dice Group ConsoleHandler GameEventHandler BloodGroup".split(" "));

const CARDS = [
  { id: "extract-method", name: "Extract method", group: "new",
    change: "Two lines in roll() are replaced by one call, and a brand new func holds them.",
    before: "currentPlayer.balance -= rent\nowner.balance += rent",
    after: "transfer(rent, from: currentPlayer, to: owner)\n\nprivate func transfer(_ amount: Int, from payer: Player, to payee: Player) {\n    payer.balance -= amount\n    payee.balance += amount\n}",
    tell: "A new func appeared and old lines now call it. The new func being private is a trap: Hide method is only for a func that already existed." },
  { id: "explaining-var", name: "Introduce explaining variable", group: "new",
    change: "A bit of maths gets a name.",
    before: "currentPlayer.boardIndex += die1 + die2",
    after: "let diceTotal = die1 + die2\ncurrentPlayer.boardIndex += diceTotal",
    tell: "A new let names part of an expression. Split temporary variable is different: one var doing two jobs." },
  { id: "extract-interface", name: "Extract interface", group: "new",
    change: "A protocol appears, the class signs up to it, and MonopolyGame now stores the protocol type.",
    before: "class ConsoleHandler { ... }\n\nlet handler: ConsoleHandler",
    after: "protocol GameEventHandler {\n    func passedGo(player: Player)\n}\n\nclass ConsoleHandler: GameEventHandler { ... }\n\nlet handler: GameEventHandler",
    tell: "The word protocol appearing is the whole tell." },
  { id: "extract-class", name: "Extract class", group: "new",
    change: "die1, die2, diceRoll() and diceRollIsDouble() leave MonopolyGame and go into a class that didn't exist before.",
    before: "class MonopolyGame {\n    var die1: Int = 0\n    var die2: Int = 0\n    func diceRoll() { ... }\n    func diceRollIsDouble() -> Bool { ... }\n}",
    after: "class Dice {\n    private(set) var die1: Int = 0\n    private(set) var die2: Int = 0\n    func roll() { ... }\n    func isDouble() -> Bool { ... }\n}\n\nclass MonopolyGame {\n    let dice = Dice()\n}",
    tell: "A new class was created and several things moved into it. If the class already existed, it would be Move method." },
  { id: "type-code", name: "Replace type code with enum", group: "new",
    change: "Magic numbers that stand for categories become an enum.",
    before: "var status: Int   // 0 active, 1 suspended, 2 closed\nreturn status == 0",
    after: "enum MemberStatus {\n    case active, suspended, closed\n}\n\nvar status: MemberStatus\nreturn status == .active",
    tell: "Numbers or strings that mean a type got swapped for an enum. The drill calls it Replace type code with class." },
  { id: "add-param", name: "Add parameter", group: "new",
    change: "A func gets a new input, and every caller passes it.",
    before: "func passedGo(_ player: Player) {\n    player.balance += 200\n}\npassedGo(currentPlayer)",
    after: "func passedGo(_ player: Player, salary: Int) {\n    player.balance += salary\n}\npassedGo(currentPlayer, salary: 200)",
    tell: "Something new inside the func's brackets." },
  { id: "inline-method", name: "Inline method", group: "gone",
    change: "A one-line func is deleted, and its body is pasted where it was called.",
    before: "if diceRollIsDouble() { ... }\n\nfunc diceRollIsDouble() -> Bool {\n    return die1 == die2\n}",
    after: "if die1 == die2 { ... }",
    tell: "A func vanished and its body moved to the caller. Inline temp is the same idea for a let." },
  { id: "inline-temp", name: "Inline temp", group: "gone",
    change: "A let that adds nothing is removed, and its value is used directly.",
    before: "let location = board[currentPlayer.boardIndex]\nreturn location",
    after: "return board[currentPlayer.boardIndex]",
    tell: "A let vanished. If a func vanished instead, it's Inline method." },
  { id: "remove-param", name: "Remove parameter", group: "gone",
    change: "An input the func never used is deleted, from the func and every caller.",
    before: "func status(_ player: Player, verbose: Bool) -> String\ngame.status(player, verbose: true)",
    after: "func status(_ player: Player) -> String\ngame.status(player)",
    tell: "Something gone from inside the brackets." },
  { id: "remove-setter-let", name: "Remove setting method", group: "gone",
    change: "A set... func is deleted and the var becomes let.",
    before: "var code: String\n\nfunc setCode(_ c: String) {\n    code = c\n}",
    after: "let code: String",
    tell: "A setter vanished and the value can never change again." },
  { id: "remove-setter-private", name: "Remove setting method", group: "locked",
    change: "A station's name gets private(set). Nothing new is added. The name never changes after the board is built.",
    before: "var name: String\nvar mortgaged = false",
    after: "private(set) var name: String\nvar mortgaged = false",
    tell: "The keyword is private(set), but the value never changes after creation. Never changes = Remove setting method." },
  { id: "hide-method", name: "Hide method", group: "locked",
    change: "An existing func gets private. Nothing else changes.",
    before: "func diceRoll() { ... }",
    after: "private func diceRoll() { ... }",
    tell: "private went on a func. Funcs = Hide method. Lecturer's rule: only for funcs used inside the class with no outside purpose." },
  { id: "encap-field", name: "Encapsulate field", group: "locked",
    change: "balance gets private(set), and a new func is the only way to change it.",
    before: "var balance: Int = 1500",
    after: "private(set) var balance: Int = 1500\n\nfunc pay(_ amount: Int) {\n    guard amount > 0, amount <= balance else { return }\n    balance -= amount\n}",
    tell: "One value that still changes inside the class, just not from outside." },
  { id: "encap-collection", name: "Encapsulate collection", group: "locked",
    change: "An array gets private(set), plus an add func.",
    before: "var players = [Player]()",
    after: "private(set) var players = [Player]()\n\nfunc addPlayer(_ player: Player) {\n    players.append(player)\n}",
    tell: "Square brackets mean a collection. Locked collection plus add/remove funcs." },
  { id: "move-method", name: "Move method", group: "moved",
    change: "ownsCompleteSet moves from MonopolyGame into Player, which already existed, and loses its player input.",
    before: "// in MonopolyGame\nfunc ownsCompleteSet(_ player: Player, _ group: Group) -> Bool",
    after: "// in Player\nfunc ownsCompleteSet(_ group: Group) -> Bool",
    tell: "One func moved into a class that already existed. A brand new class would be Extract class." },
  { id: "move-field", name: "Move field", group: "moved",
    change: "customerName moves off the printer and onto the order it describes.",
    before: "class InvoicePrinter {\n    var customerName: String\n}",
    after: "class Order {\n    var customerName: String\n}",
    tell: "A var moved to the class it belongs to. A func moving would be Move method." },
  { id: "rename", name: "Rename method", group: "moved",
    change: "Only the name changes, on the func line and every call.",
    before: "func diceRoll() { ... }\ndiceRoll()",
    after: "func rollDice() { ... }\nrollDice()",
    tell: "Same body, same inputs, new name." },
  { id: "split-temp", name: "Split temporary variable", group: "moved",
    change: "One var was doing two jobs. It becomes two lets with their own names.",
    before: "var amount = rentDue\nprint(amount)\namount = goBonus\nprint(amount)",
    after: "let rent = rentDue\nprint(rent)\nlet bonus = goBonus\nprint(bonus)",
    tell: "One var assigned twice for two meanings, split into two." }
];

const GROUPS = { new: "Something new appears", gone: "Something disappears", locked: "Something gets locked", moved: "Something moves, renames or splits" };
const NAMES = [...new Set(CARDS.map(c => c.name))];
const CONFUSE = {
  "Extract method": ["Hide method", "Extract class", "Move method"],
  "Introduce explaining variable": ["Split temporary variable", "Inline temp", "Extract method"],
  "Extract interface": ["Extract class", "Replace type code with enum", "Extract method"],
  "Extract class": ["Extract method", "Move method", "Extract interface"],
  "Replace type code with enum": ["Extract interface", "Extract class", "Rename method"],
  "Add parameter": ["Introduce explaining variable", "Rename method", "Remove parameter"],
  "Inline method": ["Inline temp", "Remove parameter", "Extract method"],
  "Inline temp": ["Inline method", "Split temporary variable", "Introduce explaining variable"],
  "Remove parameter": ["Inline method", "Remove setting method", "Rename method"],
  "Remove setting method": ["Encapsulate field", "Hide method", "Inline method"],
  "Hide method": ["Encapsulate field", "Remove setting method", "Extract method"],
  "Encapsulate field": ["Remove setting method", "Encapsulate collection", "Hide method"],
  "Encapsulate collection": ["Encapsulate field", "Remove setting method", "Extract method"],
  "Move method": ["Extract class", "Extract method", "Move field"],
  "Move field": ["Move method", "Extract class", "Encapsulate field"],
  "Rename method": ["Move method", "Extract method", "Inline method"],
  "Split temporary variable": ["Introduce explaining variable", "Inline temp", "Rename method"]
};

const KEY = "swift-refactoring-card-misses";
const loadMisses = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch(e){ return new Set(); } };
const saveMisses = s => { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch(e){} };
const shuffle = a => { a = a.slice(); for(let k = a.length - 1; k > 0; k--){ const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
const snip = (title, code, cls) => '<div class="snip ' + cls + '"><h3>' + title + '</h3><pre>' + codeBlockHTML(code, TYPES) + '</pre></div>';

let mode = "cards", deckName = "all", deck = [], i = 0, right = 0, missedThisRound = [], misses = loadMisses();
let roundLog = [], roundStart = null;

// Every wrong quiz pick is counted as "correct -> what you picked", kept on this device.
const MIXKEY = "swift-refactoring-card-mixups";
const loadMix = () => { try { return JSON.parse(localStorage.getItem(MIXKEY) || "{}"); } catch(e){ return {}; } };
const saveMix = m => { try { localStorage.setItem(MIXKEY, JSON.stringify(m)); } catch(e){} };
let mixups = loadMix();

function counts(){
  $("nAll").textContent = CARDS.length;
  $("nWeak").textContent = misses.size;
  document.querySelector('[data-deck="weak"]').disabled = misses.size === 0;
}

function start(list){
  deck = shuffle(list); i = 0; right = 0; missedThisRound = []; roundLog = []; roundStart = new Date();
  $("copyBox").hidden = true; $("copyStatus").hidden = true;
  $("done").hidden = true; $("card").hidden = false; $("prog").hidden = false;
  show();
}

function show(){
  const c = deck[i];
  $("count").textContent = (i + 1) + " / " + deck.length;
  $("bar").style.width = (i / deck.length * 100) + "%";
  $("score").textContent = right + " right";
  $("cat").textContent = GROUPS[c.group];
  $("change").textContent = c.change;
  $("snips").innerHTML = snip("Before", c.before, "") + snip("After", c.after, "after");
  $("cardsUI").hidden = mode !== "cards"; $("quizUI").hidden = mode !== "quiz";
  if(mode === "cards"){
    $("back").hidden = true; $("flipBtn").hidden = false; $("missBtn").hidden = true; $("gotBtn").hidden = true;
  } else {
    $("qfb").hidden = true; $("nextBtn").hidden = true;
    const opts = shuffle([c.name].concat(CONFUSE[c.name] || shuffle(NAMES.filter(n => n !== c.name)).slice(0, 3)));
    $("opts").innerHTML = opts.map(o => '<button class="opt" data-v="' + esc(o) + '"><span class="dot"></span>' + esc(o) + '</button>').join("");
    $("opts").querySelectorAll(".opt").forEach(b => b.onclick = () => pick(b.dataset.v));
  }
  window.scrollTo({ top: 0 });
}

function flip(){
  const c = deck[i];
  $("name").textContent = c.name; $("tell").textContent = c.tell;
  $("back").hidden = false; $("flipBtn").hidden = true; $("missBtn").hidden = false; $("gotBtn").hidden = false;
}

function mark(ok){
  const c = deck[i];
  if(ok){ right++; misses.delete(c.id); } else { missedThisRound.push(c); misses.add(c.id); }
  roundLog.push({ c, ok, picked: null });
  saveMisses(misses); counts();
  next();
}

function pick(v){
  const c = deck[i], ok = v === c.name;
  $("opts").querySelectorAll(".opt").forEach(b => { b.disabled = true; if(b.dataset.v === c.name) b.classList.add("right"); else if(b.dataset.v === v) b.classList.add("wrong"); });
  const fb = $("qfb");
  fb.className = "feedback " + (ok ? "good" : "bad");
  fb.innerHTML = "<b>" + (ok ? "Right: " : "Wrong. It's ") + esc(c.name) + "</b>" + esc(c.tell);
  fb.hidden = false;
  if(ok){ right++; misses.delete(c.id); } else { missedThisRound.push(c); misses.add(c.id); }
  roundLog.push({ c, ok, picked: v });
  if(!ok){ const k = c.name + " → " + v; mixups[k] = (mixups[k] || 0) + 1; saveMix(mixups); }
  saveMisses(misses); counts();
  $("score").textContent = right + " right";
  $("nextBtn").hidden = false; $("nextBtn").focus({ preventScroll: true });
}

function next(){
  if(i < deck.length - 1){ i++; show(); return; }
  $("card").hidden = true; $("prog").hidden = true; $("done").hidden = false;
  $("final").textContent = right + " / " + deck.length;
  $("verdict").textContent = missedThisRound.length ? "Missed: " + [...new Set(missedThisRound.map(c => c.name))].join(", ") + ". Say each one's tell out loud, then go again." : "Clean sweep. Try Quiz mode, or come back tomorrow.";
  $("againMiss").hidden = !missedThisRound.length;
  const wrong = roundLog.filter(x => !x.ok);
  $("review").innerHTML = wrong.length ? '<p class="rev-h">What you missed</p><ul class="rev">' + wrong.map(x =>
    '<li><span class="pair">' + (x.picked ? 'You picked <s>' + esc(x.picked) + '</s>, it\'s <em>' + esc(x.c.name) + '</em>' : '<em>' + esc(x.c.name) + '</em>') + '</span>'
    + '<span>' + esc(x.c.change) + '</span><span class="why">' + esc(x.c.tell) + '</span></li>').join("") + '</ul>' : "";
  const top = topMixups(5);
  $("mixups").innerHTML = top.length ? '<div class="mix"><h3>Your usual mix-ups (all quiz rounds on this device)</h3><ul>' + top.map(([k, n]) => '<li>' + esc(k) + ' <span>× ' + n + '</span></li>').join("") + '</ul></div>' : "";
  window.scrollTo({ top: 0 });
}

function topMixups(n){ return Object.entries(mixups).sort((a, b) => b[1] - a[1]).slice(0, n); }

function report(){
  const d = roundStart || new Date();
  const when = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const mins = Math.max(1, Math.round((Date.now() - d) / 60000));
  let t = "Spot the Change results\nWhen: " + when + " (" + mins + " min)\nMode: " + (mode === "quiz" ? "Quiz" : "Flashcards") + " · Deck: " + (deckName === "weak" ? "My misses" : "All") + "\nScore: " + right + " / " + roundLog.length + "\n\n";
  const wrong = roundLog.filter(x => !x.ok);
  if(wrong.length){
    t += "=== MISSED (" + wrong.length + ") ===\n";
    wrong.forEach((x, n) => {
      t += (n + 1) + ". correct = " + x.c.name + (x.picked ? " | I picked = " + x.picked : " | (flashcard, marked missed)") + "\n";
      t += "   Card: " + x.c.change + "\n";
    });
    t += "\n";
  }
  const got = roundLog.filter(x => x.ok);
  if(got.length) t += "=== RIGHT (" + got.length + ") ===\n" + got.map(x => "- " + x.c.name).join("\n") + "\n\n";
  const top = topMixups(5);
  if(top.length) t += "=== USUAL MIX-UPS (all quiz rounds) ===\n" + top.map(([k, n]) => "- " + k + " × " + n).join("\n") + "\n";
  return t;
}

function renderSheet(){
  $("sheetList").innerHTML = Object.entries(GROUPS).map(([g, title]) =>
    '<div class="card group"><h2>' + esc(title) + '</h2><ul>' + CARDS.filter(c => c.group === g).map(c => '<li><b>' + esc(c.name) + '</b><span>' + esc(c.change) + '</span></li>').join("") + '</ul></div>').join("");
}

function setMode(m){
  mode = m;
  document.querySelectorAll(".modes button").forEach(x => x.setAttribute("aria-pressed", x.dataset.mode === m));
  const sheet = m === "sheet";
  $("sheet").hidden = !sheet; $("decks").hidden = sheet;
  if(sheet){ $("card").hidden = true; $("prog").hidden = true; $("done").hidden = true; renderSheet(); return; }
  start(deckName === "weak" ? CARDS.filter(c => misses.has(c.id)) : CARDS);
}

document.querySelectorAll(".modes button").forEach(b => b.onclick = () => setMode(b.dataset.mode));
document.querySelectorAll(".decks button").forEach(b => b.onclick = () => {
  deckName = b.dataset.deck;
  document.querySelectorAll(".decks button").forEach(x => x.setAttribute("aria-pressed", x === b));
  setMode(mode);
});
$("flipBtn").onclick = flip;
$("gotBtn").onclick = () => mark(true);
$("missBtn").onclick = () => mark(false);
$("nextBtn").onclick = next;
$("againMiss").onclick = () => start(missedThisRound);
$("againAll").onclick = () => start(CARDS);
$("copyBtn").onclick = () => copyForClaude(report(), $("copyBox"), $("copyStatus"));
document.addEventListener("keydown", ev => {
  if(mode !== "cards" || $("card").hidden) return;
  if(ev.key === " " && !$("flipBtn").hidden){ ev.preventDefault(); flip(); }
  else if(ev.key === "ArrowRight" && !$("gotBtn").hidden) mark(true);
  else if(ev.key === "ArrowLeft" && !$("missBtn").hidden) mark(false);
});
counts();
setMode("cards");
