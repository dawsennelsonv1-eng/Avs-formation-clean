import { redirect } from "next/navigation";
import { OnboardingPicker } from "@/components/onboarding-onboarding-picker";
import { getCurrentUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return (
    <div className="app-mesh mx-auto min-h-screen max-w-[440px]">
      <OnboardingPicker name={user.fullName} />
    </div>
  );
}
