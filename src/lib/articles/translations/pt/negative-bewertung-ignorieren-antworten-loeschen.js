/* PT — negative-bewertung-ignorieren-antworten-loeschen (Ignorar, responder ou remover) */
const article = {
  category: "Reputação",
  meta: {
    slug: "avaliacao-negativa-ignorar-responder-remover",
    title: "Avaliação negativa: ignorar, responder ou remover?",
    h1: "Avaliação negativa no Google: ignorar, responder ou remover?",
    description:
      "Perante uma avaliação negativa no Google: ignorar, responder ou pedir a remoção? Um guia de decisão claro segundo o tipo de avaliação — com os passos seguintes.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Especialista em Google",
    date: "2026-06-09",
  },
  dek: "A reação certa depende de **uma** questão: a avaliação é legítima ou não? A crítica genuína e factual responde-se com serenidade. As avaliações injustificadas, falsas ou ilegais removem-se. E algumas avaliações ignoram-se deliberadamente. Este guia classifica claramente os três caminhos — para que não reaja por impulso.",
  blocks: [
    { t: "h2", id: "kurz", text: "O essencial em resumo", toc: "Em resumo" },
    { t: "ul", items: [
      "**Ignorar:** em caso de crítica isolada e inofensiva que se perde numa boa média geral.",
      "**Responder:** em caso de crítica genuína e factual — a resposta destina-se aos *outros leitores*, não ao autor.",
      "**Pedir a remoção:** em caso de avaliações falsas, insultos, afirmações incorretas ou ausência de relação comercial — aqui existe frequentemente um fundamento legal.",
      "**Nunca:** discutir por impulso, ameaçar ou expor clientes publicamente — isso desencadeia o efeito Streisand.",
    ] },

    { t: "h2", id: "grundfrage", text: "A questão fundamental: legítima ou não?", toc: "Legítima?" },
    { t: "p", text: "Antes de reagir, esclareça uma coisa: a avaliação descreve uma **experiência real** — ou não? É aqui que tudo se decide. Uma opinião honesta, mesmo que severa, sobre uma visita real é protegida pela liberdade de expressão e dificilmente pode ser removida. Uma avaliação sem fundamento real (falsa, de concorrente, troca de pessoa, mera difamação) é, pelo contrário, frequentemente contestável." },

    { t: "h2", id: "ignorieren", text: "Caminho 1: Ignorar — quando não fazer nada é o certo", toc: "1 · Ignorar" },
    { t: "p", text: "Nem toda a voz crítica precisa de uma reação. Se tiver uma média sólida acima de 4,0 e uma avaliação isolada e factual de 3 ou 4 estrelas no meio, o seu impacto é mínimo — aliás, torna o quadro geral mais credível. Quem reage a *qualquer* pequenez parece rapidamente hipersensível." },
    { t: "p", text: "**Ignorar é o certo quando:** a avaliação é isolada, factual e passa despercebida numa boa média." },

    { t: "h2", id: "antworten", text: "Caminho 2: Responder — com serenidade, para os outros leitores", toc: "2 · Responder" },
    { t: "p", text: "Uma avaliação negativa genuína é um palco — não para o confronto com o autor, mas para mostrar **aos outros leitores** como lida com as críticas. Uma boa resposta é breve, amigável, orientada para a solução e isenta de necessidade de justificação." },
    { t: "p", text: "Regras práticas: reagir prontamente, agradecer o feedback, levar o problema a sério, oferecer uma solução ou conversa — e nunca tornar públicos dados de clientes ou assuntos internos. O que deve evitar aqui é o **efeito Streisand**: quem responde de forma agressiva ou ameaça provoca frequentemente uma vaga de novas avaliações negativas." },
    { t: "p", text: "**Responder é o certo quando:** a crítica é genuína e factual e uma reação serena melhora a imagem." },

    { t: "h2", id: "loeschen", text: "Caminho 3: Pedir a remoção — quando existe fundamento", toc: "3 · Remover" },
    { t: "p", text: "Em caso de avaliações **injustificadas**, a remoção é o melhor caminho. As probabilidades de sucesso são boas em casos como:" },
    { t: "ul", items: [
      "**Avaliações falsas** sem relação comercial real (p. ex. de concorrentes),",
      "**Insultos, difamação, afirmações factualmente incorretas,**",
      "**Avaliações de 1 estrela sem texto** sem referência reconhecível,",
      "**Entradas sem pertinência ou com troca de pessoa.**",
    ] },
    { t: "p", text: "A exigência de uma **relação comercial efetiva** é jurisprudência consolidada na UE — o Tribunal Regional de Lübeck (proc. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) e o Tribunal Federal de Justiça alemão (BGH, proc. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) confirmaram-no; estes acórdãos alemães reflectem o enquadramento jurídico europeu vigente. Adicionalmente, o **RGPD Art. 17** (direito ao apagamento / direito a ser esquecido) pode ser invocado quando estão em causa dados pessoais." },
    { t: "p", text: "Para a execução existem dois caminhos que comparamos em detalhe: a **denúncia/via advogado** para uma avaliação individual e a **eliminação técnica do perfil** quando o perfil está globalmente comprometido. A comparação direta encontra-a em [Advogado ou eliminação técnica?](/pt/revista/avaliacao-negativa-google-advogado/) e os métodos e custos em [Remover avaliações do Google](/pt/revista/remover-avaliacoes-google/)." },
    { t: "p", text: "**Pedir a remoção é o certo quando:** a avaliação é injustificada, falsa ou ilegal — ou o perfil já não tem salvação no seu conjunto." },

    { t: "h2", id: "schnell", text: "Decisão rápida", toc: "Decisão" },
    { t: "table", head: ["Situação", "Recomendação"], rows: [
      ["Crítica isolada e factual, boa média", "Ignorar"],
      ["Experiência negativa genuína e resolúvel", "Responder"],
      ["Falsa / concorrente / sem contacto real", "Pedir remoção"],
      ["Insulto, afirmações incorretas, difamação", "Pedir remoção"],
      ["Múltiplas avaliações negativas, média muito baixa", "Ponderar eliminação do perfil"],
    ] },

    { t: "cta", title: "Não tem a certeza se a sua avaliação pode ser removida?", text: "Introduza o nome da empresa — verificamos gratuitamente em segundos se é possível remover a avaliação ou o perfil, e com que rapidez.", btn: "Iniciar análise gratuita", href: "https://www.rapid-remove.com/", trust: ["Análise gratuita", "Com garantia", "Sem risco"] },

    { t: "p", text: "Este artigo é uma orientação prática e não constitui aconselhamento jurídico." },
  ],
  faq: [
    { q: "Devo responder a todas as avaliações negativas?", a: "Não. A uma crítica genuína e factual compensa dar uma resposta serena (para os outros leitores). As vozes isoladas e inofensivas numa boa média podem ignorar-se; as injustificadas ou ilegais é melhor pedir a remoção." },
    { q: "Quando é possível remover uma avaliação do Google?", a: "Quando viola as políticas do Google ou é ilegal — por exemplo, avaliações falsas, insultos, afirmações incorretas ou ausência de relação comercial. As meras opiniões factuais sobre experiências genuínas são, pelo contrário, dificilmente removíveis." },
    { q: "O que é o efeito Streisand?", a: "Quando uma reação agressiva ou uma ameaça jurídica provoca o autor e desencadeia mais avaliações negativas. Por isso, nunca se deve reagir por impulso — e na remoção escolhem-se vias discretas e técnicas." },
    { q: "E se já existem muitas avaliações negativas?", a: "Nesse caso, lutar por cada uma individualmente é frequentemente uma batalha perdida. Pode ser mais sensato optar pela eliminação completa do perfil seguida de um recomeço limpo." },
  ],
  related: [
    { label: "Quanto custa uma avaliação negativa no Google?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Advogado ou eliminação técnica?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Remover avaliações do Google: custos e métodos", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
