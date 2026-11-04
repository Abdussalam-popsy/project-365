// Mock test: Part 1 is six quiz questions with instant feedback, Part 2 is three tasks on the full MonopolyGame class.
const TYPES = new Set("String Int Bool Player GamePiece Location Property Utility Rentable Group ColourGroup GameEventHandler Road Go Jail Chance CommunityChest TaxLocation Station Dice".split(" "));
const norm = s => s.replace(/\s+/g, "").replace(/self\./g, "").replace(/;/g, "");
const shuffle = a => { a = a.slice(); for(let k = a.length - 1; k > 0; k--){ const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
const code = s => '<pre>' + codeBlockHTML(s, TYPES) + '</pre>';

const QS = [
  { prompt: "What refactoring was applied?",
    before: "class MonopolyGame {\n    var players = [Player]()\n}",
    after: "class MonopolyGame {\n    private(set) var players = [Player]()\n\n    func addPlayer(_ player: Player) {\n        players.append(player)\n    }\n}",
    answer: "Encapsulate collection", options: ["Encapsulate collection", "Encapsulate field", "Remove setting method", "Hide method"],
    why: "It's an array, and outsiders now change it only through addPlayer. A single value would be Encapsulate field." },
  { prompt: "Player.gamePiece is set in init and never changes during a game. var gamePiece becomes let gamePiece and setGamePiece(_:) is deleted. Which refactoring is that?",
    answer: "Remove setting method", options: ["Remove setting method", "Encapsulate field", "Inline method", "Hide method"],
    why: "The value never changes after creation, so the setter goes. Encapsulate field is for values that still change inside the class." },
  { prompt: "status(_:) is never called anywhere inside MonopolyGame. Using the lecturer's rule for Hide method, what should you assume?",
    answer: "Something outside uses it, so leave it public", options: ["Something outside uses it, so leave it public", "Nothing uses it, so make it private", "Delete it with Inline method", "Make it private and add a getter"],
    why: "If a func isn't called inside the class, assume outsiders call it. Only funcs used internally, with no outside purpose, get private." },
  { prompt: "What refactoring was applied?",
    before: "class MonopolyGame {\n    var die1: Int = 0\n    var die2: Int = 0\n\n    func diceRoll() { ... }\n    func diceRollIsDouble() -> Bool { ... }\n}",
    after: "class Dice {\n    private(set) var die1: Int = 0\n    private(set) var die2: Int = 0\n\n    func roll() { ... }\n    func isDouble() -> Bool { ... }\n}\n\nclass MonopolyGame {\n    let dice = Dice()\n}",
    answer: "Extract class", options: ["Extract class", "Extract method", "Move method", "Extract interface"],
    why: "Fields and methods that belong together moved into a brand new class. Move method moves one func into a class that already exists." },
  { prompt: "isOwned(property:) and owner(property:) contain the exact same nested for loop. Which code smell is that?",
    answer: "Duplicated code", options: ["Duplicated code", "Long parameter list", "Data class", "Temporary field"],
    why: "Same logic in two places means two places to fix. isOwned could just return owner(property: property) != nil." },
  { prompt: "In Swift, what's the idiomatic way to let outside code read a player's balance but not change it?",
    answer: "private(set) var balance: Int", options: ["private(set) var balance: Int", "private var balance: Int plus a getBalance() func", "let balance: Int", "public var balance: Int"],
    why: "The lecturer said private(set) is the Swift way. A private var with a manual getter works but isn't idiomatic, and let would stop the class itself changing it." }
];

const START = `class MonopolyGame {

    var board = [Location]()
    var groups = [Group]()
    var players = [Player]()

    var doubleDiceRollsForCurrentTurn = 0
    var indexOfPlayerForCurrentTurn = 0 // which player's turn it is

    var die1: Int = 0
    var die2: Int = 0

    private let handler: GameEventHandler

    init(playerPieces: [GamePiece], handler: GameEventHandler) {
        self.handler = handler

        for piece in playerPieces {
            players.append(Player(piece))
        }

        // groups and board setup omitted
    }

    /** Called to indicate that the player has finished their go */
    func pass() {
        doubleDiceRollsForCurrentTurn = 0
        indexOfPlayerForCurrentTurn += 1

        if indexOfPlayerForCurrentTurn >= players.count {
            indexOfPlayerForCurrentTurn = 0
        }
    }

    func roll() {
        let currentPlayer = players[indexOfPlayerForCurrentTurn]

        diceRoll()

        if diceRollIsDouble() {
            doubleDiceRollsForCurrentTurn += 1
        }

        if doubleDiceRollsForCurrentTurn == 3 {
            currentPlayer.boardIndex = board.firstIndex{$0 is Jail}!
            pass()
            return
        }

        currentPlayer.boardIndex += die1 + die2

        if currentPlayer.boardIndex >= board.count {
            currentPlayer.boardIndex -= board.count
            passedGo(currentPlayer)
        }

        let location = board[currentPlayer.boardIndex]

        handler.rollOutcome(player: currentPlayer, roll1: die1, roll2: die2, destination: location)

        if let rentableLocation = location as? Rentable {
            if !isOwned(property: rentableLocation) {
                // purchase or auction omitted
            } else {
                let owner = owner(property: rentableLocation)!

                if let property = location as? Property {
                    let rent = property.rent(owner: owner)
                    currentPlayer.balance -= rent
                    owner.balance += rent
                    handler.rentPaid(tenant: currentPlayer, landlord: owner, property: property, price: rent)
                }

                if let utility = location as? Utility {
                    let rent = utility.rent(owner: owner, roll: die1 + die2)
                    currentPlayer.balance -= rent
                    owner.balance += rent
                    handler.rentPaid(tenant: currentPlayer, landlord: owner, property: utility, price: rent)
                }
            }
        }
    }

    func passedGo(_ player: Player) {
        player.balance += 200
        handler.passedGo(player: player)
    }

    func diceRoll() {
        die1 = Int.random(in: 1...6)
        die2 = Int.random(in: 1...6)
    }

    func isOwned(property: Rentable) -> Bool {
        for player in players {
            for playerProperty in player.properties {
                if playerProperty === property {
                    return true
                }
            }
        }
        return false
    }

    func diceRollIsDouble() -> Bool {
        return die1 == die2
    }

    func owner(property: Rentable) -> Player? {
        for player in players {
            for playerProperty in player.properties {
                if playerProperty === property {
                    return player
                }
            }
        }
        return nil
    }

    func status(_ player: Player) -> String {
        // builds a text summary of the player, omitted
    }

    func ownsCompleteSet(_ player: Player, _ group: Group) -> Bool {
        // counts the player's properties in the group, omitted
    }
}`;

const MODEL = START
  .replace("    var players = [Player]()", "    private(set) var players = [Player]()")
  .replace("            players.append(Player(piece))", "            addPlayer(Player(piece))")
  .replace(/                    currentPlayer\.balance -= rent\n                    owner\.balance \+= rent\n/g, "                    transfer(rent, from: currentPlayer, to: owner)\n")
  .replace(/    func (passedGo|diceRoll|isOwned|diceRollIsDouble|owner)\(/g, "    private func $1(")
  .replace(/\n}$/, "\n\n    func addPlayer(_ player: Player) {\n        players.append(player)\n    }\n\n    private func transfer(_ amount: Int, from payer: Player, to payee: Player) {\n        payer.balance -= amount\n        payee.balance += amount\n    }\n}");

const TASKS = [
  { title: "Task 1 · Hide method",
    text: "The UI calls roll(), pass(), status() and ownsCompleteSet(). Apply Hide method to every func where it fits.",
    checks: [
      { label: "passedGo is private", re: "privatefuncpassedGo\\(" },
      { label: "diceRoll is private", re: "privatefuncdiceRoll\\(\\)" },
      { label: "diceRollIsDouble is private", re: "privatefuncdiceRollIsDouble\\(" },
      { label: "isOwned is private", re: "privatefuncisOwned\\(" },
      { label: "owner is private", re: "privatefuncowner\\(" },
      { label: "roll, pass, status and ownsCompleteSet stay public", re: "privatefunc(roll|pass|status|ownsCompleteSet)\\(", mode: "not" }
    ] },
  { title: "Task 2 · Extract method",
    text: "The two balance lines are duplicated in the Property and Utility branches. Extract them into private func transfer(_ amount: Int, from payer: Player, to payee: Player) and call it in both places.",
    checks: [
      { label: "transfer has that exact signature", re: "functransfer\\(_amount:Int,frompayer:Player,topayee:Player\\)" },
      { label: "transfer moves money from payer to payee", re: "payer\\.balance-=amount" },
      { label: "...and adds it to payee", re: "payee\\.balance\\+=amount" },
      { label: "both branches call transfer(rent, from: currentPlayer, to: owner)", re: "transfer\\(rent,from:currentPlayer,to:owner\\)", mode: "count", n: 2 },
      { label: "the duplicated lines are gone", re: "currentPlayer\\.balance-=rent", mode: "not" }
    ] },
  { title: "Task 3 · Encapsulate collection",
    text: "Outside code can change players directly. Lock it so outsiders can only read it, add addPlayer(_:), and use it in init.",
    checks: [
      { label: "players is private(set)", re: "private\\(set\\)varplayers" },
      { label: "addPlayer(_:) appends to players", re: "funcaddPlayer\\(_(\\w+):Player\\)\\{players\\.append\\(\\1\\)\\}" },
      { label: "init calls addPlayer", re: "addPlayer\\(Player\\(piece\\)\\)" },
      { label: "init no longer appends directly", re: "players\\.append\\(Player\\(piece\\)\\)", mode: "not" }
    ] }
];
const SAFETY = [
  { label: "roll() still exists", re: "funcroll\\(\\)" },
  { label: "the handler calls are untouched", re: "handler\\.rentPaid\\(", mode: "count", n: 2 }
];

let minutes = 15, t0 = 0, tick = null, answers = [], taskTries = [0, 0, 0];

function runChecks(list){
  const c = norm($("editor").value);
  return list.map(k => { const m = (c.match(new RegExp(k.re, "g")) || []).length; return { ...k, pass: k.mode === "not" ? m === 0 : k.mode === "count" ? m === k.n : m > 0 }; });
}

function renderQs(){
  $("qs").innerHTML = QS.map((q, n) =>
    '<div class="card q" id="q' + n + '"><span class="num">Question ' + (n+1) + ' of ' + QS.length + '</span><p>' + esc(q.prompt) + '</p>'
    + (q.before ? '<div class="panes"><div class="pane"><h3>Before</h3>' + code(q.before) + '</div><div class="pane after"><h3>After</h3>' + code(q.after) + '</div></div>' : '')
    + '<div class="opts">' + shuffle(q.options).map(o => '<button class="opt" data-v="' + esc(o) + '"><span class="dot"></span>' + esc(o) + '</button>').join("") + '</div>'
    + '<div class="feedback" hidden></div></div>').join("");
  QS.forEach((q, n) => $("q" + n).querySelectorAll(".opt").forEach(b => b.onclick = () => answer(n, b.dataset.v)));
}

function answer(n, v){
  const q = QS[n], box = $("q" + n), ok = v === q.answer;
  answers[n] = { picked: v, ok };
  box.querySelectorAll(".opt").forEach(b => { b.disabled = true; if(b.dataset.v === q.answer) b.classList.add("right"); else if(b.dataset.v === v) b.classList.add("wrong"); });
  const fb = box.querySelector(".feedback");
  fb.className = "feedback " + (ok ? "good" : "bad");
  fb.innerHTML = "<b>" + (ok ? "Correct" : "Wrong. It's: " + esc(q.answer)) + "</b>" + esc(q.why);
  fb.hidden = false;
  $("toP2").disabled = answers.filter(Boolean).length < QS.length;
}

function renderTasks(){
  $("tasks").innerHTML = TASKS.map((t, n) =>
    '<div class="card task"><div class="thead"><b>' + esc(t.title) + '</b><button class="btn" data-t="' + n + '">Check</button></div><p>' + esc(t.text) + '</p><ul class="checks" id="c' + n + '" hidden></ul></div>').join("");
  $("tasks").querySelectorAll("button[data-t]").forEach(b => b.onclick = () => showChecks(Number(b.dataset.t)));
}

function showChecks(n){
  taskTries[n]++;
  const res = runChecks(TASKS[n].checks), ul = $("c" + n);
  ul.innerHTML = res.map(r => '<li class="' + (r.pass ? "pass" : "fail") + '"><i>' + (r.pass ? "✓" : "✗") + '</i>' + esc(r.label) + '</li>').join("");
  ul.hidden = false;
}

function fmt(s){ const neg = s < 0; s = Math.abs(s); return (neg ? "+" : "") + Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function elapsed(){ return Math.floor((Date.now() - t0) / 1000); }
function updateClock(){
  const left = minutes * 60 - elapsed();
  $("clock").textContent = left >= 0 ? fmt(left) : "Over by " + fmt(-left).slice(1);
  $("timer").classList.toggle("low", left < 60);
}

function start(){
  answers = []; taskTries = [0, 0, 0];
  $("intro").hidden = true; $("results").hidden = true; $("copyBox").hidden = true; $("copyStatus").hidden = true;
  $("p1").hidden = false; $("p2").hidden = true; $("timer").hidden = false; $("part").textContent = "Part 1";
  $("toP2").disabled = true;
  $("editor").value = START;
  renderQs(); renderTasks();
  t0 = Date.now(); clearInterval(tick); tick = setInterval(updateClock, 500); updateClock();
  window.scrollTo(0, 0);
}

function toPart2(){
  $("p1").hidden = true; $("p2").hidden = false; $("part").textContent = "Part 2";
  window.scrollTo(0, 0);
}

function finish(){
  clearInterval(tick);
  const used = elapsed();
  const p1 = answers.filter(a => a && a.ok).length;
  const taskRes = TASKS.map(t => runChecks(t.checks));
  const safety = runChecks(SAFETY);
  const p2 = taskRes.reduce((s, r) => s + r.filter(x => x.pass).length, 0), p2max = taskRes.reduce((s, r) => s + r.length, 0);
  $("p2").hidden = true; $("timer").hidden = true; $("results").hidden = false;
  $("final").textContent = Math.round((p1 / QS.length * 0.4 + p2 / p2max * 0.6) * 100) + "%";
  const over = used - minutes * 60;
  $("verdict").textContent = "Part 1: " + p1 + " / " + QS.length + ". Part 2: " + p2 + " / " + p2max + " checks. Time: " + fmt(used) + (over > 0 ? " (" + fmt(over) + " over your " + minutes + " minutes)." : " (inside your " + minutes + " minutes).")
    + (safety.every(s => s.pass) ? "" : " Careful: you changed code the tasks didn't ask for.");
  $("summary").innerHTML = QS.map((q, n) => '<li><b>Q' + (n+1) + ' · ' + esc(q.answer) + '</b><span>' + (answers[n] && answers[n].ok ? "right" : "wrong, picked " + esc(answers[n] ? answers[n].picked : "nothing")) + '</span></li>').join("")
    + TASKS.map((t, n) => '<li><b>' + esc(t.title) + '</b><span>' + taskRes[n].filter(x => x.pass).length + ' / ' + taskRes[n].length + ' checks' + (taskRes[n].some(x => !x.pass) ? ' · missed: ' + esc(taskRes[n].filter(x => !x.pass).map(x => x.label).join("; ")) : '') + '</span></li>').join("");
  $("diffCode").innerHTML = diffHTML($("editor").value, MODEL);
  window.mockReport = { used, p1, p2, p2max, taskRes, safety };
  window.scrollTo(0, 0);
}

function lineDiff(mine, model){
  const a = mine.split("\n"), b = model.split("\n"), A = a.map(x => x.trim()), B = b.map(x => x.trim());
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
  return out.filter(([t, l]) => !(t !== " " && !l.trim()));
}
function diffHTML(mine, model){
  return lineDiff(mine, model).map(([t, l]) => '<span class="ln d' + (t === "+" ? "add" : t === "-" ? "del" : "") + '"><i>' + (t === " " ? "" : t) + '</i>' + (highlightSwift(l, TYPES) || " ") + '</span>').join("");
}

function report(){
  const r = window.mockReport;
  let t = "Mock Test results\nTime: " + fmt(r.used) + " of " + minutes + " min\nPart 1: " + r.p1 + " / " + QS.length + "\nPart 2: " + r.p2 + " / " + r.p2max + " checks\n\n";
  QS.forEach((q, n) => { if(!(answers[n] && answers[n].ok)) t += "Q" + (n+1) + " wrong: correct = " + q.answer + " | I picked = " + (answers[n] ? answers[n].picked : "nothing") + "\n"; });
  TASKS.forEach((tk, n) => { const miss = r.taskRes[n].filter(x => !x.pass); t += "\n" + tk.title + ": " + (r.taskRes[n].length - miss.length) + " / " + r.taskRes[n].length + (miss.length ? "\nMissed: " + miss.map(x => x.label).join("; ") : "") + "\n"; });
  if(r.safety.some(s => !s.pass)) t += "\nChanged code outside the tasks: " + r.safety.filter(s => !s.pass).map(s => s.label).join("; ") + "\n";
  t += "\nMy final code:\n" + $("editor").value + "\n";
  return t;
}

document.querySelectorAll(".seg button").forEach(b => b.onclick = () => {
  minutes = Number(b.dataset.min);
  document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
});
$("startBtn").onclick = start;
$("toP2").onclick = toPart2;
$("finishBtn").onclick = finish;
$("againBtn").onclick = start;
$("resetBtn").onclick = () => { if(confirm("Put the original code back? Your edits will be lost.")) $("editor").value = START; };
$("copyBtn").onclick = () => copyForClaude(report(), $("copyBox"), $("copyStatus"));
$("editor").addEventListener("keydown", ev => {
  if(ev.key === "Tab"){ ev.preventDefault(); const t = ev.target, s = t.selectionStart;
    t.value = t.value.slice(0, s) + "    " + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 4; }
});
window.addEventListener("beforeunload", ev => { if(!$("p2").hidden || !$("p1").hidden){ ev.preventDefault(); ev.returnValue = ""; } });
