// Everything listed on the home page. To add a new exercise: make a folder next to drill/,
// then add one entry here. `href` is the folder name with a trailing slash.

const PAGES = [
  { href: "drill/", kind: "Practice", title: "Refactoring Drill",
    blurb: "Spot what changed between Before and After, then name the technique. Quick 10, two rounds, or everything, with an exam mode.",
    meta: "35 questions" },
  { href: "workshop/", kind: "Practice", title: "Refactoring Workshop",
    blurb: "Write the After yourself. Level 1 fills words, Level 2 fills lines, Level 3 makes you name the technique first, then do the Monopoly edit.",
    meta: "3 levels · 33 exercises" },
  { href: "mock/", kind: "Test", title: "Mock Test",
    blurb: "10 or 15 minutes, no cheat sheet. Six quiz questions, then three hand edits on the full MonopolyGame class, like Part 2 of the real test.",
    meta: "6 questions · 3 tasks" },
  { href: "watch/", kind: "Understand", title: "Watch It Run",
    blurb: "Press buttons and watch Swift run line by line: a wallet, a shopping cart, a lookup table and a plug-in weather widget. Red cheat buttons show what private(set) blocks.",
    meta: "4 scenes" },
  { href: "vocab/", kind: "Reference", title: "Swift Vocabulary",
    blurb: "Every Swift word and symbol from the zip and Monopoly, grouped by the job it does, with JS twins. Browse, hide the meanings to test yourself, or take a quiz.",
    meta: "71 words" },
  { href: "cheatsheet/", kind: "Reference", title: "Cheat Sheet",
    blurb: "What changed → technique name. The 14 techniques grouped by what vanished, appeared, got locked or changed.",
    meta: "14 techniques" },
];
