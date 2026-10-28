// Every Swift word and symbol used in the refactoring zip and the Monopoly code.
//
// VOCAB_GROUPS: the sections, in display order. `ask` is the question the whole group answers.
// VOCAB_WORDS: one entry per word.
//   group    id from VOCAB_GROUPS
//   word     what you'd see in the code
//   meaning  plain English (this is what the quiz asks about)
//   js       the JavaScript twin, or "" if there isn't a close one
//   example  a real line from the zip or Monopoly code (Swift)

const VOCAB_GROUPS = [
  { id: "build",   title: "Things you build",   ask: "What is this?" },
  { id: "boxes",   title: "Boxes",              ask: "Where's the value kept, and can it change?" },
  { id: "types",   title: "Types",              ask: "What kind of value?" },
  { id: "collect", title: "Collections",        ask: "How are many values held?" },
  { id: "access",  title: "Access",             ask: "Who's allowed to touch it?" },
  { id: "control", title: "Decisions and loops", ask: "What happens next?" },
  { id: "symbols", title: "Symbols",            ask: "Do something, or ask something?" },
  { id: "funcs",   title: "Func anatomy and closures", ask: "How do I read a func?" },
  { id: "actions", title: "Built-in actions",   ask: "What can I do to a list or a value?" },
];

const VOCAB_WORDS = [
  // ── Things you build
  { group: "build", word: "class", meaning: "Blueprint for a thing that remembers stuff and does stuff. Shared when passed around.", js: "class", example: "class Player { ... }" },
  { group: "build", word: "struct", meaning: "Like a class, but copied when passed around. Used for simple data.", js: "a plain object {}", example: "struct CartItem { let id: UUID }" },
  { group: "build", word: "enum", meaning: "A fixed menu of options. Nothing else is allowed.", js: "a union type 'active' | 'closed'", example: "enum OrderStatus { case pending, shipped }" },
  { group: "build", word: "protocol", meaning: "A job description: a list of funcs something must have. No code inside.", js: "TypeScript interface", example: "protocol WeatherService { func fetchCurrentTemperature() -> Double }" },
  { group: "build", word: "func", meaning: "An action (a verb). Takes inputs, does steps, may hand something back.", js: "function", example: "func pay(_ amount: Int) { ... }" },
  { group: "build", word: "init", meaning: "The setup steps that run when you make a new one.", js: "constructor", example: "init(name: String) { self.name = name }" },
  { group: "build", word: ": ProtocolName", meaning: "After a class name: this class signs up to that protocol (or inherits from that class).", js: "implements / extends", example: "class LiveWeatherService: WeatherService { ... }" },

  // ── Boxes
  { group: "boxes", word: "let", meaning: "A box that never changes after it's set.", js: "const", example: "let id: String" },
  { group: "boxes", word: "var", meaning: "A box that can change.", js: "let", example: "var balance: Int = 1500" },
  { group: "boxes", word: "static let", meaning: "A box that belongs to the blueprint itself, not to each copy.", js: "static", example: "static let pending = 0" },
  { group: "boxes", word: "self", meaning: "\"Me\", this object. Tells my box apart from an input with the same name.", js: "this", example: "self.name = name" },
  { group: "boxes", word: "property", meaning: "A box declared at the top of a class. The object remembers it.", js: "this.x in a class", example: "private(set) var balance: Int = 1500" },
  { group: "boxes", word: "local variable", meaning: "A box declared inside a func. It disappears when the func ends.", js: "a const inside a function", example: "let rent = property.rent(owner: owner)" },

  // ── Types
  { group: "types", word: "Int", meaning: "A whole number.", js: "number", example: "var balance: Int = 1500" },
  { group: "types", word: "Double", meaning: "A decimal number.", js: "number", example: "var currentCelsius: Double = 20.0" },
  { group: "types", word: "String", meaning: "Text.", js: "string", example: "let name: String" },
  { group: "types", word: "Bool", meaning: "True or false.", js: "boolean", example: "func isEligibleForBonus() -> Bool" },
  { group: "types", word: "UUID", meaning: "A guaranteed-unique id.", js: "crypto.randomUUID()", example: "let id: UUID" },
  { group: "types", word: "Date", meaning: "A moment in time.", js: "Date", example: "let issueDate: Date" },
  { group: "types", word: "Type?", meaning: "Optional: a value of that type, or nothing at all.", js: "T | null", example: "func owner(property: Rentable) -> Player?" },
  { group: "types", word: "nil", meaning: "Nothing. The empty value of an optional.", js: "null", example: "memberRoles[member] = nil" },

  // ── Collections
  { group: "collect", word: "[String]", meaning: "Array: a list in order. Repeats allowed.", js: "string[]", example: "var bookTitles: [String] = []" },
  { group: "collect", word: "[String: String]", meaning: "Dictionary: a lookup table, key → value. Keys are unique.", js: "{} object or Map", example: "var memberRoles: [String: String] = [:]" },
  { group: "collect", word: "Set<String>", meaning: "Set: unique things, no order. Adding a duplicate does nothing.", js: "new Set()", example: "var tags = Set<String>()" },
  { group: "collect", word: "[]", meaning: "An empty array.", js: "[]", example: "private(set) var items: [CartItem] = []" },
  { group: "collect", word: "[:]", meaning: "An empty dictionary.", js: "{}", example: "var memberRoles: [String: String] = [:]" },
  { group: "collect", word: "table[key] = value", meaning: "Set an entry in a dictionary. Replaces it if the key is already there.", js: "obj[key] = value", example: "memberRoles[member] = role" },

  // ── Access
  { group: "access", word: "(no keyword)", meaning: "Anyone can read it, change it, or call it.", js: "a normal property", example: "var balance: Int" },
  { group: "access", word: "private", meaning: "Only this class can see it at all.", js: "#private field", example: "private func diceRoll()" },
  { group: "access", word: "private(set)", meaning: "Anyone can read it. Only this class can change it.", js: "useState: read anywhere, change via setX", example: "private(set) var balance: Int" },

  // ── Decisions and loops
  { group: "control", word: "if / else", meaning: "Only do this if it's true, otherwise do that.", js: "if / else", example: "if amount > 100 { ... } else { ... }" },
  { group: "control", word: "guard ... else { return }", meaning: "A bouncer: this must be true, otherwise stop right now.", js: "if (!condition) return", example: "guard amount > 0 else { return }" },
  { group: "control", word: "return", meaning: "Hand back a value and stop the func.", js: "return", example: "return currentCelsius" },
  { group: "control", word: "for ... in", meaning: "Do this for each item in a list.", js: "for (const x of list)", example: "for player in players { ... }" },
  { group: "control", word: "case", meaning: "One option inside an enum.", js: "", example: "case active, suspended, closed" },
  { group: "control", word: "if let x = y as? Z", meaning: "If y is actually a Z, call it x and carry on inside the braces.", js: "if (y instanceof Z)", example: "if let property = location as? Property { ... }" },

  // ── Symbols
  { group: "symbols", word: "=", meaning: "Put a value in a box.", js: "=", example: "currentCelsius = celsius" },
  { group: "symbols", word: "+= / -=", meaning: "Add / take away, and save the result.", js: "+= / -=", example: "balance -= amount" },
  { group: "symbols", word: "==", meaning: "Question: are these equal?", js: "===", example: "return status == .active" },
  { group: "symbols", word: "!=", meaning: "Question: are these different?", js: "!==", example: "if a != b { ... }" },
  { group: "symbols", word: ">= / <=", meaning: "Question: greater than or equal / less than or equal?", js: ">= / <=", example: "guard celsius >= -273.15 else { return }" },
  { group: "symbols", word: "===", meaning: "Question: is it the exact same object (not just equal values)?", js: "=== on objects", example: "if playerProperty === property { ... }" },
  { group: "symbols", word: "&&", meaning: "And: both must be true.", js: "&&", example: "isAdult && hasActiveAccess" },
  { group: "symbols", word: "||", meaning: "Or: at least one must be true.", js: "||", example: "isSubscribed || activeTrialDaysLeft > 0" },
  { group: "symbols", word: "! (in front)", meaning: "Not: flips true and false.", js: "!", example: "if !emailIsValid { ... }" },
  { group: "symbols", word: "! (after)", meaning: "\"I promise this isn't empty.\" Crashes if it is.", js: "x! in TypeScript", example: "let owner = owner(property: p)!" },
  { group: "symbols", word: "->", meaning: "This func hands back a ...", js: "): Type in TypeScript", example: "func total() -> Double" },
  { group: "symbols", word: "a ? b : c", meaning: "Short if: if a then b, otherwise c.", js: "a ? b : c", example: "isVIP ? 0.15 : 0.0" },
  { group: "symbols", word: "1...6", meaning: "A range from 1 to 6, including 6.", js: "", example: "Int.random(in: 1...6)" },
  { group: "symbols", word: "\"\\(x)\"", meaning: "Drop a value into text.", js: "`${x}`", example: "print(\"Hello \\(name)\")" },
  { group: "symbols", word: "is", meaning: "Question: is this a ...?", js: "instanceof", example: "board.firstIndex { $0 is Jail }" },
  { group: "symbols", word: "as?", meaning: "Try to treat this as a ... (gives nothing if it isn't).", js: "", example: "location as? Property" },
  { group: "symbols", word: ".active", meaning: "An enum case, with the enum name left off because Swift can work it out.", js: "", example: "return status == .active" },

  // ── Func anatomy and closures
  { group: "funcs", word: "func name(label param: Type)", meaning: "label is what the caller writes; param is the name used inside the func.", js: "", example: "func removeItem(withId id: UUID)" },
  { group: "funcs", word: "_ (as a label)", meaning: "No label when calling: pay(200), not pay(amount: 200).", js: "", example: "func pay(_ amount: Int)" },
  { group: "funcs", word: "the brackets", meaning: "Your ingredients: inside the func you can use exactly the names listed there, plus the class's own boxes.", js: "function parameters", example: "func assignRole(_ role: String, to member: String)" },
  { group: "funcs", word: "{ item in ... }", meaning: "A closure: a mini func passed into another func. \"For each item, do this.\"", js: "item => ...", example: "items.removeAll { item in item.id == id }" },
  { group: "funcs", word: "$0", meaning: "Shorthand inside a closure for \"each item\".", js: "x in x => ...", example: "items.removeAll { $0.id == id }" },

  // ── Built-in actions
  { group: "actions", word: "append(x)", meaning: "Add to the end of an array.", js: "push(x)", example: "items.append(item)" },
  { group: "actions", word: "removeAll { ... }", meaning: "Remove every item that matches.", js: "arr = arr.filter(x => !...)", example: "items.removeAll { $0.id == id }" },
  { group: "actions", word: "removeAll()", meaning: "Remove everything.", js: "arr = []", example: "items.removeAll()" },
  { group: "actions", word: "filter { ... }", meaning: "Keep only the items that match, as a new list.", js: "filter", example: "values.filter { $0 > 0 }" },
  { group: "actions", word: "contains(x)", meaning: "Is it in there?", js: "includes(x)", example: "email.contains(\"@\")" },
  { group: "actions", word: "count", meaning: "How many.", js: "length", example: "password.count >= 8" },
  { group: "actions", word: "isEmpty", meaning: "Has nothing in it?", js: "length === 0", example: "valid.isEmpty ? 0.0 : ..." },
  { group: "actions", word: "sorted(by:)", meaning: "A new list in order.", js: "[...arr].sort()", example: "player.properties.sorted(by: { ... })" },
  { group: "actions", word: "firstIndex { ... }", meaning: "The position of the first item that matches.", js: "findIndex", example: "board.firstIndex { $0 is Jail }" },
  { group: "actions", word: "reduce(0, +)", meaning: "Add everything up into one value.", js: "reduce((a, b) => a + b, 0)", example: "numbers.reduce(0, +)" },
  { group: "actions", word: "max(a, b) / min(a, b)", meaning: "The bigger / smaller of two.", js: "Math.max / Math.min", example: "max(0, hours - 40)" },
  { group: "actions", word: "Int.random(in:)", meaning: "A random whole number in a range.", js: "Math.random()", example: "die1 = Int.random(in: 1...6)" },
  { group: "actions", word: "print(x)", meaning: "Show it in the console.", js: "console.log(x)", example: "print(\"Passed Go!\")" },
];
