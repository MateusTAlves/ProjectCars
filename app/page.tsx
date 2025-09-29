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
import { CarUpgrades } from "@/components/car-upgrades"
import { EvolutionTest } from "@/components/evolution-test"
import { TEAMS, DRIVERS } from "@/lib/stock-car-data"
import Image from "next/image"
import WelcomeScreen from "@/components/welcome-screen"
import { QualifyingRaceWeekend } from "@/components/qualifying-race-weekend"

export default function StockCarManager() {
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null)
  const [seasonManager] = useState(() => new SeasonManager())
  const [evolutionManager] = useState(() => new HistoricalEvolutionManager())
  const [historicalEvents, setHistoricalEvents] = useState<any[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showTeamSelection, setShowTeamSelection] = useState(false)
  const [showRaceWeekend, setShowRaceWeekend] = useState(false)

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

  const simulateFullSeason = () => {
    if (currentSeason && !currentSeason.completed) {
      const simulatedSeason = seasonManager.simulateFullSeason({ ...currentSeason })
      setCurrentSeason(simulatedSeason)
    }
  }

  const simulateNextRace = () => {
    if (currentSeason && !currentSeason.completed) {
      const updatedSeason = seasonManager.simulateNextRace({ ...currentSeason })
      setCurrentSeason(updatedSeason)
    }
  }

  const handleSimulateNext = () => {
    setShowRaceWeekend(true)
  }

  const handleWeekendComplete = (race1: any, race2: any) => {
    if (currentSeason) {
      const updatedRaces = currentSeason.races.map(race => {
        if (race.id === race1.id) return race1
        if (race.id === race2.id) return race2
        return race
      })
      
      const updatedSeason = {
        ...currentSeason,
        races: updatedRaces,
        completed: updatedRaces.every(r => r.completed)
      }
      
      setCurrentSeason(updatedSeason)
    }
    setShowRaceWeekend(false)
  }

  if (showTeamSelection) {
    return <TeamSelection onTeamSelected={handleTeamSelected} />
  }

  if (showRaceWeekend && currentSeason) {
    const nextWeekend = (() => {
      for (let i = 0; i < currentSeason.races.length; i += 2) {
        const race1 = currentSeason.races[i]
        const race2 = currentSeason.races[i + 1]
        if (race1 && race2 && (!race1.completed || !race2.completed)) {
          return { race1, race2 }
        }
      }
      return null
    })()
    
    if (nextWeekend) {
      return (
        <QualifyingRaceWeekend
          race1={nextWeekend.race1}
          race2={nextWeekend.race2}
          onWeekendComplete={handleWeekendComplete}
          onBack={() => setShowRaceWeekend(false)}
        />
      )
    }
  }

  if (!gameStarted) {
    return <WelcomeScreen onStart={startGame} />
  }

  if (!currentSeason) {
    return <div>Carregando...</div>
  }

  const selectedTeamData = TEAMS.find((t) => t.id === selectedTeam)
  const teamPrimaryColor = selectedTeamData?.colors.primary || "#3B82F6"
  const teamSecondaryColor = selectedTeamData?.colors.secondary || "#FFFFFF"

  return (
    <div className="min-h-screen bg-background">
      <header className="clean-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="title-medium">Stock Car Brasil Manager</h1>
                  <p className="text-subtle">Simulador Oficial do Automobilismo Nacional</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {selectedTeamData && (
                <div
                  className="flex items-center gap-3 px-4 py-2 rounded-lg border team-indicator"
                  style={{
                    "--team-color": teamPrimaryColor,
                  }}
                >
                  <div className="relative w-8 h-8 rounded overflow-hidden bg-secondary border">
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
              <Badge className="clean-badge">
                Temporada {currentSeason.year}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-section">
          <TabsList className="grid w-full grid-cols-9 h-12 p-1 bg-secondary rounded-lg border">
            <TabsTrigger
              value="dashboard"
              className="clean-tab data-[state=active]:clean-tab-active text-sm"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="manufacturers" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              <Car className="h-4 w-4 mr-1" />
              Montadoras
            </TabsTrigger>
            <TabsTrigger value="standings" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              <Trophy className="h-4 w-4 mr-1" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="stats" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              <Users className="h-4 w-4 mr-1" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              <Play className="h-4 w-4 mr-1" />
              Upgrades
            </TabsTrigger>
            <TabsTrigger value="history" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              <Building2 className="h-4 w-4 mr-1" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="news" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              📰 Notícias
            </TabsTrigger>
            <TabsTrigger value="evolution" className="clean-tab data-[state=active]:clean-tab-active text-sm">
              ⚡ Evolução
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview
              season={currentSeason}
              onStartNewSeason={startNewSeason}
              onSimulateFullSeason={simulateFullSeason}
              onSimulateNextRace={handleSimulateNext}
              teamColor={teamPrimaryColor}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <FunctionalCalendar season={currentSeason} onRaceComplete={handleRaceComplete} />
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
  onStartNewSeason,
  onSimulateFullSeason,
  onSimulateNextRace,
  teamColor,
}: {
  season: Season
  onStartNewSeason: () => void
  onSimulateFullSeason: () => void
  onSimulateNextRace: () => void
  teamColor: string
}) {
  const completedWeekends = Math.floor(season.races.filter((r) => r.completed).length / 2)
  const totalWeekends = season.races.length / 2
  const progress = (completedWeekends / totalWeekends) * 100

  const nextWeekend = (() => {
    for (let i = 0; i < season.races.length; i += 2) {
      const race1 = season.races[i]
      const race2 = season.races[i + 1]
      if (race1 && race2 && (!race1.completed || !race2.completed)) {
        return { race1, race2 }
      }
    }
    return null
  })()
  
  const lastCompletedRaces = (() => {
    for (let i = season.races.length - 2; i >= 0; i -= 2) {
      const race1 = season.races[i]
      const race2 = season.races[i + 1]
      if (race1?.completed && race2?.completed) {
        return { race1, race2 }
      }
    }
    return null
  })()

  return (
    <div className="space-content">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="clean-card team-indicator" style={{ "--team-color": teamColor } as React.CSSProperties}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{season.year}</div>
                <div className="text-subtle">Temporada</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="clean-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Trophy className="h-6 w-6 accent-green" />
              </div>
              <div>
                <div className="text-2xl font-bold accent-green">{completedWeekends}</div>
                <div className="text-subtle">Fins de Semana</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="clean-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="h-6 w-6 accent-orange" />
              </div>
              <div>
                <div className="text-2xl font-bold accent-orange">{progress.toFixed(0)}%</div>
                <div className="text-subtle">Progresso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="clean-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-6 w-6 accent-purple" />
              </div>
              <div>
                <div className="text-2xl font-bold accent-purple">{totalWeekends - completedWeekends}</div>
                <div className="text-subtle">Restantes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!season.completed && completedWeekends < totalWeekends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="clean-card hover-lift">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-primary text-primary-foreground">
                    <Play className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="title-small mb-3">Próxima Corrida</h3>
                <p className="text-muted-foreground mb-6">
                  Simule o próximo fim de semana de corrida
                </p>
                <Button
                  onClick={onSimulateNextRace}
                  className="clean-button"
                  disabled={!nextWeekend}
                >
                  <Play className="h-5 w-5 mr-3" />
                  Simular Próxima
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="clean-card hover-lift">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-yellow-500 text-white">
                    <Trophy className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="title-small mb-3">Temporada Completa</h3>
                <p className="text-muted-foreground mb-6">
                  Simule todos os {totalWeekends - completedWeekends} fins de semana restantes
                </p>
                <Button
                  onClick={onSimulateFullSeason}
                  className="clean-button"
                >
                  <Play className="h-5 w-5 mr-3" />
                  Simular Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!season.completed && completedWeekends < totalWeekends && nextWeekend && (
        <Card className="clean-card border-l-4" style={{ borderLeftColor: teamColor }}>
          <CardContent className="p-6">
            <div className="space-items">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{nextWeekend.race1.flag}</div>
                <div>
                  <h3 className="title-medium">Próximo: GP {nextWeekend.race1.location}</h3>
                  <p className="text-muted-foreground">{nextWeekend.race1.track} • {nextWeekend.race1.state}</p>
                </div>
                <div className="ml-auto">
                  <Badge className="clean-badge">
                    {new Date(nextWeekend.race1.date).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-secondary border">
                  <div className="text-lg font-semibold text-center">Corrida 1</div>
                  <div className="text-sm text-muted-foreground text-center">{nextWeekend.race1.laps} voltas</div>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="text-lg font-semibold text-center accent-orange">Corrida 2</div>
                  <div className="text-sm text-muted-foreground text-center">{nextWeekend.race2.laps} voltas • Grid Invertido</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nextWeekend && (
          <Card className="clean-card">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="title-small">Próximo Fim de Semana</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-items">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🏁</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl">GP {nextWeekend.race1.location}</h3>
                    <p className="text-muted-foreground">
                      {nextWeekend.race1.track} • {nextWeekend.race1.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {new Date(nextWeekend.race1.date).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <Badge className="clean-badge">2 Corridas</Badge>
                </div>
                <div className="text-center text-muted-foreground">
                  Vá para o Calendário para simular
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {lastCompletedRaces && (
          <Card className="clean-card">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Trophy className="h-5 w-5 accent-green" />
                </div>
                <span className="title-small">Último Fim de Semana</span>
                <span className="racing-text">ÚLTIMO FIM DE SEMANA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-items">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🏁</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl">GP {lastCompletedRaces.race1.location}</h3>
                    <p className="text-muted-foreground">
                      {lastCompletedRaces.race1.track} • {lastCompletedRaces.race1.state}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-semibold accent-green">Corrida 1</div>
                    <div className="text-sm text-muted-foreground">
                      {DRIVERS.find(d => d.id === lastCompletedRaces.race1.results?.[0]?.driverId)?.name.split(' ')[0]}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-semibold accent-blue">Corrida 2</div>
                    <div className="text-sm text-muted-foreground">
                      {DRIVERS.find(d => d.id === lastCompletedRaces.race2.results?.[0]?.driverId)?.name.split(' ')[0]}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {season.completed && (
          <Card className="md:col-span-2 clean-card">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="p-6 rounded-full bg-yellow-500 text-white mx-auto mb-6 w-fit">
                  <Trophy className="h-16 w-16" />
                </div>
                <h3 className="title-large mb-4">Temporada {season.year} Completa!</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Todos os fins de semana da temporada {season.year} foram concluídos.
                </p>
                <Button
                  onClick={onStartNewSeason}
                  className="clean-button px-8 py-3"
                >
                  <Trophy className="h-6 w-6 mr-3" />
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
