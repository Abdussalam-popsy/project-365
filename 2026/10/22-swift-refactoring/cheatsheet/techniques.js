// What changed → technique name. From refactoring-spot-the-difference.xlsx.
// group: which section it sits in (a GROUPS name) · idea: optional one-line principle · see: what you spot in the code
// example: optional pointer back to the Week 2 quiz

// tone picks the row colour, matching the spreadsheet: red, green, blue, amber.
const GROUPS = [
  { name: "Something vanished", tone: "vanished" },
  { name: "Something appeared", tone: "appeared" },
  { name: "Something got locked", tone: "locked" },
  { name: "Something changed", tone: "changed" },
];

const TECHNIQUES = [
  { group: "Something vanished", technique: "Inline method",
    see: ["A func disappeared, and its insides got pasted where it was used"],
    example: "Q2: hasNoLateDeliveries() gone" },
  { group: "Something vanished", technique: "Inline temp",
    see: ["A let/var box disappeared, and its value got pasted where it was used"] },
  { group: "Something vanished", technique: "Remove parameter",
    see: ["An input disappeared from the brackets ( )"] },

  { group: "Something appeared", technique: "Extract method",
    see: ["A new func appeared, and a chunk of code moved into it"] },
  { group: "Something appeared", technique: "Introduce explaining variable",
    see: ["New let boxes appeared, breaking up one long line"],
    example: "Q1: basePrice, quantityDiscount, shipping" },
  { group: "Something appeared", technique: "Add parameter",
    see: ["A new input appeared in the brackets ( )"],
    example: "Q3: taxRate added" },
  { group: "Something appeared", technique: "Extract interface",
    see: ["The word protocol appeared"],
    example: "Q4: protocol Logger" },
  { group: "Something appeared", technique: "Replace type code with class",
    see: ["The word enum appeared, replacing numbers or text codes"],
    example: "Q6: enum OrderStatus" },

  { group: "Something got locked", technique: "Remove setting method",
    idea: "A value that should NEVER change after creation (an id, passport number) gets locked for good.",
    see: ["a set... func deleted", "var changed to let", "private(set) added, and NO new funcs"],
    seeLabel: "You will see one of",
    example: "Q11: private(set) var id (an ID never changes)" },
  { group: "Something got locked", technique: "Hide method",
    see: ["private got added in front of a func"] },
  { group: "Something got locked", technique: "Encapsulate field",
    idea: "A value that still needs to change, but only safely.",
    see: ["private or private(set) on a single box (no [ ])", "PLUS new funcs that check changes (e.g. deposit, update)"],
    seeLabel: "You will see" },
  { group: "Something got locked", technique: "Encapsulate collection",
    see: ["private(set) got added in front of a list [ ], plus add/remove funcs"] },

  { group: "Something changed", technique: "Rename method",
    see: ["The func's name changed, and nothing else"] },
  { group: "Something changed", technique: "Split temporary variable",
    see: ["One var used twice became two separate lets"],
    example: "Q5: result became perimeter + area" },
];
