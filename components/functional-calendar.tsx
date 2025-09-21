"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Play, CheckCircle, Lock, Flag } from "lucide-react"
import type { Race, Season } from "@/lib/stock-car-data"
import { RaceSimulator } from "@/lib/race-simulation"

interface FunctionalCalendarProps {
  season: Season
  onRaceComplete: (race: Race, results: any[]) => void
  onSimulateRace: (race: Race) => void
}

export function FunctionalCalendar({ season, onRaceComplete, onSimulateRace }: FunctionalCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [simulator] = useState(() => new RaceSimulator())

  const getNextAvailableRace = () => {
    return season.races.find((race) => !race.completed)
  }

  const canSimulateRace = (race: Race) => {
    const nextRace = getNextAvailableRace()
    return nextRace?.id === race.id
  }

  const simulateRace = (race: Race) => {
    if (!canSimulateRace(race)) {
      alert("Você deve simular as corridas em ordem sequencial!")
      return
    }

    onSimulateRace(race)
  }

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const racesByMonth = season.races.reduce(
    (acc, race) => {
      const month = new Date(race.date).getMonth()
      if (!acc[month]) acc[month] = []
      acc[month].push(race)
      return acc
    },
    {} as Record<number, Race[]>,
  )

  const currentMonthRaces = racesByMonth[selectedMonth] || []

  const raceWeekends = currentMonthRaces.reduce(
    (acc, race) => {
      const trackKey = race.track
      if (!acc[trackKey]) acc[trackKey] = []
      acc[trackKey].push(race)
      return acc
    },
    {} as Record<string, Race[]>,
  )

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-foreground" />
              Calendário da Temporada {season.year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                disabled={selectedMonth === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="outline" className="px-4 py-2 text-base">
                {months[selectedMonth]}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))}
                disabled={selectedMonth === 11}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Season Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso da Temporada</span>
              <span className="text-sm text-muted-foreground">
                {season.races.filter((r) => r.completed).length} de {season.races.length} corridas
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(season.races.filter((r) => r.completed).length / season.races.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race Weekends for Selected Month */}
      <div className="space-y-4">
        {Object.keys(raceWeekends).length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma corrida programada para {months[selectedMonth]}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(raceWeekends).map(([track, races]) => {
            const mainRace = races.find((r) => r.raceType === "main") || races[0]
            const invertedRace = races.find((r) => r.raceType === "inverted") || races[1]

            return (
              <Card key={track} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{mainRace.flag || "🏁"}</div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Flag className="h-5 w-5" />
                        GP {mainRace.location}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {mainRace.track} • {mainRace.state}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(mainRace.date).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {races.map((race) => {
                      const isNext = canSimulateRace(race)
                      const isCompleted = race.completed
                      const isLocked = !isNext && !isCompleted

                      return (
                        <div
                          key={race.id}
                          className={`p-3 rounded-lg border ${isNext ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {isNext && <Play className="h-4 w-4 text-primary animate-pulse" />}
                                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                <h4 className="font-medium text-sm">{race.name}</h4>
                                <Badge variant={race.raceType === "main" ? "default" : "secondary"} className="text-xs">
                                  {race.raceType === "main" ? "Principal" : "Grid Invertido"}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <span>{race.laps} voltas</span>
                                <span>{race.distance.toFixed(0)} km</span>
                                <span>
                                  {new Date(race.date).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {/* Race Results Preview */}
                              {isCompleted && race.results && (
                                <div className="mt-2 flex gap-2">
                                  {race.results.slice(0, 3).map((result, idx) => {
                                    const positions = ["🥇", "🥈", "🥉"]
                                    return (
                                      <div key={result.driverId} className="flex items-center gap-1">
                                        <span className="text-xs">{positions[idx]}</span>
                                        <Badge variant="outline" className="text-xs px-1">
                                          {result.points}pts
                                        </Badge>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            <div className="ml-3">
                              {isNext && (
                                <Button size="sm" onClick={() => simulateRace(race)}>
                                  <Play className="h-3 w-3 mr-1" />
                                  Simular
                                </Button>
                              )}
                              {isCompleted && (
                                <Badge variant="outline" className="text-xs">
                                  Concluída
                                </Badge>
                              )}
                              {isLocked && (
                                <Badge variant="secondary" className="text-xs">
                                  Bloqueada
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
