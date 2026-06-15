import type { Locale } from "@/types";

/**
 * i18n scaffold.
 * Français is the active locale. Kreyòl Ayisyen ("ht") is defined but
 * marked unavailable for now — it is shown locked in the language switcher.
 */
export const LOCALES: { code: Locale; label: string; flag: string; available: boolean }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", available: true },
  { code: "ht", label: "Kreyòl Ayisyen", flag: "🇭🇹", available: false },
];

export const t = {
  fr: {
    nav: { home: "Accueil", courses: "Catalogue", learning: "Mes formations", profile: "Profil" },
    home: {
      limited: "OFFRE LIMITÉE",
      bundles: "Offres groupées",
      upcoming: "Prochaines formations",
      events: "Événements",
      seeOffer: "Voir l'offre",
      live: "EN DIRECT",
      coursesCount: (n: number) => `${n} formations`,
    },
    courses: {
      search: "Rechercher une formation…",
      free: "GRATUIT",
      soon: "BIENTÔT",
      none: "Aucune formation trouvée.",
      lessons: (n: number) => `${n} leçons`,
      filters: ["Tout", "Gratuit", "Marketing", "Ventes", "Cartes", "E-commerce", "Finance"],
    },
    learning: {
      title: "Ma Formation",
      continue: "Reprendre",
      enrolled: "Mes formations",
      progress: "Progression",
      streak: "Série",
      certificates: "Certificats",
      empty: "Tu n'as pas encore commencé de formation.",
    },
    profile: {
      memberSince: "Membre depuis Mai 2026",
      language: "Langue",
      soon: "Bientôt disponible",
      settings: "Paramètres",
      items: [
        "Modifier le profil",
        "Notifications",
        "Moyens de paiement",
        "Aide & support",
        "Conditions d'utilisation",
        "Politique de confidentialité",
        "Déconnexion",
      ],
      stats: { streak: "Série", courses: "Formations", quizzes: "Quiz réussis" },
    },
    common: { back: "Retour", htg: "HTG" },
  },
} as const;

export type Dict = (typeof t)["fr"];
export const getDict = (_locale: Locale = "fr"): Dict => t.fr;
