/** "Book a demo" opens an email; pages can pass their own subject line. */
export const demoUrl = (subject = "Haven demo") => `mailto:hello@usehaven.ai?subject=${encodeURIComponent(subject)}`;
export const DEMO_URL = demoUrl();

/** One page per agent, in the order the nav lists them. `href` is site-relative; links add the base path. */
export const agentPages = [
  { id: "receptionist", label: "Receptionist", href: "/agents/receptionist", blurb: "Every call answered on the first ring." },
  { id: "leasing", label: "Leasing", href: "/agents/leasing", blurb: "Every prospect answered in seconds." },
  { id: "maintenance", label: "Maintenance", href: "/agents/maintenance", blurb: "Work orders from first text to paid invoice." },
] as const;

export const MAINTENANCE_URL = "/agents/maintenance";
export const LEASING_URL = "/agents/leasing";

export const announcement = {
  text: "Haven recognized among Top 50 AI startups in Real Estate",
  linkLabel: "Read the article",
  href: "#",
};

/** Homepage sections, written with a leading "/" so they also work from the agent pages. */
export const navLinks = {
  platform: { label: "Platform", href: "/#platform" },
  customers: { label: "Customers", href: "/#customers" },
};

export const hero = {
  lead: "AI workers for property management.",
  prefix: "Haven answers your",
  rotating: [
    "maintenance calls.",
    "leasing leads.",
    "work orders.",
    "2am emergencies.",
  ],
  sub: "Custom AI workers that handle the repetitive work eating into your team's time.",
};

/** Names map to placeholder SVG wordmarks in components/PartnerLogos.tsx; unknown names render as text. */
export const customers = [
  "Rentor",
  "Real Capital Group",
  "Northgate Living",
  "Keystone Residential",
  "Harbor & Main",
  "Oakline Properties",
];

/** One piece of the problem statement: plain words, a phrase led by an animated icon, or a muted closing line. */
export type ProblemPart = string | { icon: "moon" | "call" | "stack"; text: string } | { muted: string };

/** The homepage problem statement, as short paragraphs (dub.co style). Icons live in components/problem/. */
export const problem: ProblemPart[][] = [
  ["Property management shouldn't keep you up at night."],
  [
    "Yet for most teams it looks familiar:",
    { icon: "moon", text: "midnight emergencies," },
    { icon: "call", text: "missed leasing leads," },
    "and",
    { icon: "stack", text: "endless admin." },
  ],
  [{ muted: "All of it pulling you away from growing your portfolio." }],
];

export const agents = [
  {
    id: "maintenance",
    eyebrow: "Maintenance AI",
    title: "Your 24/7 maintenance coordinator.",
    body: "Answers every call, triages emergencies, dispatches the right vendor from your preferred list, and writes the work order straight into your property management system. Then it checks in with the resident once the job is done.",
    points: ["Answers every call, 24/7", "Triages emergencies", "Dispatches vendors", "Creates work orders"],
    link: { label: "Learn more about Maintenance AI", href: MAINTENANCE_URL },
  },
  {
    id: "leasing",
    eyebrow: "Leasing AI",
    title: "Every lead answered in seconds, not hours.",
    body: "Responds to calls, texts and emails from Zillow, Apartments.com and every other listing site. Qualifies prospects, books tours around your agents' calendars, and follows up until they're ready to sign.",
    points: ["Qualifies prospects", "Schedules tours", "Captures listing-site leads", "Follows up consistently"],
    link: { label: "Learn more about Leasing AI", href: LEASING_URL },
  },
  {
    id: "coming-soon",
    eyebrow: "Coming soon",
    title: "Collections, renewals and more.",
    body: "New AI workers tailored to property management are on the way, trained on the same policies, vendors and workflows your team already uses.",
    points: ["Collections", "Renewals", "Move-ins"],
  },
] as const;

export const testimonials = [
  {
    quote:
      "The Haven team worked closely with us to customise the work order setup in AppFolio to fit our needs perfectly. A huge upgrade from our previous call center.",
    name: "Darus Trutna",
    role: "Founder & CEO, Rentor.com",
    agents: ["Maintenance"],
  },
  {
    quote:
      "We first purchased the Maintenance AI and have now added leasing. We can't wait for more to come. The ROI is crazy.",
    name: "Brock Forkey",
    role: "Owner, Real Capital Group",
    agents: ["Maintenance", "Leasing"],
  },
];

export const footerLinks = [
  { heading: "Product", links: ["Maintenance AI", "Leasing AI", "Voice demo"] },
  { heading: "Company", links: ["About", "Blog", "Careers"] },
  { heading: "Legal", links: ["Privacy", "Terms"] },
  { heading: "Social", links: ["LinkedIn", "X"] },
];
