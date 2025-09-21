"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Newspaper, Clock, TrendingUp, Users, Building, Factory } from "lucide-react"
import type { HistoricalEvent } from "@/lib/historical-evolution"

interface EvolutionNewsProps {
  events: HistoricalEvent[]
  currentYear: number
}

interface NewsArticle {
  id: string
  title: string
  content: string
  category: "breaking" | "analysis" | "interview" | "announcement"
  timestamp: Date
  event: HistoricalEvent
}

export function EvolutionNews({ events, currentYear }: EvolutionNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    // Generate news articles from recent events
    const recentEvents = events.filter((event) => event.year === currentYear)
    const newArticles = recentEvents.map((event) => generateNewsArticle(event))
    setArticles(newArticles)
  }, [events, currentYear])

  const generateNewsArticle = (event: HistoricalEvent): NewsArticle => {
    const templates = {
      driver_entry: {
        breaking: {
          title: `OFICIAL: ${event.entityName} assina com equipe do Stock Car Brasil`,
          content: `Em uma movimentação que promete agitar o grid, ${event.entityName} foi oficialmente anunciado como novo piloto para a temporada ${event.year}. O piloto chega com grandes expectativas e promete lutar por posições de destaque.`,
        },
        analysis: {
          title: `Análise: O que ${event.entityName} pode trazer para o campeonato`,
          content: `A chegada de ${event.entityName} representa uma nova dinâmica no Stock Car Brasil. Com sua experiência e talento, o piloto pode ser uma peça-chave na disputa pelo título desta temporada.`,
        },
      },
      driver_exit: {
        breaking: {
          title: `${event.entityName} anuncia aposentadoria do Stock Car Brasil`,
          content: `Após anos de dedicação ao automobilismo nacional, ${event.entityName} oficializou sua saída do Stock Car Brasil. O piloto deixa um legado importante na categoria.`,
        },
        interview: {
          title: `"Foi uma jornada incrível", diz ${event.entityName} sobre aposentadoria`,
          content: `Em entrevista exclusiva, ${event.entityName} reflete sobre sua carreira no Stock Car Brasil e os momentos mais marcantes de sua trajetória no automobilismo.`,
        },
      },
      team_entry: {
        announcement: {
          title: `${event.entityName} confirma entrada no Stock Car Brasil`,
          content: `A nova equipe ${event.entityName} foi oficialmente confirmada para disputar o campeonato. Com investimentos significativos, a equipe promete ser competitiva desde sua estreia.`,
        },
      },
      team_exit: {
        breaking: {
          title: `${event.entityName} anuncia saída do Stock Car Brasil`,
          content: `Por motivos financeiros, a equipe ${event.entityName} confirmou sua saída do campeonato. A decisão impacta diretamente os pilotos e funcionários da equipe.`,
        },
      },
      manufacturer_entry: {
        announcement: {
          title: `${event.entityName} entra oficialmente no Stock Car Brasil`,
          content: `A montadora ${event.entityName} marca sua entrada no automobilismo nacional com grandes investimentos e expectativas de competitividade.`,
        },
      },
    }

    const eventTemplates = templates[event.type as keyof typeof templates]
    if (!eventTemplates) {
      return {
        id: `news-${event.id}`,
        title: `Novidades sobre ${event.entityName}`,
        content: event.description,
        category: "announcement",
        timestamp: new Date(),
        event,
      }
    }

    const templateKeys = Object.keys(eventTemplates)
    const randomTemplate = templateKeys[Math.floor(Math.random() * templateKeys.length)]
    const template = eventTemplates[randomTemplate as keyof typeof eventTemplates]

    return {
      id: `news-${event.id}`,
      title: template.title,
      content: template.content,
      category: randomTemplate as NewsArticle["category"],
      timestamp: new Date(),
      event,
    }
  }

  const getCategoryIcon = (category: NewsArticle["category"]) => {
    switch (category) {
      case "breaking":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case "analysis":
        return <Newspaper className="h-4 w-4 text-blue-600" />
      case "interview":
        return <Users className="h-4 w-4 text-green-600" />
      case "announcement":
        return <Building className="h-4 w-4 text-purple-600" />
      default:
        return <Newspaper className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: NewsArticle["category"]) => {
    switch (category) {
      case "breaking":
        return "Última Hora"
      case "analysis":
        return "Análise"
      case "interview":
        return "Entrevista"
      case "announcement":
        return "Anúncio"
      default:
        return "Notícia"
    }
  }

  const getCategoryColor = (category: NewsArticle["category"]) => {
    switch (category) {
      case "breaking":
        return "bg-red-100 text-red-800 border-red-200"
      case "analysis":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "interview":
        return "bg-green-100 text-green-800 border-green-200"
      case "announcement":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory === "all") return true
    return article.category === selectedCategory
  })

  const categories = [
    { value: "all", label: "Todas as Notícias" },
    { value: "breaking", label: "Última Hora" },
    { value: "analysis", label: "Análises" },
    { value: "interview", label: "Entrevistas" },
    { value: "announcement", label: "Anúncios" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              Central de Notícias - Stock Car Brasil
            </CardTitle>
            <Badge variant="outline" className="animate-pulse">
              {currentYear}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium">Categoria:</span>
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* News Articles */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notícia disponível no momento.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredArticles
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">{getCategoryIcon(article.category)}</div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                            {getCategoryLabel(article.category)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Agora mesmo</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-3 text-balance">{article.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{article.content}</p>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {article.event.type.includes("driver") && <Users className="h-4 w-4" />}
                            {article.event.type.includes("team") && <Building className="h-4 w-4" />}
                            {article.event.type.includes("manufacturer") && <Factory className="h-4 w-4" />}
                            <span>Relacionado: {article.event.entityName}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {article.event.impact === "high"
                              ? "Alto Impacto"
                              : article.event.impact === "medium"
                                ? "Médio Impacto"
                                : "Baixo Impacto"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Breaking News Ticker */}
      {articles.filter((a) => a.category === "breaking").length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white animate-pulse">ÚLTIMA HORA</Badge>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  {articles
                    .filter((a) => a.category === "breaking")
                    .map((article) => article.title)
                    .join(" • ")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
