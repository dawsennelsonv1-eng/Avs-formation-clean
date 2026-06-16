import { Header } from "@/components/shell-header";
import { BottomNav } from "@/components/shell-bottom-nav";
import { PwaInstall } from "@/components/pwa-install";
import { getLearningStats } from "@/lib/learning-stats";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [stats, user] = await Promise.all([getLearningStats(), getCurrentUser()]);
  if (user && !user.onboarded) redirect("/onboarding");
  return (
    <div className="app-mesh relative mx-auto min-h-screen max-w-[440px]">
      <Header streak={stats.streak} />
      <main className="pb-28">{children}</main>
      <BottomNav />
      <PwaInstall />
    </div>
  );
}
