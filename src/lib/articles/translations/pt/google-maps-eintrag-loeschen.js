/* PT — google-maps-eintrag-loeschen */
const article = {
  category: "Políticas do Google",
  meta: {
    slug: "remover-ficha-google-maps",
    title: "Eliminar ficha Google Maps: própria, alheia e definitivamente",
    h1: "Eliminar ficha do Google Maps: própria, alheia, falsa e duplicada",
    description: "Eliminar ficha do Google Maps — própria, alheia, falsa ou duplicada. Guia prático sobre por que «encerrado» não chega e como conseguir a remoção definitiva.",
    keywords: ["remover ficha google maps", "apagar ficha google maps", "remover ficha de terceiros google maps", "remover ficha errada google maps", "remover empresa do google maps", "remover ficha duplicada google"],
    author: "Matthias Lang",
    authorRole: "Especialista Google",
    date: "2026-06-04",
  },
  dek: "Uma ficha desatualizada, incorreta ou duplicada no Google Maps confunde clientes, envia-os para o sítio errado — e pode prejudicar seriamente a sua reputação. O problema é insidioso: mesmo que remova tudo da sua conta, **a ficha continua visível no Maps e na pesquisa Google, juntamente com todas as avaliações.** Este guia mostra-lhe, com honestidade e passo a passo, como eliminar fichas próprias, alheias, falsas e duplicadas — onde os recursos nativos do Google ficam aquém, e como conseguir uma remoção verdadeiramente definitiva.",
  blocks: [
    { t: "note", title: "Nota", text: "Este artigo é um guia prático e não constitui aconselhamento jurídico." },

    { t: "h2", id: "kurz", text: "Em resumo", toc: "Em resumo" },
    { t: "ul", items: [
      "**«Remover da conta» ≠ eliminar.** Na maioria dos casos, a ficha é apenas marcada como «permanentemente encerrado» — continua visível com nome, morada e todas as avaliações.",
      "**Fichas alheias e falsas** só podem ser **denunciadas**, não eliminadas diretamente — e o Google recusa as denúncias com frequência.",
      "**Fichas duplicadas** devem ser fundidas, não apagadas às pressas — caso contrário perde as avaliações.",
      "**A remoção completa e definitiva** (incluindo todas as avaliações) consegue-se na prática quase sempre através da **eliminação total do perfil** — com a RapidRemove, normalmente em 24 a 48 horas, **só paga se resultar**.",
    ] },

    { t: "h2", id: "herkunft", text: "Primeiro, perceber: porque é que a ficha existe?", toc: "Porque existe" },
    { t: "p", text: "Muitos proprietários surpreendem-se ao encontrar a sua ficha no Maps sem a terem criado. É o caso habitual: as fichas surgem por outros utilizadores, pela recolha automática de dados do Google a partir da web ou por importações de registos oficiais. O importante aqui: como a ficha raramente foi criada por si, o controlo que tem através do menu normal da conta é limitado." },
    { t: "p", text: "O caminho certo depende do tipo de ficha em causa. Há quatro casos típicos." },

    { t: "h2", id: "eigener", text: "Caso 1: Remover a sua própria ficha do Google Maps", toc: "Caso 1: Ficha própria" },
    { t: "p", text: "Se estiver verificado como proprietário, pode dissociar a ficha da sua gestão:" },
    { t: "ol", items: [
      "Pesquise no Google **«A minha empresa»** e abra as definições do perfil.",
      "Aceda ao **menu de três pontos** e escolha **«Remover perfil de empresa»**.",
      "Selecione **«Remover conteúdo e administradores do perfil»** e confirme.",
    ] },
    { t: "p", text: "Parece uma eliminação — mas não é. Explicamos a seguir o que realmente acontece. Conte com que a ficha pública se mantenha visível." },

    { t: "cta", title: "Quer livrar-se definitivamente da sua ficha do Maps?", text: "Verificamos gratuitamente se a sua ficha do Google Maps pode mesmo ser removida.", btn: "Verificar gratuitamente", href: "/pt/?start=1", trust: ["Análise gratuita", "Com garantia", "Sem risco"] },

    { t: "h2", id: "sichtbar", text: "Por que a ficha continua visível depois de «eliminar»", toc: "Por que permanece" },
    { t: "p", text: "Este é o ponto onde a maioria falha — e que o Google deliberadamente não comunica com clareza: remover da sua conta **não** faz a empresa desaparecer do Maps nem da pesquisa. A ficha é simplesmente desassociada da sua gestão e, regra geral, marcada como **«Permanentemente encerrado»**. Nome, morada, fotografias e **todas as avaliações ficam públicas** — agora apenas com um aviso tachado que, para potenciais clientes, muitas vezes tem um efeito pior do que antes." },
    { t: "p", text: "A razão é o modelo de negócio do Google: o Google Maps depende de dados de localização tão completos quanto possível. Nas suas [políticas de conteúdo](https://support.google.com/contributionpolicy/answer/7400114), o Google posiciona-se expressamente contra a eliminação completa de perfis de empresa. A remoção total através da própria conta não está, portanto, praticamente prevista." },

    { t: "h2", id: "fremder", text: "Caso 2: Denunciar uma ficha alheia ou falsa", toc: "Caso 2: Ficha alheia" },
    { t: "p", text: "Para fichas que não lhe pertencem — uma ficha falsa, desatualizada ou criada por terceiros — resta apenas a funcionalidade de denúncia:" },
    { t: "ol", items: [
      "Abra a ficha no **Google Maps**.",
      "Clique em **«Sugerir uma edição»**.",
      "Selecione **«Marcar como encerrado ou remover»**.",
      "Indique o motivo, por exemplo **«Este lugar não existe»** ou **«Ofensivo, prejudicial ou enganoso»**.",
      "Submeta — e aguarde a análise do Google.",
    ] },
    { t: "p", text: "Sendo honestos: é um processo de paciência. O Google analisa maioritariamente de forma automatizada, o tratamento pode demorar semanas, e as denúncias são frequentemente recusadas sem fundamentação. Ajuda que várias pessoas independentes apresentem a mesma informação factualmente correta — denúncias falsas são detetadas rapidamente pelo Google e ignoradas." },

    { t: "h2", id: "doppelt", text: "Caso 3: Resolver uma ficha duplicada", toc: "Caso 3: Duplicado" },
    { t: "p", text: "As fichas duplicadas surgem frequentemente por mudanças de instalações, alterações de nome ou criação acidental de perfis múltiplos. Como proceder:" },
    { t: "ol", items: [
      "Abra o perfil **duplicado** no Google Maps.",
      "Clique em **«Sugerir uma edição»** → **«Marcar como encerrado ou remover»**.",
      "Escolha como motivo **«Duplicado de outro local»** e submeta.",
    ] },
    { t: "warn", title: "Importante", text: "Não elimine por engano a ficha **verificada** — teria de voltar a confirmar a titularidade. Se ambas as fichas já têm avaliações, o ideal é **não** apagar nenhuma, mas pedir ao suporte do Google que as **funda**. Só assim conserva as suas avaliações reais." },

    { t: "h2", id: "sonderfaelle", text: "Caso 4: Empresa encerrada, mudada de instalações ou renomeada", toc: "Caso 4: Casos especiais" },
    { t: "p", text: "Estes casos especiais são frequentemente mal geridos:" },
    { t: "ul", items: [
      "**Empresa definitivamente encerrada:** «Permanentemente encerrado» é a opção correta — mas tenha em conta que avaliações negativas antigas continuam visíveis e podem ter impacto.",
      "**Mudança de instalações:** Atualize a morada na ficha existente em vez de criar uma nova — caso contrário gera um duplicado e as avaliações ficam dispersas.",
      "**Renomeação:** Altere o nome no mesmo perfil. Criar uma nova ficha «desperdiça» todo o historial de avaliações acumulado.",
    ] },
    { t: "p", text: "Se a ficha estiver comprometida de raiz — por avaliações falsas, uma campanha de difamação ou dados impossíveis de corrigir — corrigir não resolve. Nesse caso, a remoção completa é o corte mais limpo." },

    { t: "h2", id: "vergleich", text: "Comparação dos métodos", toc: "Comparação dos métodos" },
    { t: "table", head: ["Método", "O que resolve", "Prazo", "Eficácia"], rows: [
      ["Denúncia própria (formulário)", "Fichas alheias/falsas individuais", "Semanas, incerto", "Frequentemente baixa, muitas recusas"],
      ["Remover da conta", "Apenas muda estado para «encerrado»", "Imediato", "Ficha continua visível"],
      ["Advogado", "Conteúdos ilegais pontuais", "3 a 9 meses", "Incerto, dispendioso (honorários/hora)"],
      ["**RapidRemove (eliminação do perfil)**", "**Ficha completa + todas as avaliações**", "**24 a 48 horas**", "**Só paga se resultar**"],
    ] },

    { t: "h2", id: "dauerhaft", text: "Solução definitiva: eliminar o perfil completo", toc: "Eliminar definitivamente" },
    { t: "p", text: "Se pretende remover uma ficha **completa e definitivamente** — incluindo todas as avaliações — do Google Maps e da pesquisa, os recursos nativos chegam ao limite. É precisamente aqui que a RapidRemove entra: não combatemos avaliações individuais nem rótulos de estado, removemos o **perfil de empresa completo** através dos procedimentos oficiais do Google. Desta forma, a ficha desaparece juntamente com todas as avaliações de uma só vez — avaliações falsas incluídas." },
    { t: "p", text: "O que isso significa para si:" },
    { t: "ul", items: [
      "**Rapidez:** Remoção normalmente em 24 a 48 horas, em vez de meses de vai e vem.",
      "**Total:** Perfil e todas as avaliações são completamente removidos da exibição e da pesquisa — sem «encerrado», sem resíduos.",
      "**Amigo do SEO:** O seu website, o seu posicionamento orgânico e os seus Google Ads ficam intactos. Remove-se exclusivamente a ficha do Maps/empresa.",
      "**Previsível:** preço fixo transparente, **só paga após o sucesso** (No Cure, No Pay).",
      "**Com garantia:** Se o perfil reaparecer por ação de terceiros, removemo-lo novamente sem custo durante o período de proteção.",
      "**Discreto:** sem troca de correspondência, sem confronto direto com quem avaliou — e, portanto, sem risco de efeito Streisand.",
    ] },
    { t: "h3", text: "Como funciona a eliminação com a RapidRemove" },
    { t: "ol", items: [
      "**Verificação gratuita:** Introduz o nome da empresa. Encontramos a sua ficha real no Maps e verificamos em segundos se pode ser removida e em quanto tempo.",
      "**Confirmar e autorizar:** Confirma o perfil correto e dá autorização para o tratamento. Sem acesso ao Gmail, Google Ads ou dados pessoais.",
      "**Eliminação em 24 a 48 horas:** A nossa equipa remove a ficha e todas as avaliações — definitivamente. Só paga depois.",
    ] },

    { t: "cta", title: "Verifique gratuitamente se a sua ficha do Maps pode ser eliminada.", text: "Introduz o nome da empresa — verificamos em segundos se e com que rapidez conseguimos remover o seu perfil e todas as avaliações.", btn: "Verificar eliminação", href: "/pt/?start=1", trust: ["Análise gratuita", "Garantia", "Sem risco"] },

    { t: "h2", id: "fazit", text: "Conclusão", toc: "Conclusão" },
    { t: "p", text: "Uma ficha do Google Maps só pode ser influenciada de forma limitada através dos recursos nativos do Google: «remover da conta» significa quase sempre apenas «encerrado», fichas alheias só podem ser denunciadas, e os duplicados devem ser fundidos em vez de apagados. Quando o objetivo é uma **remoção completa e definitiva** incluindo todas as avaliações, a eliminação total do perfil é o caminho fiável — rápido, previsível e com pagamento só após o sucesso." },

    { t: "cta", title: "Verifique agora gratuitamente se a sua ficha pode ser removida.", text: "Em poucos segundos vê o seu perfil real e fica a saber se e com que rapidez o conseguimos remover. Sem pagamento antecipado, sem compromisso.", btn: "Iniciar verificação gratuita", href: "/pt/?start=1", trust: ["Risco zero", "Pagamento só após eliminação bem-sucedida"] },
  ],
  faq: [
    { q: "Como elimino a minha própria ficha do Google Maps?", a: "Através de «A minha empresa» → Definições do perfil → Menu de três pontos → «Remover perfil de empresa» → «Remover conteúdo e administradores do perfil». Atenção: isto apenas dissocia a ficha da sua conta, não a remove do Maps nem da pesquisa." },
    { q: "Por que é que a minha ficha do Google Maps continua visível depois de a eliminar?", a: "Porque remover da conta normalmente apenas marca a ficha como «Permanentemente encerrado». O perfil e as avaliações permanecem no Maps e na pesquisa. O Google não prevê uma eliminação completa por parte do próprio titular; na prática, consegue-se quase sempre através de uma agência especializada." },
    { q: "Como denuncio uma ficha alheia ou falsa?", a: "Abre a ficha no Google Maps, «Sugerir uma edição» → «Marcar como encerrado ou remover», indica o motivo (por exemplo «Este lugar não existe») e submete. O Google analisa a sugestão — o processo pode ser demorado e é frequentemente recusado." },
    { q: "Como removo uma ficha duplicada do Google?", a: "Abre o duplicado no Maps, «Sugerir uma edição» → «Marcar como encerrado ou remover» → «Duplicado de outro local». Se ambas as fichas têm avaliações, é preferível pedir ao suporte do Google que as funda, para não perder nenhuma avaliação." },
    { q: "A remoção afeta o meu SEO ou o meu website?", a: "Não. Remove-se exclusivamente a ficha do Maps/empresa. O seu website, o seu posicionamento orgânico e os seus Google Ads ficam inalterados." },
    { q: "Posso pedir a eliminação definitiva de uma ficha do Google Maps?", a: "A remoção completa e definitiva, incluindo todas as avaliações, consegue-se normalmente através de uma agência especializada, uma vez que o Google não prevê a auto-eliminação. A eliminação técnica ocorre frequentemente em 24 a 48 horas — só paga após o sucesso." },
    { q: "Quanto custa remover uma ficha do Maps?", a: "Na RapidRemove aplica-se um preço fixo transparente, pago exclusivamente após a eliminação bem-sucedida. Não assume, portanto, qualquer risco financeiro." },
  ],
  related: [
    { label: "Remover o perfil de empresa do Google: como se faz?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Remover avaliações do Google: custos e métodos", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Denunciar e remover uma avaliação falsa do Google", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Avaliação negativa no Google – o que fazer?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
