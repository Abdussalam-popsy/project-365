// Everything listed on the home page. To add a new page: make a folder next to drill/,
// then add one entry here. `href` is the folder name with a trailing slash.

const PAGES = [
  { href: "drill/", kind: "Practice", title: "Test Drill",
    blurb: "Multiple choice from Weeks 1 to 3. Richard's slide questions, practise everything, a timed 30-question mock test, Quick 10, or only your misses.",
    meta: () => QUESTIONS.length + " questions" },
  { href: "notes/", kind: "Revise", title: "Study Notes",
    blurb: "The key facts topic by topic, then every question with its answer hidden until you tap. Good for a read-through before practising.",
    meta: () => TOPIC_ORDER.length + " topics" },
];
