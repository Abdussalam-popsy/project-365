import type { ChatMessage, Chip, TitledText } from "./agents/types";

// "Where your team already works": one maintenance case (WO-9002, no heat at 220 Gay Street, unit B),
// the same one the Maintenance page follows, seen through each channel Haven works in.

export const channelsIntro = {
  eyebrow: "Where Haven works",
  title: "Inside the tools your team already uses.",
  body: "No new dashboard to check. Haven's agents talk to residents, vendors and owners by text, email and phone, and every step lands in your property management software.",
};

export type ChannelId = "text" | "email" | "phone" | "pms";

export const channels: (TitledText & { id: ChannelId })[] = [
  {
    id: "text",
    title: "Text",
    body: "Residents text the number they already have. The agent replies in your firm's name and opens the work order before the conversation ends.",
  },
  {
    id: "email",
    title: "Email",
    body: "Owner approvals, vendor estimates and guest cards arrive by email. The agent replies in the thread, from your address.",
  },
  {
    id: "phone",
    title: "Phone",
    body: "Calls answered or placed at any hour, in the caller's language, checked against your records.",
  },
  {
    id: "pms",
    title: "Your PMS",
    body: "Every step is a note on the record in AppFolio, Buildium, Rentvine or Rent Manager. Your team never learns a new tool.",
  },
];

export const channelText = {
  header: { title: "Text · Chris Nolan, unit B", date: "Sep 12 · 7:42pm" },
  messages: [
    { from: "them", text: "The heat's not working and it's freezing in here." },
    { from: "haven", label: "Haven · Maintenance", text: "Sorry, Chris. Is the thermostat blank, or showing a temperature?" },
    { from: "them", text: "It says 68 but it's blowing cold air." },
  ] satisfies ChatMessage[],
  outcome: { label: "WO-9002 opened in AppFolio", tone: "violet" } satisfies Chip,
};

export const channelEmail = {
  header: { title: "Email · Owner approval", date: "Sep 13" },
  sent: {
    from: "Haven · maintenance@yourfirm.com",
    to: "Dana Price, owner",
    subject: "WO-9002 · Furnace repair at 220 Gay Street",
    body: "Knox HVAC's estimate is $840, above your $500 limit. Approve and I'll book the repair for tomorrow morning.",
  },
  reply: { from: "Dana Price", body: "Approved, go ahead." },
  outcome: { label: "Approval saved to WO-9002", tone: "green" } satisfies Chip,
};

export const channelPhone = {
  header: { title: "Outbound call · Chris Nolan", date: "Sep 14 · 11:02am" },
  lines: [
    { speaker: "Haven", haven: true, text: "Hi Chris, it's Haven for your property manager. Knox HVAC says the furnace is fixed. Is the heat back on?" },
    { speaker: "Chris", haven: false, text: "Yes, it's warm again. Thanks for sorting it." },
  ],
  outcome: { label: "Resident confirmed the repair", tone: "green" } satisfies Chip,
};

export const channelPms = {
  header: { title: "AppFolio · WO-9002 · No heat, unit B", date: "Assigned to Haven" },
  notes: [
    { time: "Sep 12 · 7:44pm", text: "Emergency. Texted Knox HVAC, details emailed." },
    { time: "Sep 12 · 7:51pm", text: "Knox accepted. Resident told." },
    { time: "Sep 13 · 9:10am", text: "Owner approved the $840 estimate." },
    { time: "Sep 14 · 11:03am", text: "Resident confirmed heat is back." },
  ],
  outcome: { label: "Closed · Done", tone: "green" } satisfies Chip,
};
