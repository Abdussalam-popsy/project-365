// Workshop exercises. To add one, copy an object with the same level and edit it.
// Levels 1-2: `after` marks blanks with «answer» and accepts alternatives as «a|b».
// Level 3: `model` is the answer; `checks` are regexes run on your code with all whitespace removed
// (mode "not" = must not match, mode "count" = must match exactly n times).

const EX = [
  {
    "level": 1,
    "technique": "Hide method",
    "task": "diceRoll() is only called inside MonopolyGame. Apply Hide method.",
    "recipe": "Put private in front of func.",
    "before": "func diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    "after": "«private» func diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    "hints": [
      "One word. Which word means 'only this class can use it'?"
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Rename method",
    "task": "Rename pass() to endTurn().",
    "recipe": "1. Change the name on the func line. 2. Change the name everywhere it is called.",
    "before": "func pass() {\n    doubleDiceRollsForCurrentTurn = 0\n    indexOfPlayerForCurrentTurn += 1\n}\n\n// inside roll():\npass()",
    "after": "func «endTurn»() {\n    doubleDiceRollsForCurrentTurn = 0\n    indexOfPlayerForCurrentTurn += 1\n}\n\n// inside roll():\n«endTurn»()",
    "hints": [
      "Both blanks are the new name.",
      "Don't forget the caller in roll(). That's the step people lose marks on."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Add parameter",
    "task": "passedGo hardcodes 200. Add a salary: Int parameter, use it, and update the caller to pass 200.",
    "recipe": "1. Add the input to the brackets. 2. Use it in the body instead of the hardcoded value. 3. Update every caller.",
    "before": "func passedGo(_ player: Player) {\n    player.balance += 200\n}\n\n// inside roll():\npassedGo(currentPlayer)",
    "after": "func passedGo(_ player: Player, «salary»: «Int») {\n    player.balance += «salary»\n}\n\n// inside roll():\npassedGo(currentPlayer, salary: «200»)",
    "hints": [
      "The new input's name and type are in the task.",
      "The body should use the input, not 200.",
      "The caller now has to supply the value that used to be hardcoded."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Remove parameter",
    "task": "verbose is never used inside status(). Remove it and update the caller.",
    "recipe": "1. Delete the unused input from the brackets. 2. Delete it from every caller.",
    "before": "func status(_ player: Player, verbose: Bool) -> String {\n    return \"Balance: \\(player.balance)\"\n}\n\n// somewhere outside:\ngame.status(player, verbose: true)",
    "after": "func status(«_ player: Player») -> String {\n    return \"Balance: \\(player.balance)\"\n}\n\n// somewhere outside:\ngame.status(«player»)",
    "hints": [
      "Keep the player input exactly as it was, just without the verbose part.",
      "The caller only passes the player now."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Inline method",
    "task": "diceRollIsDouble() just returns die1 == die2. Inline it into roll() and delete it.",
    "recipe": "1. Copy the func's body into the place that calls it. 2. Delete the func.",
    "before": "// inside roll():\nif diceRollIsDouble() {\n    doubleDiceRollsForCurrentTurn += 1\n}\n\nfunc diceRollIsDouble() -> Bool {\n    return die1 == die2\n}",
    "after": "// inside roll():\nif «die1 == die2|die2 == die1» {\n    doubleDiceRollsForCurrentTurn += 1\n}\n\n// diceRollIsDouble() is deleted",
    "hints": [
      "What does diceRollIsDouble() return? Put exactly that in its place."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Inline temp",
    "task": "The location box adds nothing. Inline it.",
    "recipe": "Replace the box with what it holds, then delete the box.",
    "before": "func currentLocation() -> Location {\n    let location = board[currentPlayer.boardIndex]\n    return location\n}",
    "after": "func currentLocation() -> Location {\n    return «board[currentPlayer.boardIndex]»\n}",
    "hints": [
      "Return what location was holding."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Introduce explaining variable",
    "task": "Give die1 + die2 a name: diceTotal.",
    "recipe": "1. Make a let with a clear name for part of the expression. 2. Use the name in the original line.",
    "before": "currentPlayer.boardIndex += die1 + die2",
    "after": "let diceTotal = «die1 + die2|die2 + die1»\ncurrentPlayer.boardIndex += «diceTotal»",
    "hints": [
      "The new box holds the part being named.",
      "Then use the box instead of the maths."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Split temporary variable",
    "task": "result does two jobs. Split it into perimeter and area.",
    "recipe": "Give each job its own let with a clear name, and use that name where the job's value is used.",
    "before": "var result = 2 * (height + width)\nprint(\"Perimeter: \\(result)\")\n\nresult = height * width\nprint(\"Area: \\(result)\")",
    "after": "«let» perimeter = 2 * (height + width)\nprint(\"Perimeter: \\(«perimeter»)\")\n\n«let» area = height * width\nprint(\"Area: \\(«area»)\")",
    "hints": [
      "Each new box is set once and never changes. var or let?",
      "Print the box that holds that job's value."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Remove setting method",
    "task": "A player's piece never changes mid-game. Remove the setter.",
    "recipe": "1. Delete the set... func. 2. Change var to let.",
    "before": "class Player {\n    var gamePiece: GamePiece\n\n    init(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n\n    func setGamePiece(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n}",
    "after": "class Player {\n    «let» gamePiece: GamePiece\n\n    init(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n}",
    "hints": [
      "Which word means 'never changes after it's set'?"
    ],
    "note": "setGamePiece is deleted."
  },
  {
    "level": 1,
    "technique": "Encapsulate field",
    "task": "Balance should still change, but only through a checked pay(_:) func.",
    "recipe": "1. Lock the box with private(set). 2. Add a func that checks the change before making it.",
    "before": "class Player {\n    var balance: Int = 1500\n}",
    "after": "class Player {\n    «private(set)» var balance: Int = 1500\n\n    func pay(_ amount: Int) {\n        guard amount > 0, amount <= «balance» else { return }\n        balance «-=» amount\n    }\n}",
    "hints": [
      "Outsiders can read it but not change it. What goes in front of var?",
      "You can't pay more than you have. Compare the amount to what?",
      "Paying takes money away. Which operator subtracts and saves?"
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Encapsulate collection",
    "task": "This is the ShoppingCart exercise from the zip. items is already private(set). Write the three funcs.",
    "recipe": "1. Lock the list with private(set). 2. Add funcs to add, remove and clear.",
    "before": "struct CartItem {\n    let id: UUID\n    let name: String\n    let price: Double\n}\n\nclass ShoppingCart {\n    var items: [CartItem] = []\n}",
    "after": "class ShoppingCart {\n    private(set) var items: [CartItem] = []\n\n    func addItem(_ item: «CartItem») {\n        items.«append»(item)\n    }\n\n    func removeItem(withId id: UUID) {\n        items.removeAll { item in item.«id» == «id» }\n    }\n\n    func clear() {\n        items.«removeAll»()\n    }\n}",
    "hints": [
      "What is one thing in the cart called? Look at the struct name.",
      "Same word you used to add a course in Exercise 1.",
      "Match each item's id against the id you were given.",
      "Remove everything, with no condition."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Replace type code with class",
    "task": "status uses numbers: 0 = pending, 1 = shipped, 2 = delivered, 3 = cancelled. Replace them with an enum.",
    "recipe": "1. Make an enum with one case per code. 2. Change the property's type to the enum.",
    "before": "class FulfillmentOrder {\n    let orderID: String\n    var status: Int   // 0 = pending, 1 = shipped, 2 = delivered, 3 = cancelled\n}",
    "after": "«enum» OrderStatus {\n    case pending, shipped, delivered, «cancelled»\n}\n\nclass FulfillmentOrder {\n    let orderID: String\n    var status: «OrderStatus»\n}",
    "hints": [
      "Which keyword makes a fixed list of options?",
      "One option is missing from the list.",
      "The property's type is now the enum's name."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Extract interface",
    "task": "WeatherDisplayWidget is stuck to LiveWeatherService. Extract a WeatherService protocol and depend on that.",
    "recipe": "1. Write a protocol listing the funcs. 2. Make the class sign up to it. 3. Change the dependency's type to the protocol.",
    "before": "class LiveWeatherService {\n    func fetchCurrentTemperature() -> Double {\n        return 21.5\n    }\n}\n\nclass WeatherDisplayWidget {\n    let api: LiveWeatherService\n\n    init(api: LiveWeatherService) {\n        self.api = api\n    }\n}",
    "after": "«protocol» WeatherService {\n    func fetchCurrentTemperature() -> Double\n}\n\nclass LiveWeatherService: «WeatherService» {\n    func fetchCurrentTemperature() -> Double {\n        return 21.5\n    }\n}\n\nclass WeatherDisplayWidget {\n    let api: «WeatherService»\n\n    init(api: «WeatherService») {\n        self.api = api\n    }\n}",
    "hints": [
      "Which keyword makes a job description?",
      "Sign the class up to the protocol after the colon.",
      "Both the property and init should use the protocol, not the concrete class."
    ],
    "note": ""
  },
  {
    "level": 1,
    "technique": "Extract method",
    "task": "Pull the 3 banner lines out into printBanner().",
    "recipe": "1. Make a new func named after what the chunk does. 2. Move the chunk into it. 3. Call the new func where the chunk used to be.",
    "before": "func printReceipt() {\n    print(\"=====\")\n    print(\"RECEIPT\")\n    print(\"=====\")\n    print(\"Customer: \\(customerName)\")\n}",
    "after": "func printReceipt() {\n    «printBanner»()\n    print(\"Customer: \\(customerName)\")\n}\n\n«private» func printBanner() {\n    print(\"=====\")\n    print(\"RECEIPT\")\n    print(\"=====\")\n}",
    "hints": [
      "Call the new func by its name.",
      "It's only used inside this class, so it's hidden."
    ],
    "note": ""
  },
  {
    "level": 2,
    "technique": "Encapsulate field",
    "task": "From the zip: make currentCelsius private, add getCurrentCelsius(), and make updateTemperature(_:) refuse anything below -273.15.",
    "recipe": "1. Lock the box. 2. Add a func to read it. 3. Add a func that checks before changing it.",
    "before": "class ThermostatSensor {\n    var currentCelsius: Double = 20.0\n}",
    "after": "class ThermostatSensor {\n    «private var currentCelsius: Double = 20.0»\n\n    func getCurrentCelsius() -> Double {\n        «return currentCelsius|return self.currentCelsius»\n    }\n\n    func updateTemperature(_ celsius: Double) {\n        «guard celsius >= -273.15 else { return }|guard -273.15 <= celsius else { return }»\n        «currentCelsius = celsius|self.currentCelsius = celsius»\n    }\n}",
    "hints": [
      "The task says private, not private(set).",
      "The getter just hands back the box.",
      "A guard refuses bad values: guard <condition that must be true> else { return }",
      "After the guard passes, save the new value."
    ],
    "note": ""
  },
  {
    "level": 2,
    "technique": "Remove setting method",
    "task": "From the zip: an employee ID never changes. Remove setID(_:) and make id immutable.",
    "recipe": "1. Delete the set... func. 2. Change var to let.",
    "before": "class EmployeeRecord {\n    var id: String\n    var name: String\n\n    init(id: String, name: String) {\n        self.id = id\n        self.name = name\n    }\n\n    func setID(_ newID: String) {\n        self.id = newID\n    }\n}",
    "after": "class EmployeeRecord {\n    «let id: String»\n    var name: String\n\n    init(id: String, name: String) {\n        self.id = id\n        self.name = name\n    }\n}",
    "hints": [
      "Write the whole line for id, using the word that means 'never changes'."
    ],
    "note": "setID is deleted."
  },
  {
    "level": 2,
    "technique": "Encapsulate collection",
    "task": "From the zip: lock memberRoles and add assignRole(_:to:) and removeMember(_:).",
    "recipe": "1. Lock the dictionary with private(set). 2. Add funcs to change it.",
    "before": "class ProjectTeam {\n    let teamName: String\n    var memberRoles: [String: String] = [:]\n\n    init(teamName: String) {\n        self.teamName = teamName\n    }\n}",
    "after": "class ProjectTeam {\n    let teamName: String\n    «private(set) var memberRoles: [String: String] = [:]»\n\n    init(teamName: String) {\n        self.teamName = teamName\n    }\n\n    func assignRole(_ role: String, to member: String) {\n        «memberRoles[member] = role»\n    }\n\n    func removeMember(_ member: String) {\n        «memberRoles[member] = nil|memberRoles.removeValue(forKey: member)»\n    }\n}",
    "hints": [
      "Same line as before, with private(set) in front.",
      "Dictionaries work like dictionary[key] = value. The key is the member's name.",
      "Setting a key to nil removes it."
    ],
    "note": ""
  },
  {
    "level": 2,
    "technique": "Add parameter",
    "task": "From the zip: add priority: AlertPriority to sendAlert, print it, and update the internal caller.",
    "recipe": "1. Add the input. 2. Use it in the body. 3. Update every caller.",
    "before": "func sendAlert(message: String) {\n    print(\"[ALERT]: \\(message)\")\n}\n\nfunc notifyUser() {\n    sendAlert(message: \"Disk space is low\")\n}",
    "after": "func sendAlert(message: String, «priority: AlertPriority») {\n    «print(\"[ALERT - \\(priority)]: \\(message)\")»\n}\n\nfunc notifyUser() {\n    «sendAlert(message: \"Disk space is low\", priority: .high)|sendAlert(message: \"Disk space is low\", priority: .low)|sendAlert(message: \"Disk space is low\", priority: .medium)»\n}",
    "hints": [
      "Name and type are in the task.",
      "Format: [ALERT - <priority>]: <message>",
      "The caller must now pass a priority. Enum cases start with a dot, like .high"
    ],
    "note": ""
  },
  {
    "level": 2,
    "technique": "Introduce explaining variable",
    "task": "From the zip: break the condition into isAdult, hasActiveAccess and isInSupportedRegion.",
    "recipe": "1. Give each part of the long expression its own named let. 2. Use the names in the return.",
    "before": "func canAccessPremiumContent() -> Bool {\n    return age >= 18 && (isSubscribed || activeTrialDaysLeft > 0) && (countryCode == \"US\" || countryCode == \"CA\" || countryCode == \"UK\")\n}",
    "after": "func canAccessPremiumContent() -> Bool {\n    «let isAdult = age >= 18»\n    «let hasActiveAccess = isSubscribed || activeTrialDaysLeft > 0»\n    «let isInSupportedRegion = countryCode == \"US\" || countryCode == \"CA\" || countryCode == \"UK\"|let isInSupportedRegion = [\"US\", \"CA\", \"UK\"].contains(countryCode)»\n    «return isAdult && hasActiveAccess && isInSupportedRegion»\n}",
    "hints": [
      "Copy the first chunk of the condition into a let called isAdult.",
      "Second chunk, without the outer brackets.",
      "Third chunk.",
      "Combine the three names with &&."
    ],
    "note": ""
  },
  {
    "level": 2,
    "technique": "Replace type code with class",
    "task": "From the zip: status uses 0 = active, 1 = suspended, 2 = closed. Replace with a MemberStatus enum.",
    "recipe": "1. Make the enum. 2. Change the property and init to use it. 3. Update any logic that compared numbers.",
    "before": "class MemberAccount {\n    let username: String\n    var status: Int\n\n    init(username: String, status: Int) {\n        self.username = username\n        self.status = status\n    }\n\n    func canAccessServices() -> Bool {\n        return status == 0\n    }\n}",
    "after": "«enum MemberStatus {»\n    «case active, suspended, closed»\n}\n\nclass MemberAccount {\n    let username: String\n    «var status: MemberStatus»\n\n    init(username: String, «status: MemberStatus») {\n        self.username = username\n        self.status = status\n    }\n\n    func canAccessServices() -> Bool {\n        «return status == .active»\n    }\n}",
    "hints": [
      "enum <Name> {",
      "One case line listing all three.",
      "The property's type changes.",
      "So does init's input.",
      "0 meant active. Compare with the enum case instead."
    ],
    "note": ""
  },
  {
    "level": 2,
    "technique": "Extract interface",
    "task": "From the zip: extract a Logging protocol and make AuditService depend on it.",
    "recipe": "1. Protocol listing the funcs. 2. Class signs up. 3. Dependency uses the protocol.",
    "before": "class ConsoleLogger {\n    func logInfo(_ message: String) { print(\"[INFO]: \\(message)\") }\n    func logError(_ message: String) { print(\"[ERROR]: \\(message)\") }\n}\n\nclass AuditService {\n    let logger: ConsoleLogger\n\n    init(logger: ConsoleLogger) {\n        self.logger = logger\n    }\n}",
    "after": "«protocol Logging {»\n    func logInfo(_ message: String)\n    func logError(_ message: String)\n}\n\n«class ConsoleLogger: Logging {»\n    func logInfo(_ message: String) { print(\"[INFO]: \\(message)\") }\n    func logError(_ message: String) { print(\"[ERROR]: \\(message)\") }\n}\n\nclass AuditService {\n    «let logger: Logging»\n\n    «init(logger: Logging) {»\n        self.logger = logger\n    }\n}",
    "hints": [
      "protocol <Name> {",
      "Sign ConsoleLogger up to the protocol.",
      "The property uses the protocol type.",
      "So does init."
    ],
    "note": ""
  },
  {
    "level": 2,
    "technique": "Extract method",
    "task": "From the zip: extract validateCredentials(email:password:) from registerUser.",
    "recipe": "1. New func named after the chunk. 2. Move the chunk in. 3. Call it where the chunk was.",
    "before": "func registerUser(email: String, password: String) -> Bool {\n    let emailIsValid = email.contains(\"@\") && email.contains(\".\")\n    let passwordIsValid = password.count >= 8\n    if !emailIsValid || !passwordIsValid {\n        print(\"Registration failed: Invalid email or password.\")\n        return false\n    }\n    print(\"User registered successfully for \\(email).\")\n    return true\n}",
    "after": "func registerUser(email: String, password: String) -> Bool {\n    «if !validateCredentials(email: email, password: password) {»\n        print(\"Registration failed: Invalid email or password.\")\n        return false\n    }\n    print(\"User registered successfully for \\(email).\")\n    return true\n}\n\n«private func validateCredentials(email: String, password: String) -> Bool {|func validateCredentials(email: String, password: String) -> Bool {»\n    let emailIsValid = email.contains(\"@\") && email.contains(\".\")\n    let passwordIsValid = password.count >= 8\n    «return emailIsValid && passwordIsValid»\n}",
    "hints": [
      "Call the new func, and fail if it says false.",
      "The new func takes email and password and returns Bool.",
      "Valid only if both checks pass."
    ],
    "note": ""
  },
  {
    "level": 3,
    "technique": "Hide method",
    "task": "Apply Hide method to MonopolyGame. Only roll(), pass(), status() and ownsCompleteSet() are used from outside the class.",
    "recipe": "Put private in front of every func that is only called inside the class.",
    "before": "func roll() { ... }\nfunc pass() { ... }\nfunc passedGo(_ player: Player) { ... }\nfunc diceRoll() { ... }\nfunc diceRollIsDouble() -> Bool { ... }\nfunc isOwned(property: Rentable) -> Bool { ... }\nfunc owner(property: Rentable) -> Player? { ... }\nfunc status(_ player: Player) -> String { ... }\nfunc ownsCompleteSet(_ player: Player, _ group: Group) -> Bool { ... }",
    "model": "func roll() { ... }\nfunc pass() { ... }\nprivate func passedGo(_ player: Player) { ... }\nprivate func diceRoll() { ... }\nprivate func diceRollIsDouble() -> Bool { ... }\nprivate func isOwned(property: Rentable) -> Bool { ... }\nprivate func owner(property: Rentable) -> Player? { ... }\nfunc status(_ player: Player) -> String { ... }\nfunc ownsCompleteSet(_ player: Player, _ group: Group) -> Bool { ... }",
    "checks": [
      {
        "label": "passedGo is private",
        "re": "privatefuncpassedGo\\("
      },
      {
        "label": "diceRoll is private",
        "re": "privatefuncdiceRoll\\(\\)"
      },
      {
        "label": "diceRollIsDouble is private",
        "re": "privatefuncdiceRollIsDouble\\("
      },
      {
        "label": "isOwned is private",
        "re": "privatefuncisOwned\\("
      },
      {
        "label": "owner is private",
        "re": "privatefuncowner\\("
      },
      {
        "label": "roll stays public",
        "re": "privatefuncroll\\(",
        "mode": "not"
      },
      {
        "label": "pass stays public",
        "re": "privatefuncpass\\(",
        "mode": "not"
      },
      {
        "label": "status stays public",
        "re": "privatefuncstatus\\(",
        "mode": "not"
      },
      {
        "label": "ownsCompleteSet stays public",
        "re": "privatefuncownsCompleteSet\\(",
        "mode": "not"
      }
    ],
    "hints": [
      "Five of the nine get private.",
      "The four named in the task stay as they are."
    ]
  },
  {
    "level": 3,
    "technique": "Rename method",
    "task": "Rename diceRoll() to rollDice(). Update the func and its caller.",
    "recipe": "1. Change the name on the func line. 2. Change every call.",
    "before": "func roll() {\n    let currentPlayer = players[indexOfPlayerForCurrentTurn]\n\n    diceRoll()\n\n    if diceRollIsDouble() {\n        doubleDiceRollsForCurrentTurn += 1\n    }\n}\n\nfunc diceRoll() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    "model": "func roll() {\n    let currentPlayer = players[indexOfPlayerForCurrentTurn]\n\n    rollDice()\n\n    if diceRollIsDouble() {\n        doubleDiceRollsForCurrentTurn += 1\n    }\n}\n\nfunc rollDice() {\n    die1 = Int.random(in: 1...6)\n    die2 = Int.random(in: 1...6)\n}",
    "checks": [
      {
        "label": "func line renamed to rollDice()",
        "re": "funcrollDice\\(\\)"
      },
      {
        "label": "caller inside roll() updated",
        "re": "rollDice\\(\\)",
        "mode": "count",
        "n": 2
      },
      {
        "label": "old name diceRoll() is gone",
        "re": "diceRoll\\(\\)",
        "mode": "not"
      },
      {
        "label": "diceRollIsDouble left alone",
        "re": "diceRollIsDouble\\(\\)"
      }
    ],
    "hints": [
      "Two places change: the func line, and the call inside roll().",
      "Don't touch diceRollIsDouble(). It's a different func."
    ]
  },
  {
    "level": 3,
    "technique": "Inline method",
    "task": "Inline diceRollIsDouble() into roll() and delete it.",
    "recipe": "1. Paste the func's body where it's called. 2. Delete the func.",
    "before": "func roll() {\n    diceRoll()\n\n    if diceRollIsDouble() {\n        doubleDiceRollsForCurrentTurn += 1\n    }\n}\n\nfunc diceRollIsDouble() -> Bool {\n    return die1 == die2\n}",
    "model": "func roll() {\n    diceRoll()\n\n    if die1 == die2 {\n        doubleDiceRollsForCurrentTurn += 1\n    }\n}",
    "checks": [
      {
        "label": "the if now checks die1 == die2 directly",
        "re": "if\\(?(die1==die2|die2==die1)\\)?\\{"
      },
      {
        "label": "diceRollIsDouble is completely gone",
        "re": "diceRollIsDouble",
        "mode": "not"
      },
      {
        "label": "diceRoll() call still there",
        "re": "diceRoll\\(\\)"
      }
    ],
    "hints": [
      "Replace the call with what the func returns.",
      "Then delete the whole func, including its last }."
    ]
  },
  {
    "level": 3,
    "technique": "Add parameter",
    "task": "Add salary: Int to passedGo, use it instead of 200, and make the caller pass 200.",
    "recipe": "1. Add the input. 2. Use it. 3. Update every caller.",
    "before": "func roll() {\n    if currentPlayer.boardIndex >= board.count {\n        currentPlayer.boardIndex -= board.count\n        passedGo(currentPlayer)\n    }\n}\n\nfunc passedGo(_ player: Player) {\n    player.balance += 200\n    handler.passedGo(player: player)\n}",
    "model": "func roll() {\n    if currentPlayer.boardIndex >= board.count {\n        currentPlayer.boardIndex -= board.count\n        passedGo(currentPlayer, salary: 200)\n    }\n}\n\nfunc passedGo(_ player: Player, salary: Int) {\n    player.balance += salary\n    handler.passedGo(player: player)\n}",
    "checks": [
      {
        "label": "func line has salary: Int",
        "re": "funcpassedGo\\(_player:Player,salary:Int\\)"
      },
      {
        "label": "body uses salary",
        "re": "player\\.balance\\+=salary"
      },
      {
        "label": "200 no longer hardcoded in the body",
        "re": "balance\\+=200",
        "mode": "not"
      },
      {
        "label": "caller passes salary: 200",
        "re": "passedGo\\(currentPlayer,salary:200\\)"
      },
      {
        "label": "handler call left alone",
        "re": "handler\\.passedGo\\(player:player\\)"
      }
    ],
    "hints": [
      "Three places change: the func line, the body, and the caller.",
      "Leave handler.passedGo(player: player) alone. That's a different object's func."
    ]
  },
  {
    "level": 3,
    "technique": "Encapsulate collection",
    "task": "Make players read-only from outside, add addPlayer(_:), and use it in init.",
    "recipe": "1. private(set) on the list. 2. Add a func that appends. 3. Use it where the list was changed directly.",
    "before": "class MonopolyGame {\n    var players = [Player]()\n\n    init(playerPieces: [GamePiece], handler: GameEventHandler) {\n        self.handler = handler\n        for piece in playerPieces {\n            players.append(Player(piece))\n        }\n    }\n}",
    "model": "class MonopolyGame {\n    private(set) var players = [Player]()\n\n    init(playerPieces: [GamePiece], handler: GameEventHandler) {\n        self.handler = handler\n        for piece in playerPieces {\n            addPlayer(Player(piece))\n        }\n    }\n\n    func addPlayer(_ player: Player) {\n        players.append(player)\n    }\n}",
    "checks": [
      {
        "label": "players is private(set)",
        "re": "private\\(set\\)varplayers"
      },
      {
        "label": "addPlayer(_:) exists and appends",
        "re": "funcaddPlayer\\(_(\\w+):Player\\)\\{players\\.append\\(\\1\\)\\}"
      },
      {
        "label": "init uses addPlayer",
        "re": "addPlayer\\(Player\\(piece\\)\\)"
      }
    ],
    "hints": [
      "Same pattern as the ShoppingCart addItem.",
      "In init, swap players.append(...) for a call to your new func."
    ]
  },
  {
    "level": 3,
    "technique": "Encapsulate field",
    "task": "Outsiders should be able to read die1, die2 and indexOfPlayerForCurrentTurn, but not change them.",
    "recipe": "Swift's version of Encapsulate field: private(set).",
    "before": "var die1: Int = 0\nvar die2: Int = 0\nvar indexOfPlayerForCurrentTurn = 0",
    "model": "private(set) var die1: Int = 0\nprivate(set) var die2: Int = 0\nprivate(set) var indexOfPlayerForCurrentTurn = 0",
    "checks": [
      {
        "label": "die1 is private(set)",
        "re": "private\\(set\\)vardie1"
      },
      {
        "label": "die2 is private(set)",
        "re": "private\\(set\\)vardie2"
      },
      {
        "label": "indexOfPlayerForCurrentTurn is private(set)",
        "re": "private\\(set\\)varindexOfPlayerForCurrentTurn"
      }
    ],
    "hints": [
      "Readable outside, changeable only inside: which two words?"
    ]
  },
  {
    "level": 3,
    "technique": "Introduce explaining variable",
    "task": "Name die1 + die2 as diceTotal.",
    "recipe": "1. New let with a clear name. 2. Use it in the original line.",
    "before": "currentPlayer.boardIndex += die1 + die2",
    "model": "let diceTotal = die1 + die2\ncurrentPlayer.boardIndex += diceTotal",
    "checks": [
      {
        "label": "let diceTotal = die1 + die2",
        "re": "letdiceTotal=(die1\\+die2|die2\\+die1)"
      },
      {
        "label": "boardIndex uses diceTotal",
        "re": "currentPlayer\\.boardIndex\\+=diceTotal"
      }
    ],
    "hints": [
      "Two lines: make the box, then use it."
    ]
  },
  {
    "level": 3,
    "technique": "Extract method",
    "task": "The two balance lines are duplicated. Extract them into private func transfer(_ amount: Int, from payer: Player, to payee: Player) and call it in both places.",
    "recipe": "1. New func named after the chunk. 2. Move the chunk in, using the func's own input names. 3. Call it where the chunk was, in both places.",
    "before": "if let property = location as? Property {\n    let rent = property.rent(owner: owner)\n    currentPlayer.balance -= rent\n    owner.balance += rent\n}\n\nif let utility = location as? Utility {\n    let rent = utility.rent(owner: owner, roll: die1 + die2)\n    currentPlayer.balance -= rent\n    owner.balance += rent\n}",
    "model": "if let property = location as? Property {\n    let rent = property.rent(owner: owner)\n    transfer(rent, from: currentPlayer, to: owner)\n}\n\nif let utility = location as? Utility {\n    let rent = utility.rent(owner: owner, roll: die1 + die2)\n    transfer(rent, from: currentPlayer, to: owner)\n}\n\nprivate func transfer(_ amount: Int, from payer: Player, to payee: Player) {\n    payer.balance -= amount\n    payee.balance += amount\n}",
    "checks": [
      {
        "label": "transfer func with the right signature",
        "re": "privatefunctransfer\\(_amount:Int,frompayer:Player,topayee:Player\\)"
      },
      {
        "label": "transfer body uses payer, payee, amount",
        "re": "payer\\.balance-=amount;?payee\\.balance\\+=amount"
      },
      {
        "label": "called in both places",
        "re": "transfer\\(rent,from:currentPlayer,to:owner\\)",
        "mode": "count",
        "n": 2
      },
      {
        "label": "old duplicated lines removed",
        "re": "currentPlayer\\.balance-=rent",
        "mode": "not"
      }
    ],
    "hints": [
      "Write the new func at the bottom first.",
      "Inside the new func, use its own names: payer, payee, amount.",
      "Then replace the two balance lines in each if with one call."
    ]
  }
];
