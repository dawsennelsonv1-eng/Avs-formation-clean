"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui-toast";
import type { ReviewRow } from "@/lib/admin-tables";

export function ReviewsTable({ rows }: { rows: ReviewRow[] }) {
  const [list, setList] = useState(rows);
  const { toast } = useToast();
  const router = useRouter();

  const remove = async (r: ReviewRow) => {
    if (!confirm("Supprimer cet avis ?")) return;
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, courseId: r.courseId }),
    });
    const data = await res.json();
    if (data.error) return toast(data.error, "error");
    setList((l) => l.filter((x) => x.id !== r.id));
    toast("Avis supprimé.", "info");
    router.refresh();
  };

  return (
    <div className="grid gap-2.5">
      {list.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[14px] font-bold">{r.authorName}</div>
              <div className="text-[11px] text-muted-foreground">{r.courseTitle}</div>
            </div>
            <button onClick={() => remove(r)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="my-1.5 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-3.5 w-3.5" fill={i <= r.rating ? "#E8B84B" : "none"} color={i <= r.rating ? "#E8B84B" : "#243149"} />
            ))}
          </div>
          {r.body && <p className="text-[13px] text-muted-foreground">{r.body}</p>}
        </div>
      ))}
      {list.length === 0 && <p className="py-8 text-center text-[13px] text-muted-foreground">Aucun avis.</p>}
    </div>
  );
}
