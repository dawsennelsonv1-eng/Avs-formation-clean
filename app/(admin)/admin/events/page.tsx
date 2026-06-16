import { EventsManager } from "@/components/admin-events-manager";
import { getEvents } from "@/lib/events";

export default async function AdminEventsPage() {
  const events = await getEvents();
  return (
    <div className="animate-fade-up">
      <h1 className="mb-1 font-display text-[22px] font-extrabold">Évènements</h1>
      <p className="mb-4 text-[12px] text-muted-foreground">Webinaires et ateliers affichés sur l'accueil.</p>
      <EventsManager initial={events} />
    </div>
  );
}
