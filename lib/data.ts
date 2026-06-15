import type { Course, Bundle, AppEvent, Enrollment } from "@/types";

/**
 * Local seed data so the shell renders without a backend.
 * In ZIP 2 these are replaced by Supabase queries (see /supabase/schema.sql).
 */
export const COURSES: Course[] = [
  { id: "c1", title: "Maîtriser le Marketing Digital", tag: "Marketing", price: 1500, isFree: false,
    color: "#7B3FF2", rating: 4.8, reviews: 124, durationMin: 200, lessons: 18, hasSummary: true, hasLearningTools: true,
    blurb: "De zéro à expert : publicités, tunnels de vente et stratégie de contenu.",
    summary: "Apprenez à lancer des campagnes rentables, créer du contenu viral et bâtir une audience fidèle." },
  { id: "c2", title: "Obtenir une Carte de Débit Virtuelle", tag: "Cartes", price: 0, isFree: true,
    color: "#0FA3B1", rating: 4.9, reviews: 302, durationMin: 42, lessons: 6, hasSummary: true,
    blurb: "Guide pas à pas pour obtenir et activer ta carte sans tracas.",
    summary: "Tout ce qu'il faut savoir pour créer une carte virtuelle, l'alimenter et payer en ligne en sécurité." },
  { id: "c3", title: "L'Art de la Vente", tag: "Ventes", price: 2000, isFree: false,
    color: "#E5484D", rating: 4.7, reviews: 89, durationMin: 245, lessons: 22, hasLearningTools: true,
    blurb: "Techniques de persuasion et closing pour vendre n'importe quoi.",
    summary: "Maîtrise la psychologie de l'acheteur, la gestion des objections et le closing à fort taux de conversion." },
  { id: "c4", title: "Dropshipping de A à Z", tag: "E-commerce", price: 2500, isFree: false,
    color: "#3BB273", rating: 4.6, reviews: 156, durationMin: 310, lessons: 28, upcoming: true,
    blurb: "Construis ta boutique rentable même sans budget de départ.",
    summary: "Trouve des produits gagnants, lance ta boutique et scale avec la pub payante." },
  { id: "c5", title: "TikTok Organique : Devenir Viral", tag: "Marketing", price: 1200, isFree: false,
    color: "#F2618C", rating: 4.9, reviews: 410, durationMin: 170, lessons: 15, upcoming: true, hasSummary: true, hasLearningTools: true,
    blurb: "Le système exact pour des vidéos à des millions de vues.",
    summary: "Hooks, montage, tendances et algorithme : tout pour exploser ta portée sans dépenser un sou." },
  { id: "c6", title: "Finances Personnelles & Budget", tag: "Finance", price: 0, isFree: true,
    color: "#E8B84B", rating: 4.8, reviews: 198, durationMin: 90, lessons: 9, upcoming: true,
    blurb: "Gère ton argent comme un pro et arrête de stresser.",
    summary: "Méthodes simples pour budgétiser, épargner et investir tes premiers gourdes intelligemment." },
];

export const BUNDLES: Bundle[] = [
  { id: "b1", title: "Pack Entrepreneur Complet", count: 4, price: 4900, was: 7200, color: "#7B3FF2",
    courseIds: ["c1", "c3", "c4", "c5"], blurb: "Tout ce qu'il faut pour lancer et scaler ton business." },
  { id: "b2", title: "Bundle Marketing Pro", count: 2, price: 2400, was: 2700, color: "#F2618C",
    courseIds: ["c1", "c5"], blurb: "Deviens redoutable en marketing digital et organique." },
];

export const EVENTS: AppEvent[] = [
  { id: "e1", title: "Webinaire en Direct : Scaling 2026", date: "15 JUIN", time: "19h00", live: true },
  { id: "e2", title: "Atelier Closing en Groupe", date: "22 JUIN", time: "20h00", live: false },
];

export const ENROLLMENTS: Enrollment[] = [
  { courseId: "c1", progress: 65, lastLesson: 12, completed: false },
  { courseId: "c2", progress: 100, lastLesson: 6, completed: true },
];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);
