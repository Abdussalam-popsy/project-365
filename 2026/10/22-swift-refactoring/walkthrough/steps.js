// Walkthrough: the real MonopolyGame class, refactored one technique at a time.
// BASE is the original code. Each step applies `edits` ([find, replace] pairs) to the code from the step before,
// so the page can show exactly which lines changed. `note` steps change nothing and just show `snippet`.
// Answers match the Fix It page.

const BASE = String.raw`class MonopolyGame {

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
            //playerBoardIndices.append(0)
        }

        // create groups
        let brownGroup = ColourGroup(Group.Name.brown, 2, 50)
        groups.append(brownGroup)

        let blueGroup = ColourGroup(Group.Name.blue, 3, 50)
        groups.append(blueGroup)

        // create board locations
        board.append(Go())
        board.append(Road("Old Kent Road", brownGroup, 60))
        board.append(CommunityChest())
        board.append(Road("Whitechapel", brownGroup, 60))
        board.append(TaxLocation("Income Tax", 200))
        board.append(Station("Kings Cross"))
        board.append(Road("Angel Islington", blueGroup, 100))
        board.append(Chance())
        board.append(Road("Euston", blueGroup, 100))
        board.append(Road("Pentonville", blueGroup, 120))
        board.append(Jail())
    }

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
            // go to jail
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
                if currentPlayer.balance >= rentableLocation.price {
                    if !handler.purchaseUnownedProperty(player: currentPlayer, property: rentableLocation) {
                        // doesn't want it, go to auction
                    }
                } else {
                    // not enough money, go to auction
                }
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
        var builder = ""
        builder += "\(player.gamePiece)\n"
        builder += "Balance: £\(player.balance)\n"
        builder += "Properties\n"
        for property in player.properties.sorted(by: { $0.group.name < $1.group.name }) {
            builder += property.name
            if property.mortgaged {
                builder += "Mortgaged"
            }
            builder += "\n"
        }
        return builder
    }

    func ownsCompleteSet(_ player: Player, _ group: Group) -> Bool {
        var count = 0
        for property in player.properties {
            if property.group == group {
                count += 1
                if count == group.quantity {
                    return true
                }
            }
        }
        return false
    }
}`;

