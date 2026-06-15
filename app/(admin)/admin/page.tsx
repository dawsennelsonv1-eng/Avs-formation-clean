import { getAdminAnalytics } from "@/lib/admin-analytics";
import { MetricCard, Panel } from "@/components/admin-metric-card";
import { AreaTrend, Donut, Histogram, HorizontalBars, PieBasic } from "@/components/admin-charts";
import { formatHTG } from "@/lib/utils";

export default async function AdminDashboard() {
  const a = await getAdminAnalytics();
  const k = a.kpis;

  // 25 tracked metrics as cards.
  const metrics: { label: string; value: string; sub?: string; accent?: any }[] = [
    { label: "Revenu total", value: formatHTG(k.total_revenue), accent: "gold" },
    { label: "Revenu (30j)", value: formatHTG(k.revenue_30d), accent: "gold" },
    { label: "ARPU", value: formatHTG(k.arpu), sub: "par utilisateur", accent: "gold" },
    { label: "Taux de conversion", value: `${k.conversion_rate}%`, sub: "soumissions → accès", accent: "green" },
    { label: "Utilisateurs", value: String(k.total_users), accent: "blue" },
    { label: "Nouveaux (7j)", value: String(k.users_7d), accent: "blue" },
    { label: "Onboardés", value: String(k.onboarded_users), accent: "blue" },
    { label: "Inscriptions", value: String(k.total_enrollments), accent: "violet" },
    { label: "Formations terminées", value: String(k.completed_courses), accent: "green" },
    { label: "Formations actives", value: String(k.active_courses), accent: "gold" },
    { label: "Payantes / Gratuites", value: `${k.paid_courses} / ${k.free_courses}` },
    { label: "Leçons", value: String(k.total_lessons) },
    { label: "Paiements validés", value: String(k.granted_payments), accent: "green" },
    { label: "En attente", value: String(k.pending_payments), accent: "gold" },
    { label: "Doublons bloqués", value: String(k.duplicate_attempts), accent: "red" },
    { label: "Rejetés", value: String(k.rejected_payments), accent: "red" },
    { label: "SMS reçus", value: String(k.sms_received), sub: `${k.sms_unconsumed} non utilisés` },
    { label: "Note moyenne", value: `${k.avg_rating} ★`, accent: "gold" },
    { label: "Avis", value: String(k.total_reviews) },
    { label: "Quiz tentés", value: String(k.quiz_attempts), accent: "violet" },
    { label: "Taux de réussite quiz", value: `${k.quiz_pass_rate}%`, accent: "green" },
    { label: "Flashcards", value: String(k.flashcards_count) },
    { label: "Révisions cartes", value: String(k.card_reviews), sub: "mémorisation espacée" },
    { label: "Revenu MonCash", value: formatHTG(a.revenueByMethod.find((m) => m.method === "moncash")?.revenue ?? 0), accent: "red" },
    { label: "Revenu NatCash", value: formatHTG(a.revenueByMethod.find((m) => m.method === "natcash")?.revenue ?? 0), accent: "green" },
  ];

  const methodData = a.revenueByMethod.map((m) => ({
    name: m.method === "moncash" ? "MonCash" : "NatCash",
    revenue: m.revenue,
  }));
  const funnelData = a.paymentFunnel.map((f) => ({
    name: { granted: "Validé", pending: "En attente", duplicate: "Doublon", rejected: "Rejeté" }[f.status] ?? f.status,
    count: f.count,
  }));
  const ratingData = a.ratingDistribution.map((r) => ({ name: `${r.rating}★`, count: r.count }));
  const perfData = a.coursePerformance
    .slice()
    .sort((x, y) => y.revenue - x.revenue)
    .map((c) => ({ title: c.title.length > 16 ? c.title.slice(0, 15) + "…" : c.title, revenue: c.revenue }));
  const enrollData = a.coursePerformance.map((c) => ({
    title: c.title.length > 16 ? c.title.slice(0, 15) + "…" : c.title,
    enrollments: c.enrollments,
  }));
  const quizData = a.quizPassRate.map((q) => ({
    title: q.title.length > 16 ? q.title.slice(0, 15) + "…" : q.title,
    taux: q.attempts ? Math.round((q.passed / q.attempts) * 100) : 0,
  }));

  return (
    <div className="animate-fade-up">
      <h1 className="mb-1 font-display text-[22px] font-extrabold">Tableau de bord</h1>
      <p className="mb-4 text-[12px] text-muted-foreground">Les 25 indicateurs clés de AVS Formation.</p>

      {/* Metric cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Revenue trend */}
      <Panel title="Revenu quotidien (30 jours)">
        <AreaTrend data={a.dailyRevenue} xKey="day" yKey="revenue" />
      </Panel>

      {/* Revenue by method donut */}
      <Panel title="Revenu par méthode de paiement">
        <Donut data={methodData} nameKey="name" valueKey="revenue" />
      </Panel>

      {/* Enrollments histogram */}
      <Panel title="Nouvelles inscriptions (30 jours)">
        <Histogram data={a.dailyEnrollments} xKey="day" yKey="enrollments" color="#7B3FF2" />
      </Panel>

      {/* Signups area */}
      <Panel title="Inscriptions utilisateurs (30 jours)">
        <AreaTrend data={a.dailySignups} xKey="day" yKey="signups" color="#4C8DFF" />
      </Panel>

      {/* Course revenue horizontal bars */}
      <Panel title="Revenu par formation">
        <HorizontalBars data={perfData} labelKey="title" valueKey="revenue" />
      </Panel>

      {/* Enrollments per course */}
      <Panel title="Inscriptions par formation">
        <HorizontalBars data={enrollData} labelKey="title" valueKey="enrollments" />
      </Panel>

      {/* Payment funnel */}
      <Panel title="Entonnoir des paiements">
        <Histogram data={funnelData} xKey="name" yKey="count" color="#3BB273" rawLabels />
      </Panel>

      {/* Rating distribution */}
      <Panel title="Répartition des notes">
        <Histogram data={ratingData} xKey="name" yKey="count" color="#E8B84B" rawLabels />
      </Panel>

      {/* Category distribution pie */}
      <Panel title="Catalogue par catégorie">
        <PieBasic data={a.categoryDistribution} nameKey="tag" valueKey="courses" />
      </Panel>

      {/* Quiz pass rate */}
      <Panel title="Taux de réussite des quiz (%)">
        <HorizontalBars data={quizData} labelKey="title" valueKey="taux" />
      </Panel>
    </div>
  );
}
