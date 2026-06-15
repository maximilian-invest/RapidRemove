/* FR hub: "Supprimer sa fiche d'établissement Google" (lead article, MagArticle format) */
const article = {
  meta: {
    slug: "supprimer-profil-etablissement-google",
    title: "Supprimer sa fiche d'établissement Google : le guide complet",
    h1: "Supprimer sa fiche d'établissement Google — comment ça marche vraiment ?",
    description: "Google ne supprime pas votre fiche d'établissement sur simple demande. Ce guide explique pourquoi « définitivement fermé » n'est pas une suppression — et comment s'en débarrasser vraiment.",
    author: "Maximilian Hölzl",
    authorRole: "Expert Google et fondateur",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    keywords: [],
  },
  category: "Règles Google",
  iconKey: "trash",
  readingMin: 11,
  dek: "Google ne supprime pas votre fiche d'établissement sur simple demande. Ce guide explique pourquoi « définitivement fermé » n'est pas une suppression — et comment s'en débarrasser vraiment.",
  blocks: [
    { t: "h2", id: "kurz", text: "L'essentiel en bref", toc: "L'essentiel" },
    { t: "ul", items: [
      "**La suppression en autonomie est quasi impossible :** Google ne propose pas de bouton « supprimer ce profil » — seulement le statut « définitivement fermé ».",
      "**« Fermé » ≠ supprimé :** la fiche, le nom, l'adresse et **tous les avis restent visibles publiquement.**",
      "**Le seul chemin fiable** est la suppression complète du profil via les procédures officielles — légalement et de façon permanente.",
      "**RapidRemove** supprime la fiche et tous les avis associés en général en **24 à 48 heures** — **paiement uniquement après résultat**.",
    ] },

    { t: "p", text: "Vous cherchez votre entreprise sur Google et vous tombez sur un profil que vous ne voulez plus voir : rempli d'anciens faux avis ou d'avis vengeurs, avec des informations erronées, ou tout simplement une fiche dont vous voulez vous débarrasser une bonne fois pour toutes. La question qui s'impose : **comment supprimer ma fiche d'établissement Google ?** La réponse honnête est malheureusement plus compliquée que ce que Google voudrait vous faire croire. Ce guide vous explique ce qui fonctionne vraiment — étape par étape, sans langue de bois." },

    { t: "h2", id: "herkunft", text: "Qui a créé ce profil, au juste ?", toc: "Qui a créé le profil ?" },
    { t: "p", text: "La plupart des entrepreneurs qui nous contactent n'ont jamais créé leur profil eux-mêmes — et sont sincèrement surpris qu'il existe. Ce n'est pas l'exception, c'est la règle. Un profil d'établissement Google est rarement créé activement par le propriétaire. Bien plus souvent, quelqu'un d'autre l'ajoute, ou Google le génère de façon entièrement automatique. Pour comprendre pourquoi une telle fiche est si difficile à supprimer ensuite, il faut d'abord savoir comment elle est apparue. Il existe essentiellement trois voies." },
    { t: "anim", caption: "Trois façons dont un profil d'établissement voit le jour — le plus souvent sans la moindre action du propriétaire." },

    { t: "h3", text: "Voie 1 : quelqu'un ajoute le lieu à la main" },
    { t: "p", text: "N'importe quel utilisateur de Google peut, dans l'application Maps, toucher une adresse ou un emplacement vide et choisir « Ajouter un lieu manquant ». Cela permet d'inscrire un établissement sans avoir le moindre lien avec lui — des clients, d'anciens employés, des concurrents ou des utilisateurs très actifs de Maps (les Local Guides)." },
    { t: "p", text: "Ce n'est toutefois pas sans contrôle. Avant qu'un lieu signalé ne soit publié, une vérification automatique s'exécute en arrière-plan :" },
    { t: "ul", items: [
      "**Localisation :** l'utilisateur se trouve-t-il réellement à proximité du lieu qu'il veut ajouter ? Cela empêche quelqu'un à Berlin d'inventer un café à Munich pour s'amuser.",
      "**Contrôle des doublons :** existe-t-il déjà un nom similaire ou la même catégorie à cette coordonnée ou juste à côté ?",
      "**Recoupement avec le web :** Google recherche le nom en parallèle pour voir si l'établissement apparaît quelque part en ligne.",
    ] },
    { t: "p", text: "Si l'ensemble est cohérent, le point est publié — visible par tous en tant que **profil non revendiqué**." },

    { t: "h3", text: "Voie 2 : Google crée le profil lui-même à partir de données du web" },
    { t: "p", text: "C'est la voie à laquelle on pense le moins : Google crée des profils en grand nombre, de son propre chef — sans l'intervention ni le consentement du propriétaire. La raison est simple : Google veut cartographier le monde réel le plus complètement possible et n'attend pas qu'un nouvel établissement se manifeste." },
    { t: "p", text: "Pour cela, les robots de Google parcourent en continu le web à la recherche des **données NAP** — nom, adresse, téléphone (*Name, Address, Phone*). À partir de ces fragments, le système assemble un profil, déclenché par exemple par :" },
    { t: "ul", items: [
      "**Les données structurées du site :** si le site d'une entreprise intègre dans son code le balisage standardisé `LocalBusiness` (informations lisibles par machine selon Schema.org), Google lit l'adresse, le téléphone et les horaires de manière directe et nette.",
      "**Les traces numériques sur le web :** Google combine des informations issues des pages Facebook, des profils Instagram, des mentions dans la presse locale et des annuaires en ligne.",
      "**La recherche de cohérence :** lorsque le même établissement, à la même adresse, apparaît plusieurs fois de façon concordante — sur son propre site, sur Facebook et dans un blog local — Google en crée automatiquement une nouvelle fiche sur Maps.",
    ] },
    { t: "p", text: "La plupart des propriétaires ne s'en aperçoivent que lorsqu'ils voient soudain le bouton « Revendiquer cet établissement » sur la carte." },

    { t: "h3", text: "Voie 3 : import massif depuis des registres officiels" },
    { t: "p", text: "La troisième voie est souvent sous-estimée : Google reprend des données à grande échelle, depuis des sources officielles et des agrégateurs de données avec lesquels il a des accords." },
    { t: "ul", items: [
      "**Registres du commerce et des sociétés :** dès qu'une entreprise est enregistrée auprès de l'administration ou au registre du commerce, ces informations parviennent à Google à intervalles réguliers — généralement via des bases de données intermédiaires.",
      "**Annuaires professionnels :** Google confronte ses cartes aux Pages Jaunes et aux annuaires téléphoniques de chaque pays. Une nouvelle entrée peut y déclencher automatiquement un nouveau point sur Maps.",
    ] },
    { t: "p", text: "C'est ainsi qu'un profil peut apparaître peu après l'immatriculation de votre entreprise — sans que vous soyez jamais allé chez Google vous-même." },

    { t: "p", text: "**Pourquoi c'est important** Peu importe comment le profil est né, la conséquence est la même : dès qu'il existe, il collecte des avis et apparaît dans la recherche et sur Maps. Vous n'avez donc ni eu à le créer ni à le gérer pour être concerné — et c'est précisément pourquoi l'ignorer ne suffit pas. Il faut tout de même le supprimer activement." },

    { t: "h2", id: "selbst", text: "Peut-on supprimer soi-même sa fiche d'établissement Google ?", toc: "Le faire soi-même ?" },
    { t: "p", text: "En un mot : **pas de la façon dont vous l'imaginez.** Google fait une distinction stricte entre votre compte Google personnel et la fiche d'établissement publique (anciennement « Google My Business », aujourd'hui « Profil d'établissement Google »). Vous pouvez revendiquer la propriété de la fiche et modifier certaines informations — mais il n'existe tout simplement pas de bouton clair « Supprimer cette fiche et tous ses avis définitivement » pour les propriétaires d'établissements." },
    { t: "p", text: "Ce n'est pas un oubli, c'est délibéré : la fiche et ses avis font partie intégrante de la recherche Google et de Google Maps. Google considère ces informations comme utiles pour les utilisateurs — et n'en cède le contrôle qu'à contrecœur. C'est exactement pour cela que la plupart des chefs d'entreprise se heurtent rapidement à un mur lorsqu'ils essaient de supprimer leur fiche par leurs propres moyens." },

    { t: "h2", id: "geschlossen", text: "« Définitivement fermé » n'est pas une suppression", toc: "« Fermé » ≠ supprimé" },
    { t: "p", text: "L'option que Google vous propose s'appelle « Marquer comme définitivement fermé ». Beaucoup pensent que c'est une suppression — mais ce n'en est pas une. C'est simplement un **libellé de statut**." },
    { t: "warn", title: "Voici ce qui se passe vraiment avec « fermé »", text: "Votre fiche reste visible dans la recherche Google et sur Google Maps — avec le nom, l'adresse, les photos et **la totalité des avis**. Seule différence : un bandeau « Définitivement fermé » s'affiche en travers. Aux yeux de vos clients potentiels, cela donne souvent une impression *pire* qu'avant." },
    { t: "p", text: "Autrement dit : marquer son établissement comme « fermé » ne fait pas disparaître la fiche ni les avis — cela peut même rendre le problème plus visible encore. Une **vraie suppression**, elle, retire l'intégralité de la [fiche Google Maps](/fr/supprimer-fiche-google-maps/) avec tous les avis associés." },

    { t: "h2", id: "optionen", text: "Les options qui s'offrent réellement à vous", toc: "Vos options réelles" },
    { t: "p", text: "Concrètement, il existe trois façons de se débarrasser d'une fiche indésirable — avec des résultats très différents :" },
    { t: "table", rrCol: 3, head: ["Critère", "En autonomie (DIY)", "Avocat", "RapidRemove"], rows: [
      ["Suppression complète possible ?", "Pratiquement non", "Incertain", "Oui"],
      ["Délai", "—", "3 à 9 mois", "24 à 48 heures"],
      ["Coût", "—", "300 €+ / heure", "Forfait fixe à partir de 450 €"],
      ["Tous les avis supprimés", "Non", "Un par un, laborieux", "Tous d'un coup"],
      ["Résultat garanti", "Non", "Incertain", "Garanti (No Cure, No Pay)"],
      ["Votre temps et énergie", "Élevés", "Élevés", "Pratiquement nuls"],
    ] },
    { t: "p", text: "La voie autonome aboutit presque toujours à « définitivement fermé ». La voie juridique est coûteuse, lente et incertaine — et déclenche souvent l'[effet Streisand](/fr/supprimer-avis-negatif-google-avocat-ou-technique/), qui attire encore plus l'attention sur le problème. Il reste donc une troisième option : la suppression professionnelle et complète." },

    { t: "h2", id: "anleitung", text: "Guide : modifier ou supprimer sa fiche via Google", toc: "Guide via Google" },
    { t: "p", text: "Si vous souhaitez d'abord tenter par vous-même, voici comment cela se déroule concrètement. Anticipez le fait que le meilleur résultat que vous puissiez espérer est « fermé » — pas « supprimé »." },
    { t: "ol", items: [
      "**Revendiquer la propriété :** cherchez votre entreprise sur Google et cliquez sur « Vous êtes le propriétaire de cet établissement ? ». Google exige une vérification (courrier postal, téléphone, e-mail ou vidéo) — cela peut prendre plusieurs jours, voire plusieurs semaines.",
      "**Se connecter à la fiche d'établissement :** une fois la propriété confirmée, gérez la fiche directement depuis la recherche Google.",
      "**Chercher « Supprimer le profil » :** dans les paramètres, vous trouverez des options comme « Marquer l'établissement comme définitivement fermé » ou « Supprimer le profil ». Cette dernière option ne supprime que le lien de gestion, pas la fiche publique.",
      "**Vérifier le résultat :** en général, la fiche reste visible avec tous ses avis — désormais étiquetée « Définitivement fermé ». Le problème de fond n'est pas résolu.",
    ] },
    { t: "note", title: "Important à savoir", text: "Sans propriété confirmée, vous ne pouvez pratiquement rien modifier. Et même avec la propriété, la suppression complète de la fiche publique via l'interface standard n'est pas prévue." },

    { t: "cta", title: "Préférez vérifier directement si votre fiche peut être supprimée ?", text: "Entrez le nom de votre entreprise — nous retrouvons votre vraie fiche Google et vérifions en quelques secondes si elle peut être supprimée, et dans quel délai. Sans engagement et sans frais.", btn: "Lancer le diagnostic gratuit", href: "/fr/?start=1", trust: ["Paiement uniquement après suppression confirmée"] },

    { t: "h2", id: "einzeln", text: "Supprimer des avis individuels ou retirer toute la fiche ?", toc: "Avis isolés ou fiche ?" },
    { t: "p", text: "Beaucoup commencent par essayer de [signaler](/fr/supprimer-faux-avis-google/) les mauvais avis un par un auprès de Google. C'est fastidieux et aléatoire : Google rejette fréquemment ces signalements, chaque avis doit être justifié séparément — et pour chaque avis retiré, de nouveaux peuvent apparaître rapidement. Vous combattez des symptômes." },
    { t: "p", text: "L'approche durable s'attaque à la racine : **en supprimant toute la fiche, tous les avis disparaissent en même temps** — faux avis inclus. Une solution définitive, pas une rustine. C'est précisément pour cela que nous ne supprimons pas des avis isolés, mais le profil dans son intégralité. Ceux qui souhaitent dans un premier temps [faire supprimer des avis Google individuellement](/fr/supprimer-avis-google/) trouveront là-bas les méthodes et une comparaison des coûts." },
    { t: "tip", title: "L'avantage décisif", text: "Une fiche supprimée ne peut plus afficher d'anciens avis *ni* en accumuler de nouveaux. Le problème n'est pas déplacé — il est éliminé." },

    { t: "h2", id: "legal", text: "Est-ce légal ?", toc: "Est-ce légal ?" },
    { t: "p", text: "Oui. Une suppression professionnelle s'opère exclusivement via les **procédures officielles prévues par Google** et a été validée juridiquement. Rien n'est piraté, rien n'est contourné, aucun accès non autorisé n'est utilisé. Votre compte Google, Gmail et vos éventuels comptes Google Ads restent entièrement intacts — tout comme votre site web, votre référencement naturel et vos campagnes publicitaires." },
    { t: "p", text: "Pour reconnaître un prestataire sérieux : il indique une entreprise réelle avec une adresse et un numéro SIRET ou équivalent, il est transparent sur sa méthode et **ne facture qu'après résultat** — il ne promet pas des « accès secrets à Google » vagues et invérifiables." },

    { t: "h2", id: "kosten", text: "Combien de temps faut-il — et quel est le coût ?", toc: "Délai et coût" },
    { t: "p", text: "Une suppression professionnelle est en général finalisée **en 24 à 48 heures** — contre des mois si vous passez par un avocat. Sur le plan tarifaire : un avocat facture à l'heure (souvent 300 € ou plus) sans garantie de résultat. RapidRemove travaille avec un **forfait transparent à partir de 450 €** — et vous payez **exclusivement après suppression effective**." },
    { t: "p", text: "Le tarif vous paraît élevé ? Faites le calcul : un seul faux avis visible peut significativement faire chuter votre taux de clic et vous coûter bien plus sur plusieurs mois." },

    { t: "h2", id: "ablauf", text: "Comment se déroule la suppression avec RapidRemove", toc: "Le déroulé" },
    { t: "ol", items: [
      "**Diagnostic gratuit :** entrez le nom de votre entreprise. Nous retrouvons votre fiche et vérifions immédiatement si la suppression est possible — sans engagement et sans frais.",
      "**Confirmation et autorisation :** vous confirmez que c'est bien la bonne fiche et donnez votre accord pour le traitement. Aucun accès à Gmail, Ads ou données personnelles requis.",
      "**Suppression en 24 à 48 heures :** notre équipe retire la fiche et tous les avis associés — définitivement. Le paiement intervient uniquement après.",
    ] },

    { t: "h2", id: "fazit", text: "Conclusion : le chemin le plus rapide et le plus sûr vers un résultat de recherche propre", toc: "Conclusion" },
    { t: "p", text: "Supprimer soi-même sa fiche d'établissement Google échoue presque toujours face au système de Google lui-même — « définitivement fermé » ne résout pas le problème. Le seul chemin fiable est la suppression complète et légale de l'intégralité du profil avec tous ses avis. Rapide, définitif, prévisible — et sans risque financier puisque vous ne payez qu'après résultat." },

    { t: "cta", title: "Vérifiez gratuitement dès maintenant si votre fiche peut être supprimée", text: "En quelques secondes, vous voyez votre vraie fiche et savez si nous pouvons la retirer, et dans quel délai. Pas d'avance, pas d'engagement.", btn: "Lancer le diagnostic gratuit", href: "/fr/?start=1", trust: ["Zéro risque", "Paiement uniquement après suppression confirmée"] },
  ],
  faq: [
    { q: "Puis-je supprimer moi-même ma fiche d'établissement Google ?", a: "Seulement de façon très limitée. Google ne propose pas de bouton simple « Supprimer ce profil ». Vous pouvez revendiquer la propriété et marquer la fiche comme « définitivement fermée » — mais la fiche et tous les avis resteront visibles publiquement." },
    { q: "Quelle est la différence entre « définitivement fermé » et « supprimé » ?", a: "« Définitivement fermé » est uniquement un statut. La fiche reste visible dans la recherche et sur Maps, avec le nom, l'adresse et tous les avis. Une vraie suppression retire la fiche et tous les avis de façon complète." },
    { q: "Est-il légal de faire supprimer une fiche d'établissement Google ?", a: "Oui. La suppression s'effectue via les procédures officielles prévues par Google et a été validée juridiquement. Votre compte Google, Gmail et vos éventuels comptes Ads restent entièrement intacts." },
    { q: "Tous les avis seront-ils bien supprimés ?", a: "Oui. En supprimant l'intégralité de la fiche d'établissement, tous les avis associés disparaissent en même temps — y compris les faux avis et les avis vengeurs." },
    { q: "Combien de temps dure la suppression ?", a: "En général, la fiche est retirée en environ 24 heures. Vous pouvez suivre l'avancement à tout moment dans l'espace client." },
    { q: "La suppression affecte-t-elle mon SEO, mon site web ou Google Ads ?", a: "Non. Seule la fiche d'établissement (Google Maps / Profil d'établissement Google) est supprimée. Votre site, votre positionnement et vos campagnes restent inchangés." },
    { q: "Quel est le coût de la suppression d'une fiche d'établissement Google ?", a: "Chez RapidRemove, un forfait transparent s'applique à partir de 450 € — et vous ne payez qu'après suppression confirmée (No Cure, No Pay)." },
    { q: "La fiche peut-elle réapparaître ensuite ?", a: "Des tiers peuvent théoriquement créer une nouvelle fiche. Avec notre option de protection, nous surveillons votre fiche et retirons gratuitement tout profil réapparu pendant la période couverte." },
  ],
};
export default article;
