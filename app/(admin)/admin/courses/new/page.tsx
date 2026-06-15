import { CourseForm } from "@/components/admin-course-form";

export default function NewCoursePage() {
  return (
    <div className="animate-fade-up">
      <h1 className="mb-4 font-display text-[22px] font-extrabold">Nouvelle formation</h1>
      <CourseForm />
    </div>
  );
}
