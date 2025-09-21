"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, SkipForward, RotateCcw, Settings, Trophy } from "lucide-react"
import type { Season, Race, RaceResult } from "@/lib/stock-car-data"
import { SeasonManager as SeasonManagerClass } from "@/lib/season-manager"
import { SeasonCalendar } from "./season-calendar"
import { RaceSimulation } from "./race-simulation"
import { RacePreview } from "./race-preview"

interface SeasonManagerProps {
  initialSeason: Season
  onSeasonComplete: (season: Season) => void
}

export function SeasonManager({ initialSeason, onSeasonComplete }: SeasonManagerProps) {
  const [season, setSeason] = useState<Season>(initialSeason)
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [seasonManager] = useState(() => new SeasonManagerClass())

  useEffect(() => {
    if (autoMode && !season.completed) {
      const interval = setInterval(() => {
        simulateNextRace()
      }, 3000) // Auto-simulate every 3 seconds

      return () => clearInterval(interval)
    }
  }, [autoMode, season.completed])

  const simulateNextRace = () => {
    if (season.completed) return

    setIsSimulating(true)
    const updatedSeason = seasonManager.simulateNextRace(season)
    setSeason(updatedSeason)

    if (updatedSeason.completed) {
      setAutoMode(false)
      onSeasonComplete(updatedSeason)
    }

    setIsSimulating(false)
  }

  const simulateFullSeason = () => {
    setIsSimulating(true)
    const updatedSeason = seasonManager.simulateFullSeason(season)
    setSeason(updatedSeason)
    onSeasonComplete(updatedSeason)
    setIsSimulating(false)
  }

  const resetSeason = () => {
    const newSeason = seasonManager.createSeason(season.year)
    setSeason(newSeason)
    setSelectedRace(null)
    setAutoMode(false)
  }

  const handleRaceComplete = (results: RaceResult[]) => {
    // Update the race with results
    const updatedRaces = season.races.map((race) =>
      race.id === selectedRace?.id ? { ...race, results, completed: true } : race,
    )

    const updatedSeason = {
      ...season,
      races: updatedRaces,
      completed: updatedRaces.every((race) => race.completed),
    }

    setSeason(updatedSeason)

    if (updatedSeason.completed) {
      onSeasonComplete(updatedSeason)
    }
  }

  const currentRace = seasonManager.getCurrentRace(season)
  const lastRace = seasonManager.getLastRace(season)
  const progress = seasonManager.getSeasonProgress(season)

  return (
    <div className="space-y-6">
      {/* Season Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Controle da Temporada {season.year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={season.completed ? "default" : "secondary"}>
                {season.completed ? "Finalizada" : `${progress.toFixed(0)}% Completa`}
              </Badge>
              <Badge variant="outline">{season.races.filter((r) => r.completed).length} corridas</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            {!season.completed && (
              <>
                <Button
                  onClick={simulateNextRace}
                  disabled={isSimulating || !currentRace}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {currentRace ? "Próxima Corrida" : "Temporada Completa"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setAutoMode(!autoMode)}
                  disabled={isSimulating}
                  className={autoMode ? "bg-primary/10 border-primary" : ""}
                >
                  {autoMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Modo Automático
                </Button>

                <Button variant="outline" onClick={simulateFullSeason} disabled={isSimulating}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Simular Tudo
                </Button>
              </>
            )}

            <Button variant="outline" onClick={resetSeason}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar Temporada
            </Button>

            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>

          {autoMode && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium">Modo automático ativo - Simulando corridas...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="current">Corrida Atual</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <SeasonCalendar season={season} onRaceSelect={setSelectedRace} selectedRace={selectedRace} />
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          {currentRace ? (
            <RacePreview race={currentRace} onStartRace={() => setSelectedRace(currentRace)} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Temporada Completa!</h3>
                  <p className="text-muted-foreground">
                    Todas as corridas da temporada {season.year} foram concluídas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {lastRace && lastRace.results ? (
            <RaceSimulation
              race={lastRace}
              onRaceComplete={() => {
                /* Already completed */
              }}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma corrida foi concluída ainda.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Race Simulation Modal */}
      {selectedRace && !selectedRace.completed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Simulação da Corrida</h2>
                <Button variant="outline" onClick={() => setSelectedRace(null)}>
                  Fechar
                </Button>
              </div>
              <RaceSimulation race={selectedRace} onRaceComplete={handleRaceComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
