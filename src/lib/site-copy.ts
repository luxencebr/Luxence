import type { SiteLocale } from "./site-locale";

export const siteCopy = {
  pt: {
    nav: ["Início", "Catálogo", "Sobre", "Blog", "Suporte", "Assine Já!"],
    home: ["Carregando produtores...", "Novidades", "Mais visualizados", "Mais bem avaliados", "Perto de Você"],
    catalog: ["Mulheres", "Homens", "Trans", "Encontre acompanhantes", "em", "Filtrando perfis...", "Carregando mais produtores...", "Você chegou ao final da lista.", "Nenhum resultado encontrado."],
    about: ["Sobre a Luxence", "A Luxence surgiu do encontro entre o luxo e o prazer. A plataforma reúne perfis que você pode conhecer e explorar no catálogo.", "Explore no seu ritmo", "No catálogo, você encontra perfis com informações, fotos e formas de contato disponibilizadas pelas próprias anunciantes. Use os filtros para navegar pelas opções e abrir o perfil que chamou sua atenção.", "Explorar o catálogo", "Conteúdo da Luxence", "No blog, reunimos artigos e novidades publicados na plataforma. É um espaço para descobrir temas relacionados a experiências e bem-estar.", "Ler o blog", "Precisa de ajuda?", "Encontre os canais de contato na página de suporte.", "Acessar o suporte"],
  },
  en: {
    nav: ["Home", "Catalog", "About", "Blog", "Support", "Subscribe Now!"],
    home: ["Loading profiles...", "New arrivals", "Most viewed", "Top rated", "Near You"],
    catalog: ["Women", "Men", "Trans", "Find companions", "in", "Filtering profiles...", "Loading more profiles...", "You've reached the end of the list.", "No results found."],
    about: ["About Luxence", "Luxence brings luxury and pleasure together. The platform features profiles you can discover and explore in the catalog.", "Explore at your own pace", "In the catalog, you'll find profiles with information, photos, and contact options provided by the advertisers themselves. Use the filters to explore your options and open a profile that interests you.", "Explore the catalog", "Luxence content", "Our blog features articles and updates published on the platform. Discover topics related to experiences and well-being.", "Read the blog", "Need help?", "Find our contact channels on the support page.", "Go to support"],
  },
  es: {
    nav: ["Inicio", "Catálogo", "Acerca de", "Blog", "Ayuda", "¡Suscríbete!"],
    home: ["Cargando perfiles...", "Novedades", "Más vistos", "Mejor valorados", "Cerca de ti"],
    catalog: ["Mujeres", "Hombres", "Trans", "Encuentra acompañantes", "en", "Filtrando perfiles...", "Cargando más perfiles...", "Has llegado al final de la lista.", "No se encontraron resultados."],
    about: ["Acerca de Luxence", "Luxence nació del encuentro entre el lujo y el placer. La plataforma reúne perfiles que puedes descubrir y explorar en el catálogo.", "Explora a tu ritmo", "En el catálogo encontrarás perfiles con información, fotos y formas de contacto proporcionadas por las propias anunciantes. Usa los filtros para explorar las opciones y abrir el perfil que te interese.", "Explorar el catálogo", "Contenido de Luxence", "En nuestro blog reunimos artículos y novedades publicados en la plataforma. Es un espacio para descubrir temas relacionados con las experiencias y el bienestar.", "Leer el blog", "¿Necesitas ayuda?", "Encuentra nuestros canales de contacto en la página de ayuda.", "Ir a ayuda"],
  },
} as const satisfies Record<SiteLocale, object>;
