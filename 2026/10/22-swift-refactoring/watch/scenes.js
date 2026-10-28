// The code shown in each Watch It Run scene. Logic lives in watch.js.
//
// Each scene has:
//   swift  the Swift shown in the code pane
//   twin   the same idea in React or TypeScript (the "Same thing in…" toggle)
//   lines  names for the line numbers watch.js lights up, counting from 0.
//          If you edit `swift`, recount these so the right line glows.

const TYPES = new Set("String Int Double Bool UUID CartItem Player WeatherService LiveWeatherService FakeWeatherService BackupWeatherService WeatherDisplayWidget".split(" "));

const SCENES = {
  wallet: {
    swift: `class Player {
    private(set) var balance: Int = 1500

    func pay(_ amount: Int) {
        guard amount > 0, amount <= balance else { return }
        balance -= amount
    }
}`,
    twin: `const [balance, setBalance] = useState(1500)

function pay(amount) {
  if (amount <= 0 || amount > balance) return
  setBalance(balance - amount)
}`,
    lines: { balance: 1, pay: 3, guard: 4, subtract: 5 },
  },

  cart: {
    swift: `class ShoppingCart {
    private(set) var items: [CartItem] = []

    func addItem(_ item: CartItem) {
        items.append(item)
    }

    func removeItem(withId id: UUID) {
        items.removeAll { item in item.id == id }
    }

    func clear() {
        items.removeAll()
    }
}`,
    twin: `const [items, setItems] = useState([])

const addItem    = item => setItems([...items, item])
const removeItem = id   => setItems(items.filter(i => i.id !== id))
const clear      = ()   => setItems([])`,
    lines: { items: 1, addItem: 3, append: 4, removeItem: 7, removeAll: 8, clear: 11, clearAll: 12 },
  },

  team: {
    swift: `class ProjectTeam {
    private(set) var memberRoles: [String: String] = [:]

    func assignRole(_ role: String, to member: String) {
        memberRoles[member] = role
    }

    func removeMember(_ member: String) {
        memberRoles[member] = nil
    }
}`,
    twin: `const [memberRoles, setMemberRoles] = useState({})

const assignRole = (role, member) =>
  setMemberRoles({ ...memberRoles, [member]: role })

const removeMember = member => {
  const copy = { ...memberRoles }
  delete copy[member]
  setMemberRoles(copy)
}`,
    lines: { table: 1, assignRole: 3, assign: 4, removeMember: 7, remove: 8 },
  },

  weather: {
    before: `class LiveWeatherService {
    func fetchCurrentTemperature() -> Double { return 21.5 }
}

class WeatherDisplayWidget {
    let api: LiveWeatherService

    init(api: LiveWeatherService) {
        self.api = api
    }
}`,
    after: `protocol WeatherService {
    func fetchCurrentTemperature() -> Double
}

class LiveWeatherService: WeatherService {
    func fetchCurrentTemperature() -> Double { return 21.5 }
}

class FakeWeatherService: WeatherService {
    func fetchCurrentTemperature() -> Double { return 99.0 }
}

class BackupWeatherService: WeatherService {
    func fetchCurrentTemperature() -> Double { return 14.0 }
}

class WeatherDisplayWidget {
    let api: WeatherService

    init(api: WeatherService) {
        self.api = api
    }
}`,
    twin: `// Before: only one specific class allowed
function Widget({ api }: { api: LiveWeatherService }) { ... }

// After: anything that matches the interface
interface WeatherService {
  fetchCurrentTemperature(): number
}
function Widget({ api }: { api: WeatherService }) { ... }`,
    // Before: the widget's two "I only take LiveWeatherService" lines
    beforeLines: { api: 5, init: 7 },
    // After: where each service class starts, and the widget's two "any WeatherService" lines
    afterLines: { protocolFunc: 1, LiveWeatherService: 4, FakeWeatherService: 8, BackupWeatherService: 12, api: 17, init: 19 },
    temps: { LiveWeatherService: 21.5, FakeWeatherService: 99.0, BackupWeatherService: 14.0 },
  },
};
