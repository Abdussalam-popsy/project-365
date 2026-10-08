/** 24×24 stroke icon paths shared by the hero canvases (wrench, key, phone, message, … in Lucide's style). */
export const HAVEN_ICONS = {
  wrench:
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  key: "M15.5 7.5 19 4 M21 2l-9.6 9.6 M15.5 7.5l3 3L22 7l-3-3 M7.5 22a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  check: "M20 6 9 17l-5-5",
  home: "M3 10.5 12 3l9 7.5 M5 9v11h14V9 M10 20v-6h4v6",
  calendar: "M8 2v4 M16 2v4 M3 6h18v15H3z M3 10h18",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
  chevrons: "M7 9.5l5-5 5 5 M7 14.5l5 5 5-5 M12 10v.01 M12 12v.01 M12 14v.01",
  dotsX: "M9.5 9.5l5 5 M14.5 9.5l-5 5 M12 2.5v.01 M12 5v.01 M12 19v.01 M12 21.5v.01",
} as const;

export type HavenIconName = keyof typeof HAVEN_ICONS;
