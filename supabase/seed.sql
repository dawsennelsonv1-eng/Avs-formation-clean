-- Seed the 6 demo courses. Run after schema.sql.
insert into courses (slug, title, tag, blurb, summary, price, rating, reviews, duration_min, lessons, color, upcoming)
values
('marketing-digital','Maîtriser le Marketing Digital','Marketing',
 'De zéro à expert : publicités, tunnels de vente et stratégie de contenu.',
 'Apprenez à lancer des campagnes rentables, créer du contenu viral et bâtir une audience fidèle.',
 1500,4.8,124,200,18,'#7B3FF2',false),
('carte-debit-virtuelle','Obtenir une Carte de Débit Virtuelle','Cartes',
 'Guide pas à pas pour obtenir et activer ta carte sans tracas.',
 'Tout ce qu''il faut savoir pour créer une carte virtuelle, l''alimenter et payer en ligne en sécurité.',
 0,4.9,302,42,6,'#0FA3B1',false),
('art-de-la-vente','L''Art de la Vente','Ventes',
 'Techniques de persuasion et closing pour vendre n''importe quoi.',
 'Maîtrise la psychologie de l''acheteur, la gestion des objections et le closing à fort taux de conversion.',
 2000,4.7,89,245,22,'#E5484D',false),
('dropshipping','Dropshipping de A à Z','E-commerce',
 'Construis ta boutique rentable même sans budget de départ.',
 'Trouve des produits gagnants, lance ta boutique et scale avec la pub payante.',
 2500,4.6,156,310,28,'#3BB273',true),
('tiktok-organique','TikTok Organique : Devenir Viral','Marketing',
 'Le système exact pour des vidéos à des millions de vues.',
 'Hooks, montage, tendances et algorithme : tout pour exploser ta portée sans dépenser un sou.',
 1200,4.9,410,170,15,'#F2618C',true),
('finances-personnelles','Finances Personnelles & Budget','Finance',
 'Gère ton argent comme un pro et arrête de stresser.',
 'Méthodes simples pour budgétiser, épargner et investir tes premiers gourdes intelligemment.',
 0,4.8,198,90,9,'#E8B84B',true)
on conflict (slug) do nothing;
