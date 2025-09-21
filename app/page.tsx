"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Calendar, TrendingUp, Play, Users, Car, Building2 } from "lucide-react"
import type { Season } from "@/lib/stock-car-data"
import { SeasonManager } from "@/lib/season-manager"
import { HistoricalEvolutionManager } from "@/lib/historical-evolution"
import { ChampionshipStandings } from "@/components/championship-standings"
import { ChampionshipStats } from "@/components/championship-stats"
import { HistoricalEvents } from "@/components/historical-events"
import { EvolutionNews } from "@/components/evolution-news"
import { FunctionalCalendar } from "@/components/functional-calendar"
import { ManufacturerShowcase } from "@/components/manufacturer-showcase"
import { TeamSelection } from "@/components/team-selection"
import { LapByLapSimulation } from "@/components/lap-by-lap-simulation"
import { CarUpgrades } from "@/components/car-upgrades"
import { EvolutionTest } from "@/components/evolution-test"
import { TEAMS, DRIVERS } from "@/lib/stock-car-data"
import Image from "next/image"
import WelcomeScreen from "@/components/welcome-screen"

export default function StockCarManager() {
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null)
  const [seasonManager] = useState(() => new SeasonManager())
  const [evolutionManager] = useState(() => new HistoricalEvolutionManager())
  const [historicalEvents, setHistoricalEvents] = useState<any[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showTeamSelection, setShowTeamSelection] = useState(false)
  const [activeRaceSimulation, setActiveRaceSimulation] = useState<any>(null)

  useEffect(() => {
    // Initialize the game with the first season
    if (!currentSeason && selectedTeam) {
      const initialSeason = seasonManager.createSeason(2025)
      setCurrentSeason(initialSeason)

      if (initialSeason.evolutionEvents) {
        setHistoricalEvents(initialSeason.evolutionEvents)
      }
    }
  }, [currentSeason, seasonManager, selectedTeam])

  const startGame = () => {
    setShowTeamSelection(true)
  }

  const handleTeamSelected = (teamId: string) => {
    setSelectedTeam(teamId)
    setShowTeamSelection(false)
    setGameStarted(true)
  }

  const handleRaceComplete = (race: any, results: any[]) => {
    if (currentSeason) {
      const updatedSeason = { ...currentSeason }
      const raceIndex = updatedSeason.races.findIndex((r) => r.id === race.id)
      if (raceIndex !== -1) {
        updatedSeason.races[raceIndex] = race
      }

      // Check if season is complete
      const allRacesCompleted = updatedSeason.races.every((r) => r.completed)
      if (allRacesCompleted) {
        updatedSeason.completed = true
      }

      setCurrentSeason(updatedSeason)
      setActiveRaceSimulation(null)
    }
  }

  const startNewSeason = () => {
    if (currentSeason) {
      const newSeason = seasonManager.createSeason(currentSeason.year + 1)

      if (newSeason.evolutionEvents) {
        setHistoricalEvents((prev) => [...prev, ...newSeason.evolutionEvents])
      }

      setCurrentSeason(newSeason)
    }
  }

  const simulateRace = (race: any) => {
    setActiveRaceSimulation(race)
  }

  const simulateFullSeason = () => {
    if (currentSeason && !currentSeason.completed) {
      const simulatedSeason = seasonManager.simulateFullSeason({ ...currentSeason })
      setCurrentSeason(simulatedSeason)
    }
  }

  if (showTeamSelection) {
    return <TeamSelection onTeamSelected={handleTeamSelected} />
  }

  if (!gameStarted) {
    return <WelcomeScreen onStart={startGame} />
  }

  if (activeRaceSimulation) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setActiveRaceSimulation(null)}>
                  ← Voltar
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Simulação ao Vivo</h1>
                  <p className="text-sm text-muted-foreground">{activeRaceSimulation.name}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <LapByLapSimulation race={activeRaceSimulation} onRaceComplete={handleRaceComplete} />
        </main>
      </div>
    )
  }

  if (!currentSeason) {
    return <div>Carregando...</div>
  }

  const selectedTeamData = TEAMS.find((t) => t.id === selectedTeam)
  const teamPrimaryColor = selectedTeamData?.colors.primary || "#3B82F6"
  const teamSecondaryColor = selectedTeamData?.colors.secondary || "#FFFFFF"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: teamPrimaryColor + "20" }}>
                  <Trophy className="h-6 w-6" style={{ color: teamPrimaryColor }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Stock Car Brasil Manager</h1>
                  <p className="text-sm text-muted-foreground">Simulador Oficial do Automobilismo Nacional</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {selectedTeamData && (
                <div
                  className="flex items-center gap-3 px-4 py-2 rounded-lg border-2 shadow-sm"
                  style={{
                    borderColor: teamPrimaryColor,
                    backgroundColor: teamPrimaryColor + "10",
                  }}
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border">
                    <Image
                      src={selectedTeamData.logo || "/placeholder.svg"}
                      alt={`${selectedTeamData.name} logo`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{selectedTeamData.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedTeamData.owner}</div>
                  </div>
                </div>
              )}
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 border-2"
                style={{ borderColor: teamPrimaryColor, color: teamPrimaryColor }}
              >
                Temporada {currentSeason.year}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 h-12 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="dashboard"
              className="text-sm py-2 data-[state=active]:shadow-sm"
              style={
                {
                  "--tw-ring-color": teamPrimaryColor,
                } as React.CSSProperties
              }
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-sm py-2">
              <Calendar className="h-4 w-4 mr-1" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="manufacturers" className="text-sm py-2">
              <Car className="h-4 w-4 mr-1" />
              Montadoras
            </TabsTrigger>
            <TabsTrigger value="standings" className="text-sm py-2">
              <Trophy className="h-4 w-4 mr-1" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-sm py-2">
              <Users className="h-4 w-4 mr-1" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="text-sm py-2">
              <Play className="h-4 w-4 mr-1" />
              Upgrades
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm py-2">
              <Building2 className="h-4 w-4 mr-1" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="news" className="text-sm py-2">
              📰 Notícias
            </TabsTrigger>
            <TabsTrigger value="evolution" className="text-sm py-2">
              ⚡ Evolução
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview
              season={currentSeason}
              onSimulateRace={simulateRace}
              onStartNewSeason={startNewSeason}
              onSimulateFullSeason={simulateFullSeason}
              teamColor={teamPrimaryColor}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <FunctionalCalendar
              season={currentSeason}
              onRaceComplete={handleRaceComplete}
              onSimulateRace={simulateRace}
            />
          </TabsContent>

          <TabsContent value="manufacturers">
            <ManufacturerShowcase season={currentSeason} />
          </TabsContent>

          <TabsContent value="standings">
            <ChampionshipStandings season={currentSeason} />
          </TabsContent>

          <TabsContent value="stats">
            <ChampionshipStats season={currentSeason} />
          </TabsContent>

          <TabsContent value="upgrades">
            <CarUpgrades selectedTeam={selectedTeamData} />
          </TabsContent>

          <TabsContent value="history">
            <HistoricalEvents events={historicalEvents} currentYear={currentSeason.year} />
          </TabsContent>

          <TabsContent value="news">
            <EvolutionNews events={historicalEvents} currentYear={currentSeason.year} />
          </TabsContent>

          <TabsContent value="evolution">
            <EvolutionTest />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function DashboardOverview({
  season,
  onSimulateRace,
  onStartNewSeason,
  onSimulateFullSeason,
  teamColor,
}: {
  season: Season
  onSimulateRace: (race: any) => void
  onStartNewSeason: () => void
  onSimulateFullSeason: () => void
  teamColor: string
}) {
  const completedRaces = season.races.filter((r) => r.completed).length
  const totalRaces = season.races.length
  const progress = (completedRaces / totalRaces) * 100

  const nextRace = season.races.find((r) => !r.completed)
  const lastRace = season.races.filter((r) => r.completed).pop()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4" style={{ borderLeftColor: teamColor }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6" style={{ color: teamColor }} />
              <div>
                <div className="text-2xl font-bold">{season.year}</div>
                <div className="text-sm text-muted-foreground">Temporada</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{completedRaces}</div>
                <div className="text-sm text-muted-foreground">Concluídas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{progress.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Progresso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{totalRaces - completedRaces}</div>
                <div className="text-sm text-muted-foreground">Restantes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!season.completed && completedRaces < totalRaces && (
        <Card className="border-2 border-dashed" style={{ borderColor: teamColor + "40" }}>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="h-10 w-10" style={{ color: teamColor }} />
                <TrendingUp className="h-10 w-10" style={{ color: teamColor }} />
              </div>
              <h3 className="text-xl font-bold mb-3">Simular Temporada Completa</h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                Execute todas as {totalRaces - completedRaces} corridas restantes automaticamente e veja os resultados
                finais da temporada {season.year}.
              </p>
              <Button
                size="lg"
                onClick={onSimulateFullSeason}
                className="px-8 py-3"
                style={{ backgroundColor: teamColor }}
              >
                <Play className="h-5 w-5 mr-2" />
                Simular Temporada Inteira
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nextRace && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" style={{ color: teamColor }} />
                Próxima Corrida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{nextRace.flag || "🏁"}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{nextRace.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {nextRace.track} • {nextRace.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {new Date(nextRace.date).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <Badge variant="outline">{nextRace.laps} voltas</Badge>
                </div>
                <Button
                  className="w-full"
                  onClick={() => onSimulateRace(nextRace)}
                  style={{ backgroundColor: teamColor }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Simular Corrida
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {lastRace && lastRace.results && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5" style={{ color: teamColor }} />
                Última Corrida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{lastRace.flag || "🏁"}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{lastRace.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lastRace.track} • {lastRace.location}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {lastRace.results.slice(0, 3).map((result, index) => {
                    const driver = DRIVERS.find((d) => d.id === result.driverId)
                    const positions = ["🥇", "🥈", "🥉"]
                    return (
                      <div
                        key={result.driverId}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{positions[index]}</span>
                          <span className="font-medium">{driver?.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.points} pts
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {season.completed && (
          <Card className="md:col-span-2 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: teamColor }} />
                <h3 className="text-2xl font-bold mb-3">Temporada {season.year} Completa!</h3>
                <p className="text-muted-foreground mb-6 text-base max-w-md mx-auto">
                  Parabéns! Você completou com sucesso a temporada {season.year} do Stock Car Brasil.
                </p>
                <Button
                  size="lg"
                  onClick={onStartNewSeason}
                  style={{ backgroundColor: teamColor }}
                  className="px-8 py-3"
                >
                  Iniciar Nova Temporada
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
