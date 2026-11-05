// Fix It: each chunk is a small piece of the real MonopolyGame code.
// Step 1 pick the problem (smell), step 2 pick the technique, step 3 see the fix as a diff.
// To add a chunk, copy one object in CHUNKS. `hl` = lines (from 0) in `before` that show the problem.
const TYPES = new Set("String Int Bool Player GamePiece Location Property Utility Rentable Group GameEventHandler ConsoleHandler Road Go Jail Chance CommunityChest TaxLocation Station Dice".split(" "));

const SMELLS = {
  inside:    { text: "Only used inside the class, but anyone can call it", family: "access" },
  outside:   { text: "Outsiders can change something they should only read", family: "access" },
  never:     { text: "Can be changed, but never should after it's set up", family: "access" },
  dup:       { text: "The same steps appear in two places", family: "structure" },
  long:      { text: "One func is doing several different jobs", family: "structure" },
  group:     { text: "Some vars and funcs only talk to each other", family: "structure" },
  belong:    { text: "This func mostly uses another class's data", family: "structure" },
  name:      { text: "A name is unclear or easy to mix up", family: "naming" },
  expr:      { text: "An expression with no name, used more than once", family: "naming" },
  hard:      { text: "A hardcoded value that might need to change", family: "naming" },
  pointless: { text: "A func that's no clearer than its own body", family: "naming" },
  concrete:  { text: "Stuck to one specific class, can't swap it", family: "structure" }
};

