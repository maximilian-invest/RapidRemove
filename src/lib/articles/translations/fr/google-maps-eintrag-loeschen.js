/* FR — google-maps-eintrag-loeschen */
const article = {
  category: "Règles Google",
  meta: {
    slug: "supprimer-fiche-google-maps",
    title: "Supprimer une fiche Google Maps : guide complet",
    h1: "Supprimer une fiche Google Maps : la vôtre, celle d'un tiers, les fausses et les doublons",
    description: "Supprimer une fiche Google Maps — la vôtre, celle d'un tiers, un doublon ou une fiche erronée. Pourquoi « fermé » ne suffit pas et comment obtenir une suppression définitive.",
    keywords: ["supprimer fiche google maps", "supprimer fiche google maps tiers", "supprimer fiche erronée google maps", "supprimer entreprise de google maps", "supprimer doublon google maps", "retirer fiche google maps"],
    author: "Matthias Lang",
    authorRole: "Expert Google",
    date: "2026-06-04",
  },
  dek: "Une fiche obsolète, erronée ou dupliquée sur Google Maps sème la confusion chez vos clients, les envoie à la mauvaise adresse — et peut sérieusement entacher votre réputation. Ce qui rend la situation particulièrement délicate : même lorsque vous supprimez tout depuis votre compte, **la fiche, avec l'ensemble de ses avis, reste souvent visible dans Maps et dans la recherche Google.** Ce guide vous explique honnêtement, étape par étape, comment supprimer des fiches Maps — qu'elles vous appartiennent ou non — et où se situent les limites des outils natifs de Google, et comment obtenir une suppression véritablement définitive.",
  blocks: [
    { t: "note", title: "Remarque", text: "Cet article est un guide pratique et ne constitue pas un conseil juridique." },

    { t: "h2", id: "kurz", text: "L'essentiel en bref", toc: "L'essentiel" },
    { t: "ul", items: [
      "**« Supprimer du compte » ≠ supprimé.** Dans la plupart des cas, la fiche est simplement marquée « définitivement fermé » — elle reste visible avec le nom, l'adresse et tous les avis.",
      "**Les fiches de tiers et les fiches erronées** ne peuvent être que **signalées**, pas supprimées directement — et Google rejette souvent ces signalements.",
      "**Les doublons** doivent être fusionnés plutôt que supprimés précipitamment, sous peine de perdre des avis.",
      "**Une suppression totale et définitive** (avis compris) n'est généralement possible en pratique que par la **suppression complète du profil** — avec RapidRemove, en 24 à 48 heures en règle générale, **paiement uniquement après succès**.",
    ] },

    { t: "h2", id: "herkunft", text: "D'abord comprendre : pourquoi cette fiche existe-t-elle ?", toc: "Pourquoi elle existe" },
    { t: "p", text: "De nombreux propriétaires s'étonnent de trouver leur fiche Maps en ligne alors qu'ils ne l'ont jamais créée. C'est pourtant la norme : les fiches Maps sont générées par d'autres utilisateurs, par la collecte automatique de données de Google sur le web, ou par l'import depuis des registres officiels. À retenir ici : la fiche venant rarement de vous, vous n'avez qu'un contrôle limité via les menus habituels de votre compte." },
    { t: "p", text: "La marche à suivre dépend du type de fiche concernée. Quatre cas de figure se présentent." },

    { t: "h2", id: "eigener", text: "Cas 1 : Supprimer votre propre fiche Google Maps", toc: "Cas 1 : Votre fiche" },
    { t: "p", text: "Si vous êtes vérifié en tant que propriétaire, vous pouvez dissocier la fiche de votre compte :" },
    { t: "ol", items: [
      "Recherchez **« Mon établissement »** sur Google et ouvrez les paramètres du profil.",
      "Accédez au **menu à trois points** puis sélectionnez **« Supprimer le profil d'établissement »**.",
      "Choisissez **« Supprimer le contenu et les administrateurs du profil »** et confirmez.",
    ] },
    { t: "p", text: "Cela ressemble à une suppression — mais ce n'en est pas une. Nous expliquons ce qui se passe réellement dans la section suivante. Attendez-vous à ce que la fiche publique reste en ligne." },

    { t: "cta", title: "Vous voulez supprimer définitivement votre fiche Maps ?", text: "Nous vérifions gratuitement si votre fiche Google Maps peut vraiment être supprimée.", btn: "Vérification gratuite", href: "/fr/?start=1", trust: ["Analyse gratuite", "Avec garantie", "Sans engagement"] },

    { t: "h2", id: "sichtbar", text: "Pourquoi la fiche reste visible après la « suppression »", toc: "Pourquoi elle reste" },
    { t: "p", text: "C'est là que la plupart des gens achoppent — et que Google s'abstient délibérément de communiquer clairement : supprimer la fiche de votre compte ne signifie **pas** que l'établissement disparaît de Maps et des résultats de recherche. La fiche est simplement dissociée de votre gestion et marquée, dans la plupart des cas, comme **« Définitivement fermé »**. Le nom, l'adresse, les photos et **l'intégralité des avis restent publics** — désormais assortis d'une mention barrée qui, aux yeux des visiteurs potentiels, produit souvent un effet pire qu'avant." },
    { t: "p", text: "La raison tient au modèle économique de Google : Google Maps fonctionne grâce à des données de lieux aussi complètes que possible. Dans ses [règles relatives aux contributions](https://support.google.com/contributionpolicy/answer/7400114), Google se positionne explicitement contre la suppression totale des profils d'établissement. Une suppression complète via votre propre compte n'est donc pratiquement pas prévue." },

    { t: "h2", id: "fremder", text: "Cas 2 : Signaler une fiche de tiers ou une fiche erronée", toc: "Cas 2 : Fiche tierce" },
    { t: "p", text: "Pour les fiches qui ne vous appartiennent pas — une fiche fausse, obsolète ou créée par un tiers — il ne reste que la fonctionnalité de signalement :" },
    { t: "ol", items: [
      "Ouvrez la fiche dans **Google Maps**.",
      "Cliquez sur **« Suggérer une modification »**.",
      "Sélectionnez **« Signaler que ce lieu est fermé ou le supprimer »**.",
      "Indiquez le motif, par exemple **« Ce lieu n'existe pas ici »** ou **« Contenu inapproprié, nuisible ou trompeur »**.",
      "Enregistrez — et attendez la vérification par Google.",
    ] },
    { t: "p", text: "Soyons honnêtes : c'est un jeu de patience. Google traite les signalements principalement de façon automatisée, le traitement peut prendre des semaines, et les signalements sont souvent rejetés sans explication détaillée. Les chances de succès sont meilleures lorsque plusieurs personnes indépendantes signalent le même problème avec des informations factuellement exactes — Google détecte rapidement les signalements abusifs et les ignore." },

    { t: "h2", id: "doppelt", text: "Cas 3 : Traiter un doublon de fiche", toc: "Cas 3 : Doublon" },
    { t: "p", text: "Les doublons apparaissent souvent à la suite d'un déménagement, d'un changement de nom ou d'une création accidentelle multiple. Voici la marche à suivre :" },
    { t: "ol", items: [
      "Ouvrez le **profil en double** dans Google Maps.",
      "Cliquez sur **« Suggérer une modification »** → **« Signaler que ce lieu est fermé ou le supprimer »**.",
      "Sélectionnez comme motif **« Doublon d'un autre lieu »** et enregistrez.",
    ] },
    { t: "warn", title: "Important", text: "Ne supprimez pas par erreur la fiche **vérifiée** — vous devriez alors reprouver votre statut de propriétaire. Si les deux fiches ont déjà des avis, il vaut mieux ne pas en supprimer une, mais demander au support Google de les **fusionner**. C'est la seule façon de conserver vos avis authentiques." },

    { t: "h2", id: "sonderfaelle", text: "Cas 4 : Établissement fermé, déménagé ou renommé", toc: "Cas 4 : Cas particuliers" },
    { t: "p", text: "Ces cas particuliers sont souvent mal gérés :" },
    { t: "ul", items: [
      "**Établissement définitivement fermé :** « Définitivement fermé » est la bonne option ici — gardez toutefois à l'esprit que les anciens avis négatifs restent visibles et continuent de produire leurs effets.",
      "**Déménagement :** Mettez à jour l'adresse dans la fiche existante plutôt que d'en créer une nouvelle — vous créeriez sinon un doublon et vos avis se disperseraient.",
      "**Changement de nom :** Modifiez le nom dans le même profil. Créer une nouvelle fiche vous prive de tout votre historique d'avis.",
    ] },
    { t: "p", text: "Si la fiche est fondamentalement compromise — par des faux avis, une vague d'atteinte à la réputation ou des données qu'il est impossible de corriger — la correction ne sert à rien. La suppression complète est alors la solution la plus propre." },

    { t: "h2", id: "vergleich", text: "Comparaison des méthodes", toc: "Comparaison" },
    { t: "table", head: ["Méthode", "Ce qu'elle apporte", "Délai", "Résultat"], rows: [
      ["Signalement (formulaire)", "Fiches de tiers / erronées isolées", "Plusieurs semaines, incertain", "Souvent faible, rejets fréquents"],
      ["Suppression du compte", "Statut « fermé » uniquement", "Immédiat", "La fiche reste visible"],
      ["Avocat", "Contenus illicites ciblés", "3 à 9 mois", "Incertain, coûteux (honoraires horaires)"],
      ["**RapidRemove (suppression du profil)**", "**Fiche entière + tous les avis**", "**24 à 48 heures**", "**Paiement uniquement après succès**"],
    ] },

    { t: "h2", id: "dauerhaft", text: "Solution définitive : faire supprimer l'intégralité du profil", toc: "Suppression durable" },
    { t: "p", text: "Si vous souhaitez qu'une fiche disparaisse **totalement et définitivement** — avis compris — de Google Maps et des résultats de recherche, les outils natifs atteignent leurs limites. C'est précisément là qu'intervient RapidRemove : nous ne citons pas en justice des avis individuels ni ne contestons des statuts, nous supprimons le **profil d'établissement complet** via les procédures officielles de Google. La fiche disparaît ainsi en une seule fois avec l'ensemble de ses avis — faux avis inclus." },
    { t: "p", text: "Ce que cela signifie concrètement pour vous :" },
    { t: "ul", items: [
      "**Rapidité :** suppression en 24 à 48 heures en règle générale, contre des mois d'allers-retours.",
      "**Intégralité :** le profil et tous les avis sont intégralement retirés de l'affichage et de la recherche — ni « fermé », ni traces résiduelles.",
      "**Neutre pour le SEO :** votre site web, votre positionnement organique et vos Google Ads restent intacts. Seule la fiche Maps / profil d'établissement est supprimée.",
      "**Prévisible :** prix fixe transparent, **payable uniquement après succès** (No Cure, No Pay).",
      "**Avec garantie :** si le profil réapparaît suite à une action d'un tiers, nous le supprimons à nouveau gratuitement pendant la période de protection.",
      "**Discret :** pas d'échanges de courriers, pas de conflit direct avec les auteurs d'avis — donc aucun risque d'effet Streisand.",
    ] },
    { t: "h3", text: "Comment se déroule la suppression avec RapidRemove" },
    { t: "ol", items: [
      "**Vérification gratuite :** saisissez le nom de votre établissement. Nous localisons votre vraie fiche Maps et vérifions en quelques secondes si et dans quel délai elle peut être supprimée.",
      "**Confirmation et autorisation :** vous confirmez le bon profil et donnez l'autorisation de traitement. Aucun accès à Gmail, Google Ads ou données personnelles.",
      "**Suppression en 24 à 48 heures :** notre équipe supprime la fiche et tous les avis — définitivement. Le paiement n'intervient qu'ensuite.",
    ] },

    { t: "cta", title: "Vérifiez gratuitement si votre fiche Maps peut être supprimée.", text: "Saisissez le nom de votre établissement — nous vérifions en quelques secondes si votre profil et tous ses avis peuvent être supprimés, et dans quel délai.", btn: "Vérifier la suppressibilité", href: "/fr/?start=1", trust: ["Analyse gratuite", "Avec garantie", "Sans risque"] },

    { t: "h2", id: "fazit", text: "Conclusion", toc: "Conclusion" },
    { t: "p", text: "Les outils natifs de Google n'offrent qu'une maîtrise limitée sur une fiche Google Maps : « supprimer du compte » se traduit le plus souvent par « fermé », les fiches de tiers ne peuvent être que signalées, et les doublons devraient être fusionnés plutôt que supprimés. Lorsqu'il s'agit d'une **suppression totale et définitive**, avis compris, la suppression complète du profil est la voie fiable — rapide, prévisible et avec paiement uniquement après succès." },

    { t: "cta", title: "Vérifiez maintenant gratuitement si votre fiche peut être supprimée.", text: "En quelques secondes, vous voyez votre vrai profil et savez si et dans quel délai nous pouvons le supprimer. Pas de paiement anticipé, pas d'engagement.", btn: "Démarrer la vérification gratuite", href: "/fr/?start=1", trust: ["Zéro risque", "Paiement uniquement après suppression réussie"] },
  ],
  faq: [
    { q: "Comment supprimer ma propre fiche Google Maps ?", a: "Via « Mon établissement » → Paramètres du profil → Menu à trois points → « Supprimer le profil d'établissement » → « Supprimer le contenu et les administrateurs du profil ». Attention : cette action dissocie simplement la fiche de votre compte, mais ne la supprime pas de Maps ni des résultats de recherche." },
    { q: "Pourquoi ma fiche Google Maps reste-t-elle visible après la suppression ?", a: "Parce que la suppression du compte marque généralement la fiche comme « Définitivement fermé ». Le profil et les avis subsistent dans Maps et dans la recherche. Google ne prévoit pas de suppression complète en autonomie ; en pratique, elle nécessite le recours à une agence spécialisée." },
    { q: "Comment signaler une fiche de tiers ou une fiche erronée ?", a: "Ouvrez la fiche dans Google Maps, cliquez sur « Suggérer une modification » → « Signaler que ce lieu est fermé ou le supprimer », indiquez le motif (par ex. « Ce lieu n'existe pas ici ») et enregistrez. Google examine la suggestion — cela peut prendre du temps et le signalement est souvent rejeté." },
    { q: "Comment supprimer un doublon de fiche Google ?", a: "Ouvrez le doublon dans Maps, cliquez sur « Suggérer une modification » → « Signaler que ce lieu est fermé ou le supprimer » → « Doublon d'un autre lieu ». Si les deux fiches ont des avis, demandez plutôt leur fusion via le support Google pour ne perdre aucun avis." },
    { q: "La suppression affecte-t-elle mon SEO ou mon site web ?", a: "Non. Seule la fiche Maps / profil d'établissement est supprimée. Votre site web, votre positionnement organique et vos Google Ads restent inchangés." },
    { q: "Est-il possible de faire supprimer définitivement une fiche Google Maps ?", a: "Une suppression totale et définitive, avis compris, passe généralement par une agence spécialisée, puisque Google ne prévoit pas de suppression autonome. La suppression technique s'effectue souvent en 24 à 48 heures — le paiement n'intervient qu'après le succès." },
    { q: "Quel est le coût de la suppression d'une fiche Maps ?", a: "Chez RapidRemove, un prix fixe transparent s'applique, payable uniquement après la suppression effective. Vous ne prenez donc aucun risque financier." },
  ],
  related: [
    { label: "Supprimer la fiche d'établissement Google : comment faire ?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Supprimer un avis Google : coûts et méthodes", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Signaler et supprimer un faux avis Google", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Mauvais avis Google : que faire ?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
