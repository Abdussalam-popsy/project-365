import type { maintenanceApprovals } from "@/content/agents/maintenance";
import { Chip, DateChip, DocIcon, MockCard, MockPanel } from "../ui";

type Estimate = (typeof maintenanceApprovals)["estimate"];

/** Estimate over the limit → owner approves → invoice attached, as three stacked cards. */
export function EstimateMock({ estimate }: { estimate: Estimate }) {
  return (
    <MockPanel className="flex flex-col gap-4">
      <MockCard className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <DocIcon />
          <p className="mr-auto text-[15px] text-ink/80">{estimate.heading}</p>
          <DateChip date={estimate.date} />
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <p>
            <span className="text-[32px] font-light tracking-[-0.03em]">{estimate.amount}</span>
            <span className="ml-2 text-[14px] text-ink/50">{estimate.item}</span>
          </p>
          <Chip chip={estimate.limit} />
        </div>
      </MockCard>

      <MockCard className="ml-6 flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:ml-12">
        <p className="text-[14px] text-ink/70">{estimate.approval}</p>
        <span className="rounded-full bg-violet px-4 py-1.5 text-[13px] font-medium text-white">Approve</span>
      </MockCard>

      <p className="ml-6 flex items-center gap-2 text-[13px] text-ink/55 sm:ml-12">
        <span className="size-1.5 rounded-full bg-[#6aa07c]" aria-hidden />
        {estimate.approved}
      </p>

      <MockCard className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4 opacity-90">
        <DocIcon />
        <p className="mr-auto text-[15px] text-ink/80">{estimate.invoice.title}</p>
        <DateChip date={estimate.invoice.date} />
        <Chip chip={estimate.invoice.chip} />
      </MockCard>
    </MockPanel>
  );
}
