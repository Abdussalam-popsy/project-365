// Spot-the-difference questions. To add one, copy an object and edit it.
// round: which set it belongs to · options: the 4 choices shown (answer must be one of them)
// hint: shown on request · explanation: shown after checking · note: optional context line

const QUESTIONS = [
  {
    "round": 1,
    "before": "class Cipher {\n    func makeSalt() -> String {\n        return \"abc\"\n    }\n\n    func encrypt(_ text: String) -> String {\n        return text + makeSalt()\n    }\n}",
    "after": "class Cipher {\n    private func makeSalt() -> String {\n        return \"abc\"\n    }\n\n    func encrypt(_ text: String) -> String {\n        return text + makeSalt()\n    }\n}",
    "answer": "Hide method",
    "options": [
      "Encapsulate field",
      "Hide method",
      "Extract method",
      "Remove setting method"
    ],
    "hint": "Was something new created, or did an existing func just get a new word in front of it?",
    "explanation": "An EXISTING func got private added. It's only used inside the class (by encrypt), so it gets hidden. Existing func + private = Hide method.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class Ticket {\n    var code: String\n\n    init(code: String) {\n        self.code = code\n    }\n\n    func setCode(_ c: String) {\n        code = c\n    }\n}",
    "after": "class Ticket {\n    let code: String\n\n    init(code: String) {\n        self.code = code\n    }\n}",
    "answer": "Remove setting method",
    "options": [
      "Inline method",
      "Remove setting method",
      "Encapsulate field",
      "Remove parameter"
    ],
    "hint": "Two clues: a func starting with 'set' vanished, and var became...?",
    "explanation": "The setter setCode was deleted AND var became let. The code can never change after creation. It's not Inline method because the func's body wasn't pasted anywhere; it was thrown away.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class Thermostat {\n    var temp = 20.0\n}",
    "after": "class Thermostat {\n    private(set) var temp = 20.0\n\n    func update(to t: Double) {\n        guard t >= -273.15 else { return }\n        temp = t\n    }\n}",
    "answer": "Encapsulate field",
    "options": [
      "Remove setting method",
      "Encapsulate collection",
      "Encapsulate field",
      "Extract method"
    ],
    "hint": "private(set) appeared. Check 1: new funcs? Check 2: square brackets?",
    "explanation": "New func added (yes). No [ ] so it's a single box. The temperature still needs to change, just safely. Encapsulate field.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class Playlist {\n    var songs: [String] = []\n}",
    "after": "class Playlist {\n    private(set) var songs: [String] = []\n\n    func add(song: String) {\n        songs.append(song)\n    }\n\n    func remove(song: String) {\n        songs.removeAll { $0 == song }\n    }\n}",
    "answer": "Encapsulate collection",
    "options": [
      "Encapsulate field",
      "Extract method",
      "Encapsulate collection",
      "Add parameter"
    ],
    "hint": "Look for [ ] next to the property.",
    "explanation": "[String] is a list. private(set) on a list + add/remove funcs = Encapsulate collection. Not Extract method: add and remove are brand new, no existing code was moved out of anything.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class Passport {\n    var number: String\n    var address: String\n\n    init(number: String, address: String) {\n        self.number = number\n        self.address = address\n    }\n}",
    "after": "class Passport {\n    private(set) var number: String\n    var address: String\n\n    init(number: String, address: String) {\n        self.number = number\n        self.address = address\n    }\n}",
    "answer": "Remove setting method",
    "options": [
      "Encapsulate field",
      "Remove setting method",
      "Hide method",
      "Encapsulate collection"
    ],
    "hint": "Same trap as the Account question. Any new funcs? Should a passport number ever change?",
    "explanation": "private(set) with NO new funcs, on something that should never change after creation. The address (can change) was left open; the number (never changes) was locked. Remove setting method.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func total() -> Int {\n    let bonus = points * 2\n    return points + bonus\n}",
    "after": "func total() -> Int {\n    return points + points * 2\n}",
    "answer": "Inline temp",
    "options": [
      "Inline method",
      "Split temporary variable",
      "Inline temp",
      "Introduce explaining variable"
    ],
    "hint": "Did a func disappear, or a let box?",
    "explanation": "The let bonus box vanished and its value got pasted where it was used. Box vanished = Inline temp. Inline method is when a whole func vanishes.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func canVote() -> Bool {\n    return age >= 18 && isCitizen && !isBanned\n}",
    "after": "func canVote() -> Bool {\n    let isAdult = age >= 18\n    let isAllowed = isCitizen && !isBanned\n    return isAdult && isAllowed\n}",
    "answer": "Introduce explaining variable",
    "options": [
      "Split temporary variable",
      "Introduce explaining variable",
      "Extract method",
      "Inline temp"
    ],
    "hint": "New let boxes appeared. Splitting one var with two jobs, or naming parts of one long line?",
    "explanation": "One long condition got broken into named let boxes that explain each part. Introduce explaining variable. Split temp would need an existing var that was reused for two jobs.",
    "note": ""
  },
  {
    "round": 1,
    "before": "var x = price * 0.2\nprint(\"Tax: \\(x)\")\n\nx = price * 0.1\nprint(\"Tip: \\(x)\")",
    "after": "let tax = price * 0.2\nprint(\"Tax: \\(tax)\")\n\nlet tip = price * 0.1\nprint(\"Tip: \\(tip)\")",
    "answer": "Split temporary variable",
    "options": [
      "Introduce explaining variable",
      "Rename method",
      "Inline temp",
      "Split temporary variable"
    ],
    "hint": "How many jobs was x doing before?",
    "explanation": "var x did two jobs (tax, then tip). Now each job has its own let. One box doing two jobs became two boxes = Split temporary variable.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func shouldTicket() -> Bool {\n    return isSpeeding()\n}\n\nprivate func isSpeeding() -> Bool {\n    return speed > 70\n}",
    "after": "func shouldTicket() -> Bool {\n    return speed > 70\n}",
    "answer": "Inline method",
    "options": [
      "Inline temp",
      "Hide method",
      "Inline method",
      "Remove setting method"
    ],
    "hint": "A func vanished. Where did its insides go?",
    "explanation": "isSpeeding() vanished and its one line got pasted into shouldTicket(). The middleman got cut out: Inline method.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func printReport() {\n    print(\"=====\")\n    print(\"REPORT\")\n    print(\"=====\")\n    print(\"Total: \\(total)\")\n}",
    "after": "func printReport() {\n    printBanner()\n    print(\"Total: \\(total)\")\n}\n\nprivate func printBanner() {\n    print(\"=====\")\n    print(\"REPORT\")\n    print(\"=====\")\n}",
    "answer": "Extract method",
    "options": [
      "Hide method",
      "Extract method",
      "Inline method",
      "Encapsulate collection"
    ],
    "hint": "The new func is private, but did it exist before?",
    "explanation": "Existing code (the 3 banner prints) moved OUT into a brand-new func. Extract method. The private is a side effect; Hide method only applies to a func that already existed.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func calc(_ a: [Int]) -> Int {\n    return a.reduce(0, +)\n}",
    "after": "func sum(of numbers: [Int]) -> Int {\n    return numbers.reduce(0, +)\n}",
    "answer": "Rename method",
    "options": [
      "Add parameter",
      "Remove parameter",
      "Rename method",
      "Extract method"
    ],
    "hint": "Count the inputs before and after. Same number?",
    "explanation": "Still one input, same job inside. Only the names changed: calc to sum. Rename method.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func copy(from: String, to: String, logLevel: Int) {\n    print(\"Copy \\(from) to \\(to)\")\n}",
    "after": "func copy(from: String, to: String) {\n    print(\"Copy \\(from) to \\(to)\")\n}",
    "answer": "Remove parameter",
    "options": [
      "Remove parameter",
      "Rename method",
      "Remove setting method",
      "Inline temp"
    ],
    "hint": "Look inside the brackets.",
    "explanation": "logLevel was never used inside the func, so it left the brackets. The func stayed, an input left = Remove parameter.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func export() {\n    print(\"Exporting as PDF\")\n}",
    "after": "func export(format: String) {\n    print(\"Exporting as \\(format)\")\n}",
    "answer": "Add parameter",
    "options": [
      "Rename method",
      "Add parameter",
      "Extract method",
      "Introduce explaining variable"
    ],
    "hint": "The brackets were empty before...",
    "explanation": "A new input format appeared in the brackets, replacing the hardcoded \"PDF\". Add parameter.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class User {\n    var role: String   // \"ADMIN\", \"EDITOR\", \"VIEWER\"\n}",
    "after": "enum Role {\n    case admin, editor, viewer\n}\n\nclass User {\n    var role: Role\n}",
    "answer": "Replace type code with class",
    "options": [
      "Extract interface",
      "Encapsulate field",
      "Replace type code with class",
      "Rename method"
    ],
    "hint": "Biggest new word?",
    "explanation": "Text codes became an enum. Replace type code with class. Works for text codes the same as number codes.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class StripePay {\n    func charge(amount: Double) -> Bool {\n        return true\n    }\n}\n\nclass Checkout {\n    let gateway: StripePay\n}",
    "after": "protocol PaymentGateway {\n    func charge(amount: Double) -> Bool\n}\n\nclass StripePay: PaymentGateway {\n    func charge(amount: Double) -> Bool {\n        return true\n    }\n}\n\nclass Checkout {\n    let gateway: PaymentGateway\n}",
    "answer": "Extract interface",
    "options": [
      "Extract method",
      "Replace type code with class",
      "Encapsulate field",
      "Extract interface"
    ],
    "hint": "Biggest new word?",
    "explanation": "A protocol appeared, StripePay signs up to it, and Checkout depends on the protocol now. protocol = interface. Extract interface.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class Sensor {\n    var reading: Double = 0\n}",
    "after": "class Sensor {\n    private var reading: Double = 0\n\n    func getReading() -> Double {\n        return reading\n    }\n\n    func update(_ r: Double) {\n        guard r >= 0 else { return }\n        reading = r\n    }\n}",
    "answer": "Encapsulate field",
    "options": [
      "Hide method",
      "Encapsulate field",
      "Remove setting method",
      "Encapsulate collection"
    ],
    "hint": "Did private go in front of a func or a var?",
    "explanation": "private went on a VAR (not a func, so not Hide method), and new funcs control reading and changing it. Single box + controlled access = Encapsulate field.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class LedgerEntry {\n    var transactionID: String\n\n    init(transactionID: String) {\n        self.transactionID = transactionID\n    }\n\n    func updateTransactionID(_ id: String) {\n        transactionID = id\n    }\n}",
    "after": "class LedgerEntry {\n    private(set) var transactionID: String\n\n    init(transactionID: String) {\n        self.transactionID = transactionID\n    }\n}",
    "answer": "Remove setting method",
    "options": [
      "Inline method",
      "Encapsulate field",
      "Remove setting method",
      "Hide method"
    ],
    "hint": "The func that vanished CHANGED a value. Was its body pasted anywhere?",
    "explanation": "The setter was deleted (not pasted anywhere, so not Inline method), and private(set) stops outsiders changing the ID. A transaction ID never changes = Remove setting method.",
    "note": ""
  },
  {
    "round": 1,
    "before": "class Team {\n    var memberRoles: [String: String] = [:]\n}",
    "after": "class Team {\n    private(set) var memberRoles: [String: String] = [:]\n\n    func assignRole(_ role: String, to name: String) {\n        memberRoles[name] = role\n    }\n\n    func removeMember(_ name: String) {\n        memberRoles[name] = nil\n    }\n}",
    "answer": "Encapsulate collection",
    "options": [
      "Encapsulate collection",
      "Encapsulate field",
      "Extract method",
      "Add parameter"
    ],
    "hint": "[String: String] has square brackets too.",
    "explanation": "[String: String] is a dictionary (a lookup table), which is also a collection. private(set) + add/remove funcs = Encapsulate collection.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func isEligibleToVote() -> Bool {\n    let userAge = age\n    return userAge >= 18\n}",
    "after": "func isEligibleToVote() -> Bool {\n    return age >= 18\n}",
    "answer": "Inline temp",
    "options": [
      "Inline method",
      "Inline temp",
      "Remove parameter",
      "Split temporary variable"
    ],
    "hint": "What vanished: a func, a box, or an input?",
    "explanation": "The pointless let userAge box vanished and age is used directly. Box vanished = Inline temp.",
    "note": ""
  },
  {
    "round": 1,
    "before": "func netPay() -> Double {\n    return (hours * rate) + (max(0, hours - 40) * rate * 0.5)\n}",
    "after": "func netPay() -> Double {\n    let basePay = hours * rate\n    let overtimePay = max(0, hours - 40) * rate * 0.5\n    return basePay + overtimePay\n}",
    "answer": "Introduce explaining variable",
    "options": [
      "Extract method",
      "Split temporary variable",
      "Introduce explaining variable",
      "Add parameter"
    ],
    "hint": "New funcs or new let boxes?",
    "explanation": "No new funcs, so not Extract method. One long maths line got broken into named let boxes. Introduce explaining variable.",
    "note": ""
  },
  {
    "round": 2,
    "before": "func diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    "after": "private func diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    "answer": "Hide method",
    "options": [
      "Encapsulate field",
      "Extract method",
      "Hide method",
      "Rename method"
    ],
    "hint": "An existing func got a new word in front of it.",
    "explanation": "An existing func, only used inside the class, got private. Hide method.",
    "note": "diceRoll() is only called inside MonopolyGame."
  },
  {
    "round": 2,
    "before": "func endTurnCheck() {\n    var amount = rentDue\n    print(\"Rent: \\(amount)\")\n\n    amount = goBonus\n    print(\"Go bonus: \\(amount)\")\n}",
    "after": "func endTurnCheck() {\n    let rent = rentDue\n    print(\"Rent: \\(rent)\")\n\n    let bonus = goBonus\n    print(\"Go bonus: \\(bonus)\")\n}",
    "answer": "Split temporary variable",
    "options": [
      "Rename method",
      "Split temporary variable",
      "Introduce explaining variable",
      "Inline temp"
    ],
    "hint": "Is the func name different? How many jobs did amount do?",
    "explanation": "The func name is unchanged, so not Rename method. var amount did two jobs and became two lets. Split temporary variable.",
    "note": ""
  },
  {
    "round": 2,
    "before": "class MonopolyGame {\n    var players = [Player]()\n}",
    "after": "class MonopolyGame {\n    private(set) var players = [Player]()\n\n    func addPlayer(_ player: Player) {\n        players.append(player)\n    }\n}",
    "answer": "Encapsulate collection",
    "options": [
      "Encapsulate field",
      "Remove setting method",
      "Extract method",
      "Encapsulate collection"
    ],
    "hint": "Check 1: new funcs? Check 2: square brackets?",
    "explanation": "New func added (yes), and [Player] is a list (yes). Encapsulate collection.",
    "note": ""
  },
  {
    "round": 2,
    "before": "if diceRollIsDouble() {\n    doubleDiceRollsForCurrentTurn += 1\n}\n\nfunc diceRollIsDouble() -> Bool {\n    return die1 == die2\n}",
    "after": "if die1 == die2 {\n    doubleDiceRollsForCurrentTurn += 1\n}",
    "answer": "Inline method",
    "options": [
      "Inline temp",
      "Remove parameter",
      "Inline method",
      "Hide method"
    ],
    "hint": "Something vanished. A box, an input, or a whole func?",
    "explanation": "The whole func vanished and its insides (die1 == die2) got pasted where it was called. Middleman removed: Inline method.",
    "note": ""
  },
  {
    "round": 2,
    "before": "class Player {\n    var gamePiece: GamePiece\n\n    init(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n\n    func setGamePiece(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n}",
    "after": "class Player {\n    let gamePiece: GamePiece\n\n    init(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n}",
    "answer": "Remove setting method",
    "options": [
      "Inline method",
      "Remove setting method",
      "Encapsulate field",
      "Remove parameter"
    ],
    "hint": "A set... func vanished, and var became...?",
    "explanation": "The setter was deleted (not pasted anywhere) and var became let. Your piece never changes mid-game. Remove setting method.",
    "note": ""
  },
  {
    "round": 2,
    "before": "func passedGo(_ player: Player) {\n    player.balance += 200\n}",
    "after": "func passedGo(_ player: Player, salary: Int) {\n    player.balance += salary\n}",
    "answer": "Add parameter",
    "options": [
      "Rename method",
      "Introduce explaining variable",
      "Add parameter",
      "Extract method"
    ],
    "hint": "Look inside the brackets.",
    "explanation": "A new input salary appeared in the brackets, replacing the hardcoded 200. Add parameter.",
    "note": ""
  },
  {
    "round": 2,
    "before": "var pieceCode: Int   // 0 = dog, 1 = car, 2 = hat",
    "after": "enum GamePiece {\n    case dog, car, hat\n}\n\nvar piece: GamePiece",
    "answer": "Replace type code with class",
    "options": [
      "Replace type code with class",
      "Extract interface",
      "Rename method",
      "Encapsulate field"
    ],
    "hint": "Biggest new word.",
    "explanation": "Number codes became an enum. Replace type code with class.",
    "note": ""
  },
  {
    "round": 2,
    "before": "func pass() {\n    doubleDiceRollsForCurrentTurn = 0\n    indexOfPlayerForCurrentTurn += 1\n}",
    "after": "func endTurn() {\n    doubleDiceRollsForCurrentTurn = 0\n    indexOfPlayerForCurrentTurn += 1\n}",
    "answer": "Rename method",
    "options": [
      "Remove parameter",
      "Inline method",
      "Hide method",
      "Rename method"
    ],
    "hint": "Look at the word straight after func.",
    "explanation": "The name after func changed (pass to endTurn), insides identical. Rename method.",
    "note": ""
  },
  {
    "round": 2,
    "before": "func currentLocation() -> Location {\n    let location = board[currentPlayer.boardIndex]\n    return location\n}",
    "after": "func currentLocation() -> Location {\n    return board[currentPlayer.boardIndex]\n}",
    "answer": "Inline temp",
    "options": [
      "Inline method",
      "Inline temp",
      "Split temporary variable",
      "Remove parameter"
    ],
    "hint": "Did a func vanish, or a let box?",
    "explanation": "The func is still there. Only the let location box vanished. Inline temp.",
    "note": ""
  },
  {
    "round": 2,
    "before": "class ConsoleHandler {\n    func passedGo(player: Player) {\n        print(\"Passed Go!\")\n    }\n}\n\nclass MonopolyGame {\n    let handler: ConsoleHandler\n}",
    "after": "protocol GameEventHandler {\n    func passedGo(player: Player)\n}\n\nclass ConsoleHandler: GameEventHandler {\n    func passedGo(player: Player) {\n        print(\"Passed Go!\")\n    }\n}\n\nclass MonopolyGame {\n    let handler: GameEventHandler\n}",
    "answer": "Extract interface",
    "options": [
      "Extract method",
      "Replace type code with class",
      "Extract interface",
      "Hide method"
    ],
    "hint": "Biggest new word.",
    "explanation": "A protocol appeared. protocol = interface. Extract interface.",
    "note": ""
  },
  {
    "round": 2,
    "before": "func status(_ player: Player, verbose: Bool) -> String {\n    return \"Balance: \\(player.balance)\"\n}",
    "after": "func status(_ player: Player) -> String {\n    return \"Balance: \\(player.balance)\"\n}",
    "answer": "Remove parameter",
    "options": [
      "Remove parameter",
      "Rename method",
      "Inline temp",
      "Remove setting method"
    ],
    "hint": "Is the func still there? What happened in the brackets?",
    "explanation": "The func is still there, but verbose (never used) left the brackets. Remove parameter.",
    "note": ""
  },
  {
    "round": 2,
    "before": "currentPlayer.boardIndex += die1 + die2",
    "after": "let diceTotal = die1 + die2\ncurrentPlayer.boardIndex += diceTotal",
    "answer": "Introduce explaining variable",
    "options": [
      "Inline temp",
      "Split temporary variable",
      "Add parameter",
      "Introduce explaining variable"
    ],
    "hint": "A new let box appeared. Splitting a var with two jobs, or naming part of an expression?",
    "explanation": "A new let box gives a name to part of the expression. Introduce explaining variable, the opposite of Inline temp.",
    "note": ""
  },
  {
    "round": 2,
    "before": "if let property = location as? Property {\n    let rent = property.rent(owner: owner)\n    currentPlayer.balance -= rent\n    owner.balance += rent\n}",
    "after": "if let property = location as? Property {\n    let rent = property.rent(owner: owner)\n    transfer(rent, from: currentPlayer, to: owner)\n}\n\nprivate func transfer(_ amount: Int, from payer: Player, to payee: Player) {\n    payer.balance -= amount\n    payee.balance += amount\n}",
    "answer": "Extract method",
    "options": [
      "Hide method",
      "Extract method",
      "Inline method",
      "Add parameter"
    ],
    "hint": "Did transfer() exist before?",
    "explanation": "Existing lines moved OUT into a brand-new func. Extract method. The private is a side effect, not Hide method.",
    "note": ""
  },
  {
    "round": 2,
    "before": "class Player {\n    var balance: Int = 1500\n}",
    "after": "class Player {\n    private(set) var balance: Int = 1500\n\n    func pay(_ amount: Int) {\n        guard amount > 0, amount <= balance else { return }\n        balance -= amount\n    }\n}",
    "answer": "Encapsulate field",
    "options": [
      "Remove setting method",
      "Encapsulate collection",
      "Encapsulate field",
      "Hide method"
    ],
    "hint": "Check 1: new funcs? Check 2: square brackets?",
    "explanation": "New func added (yes), no [ ] (single box). Balance still changes, just safely. Encapsulate field.",
    "note": ""
  },
  {
    "round": 2,
    "before": "class Station {\n    var name: String\n    var price: Int\n\n    init(name: String, price: Int) {\n        self.name = name\n        self.price = price\n    }\n}",
    "after": "class Station {\n    private(set) var name: String\n    var price: Int\n\n    init(name: String, price: Int) {\n        self.name = name\n        self.price = price\n    }\n}",
    "answer": "Remove setting method",
    "options": [
      "Encapsulate field",
      "Encapsulate collection",
      "Hide method",
      "Remove setting method"
    ],
    "hint": "Same shape as the Account question. Any new funcs?",
    "explanation": "private(set) and NO new funcs. A station's name (Kings Cross) never changes; the price was left open. Remove setting method.",
    "note": ""
  }
];

// Every technique, used by exam mode.
const ALL_OPTIONS = [
  "Remove setting method",
  "Hide method",
  "Encapsulate collection",
  "Replace type code with class",
  "Inline temp",
  "Inline method",
  "Introduce explaining variable",
  "Rename method",
  "Extract method",
  "Split temporary variable",
  "Encapsulate field",
  "Remove parameter",
  "Add parameter",
  "Extract interface"
];
