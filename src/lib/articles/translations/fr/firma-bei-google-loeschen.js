/* FR — firma-bei-google-loeschen (Supprimer son entreprise de Google) */
const article = {
  category: "Règles Google",
  meta: {
    slug: "supprimer-entreprise-de-google",
    title: "Supprimer son entreprise de Google : retirer la fiche d'établissement",
    h1: "Supprimer son entreprise de Google — retirer la fiche d'établissement définitivement",
    description: "Supprimer son entreprise de Google ne suffit pas à effacer la fiche d'établissement. Découvrez pourquoi « marquer comme fermé » ne supprime rien — et comment retirer définitivement votre fiche et tous vos avis Google.",
    keywords: ["supprimer entreprise de google", "supprimer fiche établissement google", "effacer entreprise google", "retirer entreprise google maps"],
    author: "Maximilian Hölzl",
    authorRole: "Expert Google",
    date: "2026-06-04",
  },
  dek: "« Supprimer mon entreprise de Google » — ça paraît simple. Ça ne l'est pas. Marquer son établissement comme « définitivement fermé » laisse le nom, l'adresse et tous les avis pleinement visibles. Voici comment procéder pour supprimer la fiche réellement et durablement.",
  blocks: [
    { t: "note", title: "Remarque", text: "Cet article offre un aperçu pratique et ne remplace pas un conseil juridique." },

    { t: "h2", id: "was", text: "Que signifie concrètement « supprimer son entreprise de Google » ?", toc: "Que signifie-ce ?" },
    { t: "p", text: "Quand on parle de « supprimer son entreprise de Google », on vise presque toujours la **fiche d'établissement Google** — le profil public qui regroupe nom, adresse, horaires, photos et **avis**, et qui apparaît dans la recherche Google ainsi que sur Google Maps. C'est précisément cette fiche qu'il s'agit de faire disparaître. Le guide complet, étape par étape, se trouve dans notre article [Supprimer un profil d'établissement Google](/fr/magazine/supprimer-profil-etablissement-google/)." },

    { t: "h2", id: "kein-button", text: "Pourquoi il n'existe aucun bouton « Supprimer »", toc: "Aucun bouton « Supprimer »" },
    { t: "p", text: "Vous pouvez marquer votre établissement comme « définitivement fermé » ou retirer la gestion de votre compte — mais il n'existe pas, pour un propriétaire, de bouton explicite « Supprimer cette fiche et tous les avis définitivement ». Google considère la fiche comme une information utile pour les internautes et en conserve le contrôle." },
    { t: "warn", title: "« Fermé » ne signifie pas « supprimé »", text: "Marquer l'établissement comme fermé ne retire **rien** : la fiche, le nom, l'adresse et **tous les avis restent publiquement visibles** — avec en prime la mention barrée « Définitivement fermé ». Aux yeux des prospects, le résultat est souvent pire qu'avant." },

    { t: "h2", id: "so-gehts", text: "Comment retirer réellement la fiche d'établissement", toc: "Comment faire" },
    { t: "p", text: "Une fiche ne disparaît de façon fiable qu'en procédant à la **suppression complète du profil** via les voies officielles de Google — non pas en signalant les avis un par un. Lorsque l'intégralité du profil est supprimée, **tous les avis** s'effacent avec lui. Les avantages de cette démarche via RapidRemove :" },
    { t: "ul", items: [
      "**Rapidité :** suppression généralement sous 24 à 48 heures, non pas en plusieurs mois",
      "**Intégralité :** la fiche complète disparaît, **avis inclus**, en une seule fois",
      "**Prévisibilité :** prix fixe, réglable **uniquement en cas de succès** — aucun tarif horaire à l'aveugle",
      "**Sans risque :** garantie incluse — si la fiche réapparaît à cause d'un tiers, elle est retirée à nouveau sans frais",
      "**Neutre pour le référencement :** votre site et votre positionnement restent inchangés",
    ] },
    { t: "warn", title: "Important", text: "Cette procédure supprime la **fiche dans son ensemble**, pas un seul avis. Pour conserver la fiche tout en contestant un avis précis, le signalement ou le recours juridique sont les voies adaptées." },

    { t: "cta", title: "Vérifiez la supprimabilité de votre fiche — gratuitement.", text: "Renseignez le nom de votre établissement : nous vérifions en quelques secondes si votre fiche et tous vos avis peuvent être retirés, et dans quel délai.", btn: "Vérifier la supprimabilité", href: "https://www.rapid-remove.com/", trust: ["Analyse gratuite", "Garantie incluse", "Sans engagement"] },

    { t: "h2", id: "einzeln-vs-ganz", text: "Un avis isolé ou la fiche entière ?", toc: "Avis ou fiche" },
    { t: "p", text: "Si vous souhaitez uniquement contester un avis injustifié, le signalement ou la voie juridique sont appropriés — retrouvez tous les détails dans notre article [Supprimer un avis Google](/fr/magazine/supprimer-avis-google/). En revanche, si la fiche est globalement compromise et que vous souhaitez repartir sur une base saine, la suppression complète est la solution la plus directe." },

    { t: "h2", id: "kosten", text: "Quel est le coût de la suppression de la fiche ?", toc: "Le coût" },
    { t: "p", text: "Les prix varient fortement selon le prestataire :" },
    { t: "table", head: ["Type de prestataire", "Fourchette de prix", "Résultat"], rows: [
      ["Prestataires low-cost", "19 – 49 € par avis", "Très variable"],
      ["Avocats spécialisés", "100 – 159 € par avis", "~90 %, mais lent"],
      ["Suppression de fiche (RapidRemove)", "Prix fixe, réglable après succès", "Tous les avis supprimés — paiement uniquement en cas de succès"],
    ] },

    { t: "h2", id: "selbst", text: "Faire soi-même : le déroulement étape par étape", toc: "Faire soi-même" },
    { t: "ol", items: [
      "**Marquer comme définitivement fermé :** ne modifie que le libellé — la fiche et les avis restent visibles.",
      "**Retirer le profil de son compte :** dissocie uniquement le lien de gestion, sans supprimer la fiche publique.",
      "**Vérifier le résultat :** dans la quasi-totalité des cas, la fiche demeure dans la recherche et sur Maps — désormais avec la mention « Définitivement fermé ». Le problème de fond n'est pas résolu.",
    ] },
    { t: "p", text: "En d'autres termes : l'interface standard de Google ne permet pas de retirer durablement une fiche publique. C'est précisément pour cela qu'existe la suppression professionnelle et complète." },

    { t: "cta", title: "Retirer définitivement votre entreprise de Google ?", text: "Effectuez le contrôle de supprimabilité gratuit — en quelques secondes, sans engagement.", btn: "Vérifier maintenant", href: "https://www.rapid-remove.com/", trust: ["Analyse gratuite", "Garantie incluse", "Sans engagement"] },
  ],
  faq: [
    { q: "Puis-je supprimer moi-même ma fiche d'entreprise sur Google ?", a: "Vous pouvez la marquer comme « définitivement fermée » ou la retirer de votre compte — mais ces deux actions ne suppriment pas la fiche publique. Elle reste visible avec tous ses avis dans la recherche et sur Maps. Une suppression complète passe nécessairement par les processus officiels de Google." },
    { q: "« Définitivement fermé » équivaut-il à une suppression ?", a: "Non. Le nom, l'adresse et tous les avis restent publics ; seule la mention barrée « Définitivement fermé » est ajoutée. Le résultat est souvent perçu plus négativement qu'avant." },
    { q: "Quel délai faut-il prévoir pour la suppression ?", a: "Via la suppression professionnelle, comptez généralement 24 à 48 heures — bien plus rapide que la procédure judiciaire, qui peut s'étirer sur plusieurs mois pour chaque avis individuel." },
    { q: "Mon site et mon référencement seront-ils affectés ?", a: "Non. La suppression de la fiche d'établissement n'a aucun impact sur votre site, votre compte Google ni votre positionnement dans les résultats de recherche. Créer un nouveau profil propre reste possible par la suite, si vous le souhaitez." },
    { q: "Les faux avis disparaissent-ils également ?", a: "Oui. Puisque l'intégralité de la fiche est supprimée, tous les avis disparaissent avec elle — y compris les avis frauduleux ou infondés." },
    { q: "Quel est le tarif de RapidRemove pour la suppression d'une fiche ?", a: "RapidRemove applique un prix fixe, réglable uniquement après succès. Les prestataires traitant les avis à l'unité et les avocats facturent généralement par avis, le plus souvent sans garantie de résultat." },
  ],
  related: [
    { label: "Supprimer un profil d'établissement Google : le guide complet", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Supprimer un avis Google : coûts et méthodes", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Supprimer une fiche Google Maps", url: "https://www.rapid-remove.com/google-maps-eintrag-loeschen" },
  ],
};
export default article;
