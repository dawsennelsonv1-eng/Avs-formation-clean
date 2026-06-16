export type Locale = "fr" | "ht";

export interface Course {
  id: string;
  title: string;
  tag: string;
  blurb: string;
  summary: string;
  price: number;        // in HTG; 0 = free
  isFree: boolean;
  rating: number;
  reviews: number;
  durationMin: number;
  lessons: number;
  color: string;        // flyer gradient base (fallback when no image)
  flyerUrl?: string | null; // uploaded banner image, used everywhere
  upcoming?: boolean;
  hasSummary?: boolean; // some flyers show a summary/gift, some don't
  hasLearningTools?: boolean; // per-course: enable AI tutor / quizzes / flashcards
}

export interface Bundle {
  id: string;
  title: string;
  count: number;
  price: number;
  was: number;
  color: string;
  courseIds: string[];
  blurb?: string;
  featured?: boolean;
}

export interface AppEvent {
  id: string;
  title: string;
  date: string;  // "15 JUIN"
  time: string;  // "19h00"
  live: boolean;
}

export interface Enrollment {
  courseId: string;
  progress: number;   // 0-100
  lastLesson: number;
  completed: boolean;
}

export type PayMethod = "moncash" | "natcash";
export type ProofKind = "id" | "screenshot";

export interface PaymentSubmission {
  courseId: string;
  method: PayMethod;
  fullName: string;
  whatsapp: string;
  proofKind: ProofKind;
  transactionId?: string;   // when proofKind === "id"
  screenshotBase64?: string; // when proofKind === "screenshot"
}

export type VerifyStatus = "granted" | "pending" | "rejected" | "duplicate";

export interface VerifyResult {
  status: VerifyStatus;
  message: string;
  transactionId?: string;
}
