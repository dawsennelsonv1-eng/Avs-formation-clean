import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "gold" | "green" | "red" | "blue" | "violet";
}) {
  const ring = {
    gold: "text-gold",
    green: "text-emerald-400",
    red: "text-destructive",
    blue: "text-sky-400",
    violet: "text-[#9b6bff]",
  }[accent ?? "gold"];

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-[20px] font-extrabold leading-none", ring)}>{value}</div>
      {sub && <div className="mt-1 text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 font-display text-[14px] font-bold">{title}</h3>
      {children}
    </div>
  );
}
