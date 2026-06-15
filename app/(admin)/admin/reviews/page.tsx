import { adminReviews } from "@/lib/admin-tables";
import { ReviewsTable } from "@/components/admin-reviews-table";

export default async function AdminReviewsPage() {
  const rows = await adminReviews();
  return (
    <div className="animate-fade-up">
      <h1 className="mb-1 font-display text-[22px] font-extrabold">Avis</h1>
      <p className="mb-4 text-[12px] text-muted-foreground">Modère les avis publiés par les utilisateurs.</p>
      <ReviewsTable rows={rows} />
    </div>
  );
}
