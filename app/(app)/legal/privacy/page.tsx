import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Politique de confidentialité — AVS Formation" };

export default function PrivacyPage() {
  return (
    <article className="animate-fade-up px-5 py-5">
      <Link href="/profile" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="font-display text-2xl font-extrabold">Politique de confidentialité</h1>
      <p className="mt-1 text-[12px] text-muted-foreground">Dernière mise à jour : à compléter</p>

      <div className="mt-5 space-y-4 text-[13px] leading-relaxed text-muted-foreground">
        <Section title="1. Données collectées">
          Nom, email, numéro WhatsApp, progression d'apprentissage et informations de transaction nécessaires pour vérifier les paiements.
        </Section>
        <Section title="2. Utilisation des données">
          Pour fournir l'accès aux formations, suivre ta progression, vérifier les paiements et améliorer l'application.
        </Section>
        <Section title="3. Partage">
          Nous ne vendons pas tes données. Elles sont stockées de façon sécurisée via Supabase et ne sont partagées qu'avec les prestataires nécessaires au fonctionnement (paiement, IA).
        </Section>
        <Section title="4. Captures d'écran et IA">
          Les captures envoyées pour la vérification ou le tuteur IA sont traitées pour extraire les informations nécessaires, puis ne sont pas conservées au-delà du nécessaire.
        </Section>
        <Section title="5. Tes droits">
          Tu peux demander l'accès, la correction ou la suppression de tes données à tout moment.
        </Section>
        <Section title="6. Contact">
          Pour toute demande relative à tes données : [ton email / WhatsApp à compléter].
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 font-display text-[15px] font-bold text-foreground">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
