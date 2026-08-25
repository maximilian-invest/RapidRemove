/* PT — google-rezension-loeschen-lassen */
const article = {
  category: "Guia",
  meta: {
    slug: "como-remover-avaliacao-google",
    title: "Como remover uma avaliação do Google: formulário, custos e guia (2026)",
    h1: "Como remover uma avaliação do Google: formulário, custos e guia",
    description: "Remover uma avaliação do Google, com ou sem formulário, grátis ou por uma agência? Como remover avaliações próprias e de terceiros, e como ver qual avaliação foi removida.",
    keywords: ["como remover avaliação google", "remover avaliação google formulário", "remover avaliação google custo", "remover avaliação própria google", "remover avaliação google grátis", "apagar uma avaliação google"],
    author: "Matthias Lang",
    authorRole: "Especialista Google",
    date: "2026-06-04",
  },
  dek: "Quer se trate de uma avaliação sua que quer retirar ou de uma de terceiros que prejudica a sua empresa: neste guia descobre **como remover uma avaliação do Google** – grátis com o formulário de denúncia, como empresa com a gestão oficial e, se necessário, de forma permanente com uma agência. Além disso: como perceber se uma avaliação foi mesmo removida.",
  blocks: [
    { t: "note", title: "Nota", text: "Este artigo é um guia prático e não constitui aconselhamento jurídico." },

    { t: "h2", id: "eigene", text: "Remover a sua própria avaliação do Google", toc: "Remover a própria" },
    { t: "p", text: "Uma avaliação que **escreveu por si mesmo** pode removê-la gratuitamente a qualquer momento:" },
    { t: "ol", items: [
      "Abra o Google Maps no computador ou na app e inicie sessão.",
      "Clique no menu e depois em **«As suas contribuições»** ou «Avaliações».",
      "Localize a avaliação, clique no **menu de três pontos** e escolha **«Eliminar avaliação»**.",
      "Confirme a operação.",
    ] },
    { t: "p", text: "Isto só funciona para as **suas** avaliações. As avaliações de terceiros sobre a sua empresa não pode removê-las diretamente, apenas denunciá-las." },

    { t: "h2", id: "formular", text: "Mandar remover uma avaliação de terceiros: o formulário", toc: "O formulário" },
    { t: "p", text: "Se uma avaliação de terceiros prejudica a sua empresa, proceda assim:" },
    { t: "ol", items: [
      "Abra o seu **perfil de empresa do Google** e vá às avaliações.",
      "Junto à avaliação em questão, clique no **menu de três pontos** e depois em **«Denunciar avaliação»**.",
      "No **formulário**, escolha a violação adequada (p. ex. informação falsa, fora do tema, conflito de interesses).",
      "Com a **ferramenta do Google para gestão de avaliações** pode acompanhar o estado e agrupar várias denúncias.",
    ] },
    { t: "p", text: "Importante: a remoção só ocorre se o Google constatar uma **violação das diretrizes**. As simples opiniões sobre experiências reais, em regra, não são removidas." },

    { t: "h2", id: "kosten", text: "Quanto custa mandar remover uma avaliação?", toc: "Quanto custa" },
    { t: "table", head: ["Caminho", "Custo", "Sucesso"], rows: [
      ["Denunciar por si mesmo (formulário)", "gratuito", "muitas vezes baixo"],
      ["Fornecedores baratos", "cerca de 19 – 49 € / avaliação", "muito variável"],
      ["Advogados especializados (avaliação isolada)", "cerca de 100 – 159 € / avaliação", "cerca de 90 %, lento"],
      ["Remoção do perfil (RapidRemove)", "preço fixo, a pagar após sucesso", "garantido (todas as avaliações fora)"],
    ] },

    { t: "h2", id: "kostenlos-vs", text: "Grátis vs. pago: o que oferece o quê?", toc: "Grátis vs. pago" },
    { t: "p", text: "O caminho gratuito com o formulário vale sempre como **primeira tentativa**, sobretudo perante spam evidente. A realidade, porém, é desanimadora: o Google verifica em grande parte de forma automatizada e rejeita muitas denúncias com textos padrão. Em caso de insucesso, uma **remoção profissional** é o passo seguinte. Procure uma **comissão de sucesso** – assim não corre riscos de custos se a remoção não funcionar." },

    { t: "h2", id: "geloescht-sehen", text: "Como vejo que uma avaliação foi removida?", toc: "Foi removida?" },
    { t: "p", text: "Uma avaliação removida desaparece do seu perfil, e a sua **média de avaliação** e o **número de avaliações** ajustam-se. Não lhe é mostrado um estado «removida» direto; o indicador mais fiável é que a avaliação e a sua classificação deixam de estar visíveis e a média muda em conformidade. Documente antes o estado de partida com uma captura de ecrã para ter a comparação antes-depois." },

    { t: "h2", id: "profil-loeschen", text: "Solução permanente: mandar remover todo o perfil", toc: "Remover todo o perfil" },
    { t: "p", text: "Se o formulário não resulta e várias avaliações danificam permanentemente o seu perfil, a **remoção do perfil** é o caminho mais direto. A diferença-chave: a RapidRemove **não remove avaliações isoladas, mas todo o perfil de empresa do Google**; todas as avaliações desaparecem com ele. O resultado é um registo limpo em vez de uma luta por cada estrela." },
    { t: "ul", items: [
      "**24 – 48 horas** em vez de semanas ou meses",
      "**o perfil inteiro, incluindo todas as avaliações**, de uma só vez",
      "**Garantia:** se o perfil reaparecer através de terceiros, é removido gratuitamente",
      "**nenhum esforço** para si, sem risco Streisand",
      "**recomeço opcional** com um perfil limpo",
    ] },
    { t: "warn", title: "Importante", text: "A remoção do perfil retira o **perfil completo**, não uma avaliação isolada. Quem quiser apenas remover uma avaliação e manter o perfil usa a denúncia ou o caminho do advogado." },
    { t: "cta", title: "Perfil permanentemente danificado? Verifique a removibilidade – grátis.", text: "Em segundos vê se e com que rapidez o seu perfil e todas as suas avaliações podem ser removidos.", btn: "Verificar removibilidade", href: "https://www.rapid-remove.com/", trust: ["Análise gratuita", "Garantia", "Sem risco"] },
  ],
  faq: [
    { q: "Posso remover uma avaliação própria do Google?", a: "Sim. No Google Maps abra «As suas contribuições», selecione a avaliação e prima «Eliminar avaliação» no menu de três pontos. É gratuito e possível a qualquer momento." },
    { q: "Existe um formulário para mandar remover uma avaliação do Google?", a: "Sim. Pelo menu de três pontos junto à avaliação chega a «Denunciar avaliação» e, assim, ao formulário de denúncia. Acompanhe o estado com a ferramenta do Google para gestão de avaliações." },
    { q: "Posso remover uma avaliação do Google gratuitamente?", a: "As suas, sim. As de terceiros pode denunciá-las gratuitamente, mas que o Google as remova não é garantido. Para uma remoção segura existem serviços pagos com comissão de sucesso." },
    { q: "Como vejo se a minha avaliação denunciada foi removida?", a: "A avaliação desaparece do perfil e a média e o número de avaliações mudam. Não é mostrado um estado explícito; uma captura de ecrã anterior ajuda a comparar." },
    { q: "Quanto custa remover uma avaliação do Google?", a: "De grátis (denúncia própria) a 19–49 € (serviços baratos) ou 100–159 € por avaliação com um advogado. Na remoção do perfil vale um preço fixo, a pagar após sucesso." },
    { q: "A RapidRemove remove avaliações isoladas?", a: "Sim, entretanto sim: [remover uma avaliação do Google](https://www.rapid-remove.com/pt/remover-uma-avaliacao/) – 179 € por avaliação removida, paga só em caso de sucesso; a avaliação não pode ter mais de 4 semanas e tem de conter texto. Se o perfil está danificado no seu conjunto, remover o perfil completo com todas as avaliações continua a ser o caminho mais completo." },
  ],
  related: [
    { label: "Remover avaliações do Google: custos e métodos", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Denunciar e remover uma avaliação falsa do Google", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Avaliação negativa: advogado ou remoção técnica?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Remover o perfil de empresa do Google: como se faz?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
