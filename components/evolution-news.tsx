"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Newspaper, Clock, TrendingUp, Users, Building, Factory, Zap, Globe, Settings } from "lucide-react"
import type { HistoricalEvent } from "@/lib/historical-evolution"
import { EnhancedNewsGenerator, type NewsArticle } from "@/lib/enhanced-news-generator"

export function EvolutionNews({ events, currentYear }: EvolutionNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [newsGenerator] = useState(() => new EnhancedNewsGenerator())

  useEffect(() => {
    // Generate comprehensive news including events, random news, and weekly content
    const recentEvents = events.filter((event) => event.year === currentYear)
    const seasonNews = newsGenerator.generateSeasonNews(currentYear, recentEvents)
    const weeklyNews = newsGenerator.generateWeeklyNews(currentYear)
    
    const allNews = [...seasonNews, ...weeklyNews]
    setArticles(allNews)
  }, [events, currentYear, newsGenerator])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "breaking":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case "analysis":
        return <Newspaper className="h-4 w-4 text-blue-600" />
      case "interview":
        return <Users className="h-4 w-4 text-green-600" />
      case "announcement":
        return <Building className="h-4 w-4 text-purple-600" />
      case "race_preview":
        return <Zap className="h-4 w-4 text-orange-600" />
      case "technical":
        return <Settings className="h-4 w-4 text-gray-600" />
      case "market":
        return <Globe className="h-4 w-4 text-indigo-600" />
      default:
        return <Newspaper className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "breaking":
        return "Última Hora"
      case "analysis":
        return "Análise"
      case "interview":
        return "Entrevista"
      case "announcement":
        return "Anúncio"
      case "race_preview":
        return "Preview"
      case "technical":
        return "Técnico"
      case "market":
        return "Mercado"
      default:
        return "Notícia"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breaking":
        return "bg-red-100 text-red-800 border-red-200"
      case "analysis":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "interview":
        return "bg-green-100 text-green-800 border-green-200"
      case "announcement":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "race_preview":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "technical":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "market":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
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
    { value: "race_preview", label: "Previews" },
    { value: "technical", label: "Técnico" },
    { value: "market", label: "Mercado" },
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
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-xs ml-auto">
                            {article.priority === "high" ? "Alta Prioridade" : 
                             article.priority === "medium" ? "Média Prioridade" : "Baixa Prioridade"}
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
