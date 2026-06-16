/* ES hub: "Eliminar perfil de empresa de Google" (lead article, MagArticle format) */
const article = {
  meta: {
    slug: "eliminar-perfil-de-empresa-google",
    title: "Eliminar perfil de empresa de Google: guía completa (así funciona de verdad)",
    h1: "Eliminar perfil de empresa de Google: ¿cómo se hace realmente?",
    description: "Google no permite borrar el perfil de empresa con un solo clic. Esta guía explica por qué «cerrado definitivamente» no es lo mismo que eliminado, y cuál es el camino real para desaparecer del mapa.",
    author: "Maximilian Hölzl",
    authorRole: "Experto en Google y fundador",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    keywords: [],
  },
  category: "Política de Google",
  iconKey: "trash",
  readingMin: 11,
  dek: "Google no permite eliminar el perfil de empresa con un solo clic. Esta guía explica por qué «cerrado definitivamente» no es una eliminación, y cuál es el camino que realmente funciona.",
  blocks: [
    { t: "h2", id: "kurz", text: "Lo esencial en pocas palabras", toc: "Lo esencial" },
    { t: "ul", items: [
      "**Eliminarlo usted mismo es casi imposible:** Google no ofrece un botón de «eliminar perfil» real, solo la opción de marcarlo como «cerrado definitivamente».",
      "**«Cerrado» no es lo mismo que eliminado:** la ficha, el nombre, la dirección y **todas las reseñas siguen siendo visibles públicamente.**",
      "**El único camino fiable** es la eliminación completa del perfil a través de los procedimientos oficiales — legal y permanente.",
      "**RapidRemove** elimina el perfil junto con todas las reseñas por lo general en **24–48 horas** — **pago solo tras el éxito**.",
    ] },
    { t: "p", text: "Busca su empresa en Google y aparece un perfil que ya no quiere: lleno de reseñas falsas o de represalia, con datos incorrectos, o simplemente una ficha de la que quiere salir para siempre. La pregunta lógica es: **¿cómo puedo eliminar mi perfil de empresa de Google?** La respuesta honesta es, por desgracia, más complicada de lo que Google le hace creer. Esta guía le explica qué funciona de verdad — paso a paso, sin rodeos." },

    { t: "h2", id: "herkunft", text: "¿Quién creó este perfil, en realidad?", toc: "¿Quién lo creó?" },
    { t: "p", text: "La mayoría de los empresarios que nos contactan nunca crearon su perfil — y se sorprenden sinceramente de que exista. No es la excepción, es la norma. Un perfil de empresa de Google rara vez lo crea activamente el propietario. Mucho más a menudo lo añade otra persona, o lo genera Google de forma totalmente automática. Para entender por qué una ficha así es tan difícil de eliminar después, conviene saber primero cómo llegó hasta allí. En esencia, hay tres vías." },
    { t: "anim", caption: "Tres formas en que nace un perfil de empresa, casi siempre sin que el propietario haga nada." },
    { t: "h3", text: "Vía 1: alguien añade el lugar a mano" },
    { t: "p", text: "Cualquier usuario de Google puede, en la app de Maps, tocar una dirección o un espacio vacío y elegir «Añadir un sitio que falta». Así se puede registrar una empresa sin tener nada que ver con ella — lo hacen clientes, antiguos empleados, competidores o usuarios muy activos de Maps (los Local Guides)." },
    { t: "p", text: "Pero no ocurre del todo sin control. Antes de que un sitio notificado se publique, se ejecuta en segundo plano una comprobación automática:" },
    { t: "ul", items: [
      "**Ubicación:** ¿está el usuario realmente cerca del lugar que quiere añadir? Esto evita que alguien en Berlín se invente, por broma, una cafetería en Múnich.",
      "**Comprobación de duplicados:** ¿ya existe un nombre similar o la misma categoría en esa coordenada o justo al lado?",
      "**Cotejo con la web:** Google busca el nombre en paralelo para ver si la empresa aparece en algún sitio en línea.",
    ] },
    { t: "p", text: "Si el conjunto es coherente, el punto se publica — visible para todos como **perfil no reclamado**." },
    { t: "h3", text: "Vía 2: Google crea el perfil a partir de datos de la web" },
    { t: "p", text: "Es la vía en la que menos se piensa: Google crea perfiles en gran número por iniciativa propia — sin la intervención ni el consentimiento del propietario. El motivo es sencillo: Google quiere reflejar el mundo real de la forma más completa posible y no espera a que una empresa nueva dé el paso." },
    { t: "p", text: "Para ello, los rastreadores de Google recorren continuamente la web en busca de los llamados **datos NAP** — nombre, dirección, teléfono (*Name, Address, Phone*). Con estos fragmentos el sistema monta un perfil, activado por ejemplo por:" },
    { t: "ul", items: [
      "**Datos estructurados en el sitio web:** si la web de una empresa incluye en su código el marcado estandarizado `LocalBusiness` (información legible por máquina según Schema.org, el estándar internacional para datos estructurados), Google lee la dirección, el teléfono y el horario de forma directa y limpia.",
      "**Huellas digitales en la red:** Google combina información de páginas de Facebook, perfiles de Instagram, menciones en medios locales y entradas en guías telefónicas en línea.",
      "**Cotejo de coherencia:** cuando la misma empresa, con la misma dirección, aparece varias veces de forma concordante — en su propia web, en Facebook y en un blog local — Google crea automáticamente una nueva ficha en Maps.",
    ] },
    { t: "p", text: "La mayoría de los propietarios solo se da cuenta cuando, de repente, ve en el mapa el botón «Reclamar esta empresa»." },
    { t: "h3", text: "Vía 3: importación masiva desde registros oficiales" },
    { t: "p", text: "La tercera vía suele subestimarse: Google incorpora datos a gran escala, desde fuentes oficiales y desde agregadores de datos con los que tiene acuerdos." },
    { t: "ul", items: [
      "**Registros mercantiles:** en cuanto una empresa se da de alta en el organismo competente o en el registro mercantil, esos datos llegan a Google a intervalos regulares — normalmente a través de bases de datos intermediarias.",
      "**Guías de empresas:** Google contrasta sus mapas con las Páginas Amarillas y las guías telefónicas de cada país. Una nueva entrada allí puede generar automáticamente un nuevo punto en Maps.",
    ] },
    { t: "p", text: "Así es como un perfil puede aparecer poco después de dar de alta tu empresa — sin que tú hayas ido nunca a Google." },
    { t: "p", text: "**Por qué es importante** Sea cual sea el origen del perfil, la consecuencia es la misma: en cuanto existe, acumula reseñas y aparece en la Búsqueda y en Maps. No hace falta haberlo creado ni gestionarlo para verse afectado — y precisamente por eso no basta con ignorarlo. Aun así, hay que eliminarlo de forma activa." },

    { t: "h2", id: "selbst", text: "¿Puede eliminarse el perfil de empresa de Google uno mismo?", toc: "¿Eliminarlo uno mismo?" },
    { t: "p", text: "En pocas palabras: **no del modo en que usted esperaría.** Google distingue estrictamente entre su cuenta personal de Google y el perfil de empresa público (antes conocido como «Google My Business», hoy «Perfil de empresa de Google»). Puede reclamar la titularidad y editar algunos datos, pero un botón claro de «eliminar esta ficha y todas las reseñas de forma definitiva» sencillamente no existe para los propietarios." },
    { t: "p", text: "No es un descuido, sino algo deliberado: el perfil con sus reseñas forma parte de la Búsqueda de Google y de Google Maps. Google considera esa información útil para los usuarios y no cede fácilmente el control sobre ella. Por eso la mayoría de los propietarios choca rápidamente contra un muro cuando intenta eliminar su perfil por su cuenta." },

    { t: "h2", id: "geschlossen", text: "«Cerrado definitivamente» no es una eliminación", toc: "«Cerrado» ≠ eliminado" },
    { t: "p", text: "La opción que Google le ofrece se llama «Marcar como cerrado definitivamente». Muchos la confunden con una eliminación — pero no lo es. Es únicamente una **etiqueta de estado**." },
    { t: "warn", title: "Lo que ocurre realmente con «cerrado»", text: "Su perfil sigue siendo visible en la Búsqueda de Google y en Google Maps — incluidos nombre, dirección, fotos y **todas las reseñas**. Lo único que aparece encima es un tachado con «Cerrado definitivamente». Para los posibles clientes, eso suele verse *peor* que antes." },
    { t: "p", text: "Dicho de otro modo: quien «cierra» no se deshace de la ficha ni de las reseñas — en algunos casos hasta hace el problema más llamativo. Una **eliminación real**, en cambio, borra por completo la [ficha de Google Maps](/es/revista/eliminar-ficha-de-google-maps/) junto con todas las reseñas." },

    { t: "h2", id: "optionen", text: "Qué opciones tiene realmente", toc: "Qué opciones tiene" },
    { t: "p", text: "En la práctica existen tres caminos para deshacerse de un perfil no deseado — con resultados muy distintos:" },
    { t: "table", rrCol: 3, head: ["Criterio", "Por su cuenta (DIY)", "Abogado", "RapidRemove"], rows: [
      ["¿Eliminación completa posible?", "Prácticamente no", "Incierto", "Sí"],
      ["Plazo", "—", "3–9 meses", "24–48 horas"],
      ["Coste", "—", "300 €+ / hora", "Precio fijo desde 450 €"],
      ["¿Desaparecen todas las reseñas?", "No", "Una a una, con dificultad", "Todas a la vez"],
      ["Resultado", "No", "Incierto", "Garantizado (No Cure, No Pay)"],
      ["Su esfuerzo", "Alto", "Alto", "Prácticamente ninguno"],
    ] },
    { t: "p", text: "El camino del bricolaje casi siempre termina en «cerrado definitivamente». El camino del abogado es caro, lento e incierto — y no pocas veces desencadena el [efecto Streisand](/es/revista/eliminar-resena-negativa-de-google-abogado/), en el que la atención aumenta precisamente por intentar suprimir algo. Queda el tercer camino: la eliminación profesional y completa." },

    { t: "h2", id: "anleitung", text: "Guía: cómo gestionar el perfil a través del propio Google", toc: "Guía paso a paso" },
    { t: "p", text: "Si quiere intentarlo primero por su cuenta, aquí tiene el proceso real. Tenga en cuenta que el mejor resultado que puede esperar es «cerrado», no «eliminado»." },
    { t: "ol", items: [
      "**Reclamar la titularidad:** busque su empresa en Google y seleccione «¿Es usted el propietario de este negocio?». Google exige una verificación (carta postal, teléfono, correo electrónico o vídeo) — puede tardar días o semanas.",
      "**Acceder al perfil de empresa:** una vez confirmada la titularidad, gestione el perfil directamente desde la Búsqueda de Google.",
      "**Buscar «Eliminar perfil»:** en la configuración encontrará opciones como «Marcar la empresa como cerrada definitivamente» o «Eliminar perfil». Esta última solo elimina el vínculo de administración, no la ficha pública.",
      "**Comprobar el resultado:** por lo general, la ficha con todas las reseñas sigue siendo visible — ahora con la etiqueta «Cerrado definitivamente». El problema de fondo no se ha resuelto.",
    ] },
    { t: "note", title: "Importante", text: "Sin titularidad verificada apenas puede hacer nada. Y aun con titularidad, la eliminación completa de la ficha pública a través de la interfaz estándar no está prevista." },
    { t: "cta", title: "¿Prefiere saber directamente si su perfil puede eliminarse?", text: "Introduzca el nombre de su empresa — encontramos su perfil de Google real y comprobamos en segundos si puede eliminarse y con qué rapidez. Sin compromiso y sin coste.", btn: "Empezar verificación gratuita", href: "/es/?start=1", trust: ["Pago solo tras la eliminación exitosa"] },

    { t: "h2", id: "einzeln", text: "¿Eliminar reseñas individuales o borrar el perfil entero?", toc: "¿Reseñas o perfil?" },
    { t: "p", text: "Muchos empiezan intentando denunciar reseñas negativas concretas a [Google](/es/revista/eliminar-resenas-falsas-de-google/). Es un proceso agotador e incierto: Google rechaza las denuncias con frecuencia, cada reseña debe justificarse por separado — y por cada una que desaparece, no tardan en surgir nuevas. Está combatiendo síntomas, no la causa." },
    { t: "p", text: "El enfoque sostenible va a la raíz del problema: **si se elimina el perfil completo, todas las reseñas desaparecen de un golpe** — incluidas las falsas y las de represalia. Definitivo, no a medias. Por eso, deliberadamente no eliminamos reseñas individuales, sino el perfil completo. Quien desee primero [eliminar reseñas de Google de forma individual](/es/revista/eliminar-resenas-de-google/) encontrará allí los métodos y los costes comparados." },
    { t: "tip", title: "La ventaja decisiva", text: "Un perfil eliminado no puede mostrar reseñas antiguas ni nuevas. El problema no se desplaza — se resuelve." },

    { t: "h2", id: "legal", text: "¿Es legal eliminarlo?", toc: "¿Es legal?" },
    { t: "p", text: "Sí. Una eliminación profesional trabaja exclusivamente a través de los **procedimientos oficiales previstos por Google** y ha sido revisada jurídicamente. No se hackea nada, no se evita ningún mecanismo y no se accede a ningún sistema de forma no autorizada. Su cuenta de Google, Gmail y eventuales cuentas de Google Ads quedan completamente intactas — igual que su sitio web, su posicionamiento orgánico y sus campañas." },
    { t: "p", text: "Reconoce a un proveedor serio en que nombra una empresa real con dirección y número fiscal, habla con transparencia sobre el método y **cobra únicamente tras el éxito** — no en base a vagas promesas de «accesos secretos a Google»." },

    { t: "h2", id: "kosten", text: "¿Cuánto tarda y cuánto cuesta?", toc: "Plazo y coste" },
    { t: "p", text: "Una eliminación profesional suele estar completada en **24–48 horas** — en lugar de los meses que consume la vía del abogado. En cuanto a los costes: un abogado cobra por hora (a menudo 300 € o más) sin garantía de éxito. RapidRemove trabaja con un **precio fijo transparente desde 450 €** — y usted paga **únicamente tras la eliminación exitosa**." },
    { t: "p", text: "¿Le parece caro? Haga las cuentas: una sola reseña falsa visible puede reducir significativamente la tasa de clics y costarle a lo largo de los meses mucho más que eso." },

    { t: "h2", id: "ablauf", text: "Así funciona la eliminación con RapidRemove", toc: "Cómo funciona" },
    { t: "ol", items: [
      "**Verificación gratuita:** introduzca el nombre de la empresa. Encontramos su perfil y comprobamos de inmediato si la eliminación es posible — sin compromiso y sin coste.",
      "**Confirmar y autorizar:** usted confirma el perfil correcto y da su autorización para el tratamiento. Sin acceso a Gmail, Ads ni datos personales.",
      "**Eliminación en 24–48 horas:** nuestro equipo borra el perfil junto con todas las reseñas — de forma permanente. El pago se realiza solo después.",
    ] },

    { t: "h2", id: "fazit", text: "Conclusión: el camino más rápido y seguro hacia un resultado de búsqueda limpio", toc: "Conclusión" },
    { t: "p", text: "Eliminar por uno mismo un perfil de empresa de Google fracasa en la práctica casi siempre contra el propio sistema de Google — «cerrado definitivamente» no resuelve el problema. El camino fiable es la eliminación completa y legal del perfil entero junto con todas las reseñas. Rápido, permanente, planificable — y sin ningún riesgo gracias al pago solo tras el éxito." },

    { t: "cta", title: "Compruebe ahora de forma gratuita si su perfil puede eliminarse", text: "En pocos segundos verá su perfil real y sabrá si podemos eliminarlo y con qué rapidez. Sin pago por adelantado, sin compromiso.", btn: "Empezar verificación gratuita", href: "/es/?start=1", trust: ["Riesgo cero", "Pago solo tras la eliminación exitosa"] },
  ],
  faq: [
    { q: "¿Puedo eliminar mi perfil de empresa de Google por mi cuenta?", a: "Solo de forma limitada. Google no ofrece un botón sencillo de «eliminar perfil». Puede reclamar la titularidad y marcar el perfil como «cerrado definitivamente» — pero la ficha con todas las reseñas seguirá siendo visible públicamente." },
    { q: "¿Cuál es la diferencia entre «cerrado definitivamente» y «eliminado»?", a: "«Cerrado definitivamente» es solo un estado. El perfil sigue siendo visible en la Búsqueda y en Maps, incluidos nombre, dirección y todas las reseñas. Una eliminación real borra la ficha y todas las reseñas por completo." },
    { q: "¿Es legal que eliminen un perfil de empresa de Google?", a: "Sí. La eliminación se realiza a través de los procedimientos oficiales previstos por Google y ha sido revisada jurídicamente. Su cuenta de Google, Gmail y eventuales cuentas de Ads quedan completamente intactas." },
    { q: "¿También desaparecen todas las reseñas?", a: "Sí. Si se elimina el perfil de empresa completo, todas las reseñas vinculadas desaparecen de un golpe — también las falsas y las de represalia." },
    { q: "¿Cuánto tarda la eliminación?", a: "Por lo general, el perfil se elimina en torno a las 24 horas. Puede consultar el estado exacto en cualquier momento en el portal de clientes." },
    { q: "¿Afecta la eliminación a mi SEO, a mi web o a Google Ads?", a: "No. Solo se elimina el perfil de empresa (Google Maps / Perfil de empresa de Google). Su sitio web, su posicionamiento y sus campañas permanecen sin cambios." },
    { q: "¿Cuánto cuesta que eliminen un perfil de empresa de Google?", a: "En RapidRemove se aplica un precio fijo transparente desde 450 € — y usted paga únicamente tras la eliminación exitosa (No Cure, No Pay)." },
    { q: "¿Puede volver a aparecer el perfil después?", a: "Terceros podrían teóricamente crear un nuevo perfil. Con la protección opcional, supervisamos su ficha y eliminamos sin coste cualquier perfil que vuelva a aparecer durante el período de protección." },
  ],
};
export default article;
