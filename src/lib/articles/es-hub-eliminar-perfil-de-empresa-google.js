/* ES hub: "Eliminar perfil de empresa de Google" (lead article, MagArticle format).

   SEO-Ausbau 21.10.2026 nach EN-Muster (en-hub-delete-google-business-profile.js):
   Kurzantwort, Googles offizielle Schritte mit den spanischen Menübezeichnungen der
   Google-Hilfe („Ajustes de Perfil de Empresa" → „Quitar Perfil de Empresa"),
   Vergleichstabelle, eigene Abschnitte je Suchintention (qué pasa / empezar de cero /
   Google Maps / no aparece la opción) + erweiterte FAQ; Herkunft ans Ende verschoben.
   KERNBOTSCHAFT UNVERÄNDERT: „cerrado permanentemente" bzw. „Quitar Perfil de Empresa"
   ist kein Löschen — Profil und alle Bewertungen bleiben öffentlich; die vollständige
   Entfernung läuft über Googles offizielle Verfahren, im Auftrag des Inhabers (RapidRemove). */
const article = {
  meta: {
    slug: "eliminar-perfil-de-empresa-google",
    title: "Eliminar perfil de empresa de Google: 4 opciones (2026)",
    h1: "Cómo eliminar un perfil de empresa de Google (de verdad)",
    description:
      "Los pasos de Google solo quitan su acceso: la ficha y sus reseñas siguen en Maps. Qué hace cada una de las 4 opciones y cómo eliminarla del todo.",
    author: "Maximilian Hölzl",
    authorRole: "Experto en Google y fundador",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "eliminar perfil de empresa de google",
      "cómo eliminar mi empresa de google",
      "eliminar google my business",
      "quitar perfil de empresa de google",
      "borrar negocio de google maps",
      "eliminar ficha de google",
      "eliminar negocio de google maps",
      "dar de baja mi negocio en google",
    ],
  },
  category: "Política de Google",
  iconKey: "trash",
  readingMin: 14,
  dek: "«Cerrado permanentemente» no es lo mismo que eliminado — y quitar el perfil de su cuenta tampoco: la ficha, el nombre, la dirección y todas las reseñas siguen visibles en Google. Esta guía muestra las opciones oficiales de Google, qué hace realmente cada una y qué funciona de verdad para eliminar un perfil de empresa de Google por completo.",
  blocks: [
    { t: "note", title: "Nota", text: "Esta guía es una orientación práctica y no constituye asesoramiento jurídico. Para una valoración vinculante de su caso concreto, consulte a un profesional cualificado." },

    { t: "lead", text: "Busca su negocio en Google y aparece una ficha que ya no quiere: llena de reseñas falsas o de represalia, con datos incorrectos, o simplemente un perfil del que quiere salir para siempre. La pregunta lógica es: **¿cómo eliminar mi perfil de empresa de Google?** — o, como muchos lo siguen llamando, cómo eliminar Google My Business. La respuesta honesta es más complicada de lo que Google le hace creer. Aquí tiene qué hace cada opción y qué funciona de verdad, paso a paso." },

    { t: "tip", title: "Respuesta corta", text: "Un perfil de empresa de Google no se puede borrar sin más. Como propietario, Google solo le permite **quitar el perfil de su cuenta** (Ajustes de Perfil de Empresa → Quitar Perfil de Empresa) o **marcar la empresa como cerrada permanentemente**. En ambos casos, la ficha pública y **todas las reseñas siguen en la Búsqueda de Google y en Google Maps**. La eliminación completa de la ficha — con todas sus reseñas — solo es posible a través de los procedimientos oficiales que Google prevé. Eso es exactamente lo que RapidRemove gestiona en nombre del propietario, con pago solo tras la eliminación exitosa." },

    { t: "h2", id: "why", text: "Por qué no existe un botón de «eliminar»", toc: "Sin botón de eliminar" },
    { t: "p", text: "Quien busca cómo eliminar su empresa de Google choca enseguida contra un muro. Puede marcar el negocio como **«cerrado permanentemente»** o quitarlo de su propia cuenta — pero un botón claro que diga **«eliminar esta ficha y todas sus reseñas»** no existe para los propietarios. No es un descuido: Google considera el perfil y sus reseñas información útil para quien busca, y se reserva el control sobre ella. La ficha describe un lugar real del mundo; desde el punto de vista de Google, no le pertenece a usted, aunque usted la gestione." },
    { t: "p", text: "A eso se suma que Google distingue estrictamente entre su cuenta personal de Google y el perfil de empresa público (antes «Google My Business», hoy «Perfil de Empresa de Google»). Usted puede reclamar la titularidad y editar datos, pero no hacer desaparecer la ficha." },
    { t: "warn", title: "«Cerrado permanentemente» ≠ eliminado", text: "Marcar el negocio como cerrado **no** lo elimina. Según la propia Google, la ficha no desaparece de Maps de inmediato; mientras sigue ahí, el nombre, la dirección, las fotos y **todas las reseñas continúan visibles públicamente** — ahora con la etiqueta «Cerrado permanentemente» encima. Para los posibles clientes, eso suele verse **peor** que antes." },

    { t: "h2", id: "official-steps", text: "Cómo eliminar un perfil de empresa de Google: los pasos oficiales", toc: "Pasos oficiales de Google" },
    { t: "p", text: "En la terminología de Google, la opción para propietarios se llama **«Quitar Perfil de Empresa»**. Existe — pero quita el perfil de *su cuenta*, no la ficha de Google. Así funciona, para que sepa exactamente qué hace (y qué no)." },
    { t: "h3", text: "En el ordenador" },
    { t: "ol", items: [
      "Inicie sesión con la cuenta de Google vinculada al perfil y abra su Perfil de Empresa (por ejemplo, buscando el nombre de su negocio en Google).",
      "Seleccione **Más** (⋮) → **Ajustes de Perfil de Empresa**.",
      "Elija **Quitar Perfil de Empresa** → **Quitar el contenido y los administradores del perfil**.",
      "Opcional: active **«Marcar la empresa como cerrada permanentemente»**.",
      "Confirme con **Continuar** → **Quitar** → **Hecho**.",
    ] },
    { t: "h3", text: "En la app de Google Maps" },
    { t: "p", text: "Abra la app de Google Maps con la cuenta propietaria, vaya a su Perfil de Empresa y busque igualmente **Más** → **Ajustes de Perfil de Empresa** → **Quitar Perfil de Empresa**. El recorrido y el resultado son los mismos que en el ordenador." },
    { t: "h3", text: "Varios perfiles a la vez" },
    { t: "p", text: "Si gestiona varias ubicaciones, abra el **Administrador de Perfiles de Empresa** con la cuenta vinculada a todas ellas, marque los perfiles y, arriba a la derecha, elija **Acciones** → **Quitar empresas** → **Quitar**. Si aparece un error, tendrá que quitar el contenido y los administradores de cada perfil por separado." },
    { t: "warn", title: "Lo que la propia Google dice que ocurre después", text: "Según las páginas de ayuda de Google, **el contenido generado por usuarios y las reseñas se conservan**, y la empresa **puede seguir apareciendo en la Búsqueda y en Maps**. Solo se borra *su* contenido y el de los demás administradores: publicaciones, fotos, vídeos y respuestas a reseñas — de forma permanente y sin posibilidad de recuperarlo. Solo el **propietario principal** puede hacerlo, y los propietarios nuevos deben esperar **7 días**. En resumen: la opción oficial pone fin a *su* gestión del perfil — no elimina el perfil." },

    { t: "h2", id: "options", text: "Eliminar, cerrar, quitar o dar de baja: qué hace realmente cada opción", toc: "Todas las opciones" },
    { t: "p", text: "Se busca «eliminar mi cuenta de Google My Business», «dar de baja mi negocio en Google», «cerrar ficha de Google» o «eliminar ficha de Google» — pero para Google son acciones muy distintas. Esto es lo que cada una hace con la ficha pública y sus reseñas:" },
    { t: "table", head: ["Opción", "Qué hace", "¿Ficha visible?", "¿Reseñas visibles?"], rows: [
      ["Quitar Perfil de Empresa (contenido y administradores)", "Borra su gestión, sus publicaciones, fotos y respuestas", "Sí, ahora sin gestionar", "Sí"],
      ["Marcar como cerrada permanentemente", "Añade la etiqueta «Cerrado permanentemente»", "Sí, con la etiqueta (no desaparece de inmediato)", "Sí"],
      ["Marcar como cerrada temporalmente", "Indica un cierre temporal", "Sí, «Cerrado temporalmente»", "Sí"],
      ["Quitarse como administrador o borrar su cuenta de Google", "Usted pierde el acceso; el perfil queda en manos de otros o sin reclamar", "Sí", "Sí"],
      ["Sugerir un cambio → «Cerrar o quitar» en Maps (cualquiera)", "Pide a Google que cierre o quite el lugar", "Decide Google — a menudo se rechaza", "Sí, salvo que se elimine la ficha"],
      ["Eliminación completa (RapidRemove)", "Elimina la ficha por los procedimientos oficiales de Google, en nombre del propietario", "No, desaparece de la Búsqueda y de Maps", "No, desaparecen todas con ella"],
    ] },
    { t: "p", text: "Otra fuente de confusión: **Google My Business** (o «Google Mi Negocio») es simplemente el nombre antiguo del **Perfil de Empresa de Google**. Llámelo cuenta de empresa, página, ficha o perfil — es la misma entrada y se aplican las mismas reglas." },

    { t: "h2", id: "what-happens", text: "¿Qué pasa si elimino mi perfil de empresa de Google?", toc: "Qué pasa después" },
    { t: "p", text: "Muchos propietarios esperan que la ficha desaparezca en cuanto la quitan de su cuenta. Esto es lo que ocurre en realidad:" },
    { t: "ul", items: [
      "**Su acceso termina:** usted y todos los administradores pierden el control del perfil. Para volver a gestionarlo hay que reclamarlo y verificarlo desde cero.",
      "**Su contenido desaparece:** las publicaciones, las fotos que subió y sus respuestas a reseñas se borran de forma permanente y no se pueden recuperar.",
      "**La ficha se queda:** nombre, dirección, categoría y horario suelen seguir visibles en la Búsqueda de Google y en Google Maps.",
      "**Las reseñas se quedan:** todas las reseñas de clientes — también las falsas o injustas — siguen públicas, ahora **sin sus respuestas** al lado.",
      "**Cualquiera puede editarla:** un perfil sin gestionar puede ser modificado por usuarios y por la propia Google, y usted ya no recibe avisos.",
    ] },
    { t: "p", text: "Por eso, quitar el perfil de su cuenta a menudo empeora las cosas: las reseñas negativas siguen ahí, pero su versión de los hechos ha desaparecido." },

    { t: "h2", id: "start-over", text: "¿Puedo borrar mi perfil de empresa y empezar de cero?", toc: "Empezar de cero" },
    { t: "p", text: "No creando simplemente uno nuevo. Si la ficha antigua sigue existiendo — y tras «Quitar Perfil de Empresa» sigue existiendo — Google ve un **segundo perfil para el mismo negocio en la misma dirección**. Los duplicados suelen fusionarse de nuevo con la ficha antigua (reseñas incluidas) o el perfil nuevo queda suspendido. En ambos casos, las reseñas antiguas vuelven a aparecer." },
    { t: "p", text: "Un verdadero nuevo comienzo funciona en dos pasos: primero se **elimina por completo el perfil antiguo**, con todas sus reseñas; después, si lo desea, crea y verifica un **perfil nuevo y limpio**. RapidRemove se encarga del primer paso — a precio fijo y con pago solo tras la eliminación exitosa — y su web y su posicionamiento quedan intactos." },

    { t: "h2", id: "google-maps", text: "Cómo borrar un negocio de Google Maps", toc: "Borrar de Google Maps" },
    { t: "p", text: "En Google Maps, cualquiera — propietario o no — puede pedir a Google que cierre o quite un lugar:" },
    { t: "ol", items: [
      "Abra el lugar en Google Maps o en la Búsqueda de Google.",
      "Elija **Sugerir un cambio** (en algunas versiones, «Sugerir una edición») → **Cerrar o quitar**.",
      "Indique un motivo, por ejemplo cerrado permanentemente, el lugar no existe, es un duplicado o es spam.",
      "Envíe la sugerencia: Google la revisa y decide por su cuenta.",
    ] },
    { t: "p", text: "En negocios reales y existentes, estas sugerencias suelen rechazarse o convertirse en una etiqueta de «Cerrado permanentemente» — la ficha y sus reseñas permanecen. Una **eliminación real**, en cambio, borra por completo la [ficha de Google Maps](/es/revista/eliminar-ficha-de-google-maps/) junto con todas las reseñas; allí encontrará también los casos de fichas propias, de terceros y duplicadas." },

    { t: "h2", id: "no-delete-option", text: "Por qué no le aparece la opción de eliminar", toc: "¿No aparece la opción?" },
    { t: "p", text: "Si en sus ajustes no encuentra «Quitar Perfil de Empresa», casi siempre se debe a uno de estos motivos:" },
    { t: "ul", items: [
      "**Es administrador, no propietario principal.** Solo el propietario principal puede quitar el contenido y los administradores del perfil.",
      "**Es propietario desde hace poco.** Los propietarios nuevos deben esperar 7 días antes de que la opción esté disponible.",
      "**El perfil no está verificado ni reclamado por usted.** Entonces no pertenece a nadie — o pertenece a otra cuenta de Google.",
      "**Ha iniciado sesión con la cuenta de Google equivocada.** Muchas empresas tienen varias; compruebe cuál es la propietaria del perfil.",
    ] },
    { t: "p", text: "Y aunque encuentre el botón, recuerde el resultado: quita el perfil de su cuenta, no de Google." },

    { t: "h2", id: "how", text: "Cómo funciona la eliminación completa del perfil", toc: "Cómo funciona" },
    { t: "p", text: "La única forma fiable de que un perfil y sus reseñas desaparezcan es la **eliminación completa del Perfil de Empresa** a través de los procedimientos oficiales que Google prevé — no borrar reseña por reseña. Cuando se elimina el perfil entero, **todas las reseñas desaparecen con él**, incluidas las falsas. Es la diferencia entre tratar síntomas y eliminar la causa." },
    { t: "p", text: "Eso es exactamente lo que hace RapidRemove, en nombre del propietario del negocio:" },
    { t: "ol", items: [
      "**Verificación gratuita:** introduzca el nombre de la empresa. Encontramos su perfil y comprobamos de inmediato si la eliminación es posible — sin compromiso y sin coste.",
      "**Confirmar y autorizar:** usted confirma el perfil correcto y da su autorización para el trámite. Sin acceso a Gmail, Ads ni datos personales.",
      "**Eliminación en 24–48 horas:** nuestro equipo tramita la eliminación del perfil junto con todas las reseñas, de forma permanente. El pago se realiza solo después.",
    ] },
    { t: "p", text: "Todo se hace exclusivamente a través de los **procedimientos que Google pone a disposición**: no se accede a ningún sistema ni se evita ningún mecanismo. Su cuenta de Google, Gmail y sus eventuales cuentas de Google Ads quedan intactas — igual que su sitio web, su posicionamiento orgánico y sus campañas. Reconoce a un proveedor serio en que da la cara con una empresa real, dirección y número fiscal, explica con transparencia cómo trabaja y **cobra únicamente tras la eliminación exitosa** — no en base a vagas promesas de «accesos secretos a Google»." },
    { t: "warn", title: "Importante", text: "La eliminación completa borra el **perfil entero**, no una reseña concreta. Si solo quiere quitar una o unas pocas reseñas y conservar el perfil, RapidRemove también lo ofrece: [eliminación de reseñas individuales](/es/eliminar-una-resena/) — más detalles en la sección siguiente." },

    { t: "cta", title: "¿Prefiere saber directamente si su perfil puede eliminarse?", text: "Introduzca el nombre de su empresa — encontramos su perfil de Google real y comprobamos en segundos si puede eliminarse y con qué rapidez. Sin compromiso y sin coste.", btn: "Empezar verificación gratuita", href: "/es/?start=1", trust: ["Pago solo tras la eliminación exitosa"] },

    { t: "h2", id: "single-vs-profile", text: "¿Eliminar reseñas individuales o borrar el perfil entero?", toc: "¿Reseñas o perfil?" },
    { t: "p", text: "Muchos empiezan intentando denunciar reseñas negativas concretas a [Google](/es/revista/eliminar-resenas-falsas-de-google/). Es un proceso agotador e incierto: Google rechaza las denuncias con frecuencia, cada reseña debe justificarse por separado — y por cada una que desaparece, no tardan en surgir nuevas. Está combatiendo síntomas, no la causa." },
    { t: "p", text: "El enfoque sostenible va a la raíz del problema: **si se elimina el perfil completo, todas las reseñas desaparecen de un golpe** — incluidas las falsas y las de represalia. Definitivo, no a medias." },
    { t: "p", text: "¿Su perfil está bien en general y solo le molestan una o unas pocas reseñas? Entonces no hace falta borrarlo entero: con nuestra [eliminación de reseñas individuales](/es/eliminar-una-resena/) usted elige las reseñas concretas y paga **179 € por reseña eliminada** (hasta 4 semanas y con texto) — solo si desaparece. Estas reseñas tienen aprox. un 90 % de éxito; las más antiguas, aprox. un 50 %. Todas las demás (más antiguas o solo con estrellas) cuestan 250 € cada una. Precios, plazos y descuentos por volumen, en el [servicio para eliminar reseñas de Google](/es/revista/servicio-eliminar-resenas-google/). Si prefiere comparar primero todos los métodos, aquí tiene cómo [eliminar reseñas de Google](/es/revista/eliminar-resenas-de-google/) con sus costes." },
    { t: "tip", title: "La ventaja decisiva", text: "Un perfil eliminado no puede mostrar reseñas antiguas ni nuevas. El problema no se desplaza — se resuelve." },

    { t: "h2", id: "cost", text: "¿Cuánto tarda y cuánto cuesta eliminar un perfil de empresa de Google?", toc: "Plazo y coste" },
    { t: "p", text: "En la práctica existen tres caminos para deshacerse de un perfil no deseado — con resultados muy distintos:" },
    { t: "table", rrCol: 3, head: ["Criterio", "Por su cuenta", "Abogado", "RapidRemove"], rows: [
      ["¿Eliminación completa posible?", "Prácticamente no", "Incierto", "Sí, si la verificación lo confirma"],
      ["Plazo", "—", "3–9 meses", "24–48 horas"],
      ["Coste", "—", "300 €+ / hora", "Precio fijo desde 450 €"],
      ["¿Desaparecen todas las reseñas?", "No", "Una a una, con dificultad", "Todas a la vez"],
      ["Pago", "—", "Por horas, también sin éxito", "Solo tras la eliminación exitosa (No Cure, No Pay)"],
      ["Su esfuerzo", "Alto", "Alto", "Prácticamente ninguno"],
    ] },
    { t: "p", text: "El camino por cuenta propia casi siempre termina en «cerrado permanentemente». El camino del abogado es caro, lento e incierto — y no pocas veces desencadena el [efecto Streisand](/es/revista/eliminar-resena-negativa-de-google-abogado/), en el que la atención aumenta precisamente por intentar suprimir algo." },
    { t: "p", text: "Una eliminación profesional suele estar completada en **24–48 horas** — en lugar de los meses que consume la vía del abogado. Un abogado cobra por hora (a menudo 300 € o más) sin asegurar el resultado. RapidRemove trabaja con un **precio fijo transparente desde 450 €** — y usted paga **únicamente tras la eliminación exitosa**. Haga las cuentas: una sola reseña falsa visible puede reducir notablemente los clics en su ficha y costarle a lo largo de los meses mucho más que eso." },

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
    { t: "p", text: "Así es como un perfil puede aparecer poco después de dar de alta su empresa — sin que usted haya ido nunca a Google." },
    { t: "p", text: "**Por qué es importante:** sea cual sea el origen del perfil, la consecuencia es la misma: en cuanto existe, acumula reseñas y aparece en la Búsqueda y en Maps. No hace falta haberlo creado ni gestionarlo para verse afectado — y precisamente por eso no basta con ignorarlo. Hay que eliminarlo de forma activa." },

    { t: "h2", id: "fazit", text: "Conclusión: el camino más directo hacia un resultado de búsqueda limpio", toc: "Conclusión" },
    { t: "p", text: "Eliminar por uno mismo un perfil de empresa de Google fracasa en la práctica casi siempre contra el propio sistema de Google: «Quitar Perfil de Empresa» solo termina su gestión y «cerrado permanentemente» no resuelve el problema. El camino fiable es la eliminación completa del perfil entero junto con todas las reseñas, a través de los procedimientos oficiales de Google y en nombre del propietario. Rápido, permanente, planificable — y con pago solo tras la eliminación exitosa." },

    { t: "cta", title: "Compruebe ahora de forma gratuita si su perfil puede eliminarse", text: "En pocos segundos verá su perfil real y sabrá si podemos eliminarlo y con qué rapidez. Sin pago por adelantado, sin compromiso.", btn: "Empezar verificación gratuita", href: "/es/?start=1", trust: ["Verificación gratuita", "Pago solo tras la eliminación exitosa"] },
  ],
  faq: [
    { q: "¿Puedo eliminar mi perfil de empresa de Google yo mismo?", a: "Solo de forma limitada. Puede marcarlo como «cerrado permanentemente» o quitarlo de su cuenta, pero ninguna de las dos opciones elimina la ficha pública: sigue visible en la Búsqueda y en Maps con todas sus reseñas. La eliminación completa pasa por los procedimientos oficiales de Google." },
    { q: "¿Cómo eliminar mi cuenta de Google My Business de forma definitiva?", a: "En su Perfil de Empresa vaya a Más → Ajustes de Perfil de Empresa → Quitar Perfil de Empresa → Quitar el contenido y los administradores del perfil, y confirme con Continuar → Quitar → Hecho. Así termina su gestión y se borran sus publicaciones, fotos y respuestas a reseñas — pero la ficha pública y sus reseñas suelen seguir en Google. Para eliminar la ficha en sí, hay que tramitar su eliminación por los procedimientos oficiales de Google." },
    { q: "¿«Cerrado permanentemente» es lo mismo que eliminado?", a: "No. «Cerrado permanentemente» (o «definitivamente») es solo un estado. La ficha no desaparece de inmediato: nombre, dirección y todas las reseñas siguen visibles, ahora con la etiqueta de cerrado. A menudo se ve peor que antes." },
    { q: "¿Qué pasa si elimino mi perfil de empresa de Google?", a: "Pierde el acceso, y sus publicaciones, fotos y respuestas a reseñas se borran sin posibilidad de recuperarlas. La ficha, sus reseñas y sus datos suelen seguir visibles en la Búsqueda de Google y en Maps — y cualquiera puede sugerir cambios en ella." },
    { q: "¿Puedo borrar mi perfil de empresa de Google y crear uno nuevo?", a: "Solo si antes se elimina por completo el perfil antiguo. Un perfil nuevo para el mismo negocio en la misma dirección se trata como duplicado y suele fusionarse con el antiguo — reseñas incluidas — o quedar suspendido." },
    { q: "¿Cómo borrar mi negocio de Google Maps?", a: "Cualquiera puede elegir «Sugerir un cambio» → «Cerrar o quitar» en el lugar dentro de Google Maps. Google decide por su cuenta y, en negocios reales, suele mantener la ficha o marcarla solo como cerrada. La eliminación completa de la ficha y sus reseñas pasa por los procedimientos oficiales de Google." },
    { q: "¿Por qué no me aparece la opción de eliminar el perfil de empresa?", a: "Normalmente porque es administrador y no propietario principal, porque es propietario desde hace menos de 7 días, porque el perfil no está verificado con su cuenta o porque ha iniciado sesión con otra cuenta de Google." },
    { q: "¿Google My Business y Perfil de Empresa de Google son lo mismo?", a: "Sí. Google My Business (Google Mi Negocio) es el nombre antiguo del Perfil de Empresa de Google. Cuenta de empresa, página, ficha o perfil de Google se refieren a la misma entrada." },
    { q: "¿Cómo eliminar una ficha de Google de mi negocio que creó otra persona?", a: "Aunque no la haya creado usted, la ficha describe su negocio. Puede reclamarla y verificarla, o encargarnos su eliminación como propietario del negocio: la tramitamos en su nombre a través de los procedimientos oficiales de Google, con todas sus reseñas." },
    { q: "¿También desaparecen todas las reseñas?", a: "Sí. Si se elimina el perfil de empresa completo, todas las reseñas vinculadas desaparecen de un golpe — también las falsas y las de represalia." },
    { q: "¿Cuánto tarda la eliminación?", a: "Por lo general, una eliminación profesional del perfil se completa en 24–48 horas. Puede consultar el estado en cualquier momento en el portal de clientes." },
    { q: "¿Afecta la eliminación a mi web, a mi SEO o a Google Ads?", a: "No. Solo se elimina el perfil de empresa (Google Maps / Perfil de Empresa de Google). Su sitio web, su cuenta de Google, su posicionamiento y sus campañas permanecen sin cambios. Si lo desea, después puede crear un perfil nuevo y limpio." },
    { q: "¿Cuánto cuesta eliminar un perfil de empresa de Google?", a: "En RapidRemove se aplica un precio fijo transparente desde 450 € — y usted paga únicamente tras la eliminación exitosa (No Cure, No Pay). Si solo necesita quitar reseñas concretas, la [eliminación de reseñas individuales](/es/eliminar-una-resena/) cuesta 179 € por reseña eliminada de hasta 4 semanas y con texto (250 € todas las demás), también solo si desaparece." },
    { q: "¿Puede volver a aparecer el perfil después?", a: "Terceros podrían teóricamente crear un nuevo perfil. Con la protección opcional, supervisamos su ficha y eliminamos sin coste cualquier perfil que vuelva a aparecer durante el período de protección." },
  ],
};
export default article;
