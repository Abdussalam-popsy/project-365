"use client";

import { useEffect, useRef, useState } from "react";
import { customers, customersCta, customersIntro, type Customer } from "@/content/customers";
import { Chip, MockCard } from "./agent-page/ui";
import { Button } from "./Button";
import { SectionIntro } from "./SectionHeading";
import { Reveal } from "./Reveal";

/** Soft gradient behind each card's mock, all from the site palette. */
const tileTones: Record<Customer["tone"], string> = {
  lilac: "from-[#e4d6f0] via-[#f3ecf7] to-[#d6c3e8]",
  sage: "from-[#dcebe1] via-[#f1f3ea] to-[#cfe2d6]",
  amber: "from-[#f4e6cc] via-[#f7efe3] to-[#efd9df]",
  blush: "from-[#f1dde4] via-[#f6eef2] to-[#e2d3ee]",
  mist: "from-[#dfe4f1] via-[#eeeef6] to-[#e4d6f0]",
};

const markTones: Record<Customer["tone"], string> = {
  lilac: "bg-[#d6c3e8] text-heather",
  sage: "bg-[#cfe2d6] text-[#4c7a5c]",
  amber: "bg-[#f1ddb8] text-[#8a6326]",
  blush: "bg-[#ecd3dc] text-[#9b4f5a]",
  mist: "bg-[#d9def0] text-[#4d5a86]",
};

/** The left edge of the 1140px content column, so the row starts in line with the heading and runs off the right. */
const GUTTER = "max(24px, calc((100% - 1140px) / 2))";

function initials(name: string) {
  return name
    .replace(/\.com$/, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

/** One customer: name, a gradient tile with a Haven mock on it, and a caption. Hover grows the tile a touch. */
function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <li className="group w-[300px] shrink-0 snap-start sm:w-[400px]">
      <div className="mb-5 flex items-center gap-3">
        <span className={`grid size-9 place-items-center rounded-xl text-[13px] font-medium ${markTones[customer.tone]}`}>
          {initials(customer.name)}
        </span>
        <span className="text-[20px] tracking-[-0.01em]">{customer.name}</span>
      </div>
      <div
        className={`relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[28px] bg-gradient-to-br transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025] ${tileTones[customer.tone]}`}
      >
        <div className="mock-compact w-[78%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5">
          <MockCard className="px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[13px] text-ink/50">{customer.mock.title}</p>
              <Chip chip={customer.mock.chip} />
            </div>
            <p className="mt-2 text-[16px] leading-snug text-ink">{customer.mock.line}</p>
          </MockCard>
        </div>
        {customer.agents.length > 0 && (
          <ul className="absolute bottom-4 left-4 flex gap-1.5">
            {customer.agents.map((agent) => (
              <li key={agent} className="rounded-full bg-white/80 px-3 py-1 text-[12px] text-ink/70 backdrop-blur">
                {agent}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-5 max-w-[380px] text-[17px] leading-snug text-ink/50">
        <span className="font-medium text-ink">{customer.name}</span> {customer.line}
      </p>
    </li>
  );
}

function Arrow({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous customers" : "Next customers"}
      className="grid size-10 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink/[0.04] disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden className={dir === "prev" ? "rotate-180" : ""}>
        <path d="M2 7h10M8 3l4 4-4 4" />
      </svg>
    </button>
  );
}

/** Customers: a row of cards that runs off the edge (swipe on phones, arrows on desktop), then the demo CTA. */
export function Customers() {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const sync = () => setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 24), behavior: "smooth" });
  };

  return (
    <section id="customers" className="scroll-mt-28 overflow-x-clip bg-page py-32">
      <div className="mx-auto max-w-[1140px] px-6 xl:px-0">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionIntro eyebrow={customersIntro.eyebrow} title={customersIntro.title} body={customersIntro.body} />
          <div className="hidden gap-2 sm:flex">
            <Arrow dir="prev" disabled={edges.start} onClick={() => step(-1)} />
            <Arrow dir="next" disabled={edges.end} onClick={() => step(1)} />
          </div>
        </div>
      </div>

      <Reveal delay={0.15}>
        <ul
          ref={track}
          className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pt-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
        >
          {customers.map((c) => (
            <CustomerCard key={c.name} customer={c} />
          ))}
        </ul>
      </Reveal>

      <div className="mx-auto mt-12 flex max-w-[1140px] flex-wrap items-center gap-x-6 gap-y-4 px-6 xl:px-0">
        <Button>Book a demo</Button>
        <p className="text-[16px] text-ink/55">{customersCta.line}</p>
      </div>
    </section>
  );
}
