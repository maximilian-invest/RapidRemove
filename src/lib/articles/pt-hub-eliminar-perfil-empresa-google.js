/* PT hub: "Eliminar perfil de empresa do Google" (lead article, MagArticle format)

   SEO-Ausbau 21.10.2026 nach EN-Muster (en-hub-delete-google-business-profile):
   Kurzantwort, Googles offizielle Schritte (Menübezeichnungen laut Google-Hilfe
   answer/4669092, hl=pt und hl=pt-BR), Vergleichstabelle, eigene Abschnitte je
   Suchintention (o que acontece / começar de novo / Google Maps / sem opção de
   eliminar) + erweiterte FAQ. Variante: pt-PT, BR-Suchbegriffe („excluir",
   „Google Meu Negócio", BR-Menünamen) eingebaut. Herkunft ans Ende verschoben.
   KERNBOTSCHAFT: „encerrado permanentemente" bzw. „aus dem Konto entfernen" ist
   kein Löschen — Profil und alle Bewertungen bleiben öffentlich; die vollständige
   Entfernung läuft über die von Google vorgesehenen Verfahren (RapidRemove). */
const article = {
  meta: {
    slug: "eliminar-perfil-empresa-google",
    title: "Eliminar perfil de empresa do Google: 4 opções (2026)",
    h1: "Como eliminar (ou excluir) o perfil de empresa do Google de vez",
    description:
      "Os passos do Google só removem o seu acesso – a ficha e as avaliações ficam no Maps. O que faz cada uma das 4 opções e como eliminar o perfil de vez.",
    author: "Maximilian Hölzl",
    authorRole: "Especialista Google e fundador",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "eliminar perfil de empresa google",
      "excluir perfil da empresa no google",
      "excluir google meu negócio",
      "remover empresa do google maps",
      "apagar empresa do google",
      "remover perfil de empresa google",
      "eliminar google meu negócio",
      "eliminar perfil de empresa google definitivamente",
    ],
  },
  category: "Políticas do Google",
  iconKey: "trash",
  readingMin: 14,
  dek: "«Encerrado permanentemente» não é o mesmo que eliminado — e remover o perfil da sua conta também não: a ficha, o nome, a morada e todas as avaliações continuam visíveis no Google. Este guia mostra as opções oficiais do Google, o que cada uma faz realmente e o que funciona para eliminar um perfil de empresa do Google por completo.",
  blocks: [
    { t: "note", title: "Nota", text: "Este guia é uma visão geral prática e não constitui aconselhamento jurídico. Para uma avaliação vinculativa do seu caso, consulte um profissional qualificado." },

    { t: "lead", text: "Quer **eliminar o perfil de empresa do Google** — ou, como se diz no Brasil, **excluir o perfil da empresa no Google** (o antigo «Google Meu Negócio»)? Encontrou uma ficha cheia de avaliações falsas ou de vingança, com dados errados, ou simplesmente quer sair de vez. A resposta honesta é mais complicada do que o Google faz crer. Este guia mostra o que cada opção faz realmente — passo a passo, sem rodeios." },

    { t: "tip", title: "Resposta curta", text: "Não é possível simplesmente apagar uma empresa do Google. Como proprietário, o Google só lhe permite **remover o perfil da sua conta** (Definições do Perfil de empresa → Remover Perfil de empresa) ou **marcar a empresa como encerrada permanentemente**. Em ambos os casos, a ficha pública e **todas as avaliações continuam na Pesquisa Google e no Google Maps**. A remoção completa da ficha — incluindo todas as avaliações — só é possível através dos procedimentos oficiais que o Google disponibiliza. É exatamente isso que a RapidRemove trata por si, em nome do proprietário, com pagamento só após a remoção com sucesso." },

    { t: "h2", id: "why", text: "Porque é que não existe um botão simples para eliminar", toc: "Sem botão de eliminar" },
    { t: "p", text: "Quem pesquisa como eliminar um perfil de empresa do Google bate rapidamente numa parede. Pode marcar a empresa como **«encerrada permanentemente»** ou removê-la da sua própria conta — mas um botão claro que diga **«eliminar esta ficha e todas as avaliações»** simplesmente não existe para os proprietários. Não é um esquecimento: o Google considera o perfil e as suas avaliações informação útil para quem pesquisa e mantém o controlo do seu lado. O perfil descreve um local real no mundo — por isso, na lógica do Google, não lhe pertence a si, mesmo que seja você a geri-lo." },
    { t: "p", text: "O Google separa ainda rigorosamente a sua **Conta Google** pessoal do **Perfil de empresa** público (antes «Google O Meu Negócio» / «Google Meu Negócio»). Pode reivindicar a titularidade e editar dados — mas apagar o registo público não está previsto na interface normal." },
    { t: "warn", title: "«Encerrado permanentemente» ≠ eliminado", text: "Marcar a empresa como encerrada **não** a remove. A ficha, o nome, a morada, as fotos e **todas as avaliações continuam publicamente visíveis** na Pesquisa Google e no Google Maps — agora com o rótulo «Encerrado permanentemente» por cima. Para potenciais clientes, isso muitas vezes parece *pior* do que antes." },

    { t: "h2", id: "official-steps", text: "Como eliminar o perfil de empresa do Google: os passos oficiais", toc: "Passos oficiais" },
    { t: "p", text: "Na terminologia do próprio Google, a opção para proprietários chama-se **«Remover Perfil de empresa»** (no Brasil: **«Remover o Perfil da Empresa»**). Ela existe — mas remove o perfil da *sua conta*, não a ficha do Google. Eis como funciona, para saber exatamente o que está (e o que não está) a fazer." },
    { t: "h3", text: "No computador" },
    { t: "ol", items: [
      "Aceda a business.google.com (ou pesquise o nome da sua empresa) e inicie sessão com a Conta Google associada ao Perfil de empresa.",
      "Selecione **Mais** → **Definições do Perfil de empresa** (no Brasil: *Configurações do Perfil da Empresa*).",
      "Escolha **Remover Perfil de empresa** → **Remover gestores e conteúdo do perfil** (no Brasil: *Remover o Perfil da Empresa* → *Remover gerentes e conteúdo do perfil*).",
      "Opcional: assinale **«Marcar a sua empresa como encerrada permanentemente»** (no Brasil: *«Marcar sua empresa como permanentemente fechada»*).",
      "Confirme com **Continuar** → **Remover** → **Concluído**.",
    ] },
    { t: "h3", text: "Na aplicação Google Maps" },
    { t: "p", text: "Abra a aplicação Google Maps com a conta de proprietário, vá ao seu Perfil de empresa (separador **Empresa**) e escolha **Mais** → **Definições do Perfil de empresa** → **Remover Perfil de empresa**. Os nomes dos menus podem variar ligeiramente consoante a versão da aplicação — o resultado é o mesmo que no computador." },
    { t: "h3", text: "Vários perfis de uma só vez" },
    { t: "p", text: "Se gere vários estabelecimentos, abra o **Gestor de Perfis de empresas** (no Brasil: *Gerenciador de Perfis de Empresas*), selecione os perfis e escolha, no canto superior direito, **Ações** → **Remover empresas** → **Remover**. Se surgir um erro, o Google indica que tem de remover os gestores e o conteúdo de cada perfil individualmente." },
    { t: "warn", title: "O que o próprio Google diz que acontece a seguir", text: "Segundo as páginas de ajuda do Google, **as avaliações e o conteúdo gerado por utilizadores permanecem**, e a empresa **pode continuar a aparecer na Pesquisa e no Maps**. Só o *seu* conteúdo é eliminado: publicações, fotos, vídeos e respostas a avaliações dos proprietários e gestores. Só o **proprietário principal** pode fazê-lo, e novos proprietários e gestores têm de aguardar **7 dias**. Em resumo: a opção oficial termina a *sua* gestão do perfil — não elimina o perfil." },

    { t: "h2", id: "options", text: "Eliminar, encerrar, remover ou excluir: o que cada opção faz realmente", toc: "Todas as opções comparadas" },
    { t: "p", text: "Pesquisa-se «excluir Google Meu Negócio», «apagar empresa do Google», «fechar empresa no Google» ou «remover empresa do Google Maps» — mas, do lado do Google, são ações muito diferentes. Eis o que cada uma faz à ficha pública e às avaliações:" },
    { t: "table", head: ["Opção", "O que faz", "A ficha continua visível?", "As avaliações continuam visíveis?"], rows: [
      ["Remover Perfil de empresa (da sua conta)", "Termina a gestão; apaga publicações, fotos e respostas dos proprietários", "Sim, agora sem gestão", "Sim"],
      ["Marcar como encerrado permanentemente", "Coloca o rótulo «Encerrado permanentemente» na ficha", "Sim, com o rótulo «Encerrado»", "Sim"],
      ["Remover-se como gestor / sair do perfil", "Só retira o seu acesso; o restante conteúdo mantém-se", "Sim, inalterada", "Sim"],
      ["Eliminar a sua Conta Google", "Apaga a conta pessoal; o perfil fica sem dono", "Sim, como perfil não reivindicado", "Sim"],
      ["Sugerir uma edição → «Fechar ou remover» (qualquer pessoa)", "Pede ao Google que feche ou remova o local; o Google decide", "Normalmente sim – muitas vezes recusado", "Sim, salvo se a ficha for removida"],
      ["Remoção completa (RapidRemove)", "Remove a ficha através dos procedimentos oficiais do Google, em nome do proprietário", "Não – desaparece da Pesquisa e do Maps", "Não – todas desaparecem com ela"],
    ] },
    { t: "p", text: "Mais uma fonte de confusão: **Google Meu Negócio** (em Portugal, «Google O Meu Negócio») é simplesmente o nome antigo do **Perfil de Empresa do Google**. Quer lhe chame conta, página, ficha ou perfil da empresa no Google — é o mesmo registo, e aplicam-se as mesmas regras." },

    { t: "h2", id: "what-happens", text: "O que acontece se eliminar o perfil de empresa do Google?", toc: "O que acontece depois" },
    { t: "p", text: "Muitos proprietários esperam que a ficha desapareça assim que a removem da conta. Eis o que acontece de facto:" },
    { t: "ul", items: [
      "**O seu acesso termina:** você e todos os gestores perdem o controlo do perfil. Para o voltar a gerir, é preciso reivindicá-lo e validá-lo de novo.",
      "**O seu conteúdo desaparece:** publicações, fotos e vídeos que carregou e as suas respostas a avaliações são eliminados definitivamente e não podem ser recuperados.",
      "**A ficha fica:** nome, morada, categoria e horário continuam, em regra, visíveis na Pesquisa Google e no Google Maps.",
      "**As avaliações ficam:** todas as avaliações de clientes — incluindo as falsas ou injustas — continuam públicas, agora **sem as suas respostas** ao lado.",
      "**Qualquer pessoa pode editá-la:** um perfil sem gestão pode ser alterado por utilizadores e pelo próprio Google, e você deixa de ser notificado.",
    ] },
    { t: "p", text: "E se marcar «encerrado permanentemente»? Segundo o Google, a empresa não desaparece de imediato do Maps — vai saindo gradualmente dos resultados de pesquisa. Não há prazo para isso, e até lá a ficha continua a ser encontrada pelo nome, com todas as avaliações e o rótulo «Encerrado». É por isso que remover o perfil da conta muitas vezes piora a situação: as avaliações negativas continuam lá, mas a sua versão dos factos desapareceu." },

    { t: "h2", id: "start-over", text: "Posso excluir o perfil da empresa no Google e começar de novo?", toc: "Começar com um perfil novo" },
    { t: "p", text: "Não simplesmente criando um novo. Se a ficha antiga ainda existe — e depois de «Remover Perfil de empresa» existe — o Google vê um **segundo perfil para a mesma empresa na mesma morada**. Os duplicados são normalmente fundidos de volta na ficha antiga (avaliações incluídas) ou o perfil novo é suspenso. De uma forma ou de outra, as avaliações antigas voltam a persegui-lo." },
    { t: "p", text: "Um verdadeiro recomeço funciona em dois passos: primeiro, o **perfil antigo é removido por completo**, incluindo todas as avaliações; depois, se quiser, cria e valida um **perfil novo e limpo**. A RapidRemove trata do primeiro passo — preço fixo, pago só após o sucesso — e o seu site e o seu posicionamento na pesquisa ficam intocados." },

    { t: "h2", id: "google-maps", text: "Como remover uma empresa do Google Maps", toc: "Remover do Google Maps" },
    { t: "p", text: "No Google Maps, qualquer pessoa — proprietária ou não — pode pedir ao Google que feche ou remova um local:" },
    { t: "ol", items: [
      "Abra o local no Google Maps ou na Pesquisa Google.",
      "Escolha **Sugerir uma edição** (no Brasil: *Sugerir uma alteração*) → **Fechar ou remover**.",
      "Indique um motivo, por exemplo encerrado permanentemente, não existe, duplicado ou spam.",
      "Envie — o Google analisa a sugestão e decide por si.",
    ] },
    { t: "p", text: "Em empresas reais e existentes, estas sugestões são normalmente recusadas ou convertidas num rótulo «Encerrado permanentemente» — a ficha e as avaliações ficam. Mais sobre fichas próprias, de terceiros e duplicadas: [remover uma ficha do Google Maps](/pt/revista/remover-ficha-google-maps/)." },

    { t: "h2", id: "no-delete-option", text: "Porque é que não aparece a opção de eliminar", toc: "Sem opção de eliminar?" },
    { t: "p", text: "Se «Remover Perfil de empresa» não aparece nas suas definições, é quase sempre por um destes motivos:" },
    { t: "ul", items: [
      "**É gestor, não proprietário principal.** Só o proprietário principal pode remover gestores e conteúdo do perfil.",
      "**Tornou-se proprietário há pouco tempo.** Novos proprietários e gestores têm de aguardar 7 dias até a opção ficar disponível.",
      "**O perfil não está validado nem reivindicado por si.** Nesse caso não pertence a ninguém — ou pertence a outra Conta Google.",
      "**Tem sessão iniciada com a Conta Google errada.** Muitas empresas têm várias; verifique qual é a dona do perfil.",
    ] },
    { t: "p", text: "E mesmo que encontre o botão, lembre-se do resultado: remove o perfil da sua conta, não do Google." },

    { t: "h2", id: "how", text: "Como funciona realmente a remoção completa do perfil", toc: "Como funciona a remoção" },
    { t: "p", text: "A única forma fiável de fazer desaparecer um perfil e as suas avaliações é a **remoção completa do Perfil de empresa** através dos procedimentos oficiais que o Google disponibiliza — e não apagar avaliações uma a uma. Quando o perfil inteiro é removido, **todas as avaliações desaparecem com ele**, incluindo as falsas. É a diferença entre combater sintomas e eliminar a causa." },
    { t: "p", text: "É exatamente isto que a RapidRemove faz, em nome do proprietário. As principais vantagens:" },
    { t: "ul", items: [
      "**Rapidez:** remoção do perfil, em regra, em 24 a 48 horas, em vez de meses",
      "**Completa:** o perfil inteiro, incluindo **todas** as avaliações, de uma só vez",
      "**Previsível:** preço fixo, pago **só após a remoção com sucesso** — sem honorários à hora em aberto",
      "**Sem tocar na sua conta:** a sua Conta Google, o Gmail e eventuais contas Google Ads ficam intocados",
      "**Amigo do SEO:** o seu site e o seu posicionamento mantêm-se; um perfil novo e limpo é opcional",
      "**Discreta:** sem contacto com os autores das avaliações, sem risco de efeito Streisand",
    ] },
    { t: "h3", text: "O processo em três passos" },
    { t: "ol", items: [
      "**Verificação gratuita:** introduza o nome da empresa. Encontramos o seu perfil e verificamos imediatamente se a eliminação é possível — sem compromisso e sem custo.",
      "**Confirmar e autorizar:** confirma o perfil correto e concede-nos autorização para agir em seu nome. Sem acesso ao Gmail, Ads ou dados pessoais.",
      "**Remoção em 24–48 horas:** tratamos da remoção do perfil com todas as avaliações através dos procedimentos oficiais do Google. O pagamento só é feito depois.",
    ] },
    { t: "p", text: "Reconhece um fornecedor sério pelo facto de indicar uma empresa real com morada e número de identificação fiscal, falar de forma transparente sobre o método e **só cobrar após o sucesso** — e não por promessas vagas de «acessos secretos ao Google»." },
    { t: "warn", title: "Importante", text: "A remoção completa elimina o **perfil inteiro**, não uma avaliação isolada. Se só quer ver desaparecer uma ou poucas avaliações e manter o perfil, a RapidRemove também oferece a [remoção de avaliações individuais](/pt/remover-uma-avaliacao/): a partir de 179 € por avaliação removida (com texto e até 4 semanas; as restantes 250 €), cobrados só após a remoção." },

    { t: "cta", title: "Prefere verificar diretamente se o seu perfil pode ser eliminado?", text: "Introduza o nome da sua empresa — encontramos o seu perfil real do Google e verificamos em segundos se e com que rapidez pode ser removido. Sem compromisso e sem custo.", btn: "Iniciar verificação gratuita", href: "/pt/?start=1", trust: ["Análise gratuita", "Pagamento só após a remoção"] },

    { t: "h2", id: "single-vs-profile", text: "Eliminar avaliações individuais ou remover o perfil completo?", toc: "Avaliações ou perfil?" },
    { t: "p", text: "Muitos começam por tentar [denunciar](/pt/revista/remover-avaliacoes-falsas-google/) avaliações negativas individuais ao Google. É trabalhoso e incerto: o Google recusa frequentemente as denúncias, cada avaliação tem de ser justificada separadamente — e por cada avaliação removida surgem rapidamente novas. Está a combater sintomas." },
    { t: "p", text: "A abordagem sustentável atua na raiz: **se o perfil completo for removido, todas as avaliações desaparecem de uma só vez** — incluindo avaliações falsas. Se, pelo contrário, o seu perfil estiver saudável no geral e o problema forem apenas uma ou poucas avaliações, não precisa de o fazer sozinho: com a [remoção de avaliações individuais](/pt/remover-uma-avaliacao/) assinala as avaliações que devem sair e paga só pelas que forem efetivamente removidas ([preços e probabilidades de sucesso em detalhe](/pt/revista/servico-remover-avaliacoes-google/)). Quem quiser primeiro [remover avaliações do Google](/pt/revista/remover-avaliacoes-google/) individualmente encontrará aí os métodos e os custos comparados." },
    { t: "tip", title: "A vantagem decisiva", text: "Um perfil removido não pode exibir nem avaliações antigas nem novas. O problema não fica adiado — fica resolvido." },

    { t: "h2", id: "cost", text: "Quanto tempo demora — e quanto custa?", toc: "Tempo e custo" },
    { t: "p", text: "Uma remoção profissional fica concluída em regra **dentro de 24 a 48 horas** — em vez dos meses que o caminho do advogado consome. Quanto aos custos: um advogado cobra por hora (muitas vezes 300 € e mais) sem certeza de resultado — e não raramente desencadeia o [efeito Streisand](/pt/revista/avaliacao-negativa-google-advogado/), em que a atenção aumenta precisamente por causa da tentativa de remoção. A RapidRemove trabalha com um **preço fixo transparente a partir de 450 €** — e só paga **após a eliminação com sucesso**." },
    { t: "table", rrCol: 3, head: ["Critério", "Por conta própria (DIY)", "Advogado", "RapidRemove"], rows: [
      ["Eliminação completa possível?", "Praticamente não", "Incerto", "Sim"],
      ["Duração", "—", "3–9 meses", "24–48 horas"],
      ["Custo", "—", "300 €+ / hora", "Preço fixo a partir de 450 €"],
      ["Todas as avaliações removidas", "Não", "Uma a uma, com esforço", "Todas de uma vez"],
      ["Pagamento", "—", "Por hora, independentemente do resultado", "Só após a remoção com sucesso"],
      ["O seu esforço", "Elevado", "Elevado", "Praticamente nulo"],
    ] },
    { t: "p", text: "O preço parece elevado? Faça as contas: uma única avaliação falsa visível pode baixar significativamente a taxa de cliques e custar-lhe muito mais ao longo de vários meses." },

    { t: "h2", id: "herkunft", text: "Afinal, quem criou este perfil?", toc: "Quem criou o perfil?" },
    { t: "p", text: "A maioria dos empresários que nos contacta nunca criou o seu perfil — e fica sinceramente surpreendida por ele existir. Não é a exceção, é a regra. Um perfil de empresa do Google raramente é criado ativamente pelo proprietário. Muito mais frequentemente é outra pessoa que o adiciona, ou é o Google que o gera de forma totalmente automática. Para perceber por que motivo uma ficha destas é tão difícil de eliminar depois, convém saber primeiro como é que ela ali foi parar. Há, no essencial, três caminhos." },
    { t: "anim", caption: "Três formas como um perfil de empresa nasce — quase sempre sem qualquer ação do proprietário." },
    { t: "h3", text: "Caminho 1: alguém adiciona o local à mão" },
    { t: "p", text: "Qualquer utilizador do Google pode, na aplicação Maps, tocar num endereço ou num espaço vazio e escolher «Adicionar um local em falta». Assim, é possível inscrever uma empresa sem ter nada a ver com ela — fazem-no clientes, ex-funcionários, concorrentes ou utilizadores muito ativos do Maps (os Local Guides)." },
    { t: "p", text: "Mas não acontece totalmente sem verificação. Antes de um local comunicado ficar visível, corre em segundo plano uma verificação automática:" },
    { t: "ul", items: [
      "**Localização:** o utilizador está mesmo perto do local que quer adicionar? Isto impede que alguém em Berlim invente, por brincadeira, um café em Munique.",
      "**Verificação de duplicados:** já existe um nome semelhante ou a mesma categoria naquela coordenada ou mesmo ao lado?",
      "**Cruzamento com a web:** o Google pesquisa o nome em paralelo para ver se a empresa aparece em algum lado online.",
    ] },
    { t: "p", text: "Se o conjunto for coerente, o ponto é publicado — visível para todos como **perfil não reivindicado**." },
    { t: "h3", text: "Caminho 2: o Google cria o perfil a partir de dados da web" },
    { t: "p", text: "É o caminho em que menos se pensa: o Google cria perfis em grande número por iniciativa própria — sem a intervenção nem o consentimento do proprietário. A razão é simples: o Google quer mapear o mundo real da forma mais completa possível e não espera que uma nova empresa se apresente." },
    { t: "p", text: "Para isso, os rastreadores do Google percorrem continuamente a web em busca dos chamados **dados NAP** — nome, morada, telefone (*Name, Address, Phone*). A partir destes fragmentos, o sistema monta um perfil, despoletado por exemplo por:" },
    { t: "ul", items: [
      "**Dados estruturados no site:** se o site de uma empresa inclui no código a marcação padronizada `LocalBusiness` (informação legível por máquina segundo o Schema.org — o padrão internacional para dados estruturados na web), o Google lê a morada, o telefone e o horário de forma direta e limpa.",
      "**Pegadas digitais na web:** o Google combina informação de páginas de Facebook, perfis de Instagram, menções em meios locais e entradas em listas telefónicas online.",
      "**Verificação de coerência:** quando a mesma empresa, com a mesma morada, aparece várias vezes de forma coincidente — no próprio site, no Facebook e num blogue local — o Google cria automaticamente uma nova ficha no Maps.",
    ] },
    { t: "p", text: "A maioria dos proprietários só dá por isso quando, de repente, vê no mapa o botão «Reivindicar esta empresa»." },
    { t: "h3", text: "Caminho 3: importação em massa a partir de registos oficiais" },
    { t: "p", text: "O terceiro caminho é muitas vezes subestimado: o Google integra dados em grande escala, a partir de fontes oficiais e de agregadores de dados com quem tem acordos." },
    { t: "ul", items: [
      "**Registos comerciais:** assim que uma empresa é registada na entidade competente ou no registo comercial, esses dados chegam ao Google em intervalos regulares — normalmente através de bases de dados intermediárias.",
      "**Listas profissionais:** o Google confronta os seus mapas com as Páginas Amarelas e as listas telefónicas de cada país. Uma nova entrada aí pode despoletar automaticamente um novo ponto no Maps.",
    ] },
    { t: "p", text: "É assim que um perfil pode surgir pouco depois de registar a sua empresa — sem que alguma vez tenha ido ao Google." },
    { t: "p", text: "**Porque é que isto importa:** independentemente de como o perfil surgiu, a consequência é a mesma: assim que existe, recolhe avaliações e aparece na Pesquisa e no Maps. Não precisa de o ter criado nem de o gerir para ser afetado — e é precisamente por isso que ignorá-lo não chega. É preciso removê-lo ativamente." },

    { t: "cta", title: "Verifique agora gratuitamente se o seu perfil pode ser eliminado", text: "Em poucos segundos vê o seu perfil real e fica a saber se e com que rapidez o podemos remover. Sem pré-pagamento, sem compromisso.", btn: "Iniciar verificação gratuita", href: "/pt/?start=1", trust: ["Análise gratuita", "Pagamento só após a remoção"] },
  ],
  faq: [
    { q: "Como eliminar o perfil de empresa do Google?", a: "No seu Perfil de empresa, escolha Mais → Definições do Perfil de empresa → Remover Perfil de empresa → Remover gestores e conteúdo do perfil, e confirme com Continuar → Remover → Concluído. Isto termina a sua gestão e apaga as suas publicações, fotos e respostas — mas a ficha pública e as avaliações ficam, em regra, no Google. Para eliminar a própria ficha, é preciso removê-la através dos procedimentos oficiais do Google." },
    { q: "Como excluir o perfil da empresa no Google (Google Meu Negócio)?", a: "No Brasil, os menus chamam-se Mais → Configurações do Perfil da Empresa → Remover o Perfil da Empresa → Remover gerentes e conteúdo do perfil. O resultado é o mesmo: você perde o acesso, mas a empresa e as avaliações continuam visíveis na Pesquisa e no Maps. Google Meu Negócio é apenas o nome antigo do Perfil da Empresa no Google." },
    { q: "Posso eliminar o meu perfil de empresa do Google por conta própria?", a: "Apenas de forma limitada. Pode marcá-lo como «encerrado permanentemente» ou removê-lo da sua conta, mas nenhuma das opções elimina a ficha pública — ela continua na Pesquisa e no Maps com todas as avaliações. A remoção completa passa pelos procedimentos oficiais do Google." },
    { q: "«Encerrado permanentemente» é o mesmo que eliminado?", a: "Não. A ficha, o nome, a morada e todas as avaliações continuam públicos; apenas é acrescentado o rótulo «Encerrado permanentemente». Segundo o Google, a empresa vai saindo dos resultados de forma gradual, sem prazo definido — até lá, muitas vezes parece pior do que antes." },
    { q: "O que acontece se eu eliminar o perfil de empresa do Google?", a: "Perde o acesso, e as suas publicações, fotos e respostas a avaliações são eliminadas. A ficha em si, as avaliações e os dados continuam, em regra, visíveis na Pesquisa Google e no Maps — e qualquer pessoa pode sugerir alterações." },
    { q: "Posso apagar o perfil e criar um novo do zero?", a: "Só se o perfil antigo for removido por completo primeiro. Um perfil novo para a mesma empresa na mesma morada é tratado como duplicado e normalmente é fundido de volta no antigo — avaliações incluídas — ou suspenso." },
    { q: "Como remover uma empresa do Google Maps?", a: "Qualquer pessoa pode escolher «Sugerir uma edição» (no Brasil: «Sugerir uma alteração») → «Fechar ou remover» no local do Google Maps. O Google decide por si e, em empresas reais, normalmente mantém a ficha ou só a marca como encerrada. A remoção completa da ficha e das avaliações passa pelos procedimentos oficiais do Google." },
    { q: "Porque é que não vejo a opção de eliminar ou excluir o perfil?", a: "Normalmente porque é gestor e não proprietário principal, porque se tornou proprietário há menos de 7 dias, porque o perfil não está validado na sua conta ou porque tem sessão iniciada noutra Conta Google." },
    { q: "Google Meu Negócio e Perfil de Empresa do Google são a mesma coisa?", a: "Sim. Google Meu Negócio (em Portugal, «Google O Meu Negócio») é o nome antigo do Perfil de Empresa do Google. Conta, página, ficha ou perfil da empresa no Google referem-se todos ao mesmo registo." },
    { q: "Como apagar uma empresa do Google que eu nunca criei?", a: "Muitos perfis são adicionados por terceiros ou criados automaticamente pelo Google a partir de dados da web e de registos oficiais. Como proprietário da empresa, pode reivindicar o perfil — mas mesmo assim só o consegue remover da sua conta. A remoção completa da ficha é feita através dos procedimentos oficiais do Google, em nome do proprietário." },
    { q: "As avaliações também são todas removidas?", a: "Sim, na remoção completa. Se o perfil de empresa inteiro for removido, todas as avaliações associadas desaparecem de uma só vez — incluindo avaliações falsas e de vingança." },
    { q: "Quanto tempo demora a eliminação?", a: "Em regra, o perfil é removido em 24 a 48 horas. Pode acompanhar o estado a qualquer momento no portal do cliente." },
    { q: "A minha Conta Google, o meu site ou o Google Ads são afetados?", a: "Não. A remoção é feita através dos procedimentos que o Google disponibiliza, em nome do proprietário, e incide exclusivamente sobre o Perfil de empresa (Google Maps). A sua Conta Google, o Gmail, o seu site, o seu posicionamento e as suas campanhas mantêm-se inalterados." },
    { q: "Quanto custa mandar eliminar um perfil de empresa do Google?", a: "Na RapidRemove aplica-se um preço fixo transparente a partir de 450 € — e só paga após a eliminação com sucesso. Se só precisa de remover avaliações individuais, a [remoção de avaliações individuais](/pt/remover-uma-avaliacao/) custa a partir de 179 € por avaliação removida (com texto e até 4 semanas; as restantes 250 €), cobrados só após a remoção." },
    { q: "O perfil pode voltar a aparecer depois?", a: "Terceiros podem, teoricamente, criar um novo perfil. Com a proteção opcional, monitorizamos o seu registo e removemos gratuitamente um perfil que volte a aparecer durante o período de proteção." },
  ],
};
export default article;
