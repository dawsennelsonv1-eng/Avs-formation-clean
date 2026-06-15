import { createClient } from "@/lib/supabase-server";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}
export interface Review {
  id: string;
  rating: number;
  body: string;
  authorName: string;
  date: string;
}

/* ---------- MOCK fallbacks (used when Supabase isn't configured) ---------- */
const MOCK_CARDS: Flashcard[] = [
  { id: "f1", front: "Quel est le but d'un hook ?", back: "Capter l'attention dans les 3 premières secondes." },
  { id: "f2", front: "Combien de secondes pour accrocher ?", back: "Environ 3 secondes — le scroll est impitoyable." },
  { id: "f3", front: "Qu'est-ce qui booste la rétention ?", back: "Un montage rythmé et une promesse claire dès le départ." },
];
const MOCK_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "Quel est le facteur n°1 pour devenir viral sur TikTok ?",
    options: ["Le nombre d'abonnés", "Le hook des 3 premières secondes", "La durée de la vidéo"],
    correctIndex: 1,
    explanation: "C'est le hook : sans accroche immédiate, le spectateur scrolle.",
  },
  {
    id: "q2",
    question: "Que regarde l'algorithme en priorité ?",
    options: ["Le taux de rétention et de replay", "La date de publication", "Le nombre de hashtags"],
    correctIndex: 0,
    explanation: "La rétention/replay signale un contenu engageant.",
  },
];
const MOCK_REVIEWS: Review[] = [
  { id: "r1", rating: 5, body: "Formation incroyable, déjà des résultats !", authorName: "Jean-Marc P.", date: "Il y a 2 jours" },
  { id: "r2", rating: 5, body: "Très clair, l'IA m'a beaucoup aidée.", authorName: "Naïka L.", date: "Il y a 1 semaine" },
  { id: "r3", rating: 4, body: "Bon contenu, j'aurais aimé plus d'exemples.", authorName: "Stanley J.", date: "Il y a 2 semaines" },
];

export async function getFlashcards(courseId: string): Promise<Flashcard[]> {
  if (!configured()) return MOCK_CARDS;
  try {
    const s = createClient();
    const { data } = await s.from("flashcards").select("id,front,back").eq("course_id", courseId).order("position");
    return data?.length ? data : MOCK_CARDS;
  } catch {
    return MOCK_CARDS;
  }
}

export async function getQuiz(courseId: string): Promise<QuizQuestion[]> {
  if (!configured()) return MOCK_QUIZ;
  try {
    const s = createClient();
    const { data } = await s
      .from("quiz_questions")
      .select("id,question,options,correct_index,explanation")
      .eq("course_id", courseId)
      .order("position");
    if (!data?.length) return MOCK_QUIZ;
    return data.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options as string[],
      correctIndex: q.correct_index,
      explanation: q.explanation ?? undefined,
    }));
  } catch {
    return MOCK_QUIZ;
  }
}

export async function getReviews(courseId: string): Promise<Review[]> {
  if (!configured()) return MOCK_REVIEWS;
  try {
    const s = createClient();
    const { data } = await s
      .from("reviews")
      .select("id,rating,body,author_name,created_at")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (!data?.length) return MOCK_REVIEWS;
    return data.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      body: r.body ?? "",
      authorName: r.author_name ?? "Anonyme",
      date: new Date(r.created_at).toLocaleDateString("fr-FR"),
    }));
  } catch {
    return MOCK_REVIEWS;
  }
}
