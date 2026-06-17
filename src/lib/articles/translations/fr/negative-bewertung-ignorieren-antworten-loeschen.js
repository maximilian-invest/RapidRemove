/* FR — negative-bewertung-ignorieren-antworten-loeschen (Ignorer, répondre ou supprimer) */
const article = {
  category: "Réputation",
  meta: {
    slug: "avis-negatif-ignorer-repondre-supprimer",
    title: "Avis négatif Google : ignorer, répondre ou supprimer ?",
    h1: "Avis Google négatif : ignorer, répondre ou supprimer ?",
    description:
      "Face à un avis Google négatif : ignorer, répondre ou demander la suppression ? Un guide de décision clair selon le type d'avis – avec les prochaines étapes concrètes.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Expert Google",
    date: "2026-06-09",
  },
  dek: "La bonne réaction dépend d'**une** seule question : l'avis est-il fondé ou non ? Une critique authentique et factuelle se répond de façon posée. Un avis non fondé, frauduleux ou illicite se fait supprimer. Et certains avis s'ignorent délibérément. Ce guide attribue clairement les trois voies – pour que vous ne réagissiez pas à l'instinct.",
  blocks: [
    { t: "h2", id: "kurz", text: "L'essentiel en bref", toc: "L'essentiel" },
    { t: "ul", items: [
      "**Ignorer :** en cas de critique isolée et anodine qui se noie dans une bonne moyenne globale.",
      "**Répondre :** en cas de critique authentique et factuelle – la réponse s'adresse aux *autres lecteurs*, pas à l'auteur.",
      "**Demander la suppression :** en cas de faux avis, d'insultes, d'affirmations mensongères ou d'absence de contact commercial réel – il existe souvent un droit à la suppression.",
      "**Jamais :** se disputer sous le coup de l'émotion, menacer ou humilier des clients publiquement – cela déclenche l'effet Streisand.",
    ] },

    { t: "h2", id: "grundfrage", text: "La question de base : fondé ou non ?", toc: "Fondé ?" },
    { t: "p", text: "Avant de réagir, clarifiez une chose : l'avis décrit-il une **expérience réelle** – ou non ? Tout se décide à cette ligne de démarcation. Une opinion honnête, même sévère, sur une visite réelle est protégée par la liberté d'expression et pratiquement impossible à supprimer. Un avis sans fondement réel (faux, concurrent, confusion, pure dénigrement) est en revanche souvent attaquable." },

    { t: "h2", id: "ignorieren", text: "Voie 1 : ignorer – quand ne rien faire est la bonne décision", toc: "1 · Ignorer" },
    { t: "p", text: "Toute voix critique ne nécessite pas de réaction. Si vous avez une bonne moyenne au-dessus de 4,0 et qu'un avis factuel isolé de 3 ou 4 étoiles s'y glisse, il nuit à peine – il rend même l'image d'ensemble plus crédible. Réagir à *chaque* petite chose donne rapidement une impression de susceptibilité." },
    { t: "p", text: "**Ignorer est la bonne option si :** l'avis est isolé, factuel et discret dans une bonne moyenne." },

    { t: "h2", id: "antworten", text: "Voie 2 : répondre – avec assurance, pour les lecteurs", toc: "2 · Répondre" },
    { t: "p", text: "Un vrai avis critique est une scène – pas pour un affrontement avec l'auteur, mais pour montrer aux **autres lecteurs** comment vous gérez la critique. Une bonne réponse est concise, aimable, orientée solution et sans besoin de se justifier." },
    { t: "p", text: "Règles pratiques : répondre rapidement, remercier pour le retour, prendre le problème au sérieux, proposer une solution ou une discussion – et ne jamais divulguer des données clients ou des informations internes publiquement. Ce qu'il faut absolument éviter ici, c'est l'**effet Streisand** (du nom de l'affaire de la chanteuse Barbra Streisand, qui, en tentant de supprimer une photo de sa villa, lui a donné une visibilité mondiale) : qui contre-attaque de façon agressive ou menace provoque souvent une vague de nouveaux avis négatifs." },
    { t: "p", text: "**Répondre est la bonne option si :** la critique est authentique et factuelle, et une réaction posée améliore l'image." },

    { t: "h2", id: "loeschen", text: "Voie 3 : demander la suppression – quand un droit existe", toc: "3 · Supprimer" },
    { t: "p", text: "Pour les avis **non fondés**, la suppression est la meilleure voie. Les chances sont bonnes notamment dans les cas suivants :" },
    { t: "ul", items: [
      "**Faux avis** sans contact commercial réel (par exemple de concurrents),",
      "**Insultes, dénigrement, affirmations mensongères,**",
      "**Avis 1 étoile sans texte** sans référence identifiable,",
      "**Entrées hors sujet ou portant sur une confusion** avec une autre entreprise.",
    ] },
    { t: "p", text: "Le fait qu'un **contact commercial réel** soit nécessaire est une jurisprudence établie – le Landgericht de Lübeck (réf. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) et le Bundesgerichtshof (réf. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) l'ont confirmé. Cette jurisprudence allemande s'inscrit dans le cadre du droit européen et est pertinente pour l'application du RGPD (Art. 17) à l'échelle de l'UE." },
    { t: "p", text: "Pour la mise en œuvre, deux voies existent, que nous comparons en détail : **le signalement/la voie juridique** pour l'avis individuel et la **suppression technique du profil** lorsque le profil est globalement compromis. La comparaison directe se trouve sous [Avocat ou suppression technique ?](/fr/magazine/supprimer-avis-negatif-google-avocat-ou-technique/) ; les méthodes et coûts sous [Supprimer un avis Google](/fr/magazine/supprimer-avis-google/)." },
    { t: "p", text: "**Demander la suppression est la bonne option si :** l'avis est non fondé, frauduleux ou illicite – ou si le profil dans son ensemble ne peut plus être sauvé." },

    { t: "h2", id: "schnell", text: "Décision rapide", toc: "Décision" },
    { t: "table", head: ["Situation", "Recommandation"], rows: [
      ["Critique isolée et factuelle, bonne moyenne", "Ignorer"],
      ["Expérience négative réelle, résolvable", "Répondre"],
      ["Faux avis / concurrent / pas de contact réel", "Demander la suppression"],
      ["Insulte, affirmation mensongère, dénigrement", "Demander la suppression"],
      ["Nombreux avis négatifs, moyenne en chute libre", "Envisager la suppression du profil"],
    ] },

    { t: "cta", title: "Vous ne savez pas si votre avis est supprimable ?", text: "Entrez le nom de votre entreprise – nous vérifions en quelques secondes et gratuitement si l'avis ou le profil peut être supprimé.", btn: "Démarrer l'analyse gratuite", href: "https://www.rapid-remove.com/", trust: ["Analyse gratuite", "Avec garantie", "Sans risque"] },

    { t: "p", text: "Cet article est un guide pratique et ne constitue pas un conseil juridique." },
  ],
  faq: [
    { q: "Faut-il répondre à chaque avis négatif ?", a: "Non. Une réponse posée vaut la peine pour une critique authentique et factuelle (pour les lecteurs). Les voix isolées et anodines dans une bonne moyenne peuvent s'ignorer ; les avis non fondés ou illicites méritent plutôt une demande de suppression." },
    { q: "Quand peut-on faire supprimer un avis Google ?", a: "Lorsqu'il enfreint les règles de Google ou est illicite – par exemple des faux avis, des insultes, des affirmations mensongères ou l'absence de contact commercial. Les avis purement factuels sur des expériences réelles sont en revanche pratiquement impossibles à supprimer." },
    { q: "Qu'est-ce que l'effet Streisand ?", a: "Lorsqu'une réaction agressive ou une menace juridique provoque l'auteur et déclenche une vague de nouveaux avis négatifs. C'est pourquoi on ne répond jamais sous le coup de l'émotion – et pour la suppression, on choisit des voies discrètes et techniques." },
    { q: "Que faire si l'on a déjà beaucoup de mauvais avis ?", a: "Dans ce cas, le combat avis par avis est souvent sans issue. La suppression complète du profil suivie d'un redémarrage propre peut être plus judicieuse." },
  ],
  related: [
    { label: "Combien coûte vraiment un mauvais avis Google ?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Avocat ou suppression technique ?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Supprimer un avis Google : coûts et méthodes", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