const CHUNKS = [
  { where: "Top of MonopolyGame", smell: "outside", tech: "Encapsulate field",
    before: "var doubleDiceRollsForCurrentTurn = 0\nvar indexOfPlayerForCurrentTurn = 0\n\nvar die1: Int = 0\nvar die2: Int = 0",
    after: "private(set) var doubleDiceRollsForCurrentTurn = 0\nprivate(set) var indexOfPlayerForCurrentTurn = 0\n\nprivate(set) var die1: Int = 0\nprivate(set) var die2: Int = 0",
    hl: [0, 1, 3, 4],
    why: "These still change every roll and every turn, so let won't work. Only MonopolyGame should change them: private(set). Single values, so Encapsulate field." },
  { where: "Top of MonopolyGame + init", smell: "outside", tech: "Encapsulate collection",
    before: "var players = [Player]()\n\ninit(playerPieces: [GamePiece], handler: GameEventHandler) {\n    for piece in playerPieces {\n        players.append(Player(piece))\n    }\n}",
    after: "private(set) var players = [Player]()\n\ninit(playerPieces: [GamePiece], handler: GameEventHandler) {\n    for piece in playerPieces {\n        addPlayer(Player(piece))\n    }\n}\n\nfunc addPlayer(_ player: Player) {\n    players.append(player)\n}",
    hl: [0],
    why: "It's an array (square brackets), and any code can append or remove players. Lock it with private(set) and give outsiders one controlled way in." },
  { where: "init", smell: "long", tech: "Extract method",
    before: "init(playerPieces: [GamePiece], handler: GameEventHandler) {\n    self.handler = handler\n    for piece in playerPieces {\n        players.append(Player(piece))\n    }\n    groups.append(brownGroup)\n    groups.append(blueGroup)\n    board.append(Go())\n    board.append(Road(\"Old Kent Road\", brownGroup, 60))\n    board.append(CommunityChest())\n    board.append(Jail())\n}",
    after: "init(playerPieces: [GamePiece], handler: GameEventHandler) {\n    self.handler = handler\n    for piece in playerPieces {\n        players.append(Player(piece))\n    }\n    setUpBoard()\n}\n\nprivate func setUpBoard() {\n    groups.append(brownGroup)\n    groups.append(blueGroup)\n    board.append(Go())\n    board.append(Road(\"Old Kent Road\", brownGroup, 60))\n    board.append(CommunityChest())\n    board.append(Jail())\n}",
    hl: [5, 6, 7, 8, 9, 10],
    why: "init does three jobs: players, groups, board. Pull the board building into a func named after its job. The append lines aren't duplicated logic (each adds different data), so they stay as they are." },
  { where: "roll(): paying rent", smell: "dup", tech: "Extract method",
    before: "if let property = location as? Property {\n    let rent = property.rent(owner: owner)\n    currentPlayer.balance -= rent\n    owner.balance += rent\n}\n\nif let utility = location as? Utility {\n    let rent = utility.rent(owner: owner, roll: die1 + die2)\n    currentPlayer.balance -= rent\n    owner.balance += rent\n}",
    after: "if let property = location as? Property {\n    let rent = property.rent(owner: owner)\n    transfer(rent, from: currentPlayer, to: owner)\n}\n\nif let utility = location as? Utility {\n    let rent = utility.rent(owner: owner, roll: die1 + die2)\n    transfer(rent, from: currentPlayer, to: owner)\n}\n\nprivate func transfer(_ amount: Int, from payer: Player, to payee: Player) {\n    payer.balance -= amount\n    payee.balance += amount\n}",
    hl: [2, 3, 8, 9],
    why: "The same two balance lines appear in both branches. Move them into one new func and call it twice. It's private, but that doesn't make it Hide method: the func is brand new." },
  { where: "roll(): three doubles", smell: "long", tech: "Extract method",
    before: "func roll() {\n    let currentPlayer = players[indexOfPlayerForCurrentTurn]\n    diceRoll()\n    if diceRollIsDouble() {\n        doubleDiceRollsForCurrentTurn += 1\n    }\n    if doubleDiceRollsForCurrentTurn == 3 {\n        currentPlayer.boardIndex = board.firstIndex{$0 is Jail}!\n        pass()\n        return\n    }\n    // ...move, pass Go, pay rent\n}",
    after: "func roll() {\n    let currentPlayer = players[indexOfPlayerForCurrentTurn]\n    diceRoll()\n    if diceRollIsDouble() {\n        doubleDiceRollsForCurrentTurn += 1\n    }\n    if doubleDiceRollsForCurrentTurn == 3 {\n        sendToJail(currentPlayer)\n        return\n    }\n    // ...move, pass Go, pay rent\n}\n\nprivate func sendToJail(_ player: Player) {\n    player.boardIndex = board.firstIndex{$0 is Jail}!\n    pass()\n}",
    hl: [7, 8],
    why: "roll() rolls, jails, moves, pays Go and charges rent. Each job can become its own named func. Jail is the easiest to pull out first." },
  { where: "Helper funcs", smell: "inside", tech: "Hide method",
    before: "func diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}\n\nfunc passedGo(_ player: Player) {\n    player.balance += 200\n    handler.passedGo(player: player)\n}",
    after: "private func diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}\n\nprivate func passedGo(_ player: Player) {\n    player.balance += 200\n    handler.passedGo(player: player)\n}",
    hl: [0, 5],
    why: "Only roll() calls these, and the UI has no reason to. Lecturer's rule: called inside and no outside purpose → private." },
  { where: "passedGo", smell: "hard", tech: "Add parameter",
    before: "func passedGo(_ player: Player) {\n    player.balance += 200\n    handler.passedGo(player: player)\n}\n\n// inside roll():\npassedGo(currentPlayer)",
    after: "func passedGo(_ player: Player, salary: Int) {\n    player.balance += salary\n    handler.passedGo(player: player)\n}\n\n// inside roll():\npassedGo(currentPlayer, salary: 200)",
    hl: [1],
    why: "200 is baked in. House rules change it. Make it an input and let the caller decide." },
  { where: "roll(): moving and utility rent", smell: "expr", tech: "Introduce explaining variable",
    before: "currentPlayer.boardIndex += die1 + die2\n// ...\nlet rent = utility.rent(owner: owner, roll: die1 + die2)",
    after: "let diceTotal = die1 + die2\ncurrentPlayer.boardIndex += diceTotal\n// ...\nlet rent = utility.rent(owner: owner, roll: diceTotal)",
    hl: [0, 2],
    why: "die1 + die2 means 'the dice total' but never says so, and it's written twice. Give it a name with a let." },
  { where: "roll() and diceRoll()", smell: "name", tech: "Rename method",
    before: "func roll() {\n    diceRoll()\n    // ...\n}\n\nfunc diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    after: "func roll() {\n    rollDice()\n    // ...\n}\n\nfunc rollDice() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    hl: [0, 1, 5],
    why: "roll and diceRoll sit side by side and sound the same. The body is fine, only the name is a problem, so rename it everywhere it's called." },
  { where: "diceRollIsDouble", smell: "pointless", tech: "Inline method",
    before: "if diceRollIsDouble() {\n    doubleDiceRollsForCurrentTurn += 1\n}\n\nfunc diceRollIsDouble() -> Bool {\n    return die1 == die2\n}",
    after: "if die1 == die2 {\n    doubleDiceRollsForCurrentTurn += 1\n}",
    hl: [4, 5],
    why: "die1 == die2 is just as clear as diceRollIsDouble(). Put the body back where it's called and delete the func." },
  { where: "ownsCompleteSet", smell: "belong", tech: "Move method",
    before: "// in MonopolyGame\nfunc ownsCompleteSet(_ player: Player, _ group: Group) -> Bool {\n    var count = 0\n    for property in player.properties {\n        if property.group == group {\n            count += 1\n        }\n    }\n    return count == group.quantity\n}",
    after: "// in Player\nfunc ownsCompleteSet(_ group: Group) -> Bool {\n    var count = 0\n    for property in properties {\n        if property.group == group {\n            count += 1\n        }\n    }\n    return count == group.quantity\n}",
    hl: [3],
    why: "It only looks at the player's properties and nothing from MonopolyGame. Player already exists, so move the func there. The player input goes, because inside Player it's just self." },
  { where: "The dice", smell: "group", tech: "Extract class",
    before: "var die1: Int = 0\nvar die2: Int = 0\n\nfunc diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}\n\nfunc diceRollIsDouble() -> Bool {\n    return die1 == die2\n}",
    after: "class Dice {\n    private(set) var die1: Int = 0\n    private(set) var die2: Int = 0\n\n    func roll() {\n        die1 = Int.random(in: 1...6)\n        die2 = Int.random(in: 1...6)\n    }\n\n    func isDouble() -> Bool {\n        return die1 == die2\n    }\n}\n\n// in MonopolyGame:\nlet dice = Dice()",
    hl: [0, 1, 3, 9],
    why: "Two vars and two funcs that only use each other: that's a class waiting to happen. It doesn't exist yet, so Extract class (not Move method)." },
  { where: "The event handler (before the lecturer's version)", smell: "concrete", tech: "Extract interface",
    before: "class ConsoleHandler {\n    func passedGo(player: Player) {\n        print(\"Passed Go!\")\n    }\n}\n\nclass MonopolyGame {\n    let handler: ConsoleHandler\n}",
    after: "protocol GameEventHandler {\n    func passedGo(player: Player)\n}\n\nclass ConsoleHandler: GameEventHandler {\n    func passedGo(player: Player) {\n        print(\"Passed Go!\")\n    }\n}\n\nclass MonopolyGame {\n    let handler: GameEventHandler\n}",
    hl: [7],
    why: "MonopolyGame can only ever talk to ConsoleHandler. A SwiftUI screen couldn't plug in. Depend on a protocol instead. The real code already does this, which is why handler is a GameEventHandler." },
  { where: "Player (setup only)", smell: "never", tech: "Remove setting method",
    before: "class Player {\n    var gamePiece: GamePiece\n\n    init(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n\n    func setGamePiece(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n}",
    after: "class Player {\n    let gamePiece: GamePiece\n\n    init(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n}",
    hl: [1, 7],
    why: "Your piece is picked once and never changes. If it never changes after setup, delete the setter and make it let." }
];

const TECHS = ["Hide method", "Encapsulate field", "Encapsulate collection", "Remove setting method", "Extract method", "Rename method", "Introduce explaining variable", "Add parameter", "Inline method", "Move method", "Extract class", "Extract interface"];
const CONFUSE = {
  "Hide method": ["Encapsulate field", "Remove setting method", "Extract method"],
  "Encapsulate field": ["Encapsulate collection", "Remove setting method", "Hide method"],
  "Encapsulate collection": ["Encapsulate field", "Remove setting method", "Extract method"],
  "Remove setting method": ["Encapsulate field", "Hide method", "Inline method"],
  "Extract method": ["Extract class", "Move method", "Hide method"],
  "Rename method": ["Move method", "Extract method", "Inline method"],
  "Introduce explaining variable": ["Extract method", "Add parameter", "Rename method"],
  "Add parameter": ["Introduce explaining variable", "Rename method", "Extract method"],
  "Inline method": ["Extract method", "Hide method", "Rename method"],
  "Move method": ["Extract class", "Extract method", "Hide method"],
  "Extract class": ["Extract method", "Move method", "Extract interface"],
  "Extract interface": ["Extract class", "Move method", "Encapsulate field"]
};

const shuffle = a => { a = a.slice(); for(let k = a.length - 1; k > 0; k--){ const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
const MIXKEY = "swift-refactoring-fix-mixups";
let mix = (() => { try { return JSON.parse(localStorage.getItem(MIXKEY) || "{}"); } catch(e){ return {}; } })();
const saveMix = () => { try { localStorage.setItem(MIXKEY, JSON.stringify(mix)); } catch(e){} };

let order = "file", deck = [], i = 0, log = [], cur = null, startedAt = null;

function smellOptions(c){
  const fam = SMELLS[c.smell].family;
  const same = shuffle(Object.keys(SMELLS).filter(k => k !== c.smell && SMELLS[k].family === fam)).slice(0, 2);
  const other = shuffle(Object.keys(SMELLS).filter(k => k !== c.smell && !same.includes(k))).slice(0, 3 - same.length);
  return shuffle([c.smell, ...same, ...other]);
}

function codeHTML(code, hl){
  return code.split("\n").map((l, n) => '<span class="ln' + (hl && hl.includes(n) ? " hl" : "") + '">' + (highlightSwift(l, TYPES) || " ") + '</span>').join("");
}

function lineDiff(a0, b0){
  const a = a0.split("\n"), b = b0.split("\n"), A = a.map(x => x.trim()), B = b.map(x => x.trim());
  const m = a.length, n = b.length, L = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for(let x = m - 1; x >= 0; x--) for(let y = n - 1; y >= 0; y--) L[x][y] = A[x] === B[y] ? L[x+1][y+1] + 1 : Math.max(L[x+1][y], L[x][y+1]);
  const out = []; let x = 0, y = 0;
  while(x < m && y < n){
    if(A[x] === B[y]){ out.push([" ", b[y]]); x++; y++; }
    else if(L[x+1][y] >= L[x][y+1]) out.push(["-", a[x++]]);
    else out.push(["+", b[y++]]);
  }
  while(x < m) out.push(["-", a[x++]]);
  while(y < n) out.push(["+", b[y++]]);
  return out;
}
function diffHTML(before, after){
  return lineDiff(before, after).map(([t, l]) => '<span class="ln d' + (t === "+" ? "add" : t === "-" ? "del" : "") + '"><i>' + (t === " " ? "" : t) + '</i>' + (highlightSwift(l, TYPES) || " ") + '</span>').join("");
}

function start(list){
  deck = order === "shuffle" ? shuffle(list) : list.slice(); i = 0; log = []; startedAt = new Date();
  roundBegin("fix/start/" + order);
  $("done").hidden = true; $("card").hidden = false; $("prog").hidden = false;
  $("copyBox").hidden = true; $("copyStatus").hidden = true;
  show();
}

function show(){
  const c = deck[i];
  cur = { c, smellOk: null, smellPick: null, techOk: null, techPick: null };
  $("count").textContent = (i + 1) + " / " + deck.length;
  $("bar").style.width = (i / deck.length * 100) + "%";
  $("score").textContent = log.filter(x => x.smellOk && x.techOk).length + " both right";
  $("where").textContent = c.where;
  $("code").innerHTML = codeHTML(c.before);
  $("s2").hidden = true; $("s3").hidden = true; $("nextBtn").hidden = true;
  $("f1").hidden = true; $("f2").hidden = true; $("fixed").hidden = true; $("showFix").hidden = false;
  $("o1").innerHTML = smellOptions(c).map(k => '<button class="opt" data-v="' + k + '"><span class="dot"></span>' + esc(SMELLS[k].text) + '</button>').join("");
  $("o1").querySelectorAll(".opt").forEach(b => b.onclick = () => pickSmell(b.dataset.v));
  window.scrollTo({ top: 0 });
}

function mark(box, right, picked){
  box.querySelectorAll(".opt").forEach(b => { b.disabled = true; if(b.dataset.v === right) b.classList.add("right"); else if(b.dataset.v === picked) b.classList.add("wrong"); });
}
function fb(id, ok, head, body){
  const f = $(id); f.className = "feedback " + (ok ? "good" : "bad");
  f.innerHTML = "<b>" + esc(head) + "</b>" + esc(body); f.hidden = false;
}

function pickSmell(k){
  roundTouched();
  const c = cur.c; cur.smellPick = k; cur.smellOk = k === c.smell;
  mark($("o1"), c.smell, k);
  $("code").innerHTML = codeHTML(c.before, c.hl);
  fb("f1", cur.smellOk, cur.smellOk ? "Right. The highlighted lines show it." : "Not quite. The highlighted lines show the real problem: " + SMELLS[c.smell].text.toLowerCase() + ".", "");
  if(!cur.smellOk){ const key = "Problem: " + SMELLS[c.smell].text + " → picked: " + SMELLS[k].text; mix[key] = (mix[key] || 0) + 1; saveMix(); }
  const opts = shuffle([c.tech, ...(CONFUSE[c.tech] || shuffle(TECHS.filter(t => t !== c.tech)).slice(0, 3))]);
  $("o2").innerHTML = opts.map(t => '<button class="opt" data-v="' + esc(t) + '"><span class="dot"></span>' + esc(t) + '</button>').join("");
  $("o2").querySelectorAll(".opt").forEach(b => b.onclick = () => pickTech(b.dataset.v));
  $("s2").hidden = false;
  $("s2").scrollIntoView({ behavior: "smooth", block: "start" });
}

function pickTech(t){
  const c = cur.c; cur.techPick = t; cur.techOk = t === c.tech;
  mark($("o2"), c.tech, t);
  fb("f2", cur.techOk, (cur.techOk ? "Right: " : "It's ") + c.tech, c.why);
  if(!cur.techOk){ const key = c.tech + " → " + t; mix[key] = (mix[key] || 0) + 1; saveMix(); }
  $("s3").hidden = false;
  $("f2").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showFix(){
  $("fixCode").innerHTML = diffHTML(cur.c.before, cur.c.after);
  $("fixed").hidden = false; $("showFix").hidden = true;
  log.push(cur);
  $("nextBtn").textContent = i === deck.length - 1 ? "See results" : "Next";
  $("nextBtn").hidden = false;
}

function next(){
  if(i < deck.length - 1){ i++; show(); return; }
  $("card").hidden = true; $("prog").hidden = true; $("done").hidden = false;
  const both = log.filter(x => x.smellOk && x.techOk).length;
  const sm = log.filter(x => x.smellOk).length, te = log.filter(x => x.techOk).length;
  $("final").textContent = both + " / " + log.length;
  $("verdict").textContent = "Problem spotted: " + sm + " / " + log.length + ". Fix picked: " + te + " / " + log.length + ".";
  const wrong = log.filter(x => !(x.smellOk && x.techOk));
  trackRound("fix", both, log.length, log.filter(x => !x.techOk).map(x => x.c.tech), log.filter(x => !x.techOk).map(x => [x.c.tech, x.techPick]));
  log.filter(x => !x.smellOk).forEach(x => track("fix/missed-problem/" + slug(x.c.smell) + "--picked--" + slug(x.smellPick)));
  $("review").innerHTML = wrong.length ? '<ul class="rev">' + wrong.map(x => '<li><b>' + esc(x.c.where) + '</b>'
    + (x.smellOk ? '' : '<span>Problem: you picked <s>' + esc(SMELLS[x.smellPick].text) + '</s>, it\'s <em>' + esc(SMELLS[x.c.smell].text) + '</em></span>')
    + (x.techOk ? '' : '<span>Fix: you picked <s>' + esc(x.techPick) + '</s>, it\'s <em>' + esc(x.c.tech) + '</em></span>')
    + '<span>' + esc(x.c.why) + '</span></li>').join("") + '</ul>' : '<p class="sub">Clean run. Try Shuffle next, so the order can\'t help you.</p>';
  $("againMiss").hidden = !wrong.length;
  window.scrollTo({ top: 0 });
}

function report(){
  const d = startedAt || new Date();
  const when = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const mins = Math.max(1, Math.round((Date.now() - d) / 60000));
  let t = "Fix It results\nWhen: " + when + " (" + mins + " min) · Order: " + (order === "file" ? "Walk the file" : "Shuffle") + "\n";
  t += "Both right: " + log.filter(x => x.smellOk && x.techOk).length + " / " + log.length + " · Problem spotted: " + log.filter(x => x.smellOk).length + " · Fix picked: " + log.filter(x => x.techOk).length + "\n\n";
  log.forEach((x, n) => {
    if(x.smellOk && x.techOk) return;
    t += "- " + x.c.where + " (" + x.c.tech + ")\n";
    if(!x.smellOk) t += "  Problem: picked \"" + SMELLS[x.smellPick].text + "\", correct \"" + SMELLS[x.c.smell].text + "\"\n";
    if(!x.techOk) t += "  Fix: picked " + x.techPick + ", correct " + x.c.tech + "\n";
  });
  const top = Object.entries(mix).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if(top.length) t += "\nUsual mix-ups (all rounds on this device):\n" + top.map(([k, v]) => "- " + k + " × " + v).join("\n") + "\n";
  return t;
}

document.querySelectorAll(".order button").forEach(b => b.onclick = () => {
  order = b.dataset.order;
  document.querySelectorAll(".order button").forEach(x => x.setAttribute("aria-pressed", x === b));
  start(CHUNKS);
});
$("showFix").onclick = showFix;
$("nextBtn").onclick = next;
$("againMiss").onclick = () => start(log.filter(x => !(x.smellOk && x.techOk)).map(x => x.c));
$("againAll").onclick = () => start(CHUNKS);
$("copyBtn").onclick = () => copyForClaude(report(), $("copyBox"), $("copyStatus"));
start(CHUNKS);
