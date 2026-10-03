/* PT — einzelbewertung-loeschen-service (artigo sem original alemão:
   o produto de avaliações individuais não existe na região DACH). Objetivo:
   encomenda de remoções de avaliações individuais através do wizard (?start=reviews). */
const article = {
    category: "Reputação",
    meta: {
      slug: "servico-remover-avaliacoes-google",
      title: "Serviço para remover avaliações do Google: preço, probabilidade de sucesso e encomenda (2026)",
      h1: "Serviço para remover avaliações do Google: preço, probabilidade de sucesso e como encomendar",
      description: "Mande remover uma avaliação injusta do Google – desde 179 € por avaliação, pago só depois de desaparecer. Preços, probabilidades de sucesso, descontos por quantidade e a encomenda em 2 minutos.",
      keywords: ["serviço remover avaliações google", "remover avaliação google", "mandar remover avaliação google", "quanto custa remover avaliação google", "apagar avaliação negativa google", "pagar para remover avaliação google"],
      author: "Maximilian Hölzl",
      authorRole: "Fundador",
      date: "2026-10-03",
    },
    dek: "O seu perfil está bem – o que dói é **uma avaliação**: uma falsa, um insulto, alguém que nunca foi cliente. Para isso não precisa de eliminar o perfil inteiro nem de esperar meses por um advogado. Com a RapidRemove escolhe as avaliações que devem desaparecer, vê o preço de imediato e **paga só pelas avaliações realmente removidas**. Eis quanto custa, quais são as probabilidades de sucesso e como encomendar em dois minutos.",
    blocks: [
      { t: "h2", id: "wann", text: "Quando faz sentido remover uma avaliação individual", toc: "Quando faz sentido" },
      { t: "p", text: "A maioria das empresas não tem um problema de perfil – tem um **problema de avaliações**. Uma média sólida de 4,6 cai para 4,3 por causa de dois ataques de 1 estrela e, de repente, os potenciais clientes clicam na concorrência. Nesta situação, eliminar o perfil inteiro seria exagerado: perderia também todas as avaliações boas." },
      { t: "ul", items: [
        "A **remoção de avaliações individuais** é a opção certa quando o seu perfil está saudável no geral e uma ou poucas avaliações são injustas, falsas ou ofensivas.",
        "A **[remoção do perfil completo](/pt/revista/eliminar-perfil-empresa-google/)** é a opção certa quando o perfil está danificado em toda a linha e quer um verdadeiro recomeço.",
        "**Responder publicamente** é o certo perante críticas honestas de clientes reais – isso é feedback, não um caso de remoção ([quando ignorar, responder ou remover](/pt/revista/avaliacao-negativa-ignorar-responder-remover/)).",
      ] },

      { t: "h2", id: "was", text: "Que avaliações podem ser removidas – e quais não", toc: "O que é removível?" },
      { t: "p", text: "Dizemos-lhe com honestidade antes de pagar o que quer que seja. Há **boas probabilidades** em avaliações que violam as regras do Google ou a lei:" },
      { t: "ul", items: [
        "**Avaliações falsas** e ataques de concorrentes ([como reconhecer avaliações falsas](/pt/revista/remover-avaliacoes-falsas-google/))",
        "Avaliações de pessoas que **nunca foram clientes**",
        "**Insultos**, ataques pessoais e **afirmações de facto falsas**",
        "**Avaliações de 1 estrela sem texto** e sem qualquer contacto de cliente reconhecível ([contexto](/pt/revista/remover-avaliacao-1-estrela-sem-texto/))",
        "Conteúdo fora do tema, spam ou avaliações destinadas a **outra empresa**",
      ] },
      { t: "warn", title: "O que não prometemos", text: "Críticas honestas e objetivas de clientes reais estão normalmente protegidas – e ninguém pode garantir a sério a remoção de qualquer avaliação. É precisamente por isso que **só paga quando uma avaliação desaparece de facto**." },

      { t: "h2", id: "preis", text: "Quanto custa remover uma avaliação do Google", toc: "Preço" },
      { t: "p", text: "O preço depende sobretudo de uma coisa: **a idade da avaliação**. Avaliações recentes são muito mais fáceis de remover do que avaliações que estão online há meses." },
      { t: "table", rrCol: 2, head: ["Idade da avaliação", "Probabilidade de sucesso", "Preço por avaliação removida"], rows: [
        ["Até 4 semanas", "aprox. 90 %", "**179 €**"],
        ["Mais de 4 semanas", "aprox. 50 %", "**229 €** (179 € + 50 €)"],
      ] },
      { t: "p", text: "Se várias avaliações tiverem de sair, o **desconto por quantidade** aplica-se automaticamente:" },
      { t: "table", head: ["Número de avaliações", "Desconto"], rows: [
        ["1 – 2", "–"],
        ["3 – 4", "**−10 %**"],
        ["5 – 9", "**−15 %**"],
        ["10 ou mais", "**−30 %**"],
      ] },
      { t: "p", text: "**Exemplos:** 3 avaliações recentes custam 537 €, menos 10 % = **483 €**. 2 avaliações recentes e 3 mais antigas custam 1.045 €, menos 15 % = **888 €**. O desconto é calculado sobre o número de avaliações efetivamente removidas – nunca paga por uma avaliação que fica." },
      { t: "tip", title: "Encomende cedo", text: "A probabilidade de sucesso desce de cerca de 90 % para cerca de 50 % quando a avaliação tem mais de quatro semanas – e o preço sobe 50 €. Uma avaliação falsa recente é a mais barata e a mais segura de remover. Para comparação: os advogados cobram normalmente por avaliação e **adiantado**, e o processo demora muitas vezes meses ([advogado ou remoção técnica?](/pt/revista/avaliacao-negativa-google-advogado/))." },

      { t: "h2", id: "bestellen", text: "Como encomendar – em cerca de dois minutos", toc: "Como encomendar" },
      { t: "ol", items: [
        "**Pesquise a sua empresa** – introduza o nome da empresa e selecione o seu perfil do Google.",
        "Escolha **«Eliminar avaliações individuais»** – carregamos automaticamente as suas avaliações Google mais recentes.",
        "**Filtre** por 1–3 estrelas (ou mostre todas) e **marque** as avaliações que devem sair. Cada avaliação mostra a sua idade e a probabilidade de sucesso.",
        "A **barra de preço** mostra sempre o total – incluindo o próximo nível de desconto («Mais uma para 10 % de desconto!»).",
        "Confira o resumo e **faça a encomenda**. Nada é cobrado adiantado.",
        "Tratamos da remoção e mantemo-lo informado. **Só paga pelas avaliações realmente removidas.**",
      ] },
      { t: "p", text: "Não encontra uma avaliação na lista? No mesmo passo pode também colar manualmente o link da avaliação." },
      { t: "cta", title: "Selecione as avaliações que devem sair", text: "Pesquise a sua empresa, marque as avaliações – e veja de imediato o preço exato. **Desde 179 € por avaliação removida**, nada adiantado.", btn: "Selecionar avaliações", href: "/pt/verificar-perfil/?start=reviews", trust: ["Nada adiantado", "Pagamento por avaliação removida", "Primeiro uma opinião honesta"] },

      { t: "h2", id: "dauer", text: "Quanto tempo demora?", toc: "Duração" },
      { t: "p", text: "Normalmente **alguns dias**, por vezes até **três semanas**, consoante a avaliação e o motivo da remoção. Entretanto não tem de fazer nada – mantemo-lo informado." },

      { t: "h2", id: "vergleich", text: "Avaliações individuais, perfil completo, advogado ou por conta própria – comparação", toc: "Comparação" },
      { t: "table", rrCol: 1, head: ["Critério", "Remoção de avaliações individuais", "Remoção do perfil", "Advogado", "Denunciar por si mesmo"], rows: [
        ["O que é removido", "Avaliações selecionadas", "Perfil inteiro + todas as avaliações", "Avaliação isolada", "Avaliação isolada"],
        ["As avaliações boas mantêm-se", "Sim", "Não", "Sim", "Sim"],
        ["Duração", "Dias a 3 semanas", "Normalmente 24 – 48 horas", "3 – 9 meses", "Incerta"],
        ["Custo", "Desde 179 €, só se for removida", "Preço fixo, após sucesso", "Por avaliação, adiantado", "Gratuito"],
        ["O seu esforço", "2 minutos", "Mínimo", "Elevado", "Médio"],
      ] },
      { t: "p", text: "Se quiser conhecer primeiro o caminho gratuito: [como denunciar uma avaliação do Google por si mesmo](/pt/revista/como-remover-avaliacao-google/) – e porque é que o Google rejeita muitas vezes as denúncias com uma resposta padrão. E se se pergunta se vale sequer a pena agir: [quanto custa realmente uma avaliação negativa no Google](/pt/revista/quanto-custa-avaliacao-negativa-google/)." },

      { t: "h2", id: "warum", text: "Porquê a RapidRemove", toc: "Porquê nós" },
      { t: "ul", items: [
        "**Especializados desde 2021:** a nossa equipa remove perfis do Google todos os dias há anos – e agora também avaliações individuais.",
        "**Sem risco:** nada adiantado – paga por avaliação removida, não por tentativas.",
        "**Discreto:** o autor da avaliação não fica a saber quem pediu a remoção.",
        "**Avaliação honesta:** se virmos poucas hipóteses para uma avaliação, dizemos-lhe antes de encomendar.",
        "**Uma empresa real:** Simple Solution OG, de Hallein (Salzburgo, Áustria), em colaboração com parceiros e escritórios de advogados.",
      ] },
    ],
    faq: [
      { q: "Quanto custa remover uma avaliação do Google?", a: "179 € por avaliação removida se a avaliação tiver até 4 semanas, 229 € se for mais antiga. A partir de 3 avaliações tem 10 % de desconto, a partir de 5 avaliações 15 % e a partir de 10 avaliações 30 %. Só paga pelas avaliações realmente removidas." },
      { q: "O que acontece se uma avaliação não puder ser removida?", a: "Nesse caso não paga nada por essa avaliação. Não há pagamento adiantado nem taxa por tentativas." },
      { q: "É possível remover avaliações com mais de 4 semanas?", a: "Sim. A probabilidade de sucesso é menor (aprox. 50 % em vez de aprox. 90 %) e o preço é 50 € mais alto por avaliação. Por isso compensa agir depressa perante avaliações falsas recentes." },
      { q: "É possível remover avaliações de 1 estrela sem texto?", a: "Sim, pode selecioná-las como qualquer outra avaliação. Classificações sem palavras e sem contacto de cliente reconhecível têm muitas vezes boas probabilidades." },
      { q: "O autor da avaliação vai saber que fui eu?", a: "Não. O autor da avaliação não fica a saber quem pediu a remoção." },
      { q: "Tenho de eliminar o meu perfil inteiro?", a: "Não. Com a remoção de avaliações individuais, o seu perfil e todas as avaliações boas mantêm-se. Remover o [perfil completo](/pt/revista/eliminar-perfil-empresa-google/) só faz sentido se estiver danificado em toda a linha." },
      { q: "Quantas avaliações posso encomendar de uma vez?", a: "Tantas quantas quiser. O desconto por quantidade aumenta a partir de 3, 5 e 10 avaliações e é aplicado automaticamente." },
    ],
    related: [
      { label: "Remover avaliações do Google: custos e métodos", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
      { label: "Reconhecer, denunciar e remover avaliações falsas do Google", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
      { label: "Remover uma avaliação de 1 estrela sem texto", url: "https://www.rapid-remove.com/1-stern-bewertung-ohne-text-loeschen" },
      { label: "Advogado ou remoção técnica?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    ],
};
export default article;
