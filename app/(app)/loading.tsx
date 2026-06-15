export default function Loading() {
  return (
    <div className="animate-pulse px-4 pt-4">
      <div className="h-40 w-full rounded-3xl bg-card" />
      <div className="mt-5 h-5 w-40 rounded-lg bg-card" />
      <div className="mt-3 flex gap-3">
        <div className="h-44 w-40 shrink-0 rounded-2xl bg-card" />
        <div className="h-44 w-40 shrink-0 rounded-2xl bg-card" />
      </div>
      <div className="mt-5 h-5 w-32 rounded-lg bg-card" />
      <div className="mt-3 grid grid-cols-2 gap-3.5">
        <div className="aspect-[3/4] rounded-2xl bg-card" />
        <div className="aspect-[3/4] rounded-2xl bg-card" />
      </div>
    </div>
  );
}