const STEPS = [
  { tech: "Encapsulate field", where: "Top of the class",
    spot: "die1, die2 and the two turn counters are plain var. Any code outside the class could change the dice or skip someone's turn.",
    did: [
      "Added private(set) in front of the 4 vars.",
      "Nothing else changes: the class still changes them inside, every roll and every turn."
    ],
    why: "They still change, so they can't be let. They're single values (no [ ]), so it's Encapsulate field, not Encapsulate collection.",
    edits: [
      ["    var doubleDiceRollsForCurrentTurn = 0", "    private(set) var doubleDiceRollsForCurrentTurn = 0"],
      ["    var indexOfPlayerForCurrentTurn = 0", "    private(set) var indexOfPlayerForCurrentTurn = 0"],
      ["    var die1: Int = 0\n    var die2: Int = 0", "    private(set) var die1: Int = 0\n    private(set) var die2: Int = 0"],
    ] },

  { tech: "Encapsulate collection", where: "players array + init",
    spot: "var players = [Player]() is an array, and any code can append or remove players from it.",
    did: [
      "Added private(set) in front of var players.",
      "Added a new func addPlayer(_ player: Player) as the only way in.",
      "init now calls addPlayer instead of players.append."
    ],
    why: "Square brackets = a collection. Lock it, then give one controlled way to add. Locked collection + add func = Encapsulate collection.",
    edits: [
      ["    var players = [Player]()", "    private(set) var players = [Player]()"],
      ["            players.append(Player(piece))", "            addPlayer(Player(piece))"],
      ["    func pass() {", "    func addPlayer(_ player: Player) {\n        players.append(player)\n    }\n\n    func pass() {"],
    ] },

  { tech: "Extract method", where: "init",
    spot: "init does three jobs: adds players, builds the groups and builds the whole board.",
    did: [
      "Cut all the group and board lines out of init.",
      "Pasted them into a new func called setUpBoard().",
      "init now just calls setUpBoard()."
    ],
    why: "A new func appeared and old lines moved into it = Extract method. It's private because only init uses it.",
    edits: [
      [String.raw`        }

        // create groups
        let brownGroup = ColourGroup(Group.Name.brown, 2, 50)`, String.raw`        }

        setUpBoard()
    }

    private func setUpBoard() {
        // create groups
        let brownGroup = ColourGroup(Group.Name.brown, 2, 50)`],
    ] },

  { tech: "Extract method", where: "roll(): three doubles",
    spot: "roll() does everything: rolls, jails, moves, pays Go, charges rent. The jail part is the easiest job to pull out.",
    did: [
      "Cut the 2 jail lines out of roll().",
      "Pasted them into a new func sendToJail(_ player: Player).",
      "roll() now calls sendToJail(currentPlayer)."
    ],
    why: "Same pattern as before: new func, old lines moved into it, call it instead = Extract method.",
    edits: [
      ["            // go to jail\n            currentPlayer.boardIndex = board.firstIndex{$0 is Jail}!\n            pass()\n            return",
       "            sendToJail(currentPlayer)\n            return"],
      ["    func passedGo(_ player: Player) {",
       "    private func sendToJail(_ player: Player) {\n        player.boardIndex = board.firstIndex{$0 is Jail}!\n        pass()\n    }\n\n    func passedGo(_ player: Player) {"],
    ] },

  { tech: "Introduce explaining variable", where: "roll(): moving and utility rent",
    spot: "die1 + die2 means 'the dice total' but never says so, and it's written twice.",
    did: [
      "Added a new line: let diceTotal = die1 + die2.",
      "Swapped both die1 + die2 for diceTotal."
    ],
    why: "A new let gives part of an expression a name = Introduce explaining variable.",
    edits: [
      ["        currentPlayer.boardIndex += die1 + die2", "        let diceTotal = die1 + die2\n        currentPlayer.boardIndex += diceTotal"],
      ["roll: die1 + die2)", "roll: diceTotal)"],
    ] },

  { tech: "Extract method", where: "roll(): paying rent",
    spot: "The same 2 lines (take money from the player, give it to the owner) are written in both rent blocks.",
    did: [
      "Made a new func transfer(_ amount:, from:, to:) holding those 2 lines.",
      "Both rent blocks now call transfer(rent, from: currentPlayer, to: owner)."
    ],
    why: "Duplicate code is fixed with a NEW func, so it's Extract method. (Inline method is the opposite: it deletes a func.)",
    edits: [
      ["                    let rent = property.rent(owner: owner)\n                    currentPlayer.balance -= rent\n                    owner.balance += rent",
       "                    let rent = property.rent(owner: owner)\n                    transfer(rent, from: currentPlayer, to: owner)"],
      ["                    let rent = utility.rent(owner: owner, roll: diceTotal)\n                    currentPlayer.balance -= rent\n                    owner.balance += rent",
       "                    let rent = utility.rent(owner: owner, roll: diceTotal)\n                    transfer(rent, from: currentPlayer, to: owner)"],
      ["    private func sendToJail(", "    private func transfer(_ amount: Int, from payer: Player, to payee: Player) {\n        payer.balance -= amount\n        payee.balance += amount\n    }\n\n    private func sendToJail("],
    ] },

  { tech: "Add parameter", where: "passedGo",
    spot: "200 is typed straight into passedGo. House rules could change it.",
    did: [
      "Added a new input salary: Int to passedGo.",
      "Swapped 200 inside it for salary.",
      "The call in roll() now passes salary: 200."
    ],
    why: "Something new appeared inside the func's brackets ( ) = Add parameter.",
    edits: [
      ["    func passedGo(_ player: Player) {\n        player.balance += 200", "    func passedGo(_ player: Player, salary: Int) {\n        player.balance += salary"],
      ["            passedGo(currentPlayer)", "            passedGo(currentPlayer, salary: 200)"],
    ] },

  { tech: "Rename method", where: "roll() and diceRoll()",
    spot: "roll() and diceRoll() sit next to each other and sound the same. Easy to call the wrong one.",
    did: [
      "Changed the name diceRoll to rollDice, where it's written and where it's called.",
      "The body stays exactly the same."
    ],
    why: "Only the name changed, nothing else = Rename method. Methods read best as verbs: rollDice.",
    edits: [
      ["        diceRoll()\n", "        rollDice()\n"],
      ["    func diceRoll() {", "    func rollDice() {"],
    ] },

  { tech: "Inline method", where: "diceRollIsDouble",
    spot: "diceRollIsDouble() is one line: return die1 == die2. The func is no clearer than its own body.",
    did: [
      "Replaced the call diceRollIsDouble() with die1 == die2.",
      "Deleted the whole diceRollIsDouble func."
    ],
    why: "A func vanished and its body moved to where it was called = Inline method. (Move method would put it in another class.)",
    edits: [
      ["        if diceRollIsDouble() {", "        if die1 == die2 {"],
      ["    func diceRollIsDouble() -> Bool {\n        return die1 == die2\n    }\n\n", ""],
    ] },

  { tech: "Hide method", where: "Helper funcs",
    spot: "rollDice() and passedGo() are only called from inside roll(). The UI has no reason to call them.",
    did: [
      "Added private in front of func rollDice.",
      "Added private in front of func passedGo.",
      "Nothing else changes."
    ],
    why: "private on an existing func = Hide method. Lecturer's rule: used inside the class, no outside purpose.",
    edits: [
      ["    func passedGo(", "    private func passedGo("],
      ["    func rollDice() {", "    private func rollDice() {"],
    ] },

  { tech: "Move method", where: "ownsCompleteSet",
    spot: "ownsCompleteSet only looks at the player's properties. It uses nothing from MonopolyGame.",
    did: [
      "Cut ownsCompleteSet out of MonopolyGame.",
      "Pasted it into Player (shown at the bottom).",
      "Dropped the player input, because inside Player it's just its own properties."
    ],
    why: "Player already exists, so moving a func into it = Move method. If the class were brand new, it'd be Extract class.",
    edits: [
      ["\n\n    func ownsCompleteSet(_ player: Player, _ group: Group) -> Bool {\n        var count = 0\n        for property in player.properties {\n            if property.group == group {\n                count += 1\n                if count == group.quantity {\n                    return true\n                }\n            }\n        }\n        return false\n    }\n}",
       "\n}\n\n// in Player (it already exists)\nextension Player {\n    func ownsCompleteSet(_ group: Group) -> Bool {\n        var count = 0\n        for property in properties {\n            if property.group == group {\n                count += 1\n            }\n        }\n        return count == group.quantity\n    }\n}"],
    ] },

  { tech: "Extract class", where: "The dice",
    spot: "die1, die2 and rollDice() only ever talk to each other. They're a class waiting to happen.",
    did: [
      "Made a brand new class Dice (shown at the bottom).",
      "Moved die1, die2 and rollDice() into it (rollDice becomes roll(), plus isDouble()).",
      "MonopolyGame now has one line: let dice = Dice().",
      "Everywhere that used die1 / die2 now says dice.die1 / dice.die2."
    ],
    why: "A NEW class was created and several things moved into it = Extract class. Moving into a class that already exists would be Move method.",
    edits: [
      ["    private(set) var die1: Int = 0\n    private(set) var die2: Int = 0", "    let dice = Dice()"],
      ["        rollDice()\n", "        dice.roll()\n"],
      ["        if die1 == die2 {", "        if dice.isDouble() {"],
      ["        let diceTotal = die1 + die2", "        let diceTotal = dice.die1 + dice.die2"],
      ["roll1: die1, roll2: die2,", "roll1: dice.die1, roll2: dice.die2,"],
      ["    private func rollDice() {\n        die1 = Int.random(in: 1...6)\n        die2 = Int.random(in: 1...6)\n    }\n\n", ""],
      ["\n// in Player (it already exists)", "\n// new class\nclass Dice {\n    private(set) var die1: Int = 0\n    private(set) var die2: Int = 0\n\n    func roll() {\n        die1 = Int.random(in: 1...6)\n        die2 = Int.random(in: 1...6)\n    }\n\n    func isDouble() -> Bool {\n        return die1 == die2\n    }\n}\n\n// in Player (it already exists)"],
    ] },

  { tech: "Extract interface", where: "The event handler", note: true,
    spot: "Already done in your code. handler is a GameEventHandler, which is a protocol, not a specific class.",
    did: [
      "No change needed. If a question shows MonopolyGame stuck to ConsoleHandler, the fix is below.",
      "Make a protocol, make ConsoleHandler follow it, store the protocol type."
    ],
    why: "The word protocol appearing is the whole tell = Extract interface. Now a SwiftUI screen could plug in instead of the console.",
    snippet: "protocol GameEventHandler {\n    func passedGo(player: Player)\n}\n\nclass ConsoleHandler: GameEventHandler {\n    func passedGo(player: Player) {\n        print(\"Passed Go!\")\n    }\n}\n\n// in MonopolyGame\nprivate let handler: GameEventHandler" },

  { tech: "Remove setting method", where: "Player (another file)", note: true,
    spot: "In Player, your game piece is picked once at the start and never changes.",
    did: [
      "Changed var gamePiece to let gamePiece.",
      "(Or private(set), as long as NO new funcs are added.)"
    ],
    why: "It never changes after setup, so remove the way to change it = Remove setting method. If it still changed (like balance), it'd be Encapsulate field.",
    snippet: "class Player {\n    let gamePiece: GamePiece\n\n    init(_ piece: GamePiece) {\n        gamePiece = piece\n    }\n}" },
];
