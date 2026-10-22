// Everything listed on the home page. To add a new exercise: make a folder next to drill/,
// then add one entry here. `href` is the folder name with a trailing slash.

const PAGES = [
  { href: "drill/", kind: "Practice", title: "Refactoring Drill",
    blurb: "Spot what changed between Before and After, then name the technique. Quick 10, two rounds, or everything, with an exam mode.",
    meta: "35 questions" },
  { href: "workshop/", kind: "Practice", title: "Refactoring Workshop",
    blurb: "Write the After yourself. Level 1 fills words, Level 2 fills lines, Level 3 is the full Monopoly edit with automatic checks.",
    meta: "3 levels · 30 exercises" },
  { href: "cheatsheet/", kind: "Reference", title: "Cheat Sheet",
    blurb: "What changed → technique name. The 14 techniques grouped by what vanished, appeared, got locked or changed.",
    meta: "14 techniques" },
];
