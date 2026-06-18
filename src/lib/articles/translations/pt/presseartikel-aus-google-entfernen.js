/* PT — presseartikel-aus-google-entfernen (Remover/desindexar imprensa · pillar) */
const article = {
  category: "Direito",
  meta: {
    slug: "remover-artigos-imprensa-google",
    title: "Remover artigos de imprensa negativos do Google / desindexar",
    h1: "Remover e desindexar artigos de imprensa negativos do Google",
    description:
      "Artigos de imprensa negativos no Google: quando podem ser desindexados ou suprimidos, que direitos (RGPD) são aplicáveis e como agir sem efeito Streisand.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Especialista em Google",
    date: "2026-06-30",
  },
  dek: "Um artigo de imprensa antigo na página 1 — um processo arquivado, um caso há muito resolvido, uma reportagem que nunca deveria ter ficado — persegue muitas vezes empresários durante anos. O próprio artigo raramente pode ser eliminado, mas não tem de estar para sempre no topo do Google. Este guia mostra os caminhos disponíveis: **desindexar** (retirar do índice do Google), **suprimir** ou agir através do **direito a ser esquecido**.",
  blocks: [
    { t: "h2", id: "kurz", text: "O essencial em resumo", toc: "Em resumo" },
    { t: "ul", items: [
      "**Eliminar o artigo não é realista:** conseguir que o meio de comunicação o remova raramente resulta — a liberdade de imprensa protege-o.",
      "**A desindexação é a alavanca:** o artigo pode ser retirado dos resultados de pesquisa do Google sem que o meio o elimine.",
      "**Direito a ser esquecido:** em caso de conteúdos pessoais, desatualizados ou excessivamente prejudiciais, o RGPD pode ser aplicável.",
      "**A discrição conta:** o caminho errado (ameaças, pressão sobre o meio) desencadeia o efeito Streisand e torna tudo pior.",
    ] },

    { t: "h2", id: "unterschied", text: "Eliminar, desindexar, suprimir — a diferença", toc: "A diferença" },
    { t: "p", text: "Três conceitos frequentemente confundidos:" },
    { t: "ul", items: [
      "**Eliminar** significa remover o artigo **no próprio meio de comunicação**. Raramente resulta, porque a liberdade de imprensa e de expressão o protege.",
      "**Desindexar (deindexação)** significa retirar o artigo dos **resultados de pesquisa do Google**. O artigo continua a existir no site do meio, mas deixa de aparecer na pesquisa do Google pelo seu nome.",
      "**Suprimir** significa empurrá-lo para fora da **página 1** com conteúdo positivo mais forte.",
    ] },
    { t: "p", text: "Para a maioria das pessoas afetadas, a desindexação ou supressão é o verdadeiro objetivo: o que não aparece no Google praticamente não existe para a maioria das pessoas." },

    { t: "h2", id: "wann", text: "Quando é possível desindexar um artigo de imprensa", toc: "Quando é possível" },
    { t: "p", text: "As possibilidades dependem do conteúdo. Bons pontos de partida são, entre outros:" },
    { t: "ul", items: [
      "**Informações desatualizadas** — por exemplo, uma reportagem sobre um processo há muito arquivado ou resolvido a favor do visado.",
      "**Dados pessoais** cuja exibição continuada seja desproporcionalmente prejudicial (base: **direito a ser esquecido**, Art. 17 do RGPD).",
      "**Afirmações factualmente incorretas** ou violações de direitos de personalidade.",
    ] },
    { t: "p", text: "A reportagem puramente legítima sobre acontecimentos atuais, verdadeiros e de relevância pública é, pelo contrário, dificilmente desindexável — aqui fica a supressão." },

    { t: "h2", id: "recht", text: "O direito a ser esquecido", toc: "Direito a ser esquecido" },
    { t: "p", text: "O Tribunal de Justiça da União Europeia deixou claro que os motores de busca devem, em determinadas condições, remover resultados relativos a uma pessoa de pesquisas pelo seu nome, quando o interesse em ser esquecido supera o interesse público na informação. São determinantes, entre outros fatores, a antiguidade e atualidade da informação, a sua correção e o papel da pessoa na esfera pública. Esta é a alavanca jurídica com que se podem retirar resultados pessoais da pesquisa do Google — sem que o meio tenha de eliminar o artigo. O fundamento é o **RGPD Art. 17**, aplicável em toda a UE." },

    { t: "h2", id: "streisand", text: "O caminho errado: o efeito Streisand", toc: "Efeito Streisand" },
    { t: "p", text: "Quem pressiona publicamente um meio de comunicação ou envia cartas de advogado com ameaças arrisca o efeito contrário: ainda mais atenção, novas reportagens, capturas de ecrã partilhadas. Este fenómeno chama-se **efeito Streisand**. Por isso, uma desindexação séria funciona de forma **silenciosa** — através dos procedimentos previstos junto do Google e, quando necessário, com fundamento jurídico sólido, em vez de confronto." },

    { t: "h2", id: "vorgehen", text: "Como proceder", toc: "Como proceder" },
    { t: "ol", items: [
      "**Identificar os resultados:** que artigos aparecem na pesquisa do Google pelo seu nome / empresa?",
      "**Classificar:** desatualizado, pessoal, incorreto → desindexação possível. Atual, verdadeiro, de relevância pública → preferencialmente suprimir.",
      "**Solicitar a desindexação** e/ou fazer uma análise jurídica.",
      "**Suprimir em paralelo:** fortalecer o conteúdo positivo, para que a página 1 fique limpa de forma duradoura.",
    ] },
    { t: "p", text: "O serviço correspondente encontra-o em [desindexar imprensa](/pt/desindexar-imprensa/); para resultados não desindexáveis aplica-se a [supressão da página 1](/pt/revista/remover-resultados-google-negativos/)." },

    { t: "cta", title: "Que artigo o prejudica — e pode ser desindexado?", text: "Indique o resultado — verificamos gratuitamente e sem compromisso se é possível a desindexação ou supressão.", btn: "Verificar gratuitamente", href: "https://www.rapid-remove.com/", trust: ["Análise gratuita", "Discrição total", "Sem risco"] },

    { t: "p", text: "Este artigo é uma orientação prática e não constitui aconselhamento jurídico." },
  ],
  faq: [
    { q: "É possível eliminar um artigo de imprensa do Google?", a: "Eliminar o artigo no próprio meio raramente resulta devido à liberdade de imprensa. O que frequentemente é possível é a desindexação dos resultados de pesquisa do Google — o artigo continua online, mas deixa de aparecer na pesquisa pelo nome." },
    { q: "Qual é a diferença entre eliminar e desindexar?", a: "Eliminar remove o artigo na fonte (no site do meio). A desindexação remove-o apenas do índice do Google — para a maioria das pessoas, torna-o praticamente invisível." },
    { q: "O que é o direito a ser esquecido?", a: "Um direito decorrente do RGPD (Art. 17) com o qual dados pessoais, desatualizados ou excessivamente prejudiciais podem ser removidos da pesquisa do Google pelo nome, em determinadas circunstâncias." },
    { q: "Como evito que tudo piore?", a: "Não exercendo pressão pública sobre o meio de comunicação. Uma desindexação discreta, realizada através dos procedimentos oficiais, evita o efeito Streisand." },
  ],
  related: [
    { label: "Gestão de reputação online para empresas — o guia", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
    { label: "Remover ou suprimir resultados negativos do Google", url: "https://www.rapid-remove.com/negative-google-suchergebnisse-verdraengen" },
    { label: "Eliminar perfil de empresa do Google", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
