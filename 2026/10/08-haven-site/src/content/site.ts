/** "Book a demo" opens an email; pages can pass their own subject line. */
export const demoUrl = (subject = "Haven demo") => `mailto:hello@usehaven.ai?subject=${encodeURIComponent(subject)}`;
export const DEMO_URL = demoUrl();

/**
 * One page per agent, in the order the nav lists them. `href` is site-relative; links add the base path.
 * `listed: false` keeps a page live at its URL but out of the nav and search results. Receptionist is
 * unlisted until the client is ready to talk about it; flip it to `true` to bring it back.
 */
export const agentPages = [
  { id: "receptionist", label: "Receptionist", href: "/agents/receptionist", blurb: "Every call answered on the first ring.", listed: false },
  { id: "leasing", label: "Leasing", href: "/agents/leasing", blurb: "Every prospect answered in seconds.", listed: true },
  { id: "maintenance", label: "Maintenance", href: "/agents/maintenance", blurb: "Work orders from first text to paid invoice.", listed: true },
] as const;

/** The agent pages the nav and footer link to. */
export const listedAgentPages = agentPages.filter((page) => page.listed);

export const MAINTENANCE_URL = "/agents/maintenance";
export const LEASING_URL = "/agents/leasing";

/** The bar above the nav. The link only shows once `href` is set. TODO(client): the article URL. */
export const announcement: { text: string; linkLabel: string; href?: string } = {
  text: "Haven recognized among Top 50 AI startups in Real Estate",
  linkLabel: "Read the article",
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

/**
 * Customer logos for the marquee: white-on-transparent files in public/logos/customers.
 * `height` is set per logo so wide wordmarks and stacked badges carry similar visual weight;
 * `ratio` is the file's width ÷ height, used to reserve space before it loads.
 * PNG where the source was too small to vectorise cleanly.
 */
export type CustomerLogo = { name: string; src: string; ratio: number; height: number };

export const customerLogos: CustomerLogo[] = [
  { name: "Guide Property Services", src: "/logos/customers/svg/guide-property-services.svg", ratio: 3.28, height: 34 },
  { name: "American Property Management", src: "/logos/customers/svg/american-property-management.svg", ratio: 1.28, height: 52 },
  { name: "Evernest", src: "/logos/customers/svg/evernest.svg", ratio: 3.73, height: 32 },
  { name: "HBR Rentals", src: "/logos/customers/svg/hbr-rentals.svg", ratio: 1, height: 54 },
  { name: "ResiHome", src: "/logos/customers/svg/resihome.svg", ratio: 8.28, height: 22 },
  { name: "GRIT Property Group", src: "/logos/customers/svg/grit-property-group.svg", ratio: 1.13, height: 54 },
  { name: "Fresno Management Company", src: "/logos/customers/svg/fresno-management.svg", ratio: 3.79, height: 34 },
  { name: "Location Rentals", src: "/logos/customers/svg/location-rentals.svg", ratio: 5.88, height: 28 },
  { name: "Pro X Property Management", src: "/logos/customers/svg/prox-property-management.svg", ratio: 2.79, height: 38 },
  { name: "GC Realty & Development", src: "/logos/customers/png/gc-realty.png", ratio: 3.21, height: 34 },
  { name: "Alpine LA Properties", src: "/logos/customers/svg/alpine-la-properties.svg", ratio: 2.3, height: 42 },
  { name: "Titan Property Management", src: "/logos/customers/png/titan-property-management.png", ratio: 2, height: 44 },
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

/**
 * Footer columns. A link without an `href` is shown as plain text until the client gives us its URL, so nothing
 * on the page is a dead "#" link. TODO(client): URLs for About, Blog, Careers, Privacy, Terms, LinkedIn and X.
 */
export const footerLinks: { heading: string; links: { label: string; href?: string }[] }[] = [
  {
    heading: "Product",
    links: [...listedAgentPages.map((page) => ({ label: page.label, href: page.href })), { label: "Voice demo", href: "/#voice-demo" }],
  },
  { heading: "Company", links: [{ label: "About" }, { label: "Blog" }, { label: "Careers" }] },
  { heading: "Legal", links: [{ label: "Privacy" }, { label: "Terms" }] },
  { heading: "Social", links: [{ label: "LinkedIn" }, { label: "X" }] },
];
