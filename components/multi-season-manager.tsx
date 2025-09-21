"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Trophy, Calendar, TrendingUp, History } from "lucide-react"
import type { Season } from "@/lib/stock-car-data"
import { SeasonManager as SeasonManagerClass } from "@/lib/season-manager"
import { SeasonManager } from "./season-manager"

export function MultiSeasonManager() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0)
  const [seasonManager] = useState(() => new SeasonManagerClass())

  // Initialize with first season if none exist
  if (seasons.length === 0) {
    const firstSeason = seasonManager.createSeason(2024)
    setSeasons([firstSeason])
  }

  const currentSeason = seasons[currentSeasonIndex]

  const handleSeasonComplete = (completedSeason: Season) => {
    // Update the completed season
    const updatedSeasons = seasons.map((season, index) => (index === currentSeasonIndex ? completedSeason : season))
    setSeasons(updatedSeasons)
  }

  const createNewSeason = () => {
    const nextYear = Math.max(...seasons.map((s) => s.year)) + 1
    const newSeason = seasonManager.createSeason(nextYear)
    setSeasons([...seasons, newSeason])
    setCurrentSeasonIndex(seasons.length) // Switch to new season
  }

  const goToPreviousSeason = () => {
    if (currentSeasonIndex > 0) {
      setCurrentSeasonIndex(currentSeasonIndex - 1)
    }
  }

  const goToNextSeason = () => {
    if (currentSeasonIndex < seasons.length - 1) {
      setCurrentSeasonIndex(currentSeasonIndex + 1)
    }
  }

  const getSeasonStats = (season: Season) => {
    const completedRaces = season.races.filter((r) => r.completed).length
    const totalRaces = season.races.length
    const progress = (completedRaces / totalRaces) * 100

    return {
      completedRaces,
      totalRaces,
      progress,
      isComplete: season.completed,
    }
  }

  return (
    <div className="space-y-6">
      {/* Multi-Season Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Stock Car Brasil Manager
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{seasons.length} temporadas</Badge>
              <Badge variant="secondary">{seasons.filter((s) => s.completed).length} completas</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Season Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goToPreviousSeason} disabled={currentSeasonIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Temporada Anterior
            </Button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary">Temporada {currentSeason?.year}</h2>
              <p className="text-sm text-muted-foreground">
                {currentSeasonIndex + 1} de {seasons.length}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={goToNextSeason} disabled={currentSeasonIndex === seasons.length - 1}>
                Próxima Temporada
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
              <Button onClick={createNewSeason} className="bg-primary hover:bg-primary/90">
                Nova Temporada
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Temporada Atual</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {currentSeason && <SeasonManager initialSeason={currentSeason} onSeasonComplete={handleSeasonComplete} />}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico de Temporadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seasons.map((season, index) => {
                  const stats = getSeasonStats(season)
                  const isCurrentSeason = index === currentSeasonIndex

                  return (
                    <div
                      key={season.year}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        isCurrentSeason ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/50"
                      }`}
                      onClick={() => setCurrentSeasonIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">Temporada {season.year}</h3>
                            {isCurrentSeason && <Badge variant="default">Atual</Badge>}
                            {stats.isComplete && <Badge variant="secondary">Completa</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {stats.completedRaces} de {stats.totalRaces} corridas • {stats.progress.toFixed(0)}%
                            completo
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{season.year}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.isComplete ? "Finalizada" : "Em andamento"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{seasons.length}</div>
                    <div className="text-sm text-muted-foreground">Temporadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{seasons.filter((s) => s.completed).length}</div>
                    <div className="text-sm text-muted-foreground">Completas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {seasons.reduce((acc, season) => acc + season.races.filter((r) => r.completed).length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Corridas Totais</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Season Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso das Temporadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seasons.map((season) => {
                  const stats = getSeasonStats(season)
                  return (
                    <div key={season.year} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Temporada {season.year}</span>
                        <span>
                          {stats.completedRaces}/{stats.totalRaces} corridas
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
