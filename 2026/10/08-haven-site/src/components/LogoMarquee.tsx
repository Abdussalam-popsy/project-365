import { customers } from "@/content/site";

export function LogoMarquee() {
  const row = [...customers, ...customers];
  return (
    <section className="bg-ink pb-20 text-white">
      <p className="mx-auto max-w-[760px] px-6 text-center text-[26px] leading-tight font-light tracking-[-0.02em] text-white/85 sm:text-[34px]">
        Trusted by leading property management companies.
      </p>
      <div className="mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-marquee flex w-max gap-16">
          {row.map((name, i) => (
            <span key={i} className="text-2xl font-medium tracking-[-0.02em] whitespace-nowrap text-white/45">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
