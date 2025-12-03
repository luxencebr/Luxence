export interface Post {
  id: string;
  title: string;
  image?: string;
  content: string;
  date: string;

  likes?: number;

  comments?: Comment[];
}

export interface Comment {
  id: string;
  user: string;
  content: string;
  likes?: number;
  date?: string;
}

export const posts: Post[] = [
  {
    id: "1",
    image: "",
    title: "Nossa História",
    content: `
Fundada em 2020, nossa empresa nasceu com o propósito de aproximar tecnologia, pessoas e negócios de forma acessível e eficiente. Desde os primeiros passos, nosso objetivo foi democratizar o acesso a soluções digitais robustas, ajudando empresas de diferentes tamanhos a crescer e alcançar melhores resultados.

No início, éramos um time pequeno, mas movido por uma ambição enorme: provar que tecnologia de qualidade não precisava ser complexa, cara ou inacessível. Trabalhamos muitas vezes madrugada adentro, movidos por insights repentinos, correções de última hora e pela vontade de entregar algo que realmente fizesse sentido para nossos primeiros clientes. Cada projeto entregue era um aprendizado novo, e cada feedback nos impulsionava a evoluir.

Ao longo dos anos, enfrentamos desafios que exigiram criatividade, resiliência e capacidade de adaptação. Os primeiros obstáculos moldaram nossa cultura. Tivemos que aprender a escalar rapidamente, estruturar processos, organizar fluxos internos e construir uma base sólida o suficiente para suportar o crescimento que começava a surgir. Em muitos momentos, erramos — mas aprendemos com cada erro, transformando dificuldades em oportunidades.

Com o passar do tempo, ampliamos nossa atuação e expandimos nossas equipes, trazendo profissionais talentosos que compartilhavam a mesma visão que nos guiou desde o início. Cada nova pessoa trouxe uma bagagem única que enriquecia o time e nos ajudava a criar uma empresa mais plural, humana e preparada para os desafios do futuro.

Hoje, olhamos para nossa trajetória com orgulho. Crescemos de forma consistente, desenvolvemos soluções que impulsionaram diversos negócios e consolidamos uma cultura focada em inovação contínua. Nosso compromisso sempre foi — e continua sendo — transformar ideias em realidade e entregar valor genuíno para cada cliente. E à medida que avançamos, reafirmamos diariamente que nossa história está apenas começando.
`,
    date: "2023-01-15",
    comments: [
      {
        id: "c1",
        user: "Roberto",
        content: "História inspiradora! Parabéns pela trajetória.",
        likes: 3,
        date: "2023-02-01",
      },
      {
        id: "c2",
        user: "Ana Clara",
        content: "Impressionante ver o quanto cresceram em tão pouco tempo!",
        date: "2023-02-03",
      },
    ],
  },

  {
    id: "2",
    image: "",
    title: "Quem Somos",
    content: `
Somos uma equipe apaixonada por tecnologia, criatividade e desenvolvimento de produtos digitais. Acreditamos que pessoas motivadas conseguem transformar qualquer ideia em algo extraordinário quando têm liberdade e suporte para criar.

Nossa metodologia valoriza a colaboração, pois sabemos que resultados incríveis nascem da soma de diferentes perspectivas e experiências. Aqui, cada membro da equipe contribui com seu talento único.

Nosso maior compromisso é entregar valor real e construir relações duradouras com nossos parceiros e clientes. Trabalhamos para oferecer soluções que impactam positivamente não apenas negócios, mas também a vida das pessoas.
    `,
    date: "2023-02-10",
    comments: [
      {
        id: "c3",
        user: "Luciana",
        content:
          "Que descrição incrível! Dá pra sentir a paixão pelo trabalho.",
        likes: 5,
      },
      {
        id: "c4",
        user: "Caio",
        content: "Ótima cultura! Isso faz toda diferença no resultado final.",
      },
      {
        id: "c5",
        user: "Mariana",
        content: "Adorei conhecer mais sobre a equipe!",
        date: "2023-02-12",
      },
    ],
  },

  {
    id: "3",
    image: "/about/about-image-2.jpg",
    title: "Visão e Futuro",
    content: `
Acreditamos que o futuro está diretamente ligado à nossa capacidade de evoluir constantemente. Por isso, buscamos inovação em todas as frentes, experimentando soluções e explorando novas tecnologias que possam gerar transformações reais. Não acreditamos em inovação por modismo, mas sim em inovação que resolve problemas concretos, melhora experiências e cria oportunidades.

Nossa visão é orientada por três pilares fundamentais: impacto, sustentabilidade e longevidade. Queremos construir produtos que façam diferença não apenas no presente, mas também ao longo dos próximos anos. Buscamos compreender profundamente os desafios do mercado e antecipar necessidades antes que se tornem urgentes.

À medida que crescemos, continuamos investindo em pesquisa, desenvolvimento e novas tecnologias. Exploramos inteligência artificial, automações avançadas, integrações inteligentes e práticas modernas de engenharia de software. Nosso objetivo não é apenas acompanhar o ritmo do mercado, mas contribuir para moldá-lo com soluções práticas, éticas e inovadoras.

Sabemos que o futuro exige flexibilidade. Por isso, adotamos uma postura adaptativa, revendo processos, atualizando métodos e testando novas abordagens sempre que necessário. Acreditamos que organizações que permanecem estagnadas tendem a perder relevância — por isso, colocamos a evolução contínua no centro de tudo o que fazemos.

Nosso foco é garantir que nossos produtos acompanhem a velocidade do mercado e superem as expectativas dos usuários. Queremos construir um futuro em que a tecnologia seja não apenas mais eficiente, mas mais humana, intuitiva e acessível. E seguimos comprometidos em trilhar esse caminho com responsabilidade, criatividade e excelência.
`,
    date: "2023-03-20",
    comments: [
      {
        id: "c6",
        user: "Felipe",
        content: "Visão admirável. Torcendo pelo sucesso!",
      },
    ],
  },

  {
    id: "4",
    image: "/about/about-image-3.jpg",
    title: "Compromisso com a Inovação",
    content: `
A inovação sempre fez parte do nosso DNA. Não enxergamos tecnologia como um fim em si, mas como um meio de melhorar vidas e negócios. Desde os primeiros projetos, percebemos que inovar significa observar atentamente o que as pessoas realmente precisam e oferecer soluções que tornem seus processos mais leves, rápidos e eficientes.

Estamos constantemente revisando nossos processos, testando novos métodos e ouvindo nossos clientes para entregar experiências cada vez melhores. Essa mentalidade experimental, aberta ao novo e às vezes até ao improvável, é o que nos permite crescer e evoluir rapidamente. Em nosso dia a dia, ideias surgem de conversas espontâneas, análises aprofundadas ou até de necessidades inesperadas que se tornam oportunidades de construir algo melhor.

Trabalhamos com metodologias ágeis, ciclos curtos de validação e experimentação constante. Isso nos permite criar, medir e ajustar com velocidade, garantindo que nossas soluções estejam sempre alinhadas à realidade do mercado. Não temos medo de recomeçar quando necessário — afinal, a inovação nasce muitas vezes do desapego ao convencional.

Acreditamos que o futuro pertence a quem não tem medo de experimentar. Por isso, cultivamos um ambiente em que a curiosidade é valorizada e novas ideias são sempre bem-vindas. Nosso compromisso com a inovação não está apenas em nossas soluções, mas na forma como pensamos, colaboramos e nos movemos como organização.
`,
    date: "2022-03-20",
    comments: [
      {
        id: "c7",
        user: "Sofia",
        content: "Muito bom! Inovação é realmente essencial.",
        likes: 2,
      },
      {
        id: "c8",
        user: "Vitor",
        content: "Excelente abordagem! Gostei muito da reflexão.",
      },
    ],
  },

  {
    id: "5",
    image: "/about/about-team.jpg",
    title: "Equipe e Cultura",
    content: `
Nossa equipe é formada por profissionais multidisciplinares que compartilham o mesmo propósito: criar soluções que fazem a diferença. Cada integrante traz uma bagagem única que enriquece nossa cultura interna.

Valorizamos a diversidade, a colaboração e a transparência. Acreditamos que um ambiente saudável e motivador é essencial para alcançar resultados extraordinários. Aqui, todos têm voz e espaço para colaborar.

Investimos na formação contínua dos nossos colaboradores e incentivamos a troca de ideias como parte do trabalho diário. Nosso time é nossa maior força.
    `,
    date: "2023-06-12",
    comments: [
      {
        id: "c9",
        user: "Daniel",
        content: "Equipe forte faz toda diferença!",
      },
    ],
  },

  {
    id: "6",
    image: "",
    title: "Tecnologia e Inovação",
    content: `
Trabalhamos com tecnologias modernas e metodologias ágeis que garantem rapidez, segurança e escalabilidade. Nossos sistemas são construídos com foco em eficiência e alta performance.

Nossos projetos são desenvolvidos com foco em performance e experiência do usuário, utilizando frameworks atualizados e práticas recomendadas pela comunidade. Estruturas leves e bem planejadas garantem uma manutenção mais simples e resultados mais robustos.

Acreditamos que a inovação não depende apenas de ferramentas, mas de pessoas curiosas e dispostas a explorar novos caminhos. É essa mentalidade que guia nosso trabalho todos os dias.
    `,
    date: "2023-07-01",
    comments: [
      {
        id: "c10",
        user: "Gabriel",
        content: "Texto impecável! Muito verdadeiro.",
      },
      {
        id: "c11",
        user: "Maria Luiza",
        content: "Amei a visão sobre inovação!",
      },
    ],
  },

  {
    id: "7",
    image: "/about/about-office.jpg",
    title: "Nosso Espaço de Trabalho",
    content: `
Criamos um ambiente de trabalho que estimula criatividade, foco e bem-estar. Nosso escritório possui áreas abertas, salas de convivência e espaços dedicados à colaboração para que cada equipe possa trabalhar com conforto e dinamismo. Acreditamos que um espaço bem planejado é capaz de influenciar diretamente a produtividade e a qualidade das ideias.

Para nós, o ambiente é tão importante quanto as ferramentas. Investimos em iluminação adequada, mobiliário ergonômico e áreas verdes que ajudam a reduzir o estresse e estimular a concentração. Também criamos salas de reunião temáticas, espaços silenciosos para foco profundo e áreas descontraídas que permitem pausas estratégicas ao longo do dia.

Acreditamos que boas ideias surgem quando as pessoas têm liberdade para explorar, testar e errar. Por isso, nosso ambiente foi pensado para ser flexível, permitindo que cada membro da equipe escolha onde e como prefere trabalhar. Alguns preferem mesas comunitárias, outros preferem cabines de foco — e todas as opções são bem-vindas.

Desenhamos um espaço que acolhe diferentes estilos de trabalho e promove trocas constantes entre as equipes. Acreditamos que o ambiente molda a forma como criamos. Quando as pessoas se sentem bem, colaboram mais, se conectam mais e constroem ideias mais ricas. Nosso espaço é um reflexo de quem somos: dinâmicos, criativos e abertos ao novo.
`,
    date: "2023-08-05",
    comments: [
      {
        id: "c12",
        user: "Juliana",
        content: "Que escritório incrível!",
      },
      {
        id: "c13",
        user: "Ricardo",
        content: "Ambiente faz TODA diferença mesmo.",
      },
    ],
  },

  {
    id: "8",
    image: "",
    title: "Parcerias Estratégicas",
    content: `
Construímos parcerias com empresas e profissionais que compartilham nossa visão e nossos valores. A colaboração nos permite expandir nossas capacidades e entregar soluções ainda mais completas e eficazes.

Essas alianças fortalecem nossa atuação e nos possibilitam explorar novos mercados e oportunidades. Trabalhar em conjunto amplia nossa visão e acelera nossa evolução.

Acreditamos que juntos podemos alcançar resultados que vão além do possível. Nossas parcerias são parte essencial do que nos torna fortes.
    `,
    date: "2023-09-19",
    comments: [
      {
        id: "c14",
        user: "Paulo",
        content: "Parcerias bem feitas aumentam muito o impacto!",
      },
    ],
  },

  {
    id: "9",
    image: "/about/about-community.jpg",
    title: "Compromisso com a Comunidade",
    content: `
Entendemos que tecnologia também é responsabilidade social. Por isso, apoiamos iniciativas que promovem educação, inclusão digital e desenvolvimento humano, buscando sempre retribuir à sociedade.

Atuamos em projetos comunitários, palestras, mentorias e ações sociais que reforçam nosso compromisso com a transformação positiva. Acreditamos que empresas têm o dever de agir além das suas operações.

Cada gesto, por menor que seja, contribui para um futuro melhor. E nós fazemos questão de assumir essa responsabilidade como parte da nossa identidade.
    `,
    date: "2023-10-02",
    comments: [
      {
        id: "c15",
        user: "Eduardo",
        content: "Lindo comprometimento!",
      },
      {
        id: "c16",
        user: "Fábio",
        content: "Muito bom ver empresas pensando além do lucro.",
      },
    ],
  },

  {
    id: "10",
    image: "",
    title: "Processos Internos",
    content: `
Nossos processos internos são constantemente avaliados para garantir eficiência, clareza e alinhamento com nossas metas estratégicas. Acreditamos que a organização é a base para um crescimento sólido.

Trabalhamos com fluxos bem estruturados, documentação acessível e comunicação integrada entre todas as equipes. Isso garante previsibilidade e segurança em cada etapa do desenvolvimento.

Essa estrutura permite decisões ágeis e uma execução consistente, resultando em entregas mais assertivas e de alta qualidade.
    `,
    date: "2023-11-14",
    comments: [
      {
        id: "c17",
        user: "Helena",
        content: "Processos bem definidos fazem toda diferença!",
      },
    ],
  },

  {
    id: "11",
    image: "/about/about-growth.jpg",
    title: "Crescimento e Resultados",
    content: `
Desde nossa fundação, temos alcançado resultados significativos que impulsionam nossa evolução. Cada meta atingida fortalece nosso compromisso com a excelência.

Expandimos nossas áreas de atuação, aumentamos nossa base de clientes e construímos cases de sucesso que reforçam nosso impacto no mercado. Nosso crescimento é fruto de muito trabalho e dedicação.

Nosso foco é crescer de forma sustentável e sólida, garantindo que cada etapa seja feita com responsabilidade e visão de longo prazo.
    `,
    date: "2024-01-08",
    comments: [
      {
        id: "c18",
        user: "Carolina",
        content: "Muito bom! Progresso consistente.",
      },
    ],
  },

  {
    id: "12",
    image: "",
    title: "Novas Iniciativas",
    content: `
Estamos constantemente desenvolvendo novas iniciativas internas para fomentar inovação, criatividade e formação de talentos. Acreditamos que o aprendizado contínuo é essencial para nos manter relevantes.

Criamos programas de capacitação, grupos de estudo e trilhas de desenvolvimento técnico que ajudam nossa equipe a evoluir diariamente, incentivando a descoberta de novas habilidades.

Investir em pessoas é o primeiro passo para inovar. Quanto mais capacitado o time, maior nossa capacidade de reinventar.
    `,
    date: "2024-02-21",
    comments: [
      {
        id: "c19",
        user: "Igor",
        content: "Muito bacana ver esse foco em capacitação!",
      },
    ],
  },

  {
    id: "13",
    image: "/about/about-innovation.jpg",
    title: "Laboratório de Ideias",
    content: `
Criamos um laboratório interno voltado exclusivamente para experimentação e testes. Esse espaço permite que nossa equipe explore novos conceitos livremente.

Nele, ideias são cultivadas desde o rascunho até protótipos funcionais. Essa liberdade gera criatividade e incentiva descobertas importantes para nosso portfólio de produtos.

Iniciativas como essa fortalecem nossa cultura e revelam caminhos inéditos para o futuro. Inovar é parte da nossa identidade.
    `,
    date: "2024-03-10",
    comments: [
      {
        id: "c20",
        user: "Renata",
        content: "Isso sim é investir em inovação!",
      },
      {
        id: "c21",
        user: "Thiago",
        content: "Amei esse laboratório, genial!",
      },
    ],
  },
];
