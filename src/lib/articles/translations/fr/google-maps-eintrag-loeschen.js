/* FR — google-maps-eintrag-loeschen */
const article = {
  category: "Règles Google",
  meta: {
    slug: "supprimer-fiche-google-maps",
    title: "Supprimer une fiche Google Maps : la sienne, celle d'un tiers et les doublons (2026)",
    h1: "Supprimer une fiche Google Maps : la sienne, celle d'un tiers et les doublons",
    description: "Supprimer une fiche Google Maps – qu'elle soit la vôtre, celle d'un tiers, erronée ou en double. Guide étape par étape, pourquoi la fiche reste souvent et comment la faire supprimer durablement.",
    keywords: ["supprimer fiche google maps", "supprimer fiche google maps tiers", "supprimer fiche erronée google maps", "supprimer entreprise de google maps", "supprimer doublon google maps", "retirer fiche google maps"],
    author: "Matthias Lang",
    authorRole: "Expert Google",
    date: "2026-06-04",
  },
  dek: "Une fiche obsolète, erronée ou en double sur Google Maps peut désorienter les clients et nuire à votre réputation. Mais la supprimer est plus délicat qu'on ne le pense : même si vous effacez tout de votre compte, **la fiche reste souvent visible dans Maps et dans la recherche.** Ce guide montre comment supprimer des fiches Google Maps personnelles, tierces, erronées et en double – et comment une suppression durable fonctionne vraiment.",
  blocks: [
    { t: "note", title: "Remarque", text: "Cet article est un guide pratique et non un conseil juridique." },

    { t: "h2", id: "eigener", text: "Supprimer votre propre fiche Google Maps", toc: "Votre propre fiche" },
    { t: "p", text: "Si vous êtes propriétaire de la fiche, vous pouvez la détacher de votre compte :" },
    { t: "ol", items: [
      "Recherchez sur Google **« Votre fiche d'établissement »** et ouvrez les paramètres de la fiche.",
      "Via le **menu à trois points**, allez à **« Supprimer la fiche d'établissement »**.",
      "Choisissez **« Supprimer le contenu de la fiche et les administrateurs »** et confirmez.",
    ] },

    { t: "h2", id: "sichtbar", text: "Pourquoi la fiche reste tout de même visible", toc: "Pourquoi elle reste" },
    { t: "p", text: "C'est le point décisif que Google occulte délibérément : la retirer de votre compte ne signifie **pas** que l'entreprise disparaît de Maps et de la recherche. Elle est seulement détachée de votre compte et, en règle générale, marquée comme **« Définitivement fermé »**. La fiche et les avis **restent**. Dans ses conditions d'utilisation, Google se positionne expressément contre la suppression complète des fiches d'établissement – une suppression totale via le seul compte est donc pratiquement impossible." },

    { t: "h2", id: "fremder", text: "Signaler une fiche tierce ou erronée", toc: "Fiche tierce" },
    { t: "p", text: "Pour les fiches qui ne vous appartiennent pas (p. ex. une fiche erronée ou obsolète), utilisez la fonction de signalement :" },
    { t: "ol", items: [
      "Ouvrez la fiche dans **Google Maps**.",
      "Cliquez sur **« Suggérer une modification »**.",
      "Choisissez **« Fermer ou supprimer »**.",
      "Indiquez le motif, p. ex. **« N'existe pas ici »** ou **« Offensant, nuisible ou trompeur »**.",
      "Enregistrez et attendez l'examen par Google.",
    ] },
    { t: "p", text: "Si la suggestion est approuvée, la fiche peut être retirée de la recherche et de Maps. Le traitement n'est toutefois pas garanti et peut prendre du temps." },

    { t: "h2", id: "doppelt", text: "Supprimer une fiche Google en double", toc: "Fiche en double" },
    { t: "p", text: "Les fiches en double (doublons) résultent souvent de déménagements, de changements de nom ou de créations multiples par erreur. Procédez ainsi :" },
    { t: "ol", items: [
      "Ouvrez la fiche **en double** dans Google Maps.",
      "Cliquez sur **« Suggérer une modification »** → **« Fermer ou supprimer »**.",
      "Choisissez comme motif **« Doublon d'un autre lieu »** et enregistrez.",
    ] },
    { t: "warn", title: "Important", text: "Ne supprimez pas par erreur la fiche **vérifiée**, sinon vous devrez la confirmer de nouveau. Si les deux fiches ont déjà des avis, ne les supprimez pas ; faites-les plutôt **fusionner** via le support Google afin de conserver les avis." },

    { t: "h2", id: "dauerhaft", text: "Suppression durable et complète", toc: "Suppression durable" },
    { t: "p", text: "Si vous voulez supprimer une fiche **entièrement et durablement** – y compris tous les avis – de Google Maps et de la recherche, ce n'est pas possible via votre propre compte. Ici, une agence spécialisée avec suppression technique aide :" },
    { t: "ul", items: [
      "**Efficacité :** suppression souvent en 24 heures maximum",
      "**Intégral :** fiche et avis sont entièrement supprimés",
      "**Compatible SEO :** votre site et votre classement restent intacts",
      "**Garanti :** si la fiche réapparaît via des tiers, elle est supprimée gratuitement",
    ] },
    { t: "cta", title: "Vérifiez gratuitement si votre fiche Maps peut être supprimée.", text: "Saisissez le nom de votre entreprise : nous vérifions en quelques secondes si votre fiche et tous ses avis peuvent être supprimés, et à quelle vitesse.", btn: "Vérifier la faisabilité", href: "https://rapid-remove.com/", trust: ["Analyse gratuite", "Garantie", "Sans risque"] },
  ],
  faq: [
    { q: "Comment supprimer ma propre fiche Google Maps ?", a: "Via « Votre fiche d'établissement » → paramètres → menu à trois points → « Supprimer la fiche d'établissement » → « Supprimer le contenu de la fiche et les administrateurs ». Attention : cela ne fait que détacher la fiche de votre compte, sans la retirer de Maps." },
    { q: "Pourquoi ma fiche Google Maps reste-t-elle visible après suppression ?", a: "Parce que la retirer du compte ne fait que marquer la fiche comme « Définitivement fermé ». La fiche et les avis restent dans Maps et la recherche. Google ne propose aucun moyen direct ; en pratique, une suppression complète passe généralement par une agence spécialisée." },
    { q: "Comment signaler une fiche tierce ou erronée ?", a: "Dans Google Maps, ouvrez la fiche, « Suggérer une modification » → « Fermer ou supprimer », indiquez le motif (p. ex. « N'existe pas ici ») et enregistrez. Google examine la suggestion." },
    { q: "Comment supprimer une fiche Google en double ?", a: "Ouvrez le doublon dans Maps, « Suggérer une modification » → « Fermer ou supprimer » → choisissez « Doublon d'un autre lieu ». Si les deux fiches ont des avis, faites-les plutôt fusionner via le support Google." },
    { q: "Puis-je faire supprimer une fiche Google Maps durablement ?", a: "De façon complète et durable, y compris les avis, cela passe généralement par une agence spécialisée, car Google ne prévoit pas l'auto-suppression. La suppression technique se fait souvent en 24 heures — paiement uniquement après succès." },
  ],
  related: [
    { label: "Supprimer la fiche d'établissement Google : comment faire ?", url: "https://rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Supprimer un avis Google : coûts et méthodes", url: "https://rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Signaler et supprimer un faux avis Google", url: "https://rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Mauvais avis Google : que faire ?", url: "https://rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
