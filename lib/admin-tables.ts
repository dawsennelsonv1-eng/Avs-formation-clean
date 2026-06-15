import { createClient } from "@/lib/supabase-server";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface PaymentRow {
  id: string;
  courseTitle: string;
  method: string;
  fullName: string;
  whatsapp: string;
  proofKind: string;
  transactionId: string | null;
  status: string;
  createdAt: string;
}
export interface ReviewRow {
  id: string;
  courseId: string;
  courseTitle: string;
  rating: number;
  body: string;
  authorName: string;
  createdAt: string;
}
export interface UserRow {
  id: string;
  fullName: string;
  whatsapp: string | null;
  role: string;
  streak: number;
  createdAt: string;
}

const MOCK_PAY: PaymentRow[] = [
  { id: "p1", courseTitle: "TikTok Organique", method: "moncash", fullName: "Marc Antoine", whatsapp: "+509 3712 0000", proofKind: "id", transactionId: "MC8842AB", status: "pending", createdAt: new Date().toISOString() },
  { id: "p2", courseTitle: "Marketing Digital", method: "natcash", fullName: "Naïka L.", whatsapp: "+509 4612 0000", proofKind: "screenshot", transactionId: "NC1190ZZ", status: "pending", createdAt: new Date().toISOString() },
];
const MOCK_REV: ReviewRow[] = [
  { id: "r1", courseId: "c5", courseTitle: "TikTok Organique", rating: 5, body: "Incroyable formation !", authorName: "Stanley J.", createdAt: new Date().toISOString() },
];
const MOCK_USERS: UserRow[] = [
  { id: "u1", fullName: "Dawsen Nelson", whatsapp: "+509 0000 0000", role: "admin", streak: 7, createdAt: new Date().toISOString() },
  { id: "u2", fullName: "Marc Antoine", whatsapp: "+509 3712 0000", role: "user", streak: 3, createdAt: new Date().toISOString() },
];

export async function adminPayments(): Promise<PaymentRow[]> {
  if (!configured()) return MOCK_PAY;
  try {
    const s = createClient();
    const { data } = await s
      .from("payment_submissions")
      .select("id,method,full_name,whatsapp,proof_kind,submitted_transaction_id,status,created_at,courses(title)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!data?.length) return MOCK_PAY;
    return data.map((r: any) => ({
      id: r.id, courseTitle: r.courses?.title ?? "—", method: r.method, fullName: r.full_name,
      whatsapp: r.whatsapp, proofKind: r.proof_kind, transactionId: r.submitted_transaction_id,
      status: r.status, createdAt: r.created_at,
    }));
  } catch {
    return MOCK_PAY;
  }
}

export async function adminReviews(): Promise<ReviewRow[]> {
  if (!configured()) return MOCK_REV;
  try {
    const s = createClient();
    const { data } = await s
      .from("reviews")
      .select("id,course_id,rating,body,author_name,created_at,courses(title)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!data?.length) return MOCK_REV;
    return data.map((r: any) => ({
      id: r.id, courseId: r.course_id, courseTitle: r.courses?.title ?? "—", rating: r.rating,
      body: r.body ?? "", authorName: r.author_name ?? "Anonyme", createdAt: r.created_at,
    }));
  } catch {
    return MOCK_REV;
  }
}

export async function adminUsers(): Promise<UserRow[]> {
  if (!configured()) return MOCK_USERS;
  try {
    const s = createClient();
    const { data } = await s
      .from("profiles")
      .select("id,full_name,whatsapp,role,streak,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!data?.length) return MOCK_USERS;
    return data.map((r: any) => ({
      id: r.id, fullName: r.full_name ?? "—", whatsapp: r.whatsapp, role: r.role ?? "user",
      streak: r.streak ?? 0, createdAt: r.created_at,
    }));
  } catch {
    return MOCK_USERS;
  }
}
