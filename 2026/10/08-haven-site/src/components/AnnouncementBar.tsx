import { announcement } from "@/content/site";

export function AnnouncementBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-30 flex h-10 items-center justify-center gap-3 bg-violet px-4 text-[13px] text-white sm:text-sm">
      <span className="truncate">{announcement.text}</span>
      <a href={announcement.href} className="hidden shrink-0 underline underline-offset-4 sm:inline">
        {announcement.linkLabel}
      </a>
    </div>
  );
}
