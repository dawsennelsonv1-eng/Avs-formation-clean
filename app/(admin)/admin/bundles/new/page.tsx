import { BundleForm } from "@/components/admin-bundle-form";
import { adminListCourses } from "@/lib/admin-courses";

export default async function NewBundlePage() {
  const courses = await adminListCourses();
  return (
    <div className="animate-fade-up">
      <h1 className="mb-4 font-display text-[22px] font-extrabold">Nouvelle offre groupée</h1>
      <BundleForm courses={courses} />
    </div>
  );
}
