import type { HistoricalEvent } from "./historical-evolution"
import { DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"

export interface NewsArticle {
  id: string
  title: string
  content: string
  category: "breaking" | "analysis" | "interview" | "announcement" | "race_preview" | "technical" | "market"
  timestamp: Date
  priority: "high" | "medium" | "low"
  tags: string[]
  relatedEntities: string[]
}

export class EnhancedNewsGenerator {
  private usedTemplates: Set<string> = new Set()
  private newsCounter = 0

  generateSeasonNews(year: number, events: HistoricalEvent[], raceResults?: any[]): NewsArticle[] {
    const articles: NewsArticle[] = []

    // Generate event-based news
    events.forEach(event => {
      articles.push(...this.generateEventNews(event))
    })

    // Generate random motorsport news (more frequent)
    articles.push(...this.generateRandomNews(year))

    // Generate race-related news if results available
    if (raceResults && raceResults.length > 0) {
      articles.push(...this.generateRaceNews(raceResults, year))
    }

    // Generate technical and market news
    articles.push(...this.generateTechnicalNews(year))
    articles.push(...this.generateMarketNews(year))

    return articles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  private generateEventNews(event: HistoricalEvent): NewsArticle[] {
    const articles: NewsArticle[] = []
    const baseId = `event-${event.id}-${this.newsCounter++}`

    const eventTemplates = {
      driver_entry: [
        {
          category: "breaking" as const,
          title: `OFICIAL: ${event.entityName} assina com equipe do Stock Car Brasil`,
          content: `Em uma movimentação que promete agitar o grid, ${event.entityName} foi oficialmente anunciado como novo piloto para a temporada ${event.year}. O piloto chega com grandes expectativas e promete lutar por posições de destaque. A contratação foi confirmada após intensas negociações e representa um investimento significativo da equipe.`,
          priority: "high" as const,
          tags: ["contratação", "pilotos", "transferências"],
        },
        {
          category: "analysis" as const,
          title: `Análise: O impacto da chegada de ${event.entityName}`,
          content: `A entrada de ${event.entityName} no Stock Car Brasil pode alterar significativamente o equilíbrio de forças no campeonato. Com sua experiência e talento comprovados, o piloto traz novas perspectivas táticas e pode ser decisivo na luta pelo título desta temporada.`,
          priority: "medium" as const,
          tags: ["análise", "estratégia", "campeonato"],
        },
      ],
      driver_exit: [
        {
          category: "breaking" as const,
          title: `${event.entityName} anuncia aposentadoria do automobilismo`,
          content: `Após uma carreira brilhante no Stock Car Brasil, ${event.entityName} oficializou sua aposentadoria das pistas. O piloto deixa um legado importante na categoria e será lembrado pelos fãs por suas conquistas e dedicação ao esporte.`,
          priority: "high" as const,
          tags: ["aposentadoria", "legado", "pilotos"],
        },
        {
          category: "interview" as const,
          title: `"Foi uma jornada incrível", diz ${event.entityName}`,
          content: `Em entrevista exclusiva, ${event.entityName} reflete sobre sua carreira no Stock Car Brasil, destacando os momentos mais marcantes e agradecendo aos fãs pelo apoio incondicional ao longo dos anos.`,
          priority: "medium" as const,
          tags: ["entrevista", "carreira", "reflexão"],
        },
      ],
      team_entry: [
        {
          category: "announcement" as const,
          title: `${event.entityName} confirma entrada no Stock Car Brasil`,
          content: `A nova equipe ${event.entityName} foi oficialmente confirmada para disputar o campeonato. Com investimentos milionários e uma estrutura de ponta, a equipe promete ser competitiva desde sua estreia e já trabalha na contratação de pilotos experientes.`,
          priority: "high" as const,
          tags: ["nova equipe", "investimento", "estrutura"],
        },
      ],
      manufacturer_entry: [
        {
          category: "announcement" as const,
          title: `${event.entityName} entra oficialmente no Stock Car Brasil`,
          content: `A montadora ${event.entityName} marca sua entrada histórica no automobilismo nacional com grandes investimentos em tecnologia e desenvolvimento. A chegada da marca promete intensificar a competição e trazer inovações técnicas para a categoria.`,
          priority: "high" as const,
          tags: ["montadora", "tecnologia", "inovação"],
        },
      ],
    }

    const templates = eventTemplates[event.type as keyof typeof eventTemplates] || []
    
    templates.forEach((template, index) => {
      const articleId = `${baseId}-${index}`
      if (!this.usedTemplates.has(articleId)) {
        this.usedTemplates.add(articleId)
        articles.push({
          id: articleId,
          title: template.title,
          content: template.content,
          category: template.category,
          timestamp: new Date(),
          priority: template.priority,
          tags: template.tags,
          relatedEntities: [event.entityId],
        })
      }
    })

    return articles
  }

  private generateRandomNews(year: number): NewsArticle[] {
    const articles: NewsArticle[] = []
    const randomTemplates = [
      {
        category: "technical" as const,
        title: "Novas regulamentações técnicas podem chegar em breve",
        content: "A direção do Stock Car Brasil estuda implementar novas regulamentações técnicas para aumentar a competitividade e reduzir custos. As mudanças podem incluir limitações de potência e novos sistemas de segurança.",
        priority: "medium" as const,
        tags: ["regulamentação", "técnico", "segurança"],
      },
      {
        category: "market" as const,
        title: "Mercado de patrocínios aquecido para a temporada",
        content: "O mercado de patrocínios no Stock Car Brasil apresenta crescimento significativo, com novas empresas interessadas em associar suas marcas ao automobilismo nacional. O investimento total pode superar R$ 200 milhões.",
        priority: "low" as const,
        tags: ["patrocínio", "mercado", "investimento"],
      },
      {
        category: "race_preview" as const,
        title: "Próxima etapa promete ser decisiva no campeonato",
        content: "Com a aproximação da próxima etapa do campeonato, as equipes intensificam os preparativos. Os pilotos destacam a importância de cada ponto na luta pelo título, prometendo uma corrida emocionante.",
        priority: "medium" as const,
        tags: ["preview", "campeonato", "preparação"],
      },
      {
        category: "technical" as const,
        title: "Inovações aerodinâmicas marcam desenvolvimento dos carros",
        content: "As equipes investem pesado em desenvolvimento aerodinâmico para a temporada. Novas soluções em asas e difusores prometem melhorar a performance e a eficiência dos carros em diferentes tipos de pista.",
        priority: "low" as const,
        tags: ["aerodinâmica", "desenvolvimento", "tecnologia"],
      },
      {
        category: "analysis" as const,
        title: "Análise: Como o clima pode influenciar o campeonato",
        content: "Especialistas analisam como as condições climáticas podem ser determinantes nesta temporada. Chuvas inesperadas e mudanças de temperatura podem alterar completamente o resultado das corridas.",
        priority: "medium" as const,
        tags: ["clima", "estratégia", "análise"],
      },
    ]

    // Generate 2-4 random articles
    const numArticles = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < numArticles; i++) {
      const template = randomTemplates[Math.floor(Math.random() * randomTemplates.length)]
      articles.push({
        id: `random-${year}-${this.newsCounter++}`,
        title: template.title,
        content: template.content,
        category: template.category,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        priority: template.priority,
        tags: template.tags,
        relatedEntities: [],
      })
    }

    return articles
  }

  private generateRaceNews(raceResults: any[], year: number): NewsArticle[] {
    const articles: NewsArticle[] = []
    
    if (raceResults.length === 0) return articles

    const winner = raceResults[0]
    const winnerDriver = DRIVERS.find(d => d.id === winner.driverId)
    const winnerTeam = TEAMS.find(t => t.id === winner.teamId)

    if (winnerDriver && winnerTeam) {
      articles.push({
        id: `race-winner-${year}-${this.newsCounter++}`,
        title: `${winnerDriver.name} domina e vence em grande estilo`,
        content: `${winnerDriver.name}, da equipe ${winnerTeam.name}, conquistou uma vitória impressionante na última etapa do campeonato. O piloto demonstrou grande habilidade e estratégia, consolidando sua posição entre os favoritos ao título desta temporada.`,
        category: "breaking",
        timestamp: new Date(),
        priority: "high",
        tags: ["vitória", "corrida", "destaque"],
        relatedEntities: [winner.driverId, winner.teamId],
      })
    }

    // Generate podium news
    const podiumDrivers = raceResults.slice(0, 3).filter(r => !r.dnf)
    if (podiumDrivers.length >= 3) {
      const podiumNames = podiumDrivers.map(r => {
        const driver = DRIVERS.find(d => d.id === r.driverId)
        return driver?.name.split(' ')[0]
      }).join(', ')

      articles.push({
        id: `podium-${year}-${this.newsCounter++}`,
        title: `Pódio emocionante com ${podiumNames}`,
        content: `O pódio da última corrida foi definido por uma disputa acirrada até a bandeirada final. Os três primeiros colocados demonstraram alto nível técnico e proporcionaram um espetáculo inesquecível para os fãs presentes no autódromo.`,
        category: "analysis",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        priority: "medium",
        tags: ["pódio", "disputa", "espetáculo"],
        relatedEntities: podiumDrivers.map(r => r.driverId),
      })
    }

    return articles
  }

  private generateTechnicalNews(year: number): NewsArticle[] {
    const articles: NewsArticle[] = []
    
    // Generate technical news occasionally
    if (Math.random() < 0.3) {
      const technicalTemplates = [
        {
          title: "Equipes investem em simuladores de última geração",
          content: "As principais equipes do Stock Car Brasil estão investindo em simuladores de alta tecnologia para melhorar o desenvolvimento dos carros e o treinamento dos pilotos. A tecnologia permite testar diferentes configurações sem custos de pista.",
          tags: ["simulador", "tecnologia", "desenvolvimento"],
        },
        {
          title: "Novos pneus prometem mais aderência e durabilidade",
          content: "O fornecedor oficial de pneus anuncia melhorias no composto para a temporada. Os novos pneus prometem maior aderência em condições secas e melhor performance em pista molhada, além de maior durabilidade.",
          tags: ["pneus", "performance", "inovação"],
        },
        {
          title: "Sistema de telemetria avançado é implementado",
          content: "Um novo sistema de telemetria em tempo real está sendo testado pelas equipes. A tecnologia permite monitoramento detalhado do desempenho do carro e pode revolucionar as estratégias de corrida.",
          tags: ["telemetria", "dados", "estratégia"],
        },
      ]

      const template = technicalTemplates[Math.floor(Math.random() * technicalTemplates.length)]
      articles.push({
        id: `technical-${year}-${this.newsCounter++}`,
        title: template.title,
        content: template.content,
        category: "technical",
        timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Random time in last 3 days
        priority: "low",
        tags: template.tags,
        relatedEntities: [],
      })
    }

    return articles
  }

  private generateMarketNews(year: number): NewsArticle[] {
    const articles: NewsArticle[] = []
    
    // Generate market news occasionally
    if (Math.random() < 0.25) {
      const marketTemplates = [
        {
          title: "Audiência do Stock Car Brasil cresce 15% na temporada",
          content: "Os números de audiência do Stock Car Brasil apresentam crescimento consistente, com aumento de 15% em relação à temporada anterior. O sucesso é atribuído à competitividade equilibrada e às transmissões de qualidade.",
          tags: ["audiência", "crescimento", "mídia"],
        },
        {
          title: "Novos patrocinadores demonstram interesse na categoria",
          content: "Empresas de diversos setores manifestam interesse em patrocinar equipes e pilotos do Stock Car Brasil. O crescimento da categoria atrai investimentos de marcas que buscam associação com o automobilismo nacional.",
          tags: ["patrocínio", "investimento", "crescimento"],
        },
        {
          title: "Stock Car Brasil expande presença nas redes sociais",
          content: "A categoria investe em conteúdo digital e presença nas redes sociais para aproximar os fãs do automobilismo. Novos formatos de conteúdo e interação prometem engajar ainda mais o público jovem.",
          tags: ["digital", "redes sociais", "engajamento"],
        },
      ]

      const template = marketTemplates[Math.floor(Math.random() * marketTemplates.length)]
      articles.push({
        id: `market-${year}-${this.newsCounter++}`,
        title: template.title,
        content: template.content,
        category: "market",
        timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Random time in last 5 days
        priority: "low",
        tags: template.tags,
        relatedEntities: [],
      })
    }

    return articles
  }

  private generateRaceNews(raceResults: any[], year: number): NewsArticle[] {
    const articles: NewsArticle[] = []

    // Generate race analysis
    if (Math.random() < 0.7) {
      articles.push({
        id: `race-analysis-${year}-${this.newsCounter++}`,
        title: "Estratégias de pit stop definem resultado da corrida",
        content: "A última corrida foi decidida pelas estratégias de pit stop das equipes. Algumas apostaram em paradas antecipadas, enquanto outras preferiram estender o stint inicial. As decisões estratégicas foram fundamentais para o resultado final.",
        category: "analysis",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: "medium",
        tags: ["estratégia", "pit stop", "análise"],
        relatedEntities: raceResults.slice(0, 5).map(r => r.driverId),
      })
    }

    // Generate technical incidents news
    if (Math.random() < 0.4) {
      articles.push({
        id: `technical-incident-${year}-${this.newsCounter++}`,
        title: "Problemas técnicos marcam a corrida",
        content: "Alguns pilotos enfrentaram problemas técnicos durante a corrida, incluindo falhas mecânicas e problemas de motor. As equipes trabalham para identificar as causas e evitar que se repitam nas próximas etapas.",
        category: "technical",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: "low",
        tags: ["problemas técnicos", "mecânica", "confiabilidade"],
        relatedEntities: [],
      })
    }

    return articles
  }

  generateDriverSpotlight(): NewsArticle[] {
    const articles: NewsArticle[] = []
    const activeDrivers = DRIVERS.filter(d => d.active)
    
    if (activeDrivers.length > 0 && Math.random() < 0.2) {
      const spotlightDriver = activeDrivers[Math.floor(Math.random() * activeDrivers.length)]
      const team = TEAMS.find(t => t.id === spotlightDriver.teamId)
      
      articles.push({
        id: `spotlight-${spotlightDriver.id}-${this.newsCounter++}`,
        title: `Em foco: ${spotlightDriver.name} e sua trajetória no automobilismo`,
        content: `Conheça melhor a história de ${spotlightDriver.name}, piloto da ${team?.name}. Com ${spotlightDriver.experience} anos de experiência no Stock Car Brasil, o piloto já conquistou ${spotlightDriver.wins} vitórias e ${spotlightDriver.podiums} pódios na categoria.`,
        category: "interview",
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        priority: "medium",
        tags: ["perfil", "trajetória", "piloto"],
        relatedEntities: [spotlightDriver.id],
      })
    }

    return articles
  }

  generateWeeklyNews(year: number): NewsArticle[] {
    const articles: NewsArticle[] = []
    
    // Generate 3-6 articles per week
    const numArticles = Math.floor(Math.random() * 4) + 3
    
    for (let i = 0; i < numArticles; i++) {
      articles.push(...this.generateRandomNews(year))
      articles.push(...this.generateDriverSpotlight())
    }

    return articles
  }
}