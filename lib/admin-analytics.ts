import { createClient } from "@/lib/supabase-server";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface Kpis {
  total_revenue: number;
  revenue_30d: number;
  total_users: number;
  users_7d: number;
  total_enrollments: number;
  active_courses: number;
  pending_payments: number;
  granted_payments: number;
  duplicate_attempts: number;
  rejected_payments: number;
  avg_rating: number;
  total_reviews: number;
  quiz_attempts: number;
  quiz_pass_rate: number;
  completed_courses: number;
  free_courses: number;
  paid_courses: number;
  total_lessons: number;
  flashcards_count: number;
  card_reviews: number;
  sms_received: number;
  sms_unconsumed: number;
  conversion_rate: number;
  arpu: number;
  onboarded_users: number;
}

export interface AdminAnalytics {
  kpis: Kpis;
  dailyRevenue: { day: string; revenue: number; sales: number }[];
  revenueByMethod: { method: string; revenue: number; sales: number }[];
  dailyEnrollments: { day: string; enrollments: number }[];
  dailySignups: { day: string; signups: number }[];
  coursePerformance: { title: string; tag: string; enrollments: number; revenue: number; rating: number }[];
  paymentFunnel: { status: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  quizPassRate: { title: string; passed: number; attempts: number }[];
  categoryDistribution: { tag: string; courses: number }[];
}

/* ---------------- MOCK (used when Supabase isn't configured) ---------------- */
function mockSeries(days: number, base: number, jitter: number) {
  const out: { day: string; v: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ day: d.toISOString().slice(0, 10), v: Math.max(0, Math.round(base + (Math.random() - 0.4) * jitter)) });
  }
  return out;
}

const MOCK: AdminAnalytics = {
  kpis: {
    total_revenue: 184500, revenue_30d: 62400, total_users: 437, users_7d: 41,
    total_enrollments: 312, active_courses: 6, pending_payments: 7, granted_payments: 268,
    duplicate_attempts: 9, rejected_payments: 14, avg_rating: 4.78, total_reviews: 213,
    quiz_attempts: 489, quiz_pass_rate: 72.4, completed_courses: 96, free_courses: 2,
    paid_courses: 4, total_lessons: 84, flashcards_count: 156, card_reviews: 1840,
    sms_received: 291, sms_unconsumed: 23, conversion_rate: 84.3, arpu: 422, onboarded_users: 388,
  },
  dailyRevenue: mockSeries(30, 2000, 2600).map((d) => ({ day: d.day, revenue: d.v, sales: Math.round(d.v / 1500) })),
  revenueByMethod: [
    { method: "moncash", revenue: 118500, sales: 172 },
    { method: "natcash", revenue: 66000, sales: 96 },
  ],
  dailyEnrollments: mockSeries(30, 10, 8).map((d) => ({ day: d.day, enrollments: d.v })),
  dailySignups: mockSeries(30, 14, 10).map((d) => ({ day: d.day, signups: d.v })),
  coursePerformance: [
    { title: "TikTok Organique", tag: "Marketing", enrollments: 98, revenue: 117600, rating: 4.9 },
    { title: "Marketing Digital", tag: "Marketing", enrollments: 64, revenue: 96000, rating: 4.8 },
    { title: "L'Art de la Vente", tag: "Ventes", enrollments: 41, revenue: 82000, rating: 4.7 },
    { title: "Dropshipping", tag: "E-commerce", enrollments: 38, revenue: 95000, rating: 4.6 },
    { title: "Carte de Débit", tag: "Cartes", enrollments: 71, revenue: 0, rating: 4.9 },
  ],
  paymentFunnel: [
    { status: "granted", count: 268 },
    { status: "pending", count: 7 },
    { status: "duplicate", count: 9 },
    { status: "rejected", count: 14 },
  ],
  ratingDistribution: [
    { rating: 5, count: 142 },
    { rating: 4, count: 51 },
    { rating: 3, count: 14 },
    { rating: 2, count: 4 },
    { rating: 1, count: 2 },
  ],
  quizPassRate: [
    { title: "TikTok Organique", passed: 132, attempts: 180 },
    { title: "Marketing Digital", passed: 88, attempts: 120 },
    { title: "L'Art de la Vente", passed: 60, attempts: 95 },
  ],
  categoryDistribution: [
    { tag: "Marketing", courses: 2 },
    { tag: "Ventes", courses: 1 },
    { tag: "E-commerce", courses: 1 },
    { tag: "Cartes", courses: 1 },
    { tag: "Finance", courses: 1 },
  ],
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  if (!configured()) return MOCK;
  try {
    const s = createClient();
    const [
      kpiRes,
      revRes,
      methodRes,
      enrRes,
      signRes,
      perfRes,
      funnelRes,
      ratingRes,
      quizRes,
      catRes,
    ] = await Promise.all([
      s.rpc("admin_kpis"),
      s.from("v_daily_revenue").select("*"),
      s.from("v_revenue_by_method").select("*"),
      s.from("v_daily_enrollments").select("*"),
      s.from("v_daily_signups").select("*"),
      s.from("v_course_performance").select("*"),
      s.from("v_payment_funnel").select("*"),
      s.from("v_rating_distribution").select("*"),
      s.from("v_quiz_pass_rate").select("*"),
      s.from("v_category_distribution").select("*"),
    ]);

    const kpis = (kpiRes.data as Kpis) ?? MOCK.kpis;

    return {
      kpis,
      dailyRevenue: (revRes.data as any[])?.map((r) => ({ day: r.day, revenue: Number(r.revenue), sales: Number(r.sales) })) ?? MOCK.dailyRevenue,
      revenueByMethod: (methodRes.data as any[])?.map((r) => ({ method: r.method, revenue: Number(r.revenue), sales: Number(r.sales) })) ?? MOCK.revenueByMethod,
      dailyEnrollments: (enrRes.data as any[])?.map((r) => ({ day: r.day, enrollments: Number(r.enrollments) })) ?? MOCK.dailyEnrollments,
      dailySignups: (signRes.data as any[])?.map((r) => ({ day: r.day, signups: Number(r.signups) })) ?? MOCK.dailySignups,
      coursePerformance: (perfRes.data as any[])?.map((r) => ({ title: r.title, tag: r.tag, enrollments: Number(r.enrollments), revenue: Number(r.revenue), rating: Number(r.rating) })) ?? MOCK.coursePerformance,
      paymentFunnel: (funnelRes.data as any[])?.map((r) => ({ status: r.status, count: Number(r.count) })) ?? MOCK.paymentFunnel,
      ratingDistribution: (ratingRes.data as any[])?.map((r) => ({ rating: Number(r.rating), count: Number(r.count) })) ?? MOCK.ratingDistribution,
      quizPassRate: (quizRes.data as any[])?.map((r) => ({ title: r.title, passed: Number(r.passed), attempts: Number(r.attempts) })) ?? MOCK.quizPassRate,
      categoryDistribution: (catRes.data as any[])?.map((r) => ({ tag: r.tag, courses: Number(r.courses) })) ?? MOCK.categoryDistribution,
    };
  } catch {
    return MOCK;
  }
}
