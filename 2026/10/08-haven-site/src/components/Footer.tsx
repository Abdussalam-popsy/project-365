import { footerLinks } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink px-6 pt-20 pb-10 text-white">
      <div className="mx-auto grid max-w-[1140px] gap-12 md:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[260px] text-[14px] text-white/50">AI workers built for property management.</p>
        </div>
        {footerLinks.map((col) => (
          <div key={col.heading}>
            <p className="text-[13px] text-white/40">{col.heading}</p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/75">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-20 flex max-w-[1140px] justify-between border-t border-white/10 pt-6 text-[13px] text-white/40">
        <span>© {new Date().getFullYear()} Haven AI</span>
        <span>Backed by Y Combinator</span>
      </div>
    </footer>
  );
}
