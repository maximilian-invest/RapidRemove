/* PT — fake-google-bewertung-melden-loeschen */
const article = {
  category: "Reputação",
  meta: {
    slug: "remover-avaliacoes-falsas-google",
    title: "Reconhecer, denunciar e mandar remover avaliações falsas do Google (guia 2026)",
    h1: "Reconhecer, denunciar e mandar remover avaliações falsas do Google",
    description: "Reconhecer, denunciar e mandar remover avaliações falsas do Google: guia passo a passo, situação jurídica, se as avaliações falsas são puníveis e o que realmente funciona quando o Google não reage.",
    keywords: ["remover avaliação falsa google", "denunciar avaliações falsas google", "reconhecer avaliações falsas google", "avaliações falsas google puníveis", "o que fazer contra avaliações falsas google", "denunciar avaliação falsa google"],
    author: "Matthias Lang",
    authorRole: "Especialista Google",
    date: "2026-06-04",
  },
  dek: "Uma avaliação falsa de 1 estrela de alguém que nunca foi cliente? Não está sozinho. As avaliações falsas são um fenómeno de massa – o prejuízo que causam à economia é estimado em cerca de **3,8 mil milhões de euros por ano**. Neste guia aprende **como reconhecer avaliações falsas, denunciá-las ao Google e – se o Google não reagir – mandá-las remover definitivamente.**",
  blocks: [
    { t: "note", title: "Nota", text: "Este artigo é uma orientação prática e não constitui aconselhamento jurídico. Para uma avaliação jurídica do caso concreto, consulte um advogado." },

    { t: "h2", id: "was-ist", text: "O que é uma avaliação falsa?", toc: "O que é?" },
    { t: "p", text: "Uma avaliação falsa é uma opinião que **não reflete uma experiência real de cliente**. As fontes típicas são concorrentes que querem sabotar a sua reputação, ex-funcionários descontentes, tentativas de extorsão («Pague, senão vem a avaliação de 1 estrela») ou simplesmente confusões com outra empresa. Tais avaliações violam as diretrizes do Google e são, por isso, em princípio contestáveis." },

    { t: "h2", id: "erkennen", text: "Reconhecer avaliações falsas do Google: 7 sinais de alerta", toc: "7 sinais" },
    { t: "p", text: "Antes de agir, documente a avaliação (captura de ecrã com data). Estes indícios apontam para uma falsificação:" },
    { t: "ol", items: [
      "**Sem relação com o serviço** – a avaliação não descreve nada que combine com a sua oferta.",
      "**1 estrela sem texto** – sem fundamentação compreensível.",
      "**Perfil sem histórico** – a conta tem poucas ou apenas avaliações negativas.",
      "**Timing suspeito** – várias avaliações negativas em pouco tempo (ataque coordenado).",
      "**Nenhum cliente localizável** – o nome não aparece em qualquer encomenda ou reserva.",
      "**Conteúdo fora do tema** – publicidade, insultos ou confusões.",
      "**Formulações idênticas** – blocos de texto que surgem em várias empresas.",
    ] },

    { t: "h2", id: "strafbar", text: "As avaliações falsas são puníveis?", toc: "Puníveis?" },
    { t: "p", text: "Afirmações de facto deliberadamente falsas e avaliações forjadas podem ter consequências jurídicas – de pedidos de cessação a indemnizações, e em certos casos também aspetos penais ou de concorrência. O problema na prática: o autor é muitas vezes **anónimo**, e a via judicial contra uma pessoa desconhecida é demorada. Por isso, a alavanca pragmática não costuma ser a queixa-crime, mas a **remoção da avaliação** no próprio Google." },

    { t: "h2", id: "melden", text: "Guia: denunciar uma avaliação falsa ao Google", toc: "Denunciar (guia)" },
    { t: "p", text: "O primeiro passo, gratuito, é a denúncia através do perfil de empresa:" },
    { t: "ol", items: [
      "Abra o seu **perfil de empresa do Google** e vá às avaliações.",
      "Localize a avaliação em questão e clique no **menu de três pontos**.",
      "Escolha **«Denunciar avaliação»**.",
      "Indique a violação adequada (p. ex. «Informação falsa», «fora do tema», «conflito de interesses»).",
      "Envie a denúncia.",
    ] },
    { t: "p", text: "Além disso, através da **ferramenta do Google para gestão de avaliações** pode acompanhar o estado e denunciar várias avaliações em conjunto." },

    { t: "h2", id: "google-reagiert", text: "Quando o Google não reage: e depois?", toc: "Google não reage" },
    { t: "p", text: "Aqui começa a frustração de muitos empresários. O Google analisa as denúncias **maioritariamente de forma automatizada** e rejeita-as frequentemente com textos padrão – mesmo perante falsificações evidentes. Não tem então uma verdadeira via de escalada e volta à estaca zero." },
    { t: "p", text: "Dois caminhos seguem em frente:" },
    { t: "ul", items: [
      "**Via do advogado:** um pedido de remoção juridicamente fundamentado pode ter êxito em avaliações claramente ilícitas – mas demora muitas vezes semanas a meses, é faturado por avaliação e pode provocar no autor «avaliações de vingança» (efeito Streisand).",
      "**Remoção do perfil:** em vez de atacar cada avaliação falsa isoladamente, remove-se todo o perfil – todas as avaliações desaparecem com ele.",
    ] },

    { t: "h2", id: "loeschen", text: "Livrar-se das avaliações falsas – a solução definitiva", toc: "Solução definitiva" },
    { t: "p", text: "Num **ataque coordenado de avaliações falsas** com muitas avaliações, denunciar avaliações isoladas é um jogo do gato e do rato sem saída. Por isso, a RapidRemove segue outro caminho: **com este método não vamos avaliação a avaliação: removemos todo o perfil de empresa do Google.** Todas as avaliações falsas desaparecem com a remoção – começa com um registo limpo." },
    { t: "table", rrCol: 3, head: ["Critério", "Denunciar por si mesmo", "Advogado", "RapidRemove (remoção do perfil)"], rows: [
      ["O que é removido", "avaliação isolada", "avaliação isolada", "perfil inteiro + todas as avaliações"],
      ["Rapidez", "incerto", "3 – 9 meses", "24 – 48 h"],
      ["Sucesso", "raro", "incerto", "garantido"],
      ["Custo", "gratuito", "por avaliação, adiantado", "preço fixo após sucesso"],
      ["Todas as falsas fora", "uma a uma", "casos isolados", "sim (com o perfil)"],
      ["Esforço", "médio", "elevado", "nenhum"],
    ] },
    { t: "p", text: "A vantagem decisiva: só paga **após a remoção bem-sucedida** e, se o perfil reaparecer através de terceiros, é removido gratuitamente ao abrigo da garantia." },
    { t: "warn", title: "Importante", text: "A remoção do perfil retira o **perfil de empresa completo**, não uma avaliação falsa isolada. Se quiser apenas remover uma avaliação e manter o perfil, a denúncia ao Google ou a via do advogado são as opções adequadas." },
    { t: "cta", title: "Ataque de avaliações falsas? Verifique a removibilidade – grátis.", text: "Introduza o nome da empresa – verificamos em segundos se e com que rapidez o seu perfil e todas as avaliações falsas podem ser removidos.", btn: "Verificar removibilidade", href: "https://www.rapid-remove.com/", trust: ["Análise gratuita", "Garantia", "Sem risco"] },
  ],
  faq: [
    { q: "Como reconheço uma avaliação falsa do Google?", a: "Sinais típicos são a falta de relação com o serviço, 1 estrela sem texto, um perfil sem histórico de avaliações, timing suspeito de várias avaliações negativas e conteúdos fora do tema ou ofensivos." },
    { q: "Como denuncio uma avaliação falsa ao Google?", a: "No menu de três pontos junto à avaliação, clique em «Denunciar avaliação», escolha a violação e envie a denúncia. Pode acompanhar o estado pela ferramenta do Google para gestão de avaliações." },
    { q: "As avaliações falsas são puníveis?", a: "Avaliações deliberadamente falsas podem ter consequências cíveis, de concorrência e em parte penais. Na prática, porém, o autor é muitas vezes anónimo, pelo que a remoção da avaliação costuma ser a alavanca mais rápida do que uma queixa. Isto não é aconselhamento jurídico." },
    { q: "O que posso fazer se o Google não remover a avaliação falsa?", a: "Se a denúncia for rejeitada, resta para uma avaliação isolada a via do advogado. Se o perfil está danificado por muitas falsas, a remoção do perfil através da RapidRemove é a via mais fiável: todo o perfil é removido, todas as avaliações desaparecem com ele." },
    { q: "A RapidRemove remove avaliações falsas isoladas?", a: "Sim, entretanto sim: [remover uma avaliação do Google](https://www.rapid-remove.com/pt/remover-uma-avaliacao/) – 179 € por avaliação removida, paga só em caso de sucesso; a avaliação não pode ter mais de 4 semanas e tem de conter texto. Se o perfil está danificado no seu conjunto, remover o perfil completo com todas as avaliações continua a ser o caminho mais completo." },
    { q: "Com que rapidez nos livramos das avaliações falsas?", a: "Pela remoção do perfil, há muitas vezes resultados em 24 a 48 horas – bastante mais rápido do que a via jurídica de vários meses." },
  ],
  related: [
    { label: "Remover avaliações do Google: custos e métodos comparados", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Remover uma avaliação de 1 estrela sem texto", url: "https://www.rapid-remove.com/1-stern-bewertung-ohne-text-loeschen" },
    { label: "Avaliação negativa no Google – o que fazer?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
    { label: "Remover o perfil de empresa do Google: como se faz?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
