export const DEMO_URL = "#book-a-demo";

export const announcement = {
  text: "Haven recognized among Top 50 AI startups in Real Estate",
  linkLabel: "Read the article",
  href: "#",
};

export const navLinks = [
  { label: "Use cases", href: "#agents" },
  { label: "Voice demo", href: "#voice-demo" },
  { label: "Testimonials", href: "#testimonials" },
];

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

export const customers = [
  "Rentor",
  "Real Capital Group",
  "Partner logo",
  "Partner logo",
  "Partner logo",
  "Partner logo",
];

export const problem =
  "Property management shouldn't keep you up at night. Yet for most teams it looks familiar: midnight maintenance emergencies, missed leasing opportunities, and endless admin pulling you away from growing your portfolio.";

export const agents = [
  {
    id: "maintenance",
    eyebrow: "Maintenance AI",
    title: "Your 24/7 maintenance coordinator.",
    body: "Answers every call, triages emergencies, dispatches the right vendor from your preferred list, and writes the work order straight into your property management system. Then it checks in with the resident once the job is done.",
    points: ["Answers every call, 24/7", "Triages emergencies", "Dispatches vendors", "Creates work orders"],
  },
  {
    id: "leasing",
    eyebrow: "Leasing AI",
    title: "Every lead answered in seconds, not hours.",
    body: "Responds to calls, texts and emails from Zillow, Apartments.com and every other listing site. Qualifies prospects, books tours around your agents' calendars, and follows up until they're ready to sign.",
    points: ["Qualifies prospects", "Schedules tours", "Captures listing-site leads", "Follows up consistently"],
  },
  {
    id: "coming-soon",
    eyebrow: "Coming soon",
    title: "Vendors, collections and more.",
    body: "New AI workers tailored to property management are on the way, trained on the same policies, vendors and workflows your team already uses.",
    points: ["Vendor management", "Collections", "Renewals"],
  },
] as const;

export const capabilities = [
  { title: "Easy to integrate", body: "Connects to your existing tools. No migrations, no disruption." },
  { title: "Multi-channel", body: "Meets residents and prospects on phone, SMS and email." },
  { title: "Tailored to your portfolio", body: "Understands the nuances of your properties and residents." },
  { title: "Workflow aware", body: "Follows your policies, vendors and processes every time." },
];

export const testimonials = [
  {
    quote:
      "The Haven team worked closely with us to customise the work order setup in AppFolio to fit our needs perfectly. A huge upgrade from our previous call center.",
    name: "Darus Trutna",
    role: "Founder & CEO, Rentor.com",
  },
  {
    quote:
      "We first purchased the Maintenance AI and have now added leasing. We can't wait for more to come. The ROI is crazy.",
    name: "Brock Forkey",
    role: "Owner, Real Capital Group",
  },
];

export const process = [
  { step: "01", title: "Discover", body: "We learn your workflows, systems and challenges." },
  { step: "02", title: "Configure", body: "We tailor Haven's AI workers to your policies and integrate with your stack." },
  { step: "03", title: "Launch", body: "Your AI workers start handling calls and leads immediately." },
  { step: "04", title: "Optimize", body: "We keep refining performance from real-world results." },
];

export const footerLinks = [
  { heading: "Product", links: ["Maintenance AI", "Leasing AI", "Voice demo"] },
  { heading: "Company", links: ["About", "Blog", "Careers"] },
  { heading: "Legal", links: ["Privacy", "Terms"] },
  { heading: "Social", links: ["LinkedIn", "X"] },
];
