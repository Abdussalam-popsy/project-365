// Everything listed on the home page. To add a new exercise: make a folder next to drill/,
// then add one entry here. `href` is the folder name with a trailing slash.

const PAGES = [
  // Practice: ordered easiest to hardest.
  { href: "cards/", section: "practice", step: "Easy · name it", title: "Spot the Change",
    blurb: "Flashcards and a quick quiz on your phone. See what changed, say the name. Remembers your misses and mix-ups.",
    meta: "18 cards" },
  { href: "fix/", section: "practice", step: "Medium · find & fix", title: "Fix It",
    blurb: "Walk the real Monopoly code in small pieces. Tap what's wrong, pick the fix, see it fixed. No typing, made for your phone.",
    meta: "14 pieces" },
  { href: "drill/", section: "practice", step: "Medium · spot it", title: "Refactoring Drill",
    blurb: "Real Before and After code, name the technique. Quick 10, two rounds or all 35, with an exam mode.",
    meta: "35 questions" },
  { href: "workshop/", section: "practice", step: "Hard · write it", title: "Refactoring Workshop",
    blurb: "Write the After yourself. Help fades from filling words, to filling lines, to the full Monopoly edit.",
    meta: "3 levels · 33 exercises" },
  // Test: the closest thing to the real exam.
  { href: "mock/", section: "test", title: "Mock Test",
    blurb: "Timed, no cheat sheet. Six quiz questions, then three hand edits on the full MonopolyGame class, like Part 1 and Part 2 of the real test.",
    meta: "10 or 15 min · 6 questions · 3 tasks" },
  // Learn: read and look things up, nothing is marked.
  { href: "cheatsheet/", section: "learn", title: "Cheat Sheet",
    blurb: "What changed → technique name, grouped by what appeared, vanished, got locked or moved.",
    meta: "14 techniques" },
  { href: "watch/", section: "learn", title: "Watch It Run",
    blurb: "Press buttons and watch Swift run line by line. Red cheat buttons show what private(set) blocks.",
    meta: "4 scenes" },
  { href: "vocab/", section: "learn", title: "Swift Vocabulary",
    blurb: "Every Swift word and symbol from the zip and Monopoly, with JS twins.",
    meta: "71 words" },
];

const SECTIONS = [
  { id: "practice", title: "Practice", use: "Short rounds, instant right or wrong. Start easy, move up as it clicks." },
  { id: "test", title: "Test", use: "Once practice feels easy. Do it timed and don't peek." },
  { id: "learn", title: "Learn", use: "Look things up when you're stuck. Nothing here is marked." },
];

// The real class test (CO6071 Assignment 1).
const TEST_DATE = "2026-11-11";
