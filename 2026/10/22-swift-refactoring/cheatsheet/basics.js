// Swift basics as side-by-side comparison tables: the things that look alike, next to each other.
// Shown on the Cheat Sheet page and in the reference popup (the "Swift basics" button).
//
// Each table: id, title, intro (one line), cols (the things being compared), rows.
// Each row:   label, cells (one per col), and optional flags:
//   code: true   cells are Swift, shown in code style
//   twin: "js" | "py"   a JavaScript or Python row, hidden until "Show JS / Python" is on
// In a cell, **word** makes that word bold.

const BASICS = [
  {
    id: "collections",
    title: "Collections: holding many values",
    intro: "Square brackets mean a collection. A colon inside them means a lookup table.",
    cols: ["Array", "Set", "Dictionary"],
    rows: [
      { label: "What it is", cells: ["a list in order", "a bag of unique things", "a lookup table"] },
      { label: "Example", code: true, cells: ['["milk", "eggs", "milk"]', '["milk", "eggs"]', '["Aisha": "Lead", "Ben": "Dev"]'] },
      { label: "Order?", cells: ["yes, kept in order", "**no** order", "**no** order"] },
      { label: "Duplicates?", cells: ["allowed", "**not allowed**", "keys unique, values can repeat"] },
      { label: "Type", code: true, cells: ["[String]", "Set<String>", "[String: String]"] },
      { label: "Empty", code: true, cells: ["[]", "Set<String>()", "[:]"] },
      { label: "Add", code: true, cells: ['list.append("milk")', 'bag.insert("milk")', 'table["Aisha"] = "Lead"'] },
      { label: "Remove", code: true, cells: ['list.removeAll { $0 == "milk" }', 'bag.remove("milk")', 'table["Aisha"] = nil'] },
      { label: "Use it for", cells: ["order matters, repeats are fine (a cart)", "is it in there? (who's online)", "look one thing up by another (name → role)"] },
      { label: "Refactoring", cells: ["Encapsulate collection", "", "Encapsulate collection"] },
      { label: "JavaScript", twin: "js", code: true, cells: ["[]", "new Set()", "{} or new Map()"] },
      { label: "Python", twin: "py", code: true, cells: ["[]  (list)", "set()", "{}  (dict)"] },
    ],
  },
  {
    id: "boxes",
    title: "Boxes: who can read it, who can change it",
    intro: "let and var answer \"can it change?\". private answers \"who can touch it?\". They combine.",
    cols: ["let", "var", "private var", "private(set) var"],
    rows: [
      { label: "Can it change?", cells: ["**never**", "yes", "yes", "yes"] },
      { label: "Who can read it?", cells: ["anyone", "anyone", "**only this class**", "anyone"] },
      { label: "Who can change it?", cells: ["nobody", "**anyone**", "only this class", "**only this class**"] },
      { label: "Example", code: true, cells: ["let id: String", "var balance = 1500", "private var currentCelsius = 20.0", "private(set) var balance = 1500"] },
      { label: "Refactoring", cells: ["Remove setting method", "the \"before\" in most exercises", "Encapsulate field (plus a get func)", "Encapsulate field / collection, or Remove setting method if nothing is added"] },
      { label: "JavaScript", twin: "js", code: true, cells: ["const id", "let balance", "#celsius (private field)", "useState: read anywhere, change with setX"] },
      { label: "Python", twin: "py", code: true, cells: ["ID = ... (by convention)", "balance = 1500", "_celsius (by convention)", "@property with no setter"] },
    ],
  },
  {
    id: "build",
    title: "Things you build",
    intro: "Every other word lives inside one of these.",
    cols: ["class", "struct", "enum", "protocol", "func"],
    rows: [
      { label: "It is a", cells: ["thing (shared)", "thing (copied)", "menu of options", "job description", "action (a verb)"] },
      { label: "Contains", cells: ["boxes + funcs", "boxes + funcs", "case options", "func names only, **no code**", "steps"] },
      { label: "You use it by", code: true, cells: ["Player()", "CartItem(...)", ".active", "class Live: WeatherService", "player.pay(200)"] },
      { label: "Example", code: true, cells: ["class Player { ... }", "struct CartItem { let id: UUID }", "enum Status { case active, closed }", "protocol Logging { func log() }", "func pay(_ amount: Int) { ... }"] },
      { label: "Refactoring", cells: ["Extract class, Extract superclass", "", "Replace type code with class", "Extract interface", "Extract / Inline / Rename / Hide method"] },
      { label: "JavaScript", twin: "js", code: true, cells: ["class", "{ ... } object", "'active' | 'closed' (TS)", "interface (TS)", "function"] },
      { label: "Python", twin: "py", code: true, cells: ["class", "@dataclass", "class Status(Enum)", "class Logging(Protocol)", "def"] },
    ],
  },
  {
    id: "symbols",
    title: "Doing vs asking",
    intro: "Symbols on the left change a box. Symbols on the right ask a true/false question.",
    cols: ["Does something (changes a box)", "Asks a question (true / false)"],
    rows: [
      { label: "Equals", code: true, cells: ["=   put a value in", "==   are they equal?"] },
      { label: "Add / at least", code: true, cells: ["+=   add, and save", ">=   at least?"] },
      { label: "Subtract / at most", code: true, cells: ["-=   take away, and save", "<=   at most?"] },
      { label: "Not", code: true, cells: ["", "!=   different?     !x   not x"] },
      { label: "Combine", code: true, cells: ["", "&&   and     ||   or"] },
      { label: "Example", code: true, cells: ["balance -= amount", "guard amount <= balance else { return }"] },
      { label: "JavaScript", twin: "js", code: true, cells: ["=   +=   -=", "===   >=   <=   !==   &&   ||"] },
      { label: "Python", twin: "py", code: true, cells: ["=   +=   -=", "==   >=   <=   !=   and   or   not"] },
    ],
  },
  {
    id: "control",
    title: "if vs guard",
    intro: "Both check a condition. guard is a bouncer: it stops the func when the check fails.",
    cols: ["if", "guard"],
    rows: [
      { label: "Reads as", cells: ["only do this **if** true", "this **must** be true, otherwise stop"] },
      { label: "Good path goes", cells: ["inside the { }", "on the lines **after** it"] },
      { label: "Must it leave the func?", cells: ["no", "yes: its else has to return"] },
      { label: "Example", code: true, cells: ["if amount > 0 { balance -= amount }", "guard amount > 0 else { return }\nbalance -= amount"] },
      { label: "JavaScript", twin: "js", code: true, cells: ["if (amount > 0) { ... }", "if (!(amount > 0)) return"] },
      { label: "Python", twin: "py", code: true, cells: ["if amount > 0:", "if not amount > 0: return"] },
    ],
  },
];
