import { useState } from "react";

const NAV_ITEMS = ["Products", "Testimonials", "What we do"] as const;

function ChevronDown() {
  return (
    <svg
      className="h-4 w-4 text-neutral-400"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
      <span
        className={`block h-px w-5 bg-neutral-900 transition-all duration-200 ${
          open ? "translate-y-[6px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-px w-5 bg-neutral-900 transition-all duration-200 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-px w-5 bg-neutral-900 transition-all duration-200 ${
          open ? "-translate-y-[6px] -rotate-45" : ""
        }`}
      />
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-cream">
      <div className="mx-auto flex h-[65px] max-w-[1440px] items-center justify-between px-5 sm:px-10 lg:px-20">
        {/* Logo */}
        <a
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-900"
        >
          Haven
        </a>

        {/* Desktop nav — centered absolutely so buttons don't push it */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
          {NAV_ITEMS.map((label) => (
            <button
              key={label}
              className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {label}
              <ChevronDown />
            </button>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <button className="rounded-\[8px\] px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900">
            Log in
          </button>
          <button className="rounded-\[8px\] bg-coral px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
            Book a demo
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1.5 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-neutral-200/60 bg-cream transition-all duration-300 ease-in-out lg:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-5 pb-6 pt-2 sm:px-10">
          {NAV_ITEMS.map((label) => (
            <button
              key={label}
              className="flex items-center justify-between border-b border-neutral-200/60 py-3.5 text-sm text-neutral-700"
            >
              {label}
              <ChevronDown />
            </button>
          ))}
          <div className="mt-5 flex flex-col gap-3">
            <button className="py-1 text-left text-sm text-neutral-600">
              Log in
            </button>
            <button className="w-full rounded-\[8px\] bg-coral py-3 text-sm font-medium text-white">
              Book a demo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
