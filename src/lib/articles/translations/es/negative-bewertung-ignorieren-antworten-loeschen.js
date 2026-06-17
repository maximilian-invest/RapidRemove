/* ES — negative-bewertung-ignorieren-antworten-loeschen (Ignorar, responder o eliminar) */
const article = {
  category: "Reputación",
  meta: {
    slug: "resena-negativa-ignorar-responder-eliminar",
    title: "Reseña negativa: ¿ignorar, responder o eliminar?",
    h1: "Reseña negativa en Google: ¿ignorar, responder o eliminar?",
    description:
      "Ante una reseña negativa en Google: ¿ignorar, responder o solicitar su eliminación? Una guía de decisión clara según el tipo de reseña, con los pasos a seguir.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Experto en Google",
    date: "2026-06-09",
  },
  dek: "La respuesta correcta depende de **una** pregunta: ¿la reseña está justificada o no? La crítica real y fundada se responde con serenidad. Las reseñas injustificadas, falsas o ilegales se solicita que sean eliminadas. Y algunas reseñas se ignoran deliberadamente. Esta guía asigna claramente los tres caminos para que no reacciones por impulso.",
  blocks: [
    { t: "h2", id: "kurz", text: "Lo más importante en resumen", toc: "En resumen" },
    { t: "ul", items: [
      "**Ignorar:** ante crítica aislada e inofensiva que queda diluida en una buena media general.",
      "**Responder:** ante crítica real y fundada — la respuesta es para los *otros lectores*, no para el autor.",
      "**Solicitar eliminación:** ante reseñas falsas, insultos, afirmaciones falsas o sin contacto comercial real — aquí suele existir un derecho.",
      "**Nunca:** discutir en caliente, amenazar o exponer públicamente a clientes — eso desencadena el efecto Streisand.",
    ] },

    { t: "h2", id: "grundfrage", text: "La pregunta clave: ¿justificada o no?", toc: "¿Justificada?" },
    { t: "p", text: "Antes de reaccionar, aclara una cosa: ¿describe la reseña una **experiencia real** o no? Todo depende de esa línea. Una opinión honesta, aunque dura, sobre una visita real está amparada por la libertad de expresión y difícilmente puede eliminarse. Una reseña sin base real (falsa, de un competidor, por confusión, puro ataque) es, en cambio, frecuentemente impugnable." },

    { t: "h2", id: "ignorieren", text: "Camino 1: Ignorar — cuándo no hacer nada es lo correcto", toc: "1 · Ignorar" },
    { t: "p", text: "No toda voz crítica necesita una reacción. Si tienes una media sólida por encima de 4,0 y hay una reseña individual de 3 o 4 estrellas, fundada y puntual, el daño es mínimo — de hecho hace el conjunto más creíble. Quien reacciona a *cada* pequeñez parece fácilmente susceptible." },
    { t: "p", text: "**Ignorar es lo correcto cuando:** la reseña es aislada, fundada y pasa desapercibida en una buena media." },

    { t: "h2", id: "antworten", text: "Camino 2: Responder — con serenidad, para los lectores", toc: "2 · Responder" },
    { t: "p", text: "Una reseña real y crítica es un escenario — no para discutir con el autor, sino para mostrar a **los demás lectores** cómo gestionas la crítica. Una buena respuesta es breve, cordial, orientada a la solución y sin necesidad de justificarse." },
    { t: "p", text: "Reglas básicas: responder con prontitud, agradecer el feedback, tomar en serio el problema, ofrecer una solución o una conversación — y nunca revelar datos del cliente o información interna en público. Lo que hay que evitar aquí es el **efecto Streisand**: quien responde de forma agresiva o amenaza provoca a menudo una oleada de nuevas reseñas negativas." },
    { t: "p", text: "**Responder es lo correcto cuando:** la crítica es real y fundada, y una reacción serena mejora la imagen." },

    { t: "h2", id: "loeschen", text: "Camino 3: Solicitar eliminación — cuándo existe un derecho", toc: "3 · Eliminar" },
    { t: "p", text: "Ante reseñas **injustificadas**, la eliminación es el mejor camino. Las posibilidades son buenas, entre otros casos, en:" },
    { t: "ul", items: [
      "**Reseñas falsas** sin contacto comercial real (p. ej., de competidores),",
      "**Insultos, críticas difamatorias, afirmaciones de hechos falsos,**",
      "**Reseñas de 1 estrella sin texto** sin relación reconocible,",
      "**Entradas irrelevantes o confundidas**.",
    ] },
    { t: "p", text: "Que lo decisivo sea la existencia de un **contacto comercial real** es jurisprudencia consolidada — el Tribunal Regional de Lübeck (ref. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) y el Tribunal Federal de Justicia de Alemania (ref. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) lo han confirmado, como ejemplo de jurisprudencia europea en este ámbito, coherente con el marco del RGPD y la protección de datos de la UE." },
    { t: "p", text: "Para la ejecución hay dos vías, que comparamos en detalle: la **denuncia / vía legal** para la reseña individual y la **eliminación técnica del perfil** cuando el perfil está dañado en su conjunto. La comparativa directa está en [¿Abogado o eliminación técnica?](/es/revista/eliminar-resena-negativa-de-google-abogado/), y los métodos y costes en [Eliminar reseñas de Google](/es/revista/eliminar-resenas-de-google/)." },
    { t: "p", text: "**Solicitar eliminación es lo correcto cuando:** la reseña es injustificada, falsa o ilegal — o el perfil en su conjunto ya no tiene solución." },

    { t: "h2", id: "schnell", text: "Decisión rápida", toc: "Decisión" },
    { t: "table", head: ["Situación", "Recomendación"], rows: [
      ["Crítica aislada y fundada, buena media", "Ignorar"],
      ["Experiencia negativa real, resoluble", "Responder"],
      ["Falsa / competidor / sin contacto real", "Solicitar eliminación"],
      ["Insulto, hechos falsos, difamación", "Solicitar eliminación"],
      ["Muchas reseñas negativas, media hundida", "Considerar eliminación del perfil"],
    ] },

    { t: "cta", title: "¿No estás seguro de si tu reseña puede eliminarse?", text: "Introduce el nombre de tu empresa — comprobamos en segundos, de forma gratuita, si la reseña o el perfil pueden eliminarse y con qué rapidez.", btn: "Análisis gratuito", href: "https://www.rapid-remove.com/", trust: ["Análisis gratuito", "Con garantía", "Sin riesgo"] },

    { t: "p", text: "Este artículo es una orientación práctica y no constituye asesoramiento jurídico." },
  ],
  faq: [
    { q: "¿Debo responder a cada reseña negativa?", a: "No. A la crítica real y fundada le conviene una respuesta serena (para los lectores). Las voces aisladas e inofensivas con buena media se pueden ignorar; las injustificadas o ilegales es mejor solicitar que se eliminen." },
    { q: "¿Cuándo puede eliminarse una reseña de Google?", a: "Cuando incumple las políticas de Google o es ilegal — por ejemplo, reseñas falsas, insultos, afirmaciones falsas o ausencia de contacto comercial. Las opiniones puramente fundadas sobre experiencias reales difícilmente pueden eliminarse." },
    { q: "¿Qué es el efecto Streisand?", a: "Cuando una reacción agresiva o una amenaza legal provoca al autor y desencadena más reseñas negativas. Por eso no se responde nunca en caliente — y para la eliminación se eligen vías discretas y técnicas." },
    { q: "¿Qué pasa si ya hay muchas reseñas negativas?", a: "En ese caso, luchar reseña a reseña suele ser infructuoso. Puede ser más sensato optar por la eliminación completa del perfil con un nuevo comienzo limpio." },
  ],
  related: [
    { label: "¿Cuánto cuesta realmente una reseña negativa en Google?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "¿Abogado o eliminación técnica?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Eliminar reseñas de Google: costes y métodos", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
