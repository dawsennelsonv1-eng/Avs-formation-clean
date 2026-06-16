import { notFound } from "next/navigation";
import { BundleForm } from "@/components/admin-bundle-form";
import { getBundleById } from "@/lib/bundles";
import { adminListCourses } from "@/lib/admin-courses";

export default async function EditBundlePage({ params }: { params: { id: string } }) {
  const [bundle, courses] = await Promise.all([getBundleById(params.id), adminListCourses()]);
  if (!bundle) notFound();
  return (
    <div className="animate-fade-up">
      <h1 className="mb-4 font-display text-[22px] font-extrabold">Modifier l'offre</h1>
      <BundleForm bundle={bundle} courses={courses} />
    </div>
  );
}
