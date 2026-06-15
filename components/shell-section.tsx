import { cn } from "@/lib/utils";

export function SectionTitle({
  icon,
  title,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 mt-5 flex items-center gap-2", className)}>
      {icon}
      <h2 className="font-display text-[17px] font-extrabold">{title}</h2>
    </div>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1.5">
      {children}
    </div>
  );
}
