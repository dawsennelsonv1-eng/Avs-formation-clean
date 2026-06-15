import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Conditions d'utilisation — AVS Formation" };

export default function TermsPage() {
  return (
    <article className="animate-fade-up px-5 py-5">
      <Link href="/profile" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="font-display text-2xl font-extrabold">Conditions d'utilisation</h1>
      <p className="mt-1 text-[12px] text-muted-foreground">Dernière mise à jour : à compléter</p>

      <div className="mt-5 space-y-4 text-[13px] leading-relaxed text-muted-foreground">
        <Section title="1. Acceptation">
          En utilisant AVS Formation, tu acceptes les présentes conditions. Si tu n'es pas d'accord, n'utilise pas l'application.
        </Section>
        <Section title="2. Comptes">
          Tu es responsable de la confidentialité de ton compte et de toute activité qui s'y déroule. Fournis des informations exactes lors de l'inscription.
        </Section>
        <Section title="3. Achats et paiements">
          Les formations sont payées via MonCash ou NatCash. L'accès est accordé après vérification de la transaction. Les paiements ne sont pas remboursables sauf indication contraire et selon la loi applicable.
        </Section>
        <Section title="4. Propriété du contenu">
          Tout le contenu des formations appartient à AVS Formation et ne peut être copié, redistribué ou revendu sans autorisation écrite.
        </Section>
        <Section title="5. Utilisation acceptable">
          Tu t'engages à ne pas partager tes accès, ni tenter de contourner les systèmes de paiement ou de sécurité.
        </Section>
        <Section title="6. Limitation de responsabilité">
          Les formations sont fournies à titre éducatif. AVS Formation ne garantit aucun résultat financier spécifique.
        </Section>
        <Section title="7. Contact">
          Pour toute question : [ton email / WhatsApp à compléter].
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
