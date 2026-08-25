/* FR — google-rezension-loeschen-lassen */
const article = {
  category: "Guide",
  meta: {
    slug: "comment-supprimer-un-avis-google",
    title: "Comment supprimer un avis Google : formulaire, coûts et guide (2026)",
    h1: "Comment supprimer un avis Google : formulaire, coûts et guide",
    description: "Supprimer un avis Google – avec ou sans formulaire, gratuitement ou via une agence ? Comment retirer ses propres avis et ceux des autres, et comment voir quel avis a été supprimé.",
    keywords: ["comment supprimer un avis google", "supprimer avis google formulaire", "supprimer avis google coût", "supprimer son propre avis google", "supprimer avis google gratuit", "retirer un avis google"],
    author: "Matthias Lang",
    authorRole: "Expert Google",
    date: "2026-06-04",
  },
  dek: "Qu'il s'agisse d'un avis que vous avez vous-même publié et voulez retirer, ou d'un avis tiers qui nuit à votre entreprise : dans ce guide, vous apprendrez **comment supprimer un avis Google** – gratuitement via le formulaire de signalement, en tant qu'entreprise via la gestion officielle et, si besoin, durablement via une agence. En plus : comment savoir si un avis a vraiment été retiré.",
  blocks: [
    { t: "note", title: "Remarque", text: "Cet article est un guide pratique et non un conseil juridique." },

    { t: "h2", id: "eigene", text: "Supprimer votre propre avis Google", toc: "Supprimer le sien" },
    { t: "p", text: "Un avis que vous avez **écrit vous-même**, vous pouvez le retirer gratuitement à tout moment :" },
    { t: "ol", items: [
      "Ouvrez Google Maps sur l'ordinateur ou dans l'application et connectez-vous.",
      "Cliquez sur le menu puis sur **« Vos contributions »** ou « Avis ».",
      "Trouvez l'avis, cliquez sur le **menu à trois points** et choisissez **« Supprimer l'avis »**.",
      "Confirmez l'opération.",
    ] },
    { t: "p", text: "Cela ne fonctionne que pour **vos propres** avis. Les avis tiers sur votre entreprise, vous ne pouvez pas les supprimer directement – seulement les signaler." },

    { t: "h2", id: "formular", text: "Faire supprimer un avis tiers : le formulaire", toc: "Le formulaire" },
    { t: "p", text: "Si un avis tiers nuit à votre entreprise, procédez ainsi :" },
    { t: "ol", items: [
      "Ouvrez votre **fiche d'établissement Google** et allez aux avis.",
      "À côté de l'avis concerné, cliquez sur le **menu à trois points** puis sur **« Signaler l'avis »**.",
      "Dans le **formulaire**, choisissez l'infraction adaptée (p. ex. fausses informations, hors sujet, conflit d'intérêts).",
      "Via l'**outil Google de gestion des avis**, vous pouvez suivre l'état et grouper plusieurs signalements.",
    ] },
    { t: "p", text: "Important : une suppression n'a lieu que si Google constate une **infraction aux règles**. Les simples expressions d'opinion sur des expériences réelles ne sont en général pas retirées." },

    { t: "h2", id: "kosten", text: "Combien coûte la suppression d'un avis ?", toc: "Combien ça coûte" },
    { t: "table", head: ["Voie", "Coût", "Succès"], rows: [
      ["Signaler soi-même (formulaire)", "gratuit", "souvent faible"],
      ["Prestataires bon marché", "env. 19 – 49 € / avis", "très variable"],
      ["Avocats spécialisés (avis isolé)", "env. 100 – 159 € / avis", "env. 90 %, lent"],
      ["Suppression de la fiche (RapidRemove)", "prix fixe, payable après succès", "garanti (tous les avis partis)"],
    ] },

    { t: "h2", id: "kostenlos-vs", text: "Gratuit vs. payant : que valent-ils ?", toc: "Gratuit vs. payant" },
    { t: "p", text: "La voie gratuite via le formulaire vaut toujours comme **première tentative**, surtout pour du spam évident. La réalité est toutefois décevante : Google examine en grande partie de façon automatisée et rejette beaucoup de signalements avec des textes types. En cas d'échec, une **suppression professionnelle** est l'étape suivante. Recherchez des **honoraires de résultat** – ainsi vous ne portez aucun risque financier si la suppression ne marche pas." },

    { t: "h2", id: "geloescht-sehen", text: "Comment savoir qu'un avis a été supprimé ?", toc: "A-t-il été supprimé ?" },
    { t: "p", text: "Un avis supprimé disparaît de votre fiche, et votre **note moyenne** ainsi que le **nombre d'avis** s'ajustent. Aucun statut « supprimé » direct ne vous est montré ; l'indicateur le plus fiable est que l'avis et sa note ne sont plus visibles et que la moyenne change en conséquence. Documentez au préalable l'état de départ par une capture pour avoir la comparaison avant-après." },

    { t: "h2", id: "profil-loeschen", text: "Solution durable : faire supprimer toute la fiche", toc: "Supprimer toute la fiche" },
    { t: "p", text: "Si le formulaire ne donne rien et que plusieurs avis endommagent durablement votre fiche, la **suppression de la fiche** est la voie la plus directe. La différence clé : RapidRemove ne supprime **pas des avis isolés, mais toute la fiche d'établissement Google** ; tous les avis disparaissent avec. Le résultat est une page blanche au lieu d'un combat pour chaque étoile." },
    { t: "ul", items: [
      "**24 – 48 heures** au lieu de semaines ou de mois",
      "**toute la fiche, y compris tous les avis**, d'un coup",
      "**Garantie :** si la fiche réapparaît via des tiers, elle est supprimée gratuitement",
      "**aucun effort** pour vous, aucun risque Streisand",
      "**nouveau départ en option** avec une fiche propre",
    ] },
    { t: "warn", title: "Important", text: "La suppression de la fiche retire la **fiche complète**, pas un avis isolé. Qui veut seulement supprimer un avis et conserver la fiche utilise le signalement ou la voie de l'avocat. Depuis peu, RapidRemove propose aussi exactement cela : [suppression d'avis isolés](https://www.rapid-remove.com/fr/supprimer-un-avis/) – payée par avis réellement supprimé, uniquement en cas de succès." },
    { t: "cta", title: "Fiche durablement endommagée ? Vérifiez gratuitement la faisabilité.", text: "En quelques secondes, vous verrez si votre fiche et tous ses avis peuvent être supprimés, et à quelle vitesse.", btn: "Vérifier la faisabilité", href: "https://www.rapid-remove.com/", trust: ["Analyse gratuite", "Garantie", "Sans risque"] },
  ],
  faq: [
    { q: "Puis-je supprimer mon propre avis Google ?", a: "Oui. Dans Google Maps, ouvrez « Vos contributions », sélectionnez l'avis et cliquez sur « Supprimer l'avis » dans le menu à trois points. C'est gratuit et possible à tout moment." },
    { q: "Existe-t-il un formulaire pour faire supprimer un avis Google ?", a: "Oui. Via le menu à trois points à côté de l'avis, vous accédez à « Signaler l'avis » et donc au formulaire de signalement. Vous suivez le statut via l'outil Google de gestion des avis." },
    { q: "Puis-je supprimer un avis Google gratuitement ?", a: "Les vôtres oui. Les avis tiers, vous pouvez les signaler gratuitement, mais que Google les retire n'est pas garanti. Pour une suppression sûre, il existe des services payants avec honoraires de résultat." },
    { q: "Comment voir si mon avis signalé a été supprimé ?", a: "L'avis disparaît de la fiche et la moyenne ainsi que le nombre d'avis changent. Aucun statut explicite n'est affiché – une capture préalable aide à comparer." },
    { q: "Combien coûte la suppression d'un avis Google ?", a: "De gratuit (auto-signalement) à 19–49 € (services bon marché) ou 100–159 € par avis chez un avocat. Pour la suppression de la fiche, un prix fixe s'applique, payable après succès." },
    { q: "RapidRemove supprime-t-il des avis isolés ?", a: "Oui, désormais : [supprimer un avis Google](https://www.rapid-remove.com/fr/supprimer-un-avis/) – 179 € par avis supprimé, payé uniquement en cas de succès ; l'avis doit dater de 4 semaines au maximum et contenir du texte. Si la fiche est endommagée dans son ensemble, la suppression de la fiche complète avec tous ses avis reste la voie la plus complète." },
  ],
  related: [
    { label: "Supprimer un avis Google : coûts et méthodes", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Signaler et supprimer un faux avis Google", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Avocat ou suppression technique : qu'est-ce qui vaut le coup ?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Supprimer la fiche d'établissement Google : comment faire ?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
