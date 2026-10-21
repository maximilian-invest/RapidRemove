/* FR hub: "Supprimer sa fiche d'établissement Google" (lead article, MagArticle format)

   SEO-Ausbau 21.10.2026 nach EN-Muster (en-hub-delete-google-business-profile.js):
   Kurzantwort, Googles offizielle Schritte (FR-Menübezeichnungen), Vergleichstabelle,
   eigene Abschnitte je Suchintention (que se passe-t-il / repartir de zéro / Google Maps /
   pas d'option de suppression) + erweiterte FAQ. Keywords: supprimer fiche google my
   business, supprimer fiche d'établissement google, supprimer son entreprise de google
   maps, supprimer compte google business, comment supprimer une fiche google.
   KERNBOTSCHAFT UNVERÄNDERT: „définitivement fermé" bzw. „Supprimer la fiche
   d'établissement" (aus dem Konto) ist kein Löschen — Fiche und alle Avis bleiben
   öffentlich; die vollständige Entfernung läuft über Googles offizielle Prozesse. */
const article = {
  meta: {
    slug: "supprimer-profil-etablissement-google",
    title: "Supprimer une fiche Google My Business : 4 options (2026)",
    h1: "Comment supprimer une fiche d'établissement Google (définitivement)",
    description: "Les étapes de Google ne retirent que votre accès : la fiche et tous les avis restent sur Maps. Ce que font les 4 options, et comment la supprimer vraiment.",
    author: "Maximilian Hölzl",
    authorRole: "Expert Google et fondateur",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "supprimer fiche google my business",
      "supprimer fiche d'établissement google",
      "comment supprimer une fiche google",
      "supprimer son entreprise de google maps",
      "supprimer compte google business",
      "supprimer profil d'établissement google",
      "supprimer google my business définitivement",
      "supprimer un établissement sur google maps",
    ],
  },
  category: "Règles Google",
  iconKey: "trash",
  readingMin: 14,
  dek: "« Définitivement fermé » n'est pas une suppression — et retirer la fiche de votre compte non plus : le nom, l'adresse et tous les avis restent visibles sur Google. Ce guide montre les options officielles de Google, ce que chacune fait réellement, et ce qui fonctionne pour supprimer une fiche d'établissement Google complètement.",
  blocks: [
    { t: "lead", text: "Vous voulez **supprimer votre fiche Google My Business** — aujourd'hui « fiche d'établissement Google » ou « Profil d'établissement Google » ? Les étapes proposées par Google ne font que **retirer votre accès** : la fiche publique et **tous les avis restent visibles** dans la recherche Google et sur Google Maps. Ce guide explique comment supprimer une fiche Google pas à pas, ce que chaque option produit vraiment, et comment obtenir une suppression complète." },

    { t: "tip", title: "En bref", text: "Il n'existe pas de bouton pour supprimer purement et simplement une fiche d'établissement Google. En tant que propriétaire, Google vous permet seulement de **retirer la fiche de votre compte** (Paramètres de la fiche d'établissement → Supprimer la fiche d'établissement) ou de **marquer l'établissement comme définitivement fermé**. Dans les deux cas, la fiche publique et **tous les avis restent dans la recherche Google et sur Google Maps**. Une suppression complète de la fiche — avis compris — passe uniquement par les procédures prévues par Google. C'est exactement ce dont RapidRemove se charge, pour le compte du propriétaire, avec paiement uniquement après suppression." },

    { t: "note", title: "À noter", text: "Ce guide est un aperçu pratique et ne constitue pas un conseil juridique. Pour un avis contraignant sur votre situation, adressez-vous à un professionnel qualifié." },

    { t: "h2", id: "why", text: "Pourquoi il n'y a pas de bouton « supprimer » simple", toc: "Pas de bouton supprimer" },
    { t: "p", text: "Cherchez comment supprimer une fiche d'établissement Google et vous vous heurtez vite à un mur. Vous pouvez marquer l'établissement comme **« définitivement fermé »** ou retirer la fiche de votre propre compte — mais un bouton clair **« supprimer cette fiche et tous ses avis »** n'existe pas pour les propriétaires. Ce n'est pas un oubli : Google distingue strictement votre compte Google personnel de la fiche publique, et considère la fiche et ses avis comme des informations utiles aux internautes. La fiche décrit un lieu réel — aux yeux de Google, elle ne vous appartient donc pas, même si vous la gérez." },
    { t: "warn", title: "« Définitivement fermé » ≠ supprimé", text: "Marquer votre établissement comme fermé ne le supprime **pas**. La fiche, le nom, l'adresse, les photos et **la totalité des avis restent visibles publiquement** dans la recherche Google et sur Google Maps — avec en plus un bandeau « Définitivement fermé ». Aux yeux de vos clients potentiels, cela donne souvent une impression *pire* qu'avant." },

    { t: "h2", id: "official-steps", text: "Comment supprimer une fiche Google My Business : les étapes officielles de Google", toc: "Étapes officielles" },
    { t: "p", text: "Dans le vocabulaire de Google, l'option réservée au propriétaire s'appelle **« Supprimer la fiche d'établissement »**. Elle existe — mais elle retire la fiche de *votre compte*, pas de Google. Voici comment elle fonctionne, pour que vous sachiez exactement ce que vous faites (et ce que vous ne faites pas)." },
    { t: "h3", text: "Sur ordinateur (recherche Google)" },
    { t: "ol", items: [
      "Connectez-vous avec le compte Google propriétaire de la fiche et recherchez le nom de votre établissement (ou « mon entreprise »).",
      "Dans votre fiche d'établissement, ouvrez **Plus** (⋮) → **Paramètres de la fiche d'établissement**.",
      "Sélectionnez **Supprimer la fiche d'établissement** → **Supprimer les administrateurs et le contenu de la fiche**.",
      "Facultatif : activez **Marquer votre établissement comme définitivement fermé**.",
      "Confirmez avec **Continuer** → **Supprimer** → **OK**.",
    ] },
    { t: "h3", text: "Dans l'application Google Maps" },
    { t: "p", text: "Ouvrez l'application Google Maps avec le compte propriétaire, accédez à votre fiche d'établissement et choisissez **Plus** → **Paramètres de la fiche d'établissement** → **Supprimer la fiche d'établissement**. Les étapes et le résultat sont les mêmes que sur ordinateur." },
    { t: "h3", text: "Plusieurs fiches à la fois" },
    { t: "p", text: "Si vous gérez plusieurs établissements, ouvrez le **gestionnaire de fiches d'établissement**, cochez les fiches concernées, puis choisissez **Actions** → **Supprimer les établissements** → **Supprimer**. Si un message d'erreur apparaît, Google recommande de supprimer le contenu et les gestionnaires fiche par fiche. Les libellés peuvent légèrement varier selon la version de l'interface." },
    { t: "warn", title: "Ce que Google dit lui-même de la suite", text: "D'après les pages d'aide de Google, **les avis des clients restent visibles** et l'établissement **peut continuer à apparaître dans la recherche et sur Maps**. Seul *votre* contenu est supprimé, définitivement : posts, photos et vidéos que vous avez publiés, et vos réponses aux avis. Seul le **propriétaire principal** peut effectuer cette opération, et les nouveaux propriétaires et gestionnaires doivent attendre **7 jours**. Pour gérer à nouveau l'établissement, il faut faire revalider la fiche. En résumé : l'option officielle met fin à *votre* gestion de la fiche — elle ne supprime pas la fiche." },

    { t: "h2", id: "options", text: "Supprimer, fermer, retirer ou signaler : ce que fait vraiment chaque option", toc: "Les options comparées" },
    { t: "p", text: "On cherche « supprimer compte Google Business », « fermer sa fiche Google », « supprimer son entreprise de Google Maps » ou « retirer une fiche Google » — mais du côté de Google, ce sont des actions très différentes. Voici l'effet de chacune sur la fiche publique et sur ses avis :" },
    { t: "table", head: ["Option", "Effet", "Fiche visible ?", "Avis visibles ?"], rows: [
      ["Supprimer la fiche d'établissement (de votre compte)", "Vous perdez l'accès ; vos posts, photos et réponses sont effacés", "Oui, désormais sans gestionnaire", "Oui"],
      ["Marquer comme définitivement fermé", "Statut affiché sur la fiche", "Oui, avec le bandeau « Définitivement fermé »", "Oui"],
      ["Retirer des gestionnaires / quitter la fiche", "Les personnes concernées n'ont plus accès", "Oui, inchangée", "Oui"],
      ["Supprimer votre compte Google", "Votre compte disparaît, la fiche devient non revendiquée", "Oui", "Oui"],
      ["Suggérer « Fermer ou supprimer » sur Maps (tout le monde)", "Google décide seul — souvent refusé", "Le plus souvent oui", "Oui, sauf suppression"],
      ["Suppression complète (RapidRemove)", "Via les procédures prévues par Google, pour le compte du propriétaire", "Non, retirée de la recherche et de Maps", "Non, tous supprimés avec la fiche"],
    ] },
    { t: "p", text: "Autre source de confusion : **Google My Business** est simplement l'ancien nom de la **fiche d'établissement Google** (Profil d'établissement Google). Que vous parliez de compte Google Business, de page, de fiche ou de profil — c'est la même entrée, et les mêmes règles s'appliquent." },

    { t: "h2", id: "what-happens", text: "Que se passe-t-il si vous supprimez votre fiche Google Business ?", toc: "Après la suppression" },
    { t: "p", text: "Beaucoup de propriétaires s'attendent à ce que la fiche disparaisse dès qu'ils l'ont retirée de leur compte. Voici ce qui se passe réellement :" },
    { t: "ul", items: [
      "**Votre accès prend fin :** vous et tous les gestionnaires perdez le contrôle de la fiche. Pour la gérer à nouveau, il faut la revendiquer et la faire valider depuis le début.",
      "**Votre contenu disparaît :** posts, photos publiées et réponses aux avis sont supprimés définitivement et ne peuvent pas être restaurés.",
      "**La fiche reste :** nom, adresse, catégorie et horaires restent en général visibles dans la recherche Google et sur Google Maps.",
      "**Les avis restent :** chaque avis client — y compris les faux avis ou les avis injustes — reste public, désormais **sans vos réponses** à côté.",
      "**Tout le monde peut la modifier :** une fiche sans gestionnaire peut être modifiée par les utilisateurs et par Google lui-même, sans que vous en soyez averti.",
    ] },
    { t: "p", text: "C'est pourquoi retirer la fiche de votre compte aggrave souvent la situation : les avis négatifs sont toujours là, mais votre version des faits a disparu." },

    { t: "h2", id: "start-over", text: "Peut-on supprimer sa fiche Google et repartir de zéro ?", toc: "Repartir de zéro" },
    { t: "p", text: "Pas en créant simplement une nouvelle fiche. Si l'ancienne existe encore — et après « Supprimer la fiche d'établissement », elle existe toujours — Google voit **une deuxième fiche pour le même établissement à la même adresse**. Ce doublon est en général **fusionné avec l'ancienne fiche, avis compris**, ou la nouvelle fiche est suspendue. Dans les deux cas, les anciens avis vous rattrapent." },
    { t: "p", text: "Un vrai nouveau départ se fait en deux temps : d'abord, l'**ancienne fiche est entièrement supprimée**, avec tous ses avis ; ensuite, si vous le souhaitez, vous créez et faites valider une **nouvelle fiche propre**. RapidRemove se charge de la première étape — paiement uniquement après suppression — et votre site web comme votre référencement naturel restent intacts." },

    { t: "h2", id: "google-maps", text: "Comment supprimer son entreprise de Google Maps", toc: "Supprimer de Google Maps" },
    { t: "p", text: "Sur Google Maps, n'importe qui — propriétaire ou non — peut demander à Google de fermer ou de supprimer un lieu :" },
    { t: "ol", items: [
      "Ouvrez le lieu dans Google Maps ou dans la recherche Google.",
      "Choisissez **Suggérer une modification** → **Fermer ou supprimer**.",
      "Indiquez un motif, par exemple : définitivement fermé, n'existe pas, doublon ou spam.",
      "Cliquez sur **Envoyer** — Google examine la suggestion et décide seul.",
    ] },
    { t: "p", text: "Pour un établissement réel et existant, ces suggestions sont le plus souvent refusées ou transformées en bandeau « Définitivement fermé » — la fiche et ses avis restent. Plus de détails sur les fiches propres, tierces et en double : [supprimer une fiche Google Maps](/fr/magazine/supprimer-fiche-google-maps/) et [supprimer son entreprise de Google](/fr/magazine/supprimer-entreprise-de-google/)." },

    { t: "h2", id: "no-delete-option", text: "Pourquoi vous ne voyez pas d'option de suppression", toc: "Pas d'option visible ?" },
    { t: "p", text: "Si « Supprimer la fiche d'établissement » n'apparaît pas dans vos paramètres, c'est presque toujours pour l'une de ces raisons :" },
    { t: "ul", items: [
      "**Vous êtes gestionnaire, pas propriétaire principal.** Seul le propriétaire principal peut supprimer le contenu et les gestionnaires de la fiche.",
      "**Vous êtes propriétaire depuis peu.** Les nouveaux propriétaires doivent attendre 7 jours avant que l'option soit disponible.",
      "**La fiche n'est pas validée ou revendiquée par vous.** Elle n'appartient alors à personne — ou à un autre compte Google.",
      "**Vous êtes connecté avec le mauvais compte Google.** Beaucoup d'entreprises en ont plusieurs ; vérifiez lequel est propriétaire de la fiche.",
    ] },
    { t: "p", text: "Et même si vous trouvez le bouton, gardez le résultat en tête : il retire la fiche de votre compte, pas de Google." },

    { t: "h2", id: "how", text: "Comment fonctionne une suppression complète de la fiche", toc: "La suppression complète" },
    { t: "p", text: "Le seul moyen fiable de faire disparaître une fiche et ses avis est la **suppression complète de la fiche d'établissement** via les procédures prévues par Google — et non la suppression des avis un par un. Lorsque la fiche entière est retirée, **tous les avis disparaissent avec elle**, faux avis compris. C'est la différence entre traiter les symptômes et supprimer la cause." },
    { t: "p", text: "C'est exactement ce que fait RapidRemove, pour le compte du propriétaire. Le déroulé :" },
    { t: "ol", items: [
      "**Diagnostic gratuit :** entrez le nom de votre entreprise. Nous retrouvons votre fiche et vérifions immédiatement si la suppression est possible — sans engagement et sans frais.",
      "**Confirmation et autorisation :** vous confirmez que c'est bien la bonne fiche et donnez votre accord pour le traitement. Aucun accès à Gmail, Ads ou données personnelles requis.",
      "**Suppression en 24 à 48 heures :** notre équipe fait retirer la fiche et tous les avis associés — définitivement. Le paiement intervient uniquement après.",
    ] },
    { t: "ul", items: [
      "**Rapide :** suppression de la fiche en général en 24 à 48 heures, au lieu de plusieurs mois",
      "**Complet :** la fiche entière, **tous** les avis compris, en une seule fois",
      "**Prévisible :** un forfait transparent, payable **uniquement après suppression** — pas d'honoraires horaires ouverts",
      "**Sans impact SEO :** votre site web et votre positionnement restent intacts ; une nouvelle fiche propre est possible ensuite",
      "**Discret :** aucun échange avec les auteurs des avis, pas de risque d'[effet Streisand](/fr/magazine/supprimer-avis-negatif-google-avocat-ou-technique/)",
    ] },

    { t: "cta", title: "Préférez vérifier directement si votre fiche peut être supprimée ?", text: "Entrez le nom de votre entreprise — nous retrouvons votre vraie fiche Google et vérifions en quelques secondes si elle peut être supprimée, et dans quel délai. Sans engagement et sans frais.", btn: "Lancer le diagnostic gratuit", href: "/fr/?start=1", trust: ["Paiement uniquement après suppression"] },

    { t: "h2", id: "einzeln", text: "Supprimer des avis individuels ou retirer toute la fiche ?", toc: "Avis isolés ou fiche ?" },
    { t: "p", text: "Beaucoup commencent par essayer de [signaler](/fr/magazine/supprimer-faux-avis-google/) les mauvais avis un par un auprès de Google. C'est fastidieux et aléatoire : Google rejette fréquemment ces signalements, chaque avis doit être justifié séparément — et pour chaque avis retiré, de nouveaux peuvent apparaître rapidement. Vous combattez des symptômes." },
    { t: "p", text: "L'approche durable s'attaque à la racine : **en supprimant toute la fiche, tous les avis disparaissent en même temps** — faux avis inclus. C'est pour cela que la suppression de fiche ne traite pas les avis un par un, mais retire le profil dans son intégralité. Si votre fiche est saine dans l'ensemble et que seuls un ou deux avis posent problème, RapidRemove propose aussi la [suppression d'avis isolés](/fr/supprimer-un-avis/) : vous choisissez les avis, 99 € par avis réellement supprimé (avis avec texte de 4 semaines maximum, 250 € pour tous les autres), rien d'avance ([prix et déroulé en détail](/fr/magazine/service-suppression-avis-google/)). Ceux qui veulent comparer toutes les méthodes trouveront [ici les options et leurs coûts](/fr/magazine/supprimer-avis-google/)." },
    { t: "tip", title: "L'avantage décisif", text: "Une fiche supprimée ne peut plus afficher d'anciens avis *ni* en accumuler de nouveaux. Le problème n'est pas déplacé — il est éliminé." },

    { t: "h2", id: "kosten", text: "Combien de temps faut-il — et quel est le coût ?", toc: "Délai et coût" },
    { t: "p", text: "Une suppression professionnelle est en général finalisée **en 24 à 48 heures** — contre des mois si vous passez par un avocat. Sur le plan tarifaire : un avocat facture à l'heure (souvent 300 € ou plus) sans certitude de résultat. RapidRemove travaille avec un **forfait transparent à partir de 450 €** — et vous payez **exclusivement après suppression effective**." },
    { t: "table", rrCol: 3, head: ["Critère", "En autonomie (DIY)", "Avocat", "RapidRemove"], rows: [
      ["Suppression complète possible ?", "Pratiquement non", "Incertain", "Oui"],
      ["Délai", "—", "3 à 9 mois", "24 à 48 heures"],
      ["Coût", "—", "300 €+ / heure", "Forfait fixe à partir de 450 €"],
      ["Tous les avis supprimés", "Non", "Un par un, laborieux", "Tous d'un coup"],
      ["Paiement", "—", "À l'heure, quel que soit le résultat", "Uniquement après suppression"],
      ["Votre temps et énergie", "Élevés", "Élevés", "Pratiquement nuls"],
    ] },
    { t: "p", text: "Le tarif vous paraît élevé ? Faites le calcul : un seul faux avis visible peut faire chuter votre taux de clic et vous coûter bien plus sur plusieurs mois." },

    { t: "h2", id: "legal", text: "Est-ce légal de faire supprimer sa fiche ?", toc: "Est-ce légal ?" },
    { t: "p", text: "Une suppression professionnelle passe exclusivement par les **procédures prévues par Google, pour le compte du propriétaire**. Votre compte Google, Gmail et vos éventuels comptes Google Ads restent entièrement intacts — tout comme votre site web, votre référencement naturel et vos campagnes publicitaires." },
    { t: "p", text: "Pour reconnaître un prestataire sérieux : il indique une entreprise réelle avec une adresse et un numéro d'immatriculation, il est transparent sur sa méthode et **ne facture qu'après résultat** — il ne promet pas des « accès secrets à Google » vagues et invérifiables." },

    { t: "h2", id: "herkunft", text: "Qui a créé cette fiche, au juste ?", toc: "Qui a créé la fiche ?" },
    { t: "p", text: "La plupart des entrepreneurs qui nous contactent n'ont jamais créé leur fiche eux-mêmes — et sont sincèrement surpris qu'elle existe. Ce n'est pas l'exception, c'est la règle. Une fiche d'établissement Google est rarement créée activement par le propriétaire. Bien plus souvent, quelqu'un d'autre l'ajoute, ou Google la génère de façon entièrement automatique. Pour comprendre pourquoi une telle fiche est si difficile à supprimer ensuite, il faut savoir comment elle est apparue. Il existe essentiellement trois voies." },
    { t: "anim", caption: "Trois façons dont un profil d'établissement voit le jour — le plus souvent sans la moindre action du propriétaire." },

    { t: "h3", text: "Voie 1 : quelqu'un ajoute le lieu à la main" },
    { t: "p", text: "N'importe quel utilisateur de Google peut, dans l'application Maps, toucher une adresse ou un emplacement vide et choisir « Ajouter un lieu manquant ». Cela permet d'inscrire un établissement sans avoir le moindre lien avec lui — des clients, d'anciens employés, des concurrents ou des utilisateurs très actifs de Maps (les Local Guides)." },
    { t: "p", text: "Ce n'est toutefois pas sans contrôle. Avant qu'un lieu signalé ne soit publié, une vérification automatique s'exécute en arrière-plan :" },
    { t: "ul", items: [
      "**Localisation :** l'utilisateur se trouve-t-il réellement à proximité du lieu qu'il veut ajouter ? Cela empêche quelqu'un à Berlin d'inventer un café à Munich pour s'amuser.",
      "**Contrôle des doublons :** existe-t-il déjà un nom similaire ou la même catégorie à cette coordonnée ou juste à côté ?",
      "**Recoupement avec le web :** Google recherche le nom en parallèle pour voir si l'établissement apparaît quelque part en ligne.",
    ] },
    { t: "p", text: "Si l'ensemble est cohérent, le point est publié — visible par tous en tant que **fiche non revendiquée**." },

    { t: "h3", text: "Voie 2 : Google crée la fiche lui-même à partir de données du web" },
    { t: "p", text: "C'est la voie à laquelle on pense le moins : Google crée des fiches en grand nombre, de son propre chef — sans l'intervention ni le consentement du propriétaire. La raison est simple : Google veut cartographier le monde réel le plus complètement possible et n'attend pas qu'un nouvel établissement se manifeste." },
    { t: "p", text: "Pour cela, les robots de Google parcourent en continu le web à la recherche des **données NAP** — nom, adresse, téléphone (*Name, Address, Phone*). À partir de ces fragments, le système assemble une fiche, déclenchée par exemple par :" },
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
    { t: "p", text: "C'est ainsi qu'une fiche peut apparaître peu après l'immatriculation de votre entreprise — sans que vous soyez jamais allé chez Google vous-même." },
    { t: "p", text: "**Pourquoi c'est important :** peu importe comment la fiche est née, la conséquence est la même : dès qu'elle existe, elle collecte des avis et apparaît dans la recherche et sur Maps. Vous n'avez donc ni eu à la créer ni à la gérer pour être concerné — et c'est précisément pourquoi l'ignorer ne suffit pas. Il faut tout de même la supprimer activement." },

    { t: "h2", id: "fazit", text: "Conclusion : supprimer sa fiche d'établissement Google pour de bon", toc: "Conclusion" },
    { t: "p", text: "Supprimer soi-même sa fiche Google My Business se heurte presque toujours au système de Google : « Supprimer la fiche d'établissement » ne retire que votre accès, et « définitivement fermé » n'est qu'un bandeau. Le seul chemin fiable est la suppression complète de la fiche avec tous ses avis, via les procédures prévues par Google. Rapide, définitif, prévisible — et sans risque financier, puisque vous ne payez qu'après suppression." },

    { t: "cta", title: "Vérifiez gratuitement dès maintenant si votre fiche peut être supprimée", text: "En quelques secondes, vous voyez votre vraie fiche et savez si nous pouvons la faire retirer, et dans quel délai. Pas de paiement d'avance, pas d'engagement.", btn: "Lancer le diagnostic gratuit", href: "/fr/?start=1", trust: ["Diagnostic gratuit", "Paiement uniquement après suppression"] },
  ],
  faq: [
    { q: "Puis-je supprimer moi-même ma fiche d'établissement Google ?", a: "Seulement de façon très limitée. Vous pouvez marquer la fiche comme « définitivement fermée » ou la retirer de votre compte, mais aucune de ces options ne supprime la fiche publique : elle reste visible dans la recherche et sur Maps, avec tous ses avis. Une suppression complète passe par les procédures prévues par Google." },
    { q: "Comment supprimer une fiche Google My Business définitivement ?", a: "Dans votre fiche, allez dans Plus → Paramètres de la fiche d'établissement → Supprimer la fiche d'établissement → Supprimer les administrateurs et le contenu de la fiche. Cela met fin à votre gestion et efface vos posts, photos et réponses aux avis — mais la fiche publique et ses avis restent en général sur Google. Pour supprimer la fiche elle-même, elle doit être retirée via les procédures prévues par Google." },
    { q: "Comment supprimer une fiche Google sur Google Maps ?", a: "Dans l'application Google Maps, connectez-vous avec le compte propriétaire, ouvrez votre fiche et choisissez Plus → Paramètres de la fiche d'établissement → Supprimer la fiche d'établissement. Le résultat est le même que sur ordinateur : votre accès est retiré, la fiche et les avis restent." },
    { q: "Comment supprimer son entreprise de Google Maps ?", a: "N'importe qui peut choisir « Suggérer une modification » → « Fermer ou supprimer » sur le lieu dans Google Maps. Google décide seul et, pour un établissement réel, conserve le plus souvent la fiche ou la marque seulement comme fermée. Une suppression complète de la fiche et de ses avis passe par les procédures prévues par Google." },
    { q: "Comment supprimer mon compte Google Business ?", a: "Il n'existe pas de « compte Google Business » séparé : il s'agit de votre fiche d'établissement, gérée depuis votre compte Google. Vous pouvez la retirer de votre compte via « Supprimer la fiche d'établissement », ou supprimer votre compte Google entier — dans les deux cas, la fiche publique et ses avis restent en ligne, simplement sans gestionnaire." },
    { q: "Quelle est la différence entre « définitivement fermé » et « supprimé » ?", a: "« Définitivement fermé » est uniquement un statut. La fiche reste visible dans la recherche et sur Maps, avec le nom, l'adresse et tous les avis, plus un bandeau « Définitivement fermé ». Une vraie suppression retire la fiche et tous les avis de façon complète." },
    { q: "Que se passe-t-il si je supprime ma fiche d'établissement Google ?", a: "Vous perdez l'accès, et vos posts, photos et réponses aux avis sont supprimés. La fiche elle-même, ses avis et ses informations restent en général visibles dans la recherche Google et sur Maps — et n'importe qui peut désormais y suggérer des modifications." },
    { q: "Puis-je supprimer ma fiche Google et en créer une nouvelle ?", a: "Seulement si l'ancienne fiche est d'abord supprimée complètement. Une nouvelle fiche pour le même établissement à la même adresse est traitée comme un doublon : elle est en général fusionnée avec l'ancienne — avis compris — ou suspendue." },
    { q: "Pourquoi je ne vois pas l'option « Supprimer la fiche d'établissement » ?", a: "Le plus souvent parce que vous êtes gestionnaire et non propriétaire principal, que vous êtes propriétaire depuis moins de 7 jours, que la fiche n'est pas validée sur votre compte, ou que vous êtes connecté avec un autre compte Google." },
    { q: "Google My Business et fiche d'établissement Google, c'est la même chose ?", a: "Oui. Google My Business est l'ancien nom de la fiche d'établissement Google (Profil d'établissement Google). Compte, page, fiche ou profil Google Business désignent la même entrée." },
    { q: "Tous les avis seront-ils bien supprimés ?", a: "Oui. En supprimant l'intégralité de la fiche d'établissement, tous les avis associés disparaissent en même temps — y compris les faux avis et les avis vengeurs." },
    { q: "Est-il légal de faire supprimer une fiche d'établissement Google ?", a: "La suppression s'effectue exclusivement via les procédures prévues par Google, pour le compte du propriétaire. Votre compte Google, Gmail et vos éventuels comptes Ads restent entièrement intacts." },
    { q: "Combien de temps dure la suppression ?", a: "En général, la fiche est retirée en 24 à 48 heures. Vous pouvez suivre l'avancement à tout moment dans l'espace client." },
    { q: "La suppression affecte-t-elle mon SEO, mon site web ou Google Ads ?", a: "Non. Seule la fiche d'établissement (Google Maps / Profil d'établissement Google) est supprimée. Votre site, votre positionnement et vos campagnes restent inchangés. Une nouvelle fiche propre peut être créée ensuite si vous le souhaitez." },
    { q: "Quel est le coût de la suppression d'une fiche d'établissement Google ?", a: "Chez RapidRemove, un forfait transparent s'applique à partir de 450 € — et vous ne payez qu'après suppression confirmée (No Cure, No Pay). Si seuls quelques avis posent problème, la [suppression d'avis isolés](/fr/supprimer-un-avis/) coûte 99 € par avis réellement supprimé (avis avec texte de 4 semaines maximum, 250 € pour tous les autres)." },
    { q: "La fiche peut-elle réapparaître ensuite ?", a: "Des tiers peuvent théoriquement créer une nouvelle fiche. Avec notre option de protection, nous surveillons votre fiche et retirons gratuitement tout profil réapparu pendant la période couverte." },
  ],
};
export default article;
