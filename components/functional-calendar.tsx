"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Play, CheckCircle, Lock, Flag, Sun, Cloud, CloudRain } from "lucide-react"
import type { Race, Season } from "@/lib/stock-car-data"
import { RaceWeekend } from "./race-weekend"
import { DRIVERS } from "@/lib/stock-car-data"

interface FunctionalCalendarProps {
  season: Season
  onRaceComplete: (race: Race, results: any[]) => void
}

export function FunctionalCalendar({ season, onRaceComplete }: FunctionalCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [activeWeekend, setActiveWeekend] = useState<{ race1: Race, race2: Race } | null>(null)

  const getNextAvailableWeekend = () => {
    // Find the first incomplete race weekend (both races must be incomplete)
    for (let i = 0; i < season.races.length; i += 2) {
      const race1 = season.races[i]
      const race2 = season.races[i + 1]
      if (race1 && race2 && (!race1.completed || !race2.completed)) {
        return { race1, race2 }
      }
    }
    return null
  }

  const canSimulateWeekend = (race1: Race, race2: Race) => {
    const nextWeekend = getNextAvailableWeekend()
    return nextWeekend?.race1.id === race1.id
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny": return <Sun className="h-4 w-4 text-yellow-500" />
      case "cloudy": return <Cloud className="h-4 w-4 text-gray-500" />
      case "rainy": return <CloudRain className="h-4 w-4 text-blue-500" />
      default: return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  const simulateWeekend = (race1: Race, race2: Race) => {
    if (!canSimulateWeekend(race1, race2)) {
      alert("Você deve simular os fins de semana em ordem sequencial!")
      return
    }

    setActiveWeekend({ race1, race2 })
  }

  const handleWeekendComplete = (completedRace1: Race, completedRace2: Race) => {
    // Update both races in the season
    onRaceComplete(completedRace1, completedRace1.results || [])
    onRaceComplete(completedRace2, completedRace2.results || [])
    setActiveWeekend(null)
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

  if (activeWeekend) {
    return <RaceWeekend {...activeWeekend} onWeekendComplete={handleWeekendComplete} onBack={() => setActiveWeekend(null)} />
  }

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
                {Math.floor(season.races.filter((r) => r.completed).length / 2)} de {season.races.length / 2} fins de semana
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(Math.floor(season.races.filter((r) => r.completed).length / 2) / (season.races.length / 2)) * 100}%`,
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
                <p className="text-muted-foreground">Nenhum fim de semana programado para {months[selectedMonth]}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(raceWeekends).map(([track, races]) => {
            const race1 = races.find((r) => r.raceType === "main") || races[0]
            const race2 = races.find((r) => r.raceType === "inverted") || races[1]
            
            if (!race1 || !race2) return null
            
            const weekendComplete = race1.completed && race2.completed
            const canSimulate = canSimulateWeekend(race1, race2)

            return (
              <Card key={track} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{race1.flag || "🏁"}</div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Flag className="h-5 w-5" />
                        GP {race1.location}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {race1.track} • {race1.state}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(race1.date).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Weekend Overview */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg border-2 ${race1.completed ? 'border-green-500 bg-green-50' : canSimulate ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {race1.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : 
                           canSimulate ? <Play className="h-4 w-4 text-blue-500 animate-pulse" /> :
                           <Lock className="h-4 w-4 text-gray-400" />}
                          <span className="font-semibold text-sm">CORRIDA 1</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {race1.laps} voltas • {race1.distance.toFixed(0)}km
                        </div>
                        {race1.completed && race1.results && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Vencedor: {
                                Array.isArray(race1.results) && race1.results.length > 0
                                  ? (
                                      race1.results && race1.results.length > 0
                                        ? (race1.results && race1.results.length > 0
                                            ? (race1.results && race1.results.length > 0
                                                ? DRIVERS.find(d => d.id === race1.results?.[0]?.driverId)?.name?.split(' ')[0] ?? "N/A"
                                                : "N/A")
                                            : "N/A")
                                        : "N/A"
                                    )
                                  : "N/A"
                              }
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              Tempo: 1:{(20 + Math.random() * 10).toFixed(0)}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}.{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={`p-3 rounded-lg border-2 ${race2.completed ? 'border-green-500 bg-green-50' : race1.completed ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {race2.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : 
                           race1.completed ? <Play className="h-4 w-4 text-orange-500 animate-pulse" /> :
                           <Lock className="h-4 w-4 text-gray-400" />}
                          <span className="font-semibold text-sm">CORRIDA 2</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {race2.laps} voltas • Grid Invertido
                        </div>
                        {race2.completed && race2.results && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Vencedor: {DRIVERS.find(d => d.id === race2.results![0]?.driverId)?.name.split(' ')[0]}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              Tempo: 1:{(15 + Math.random() * 8).toFixed(0)}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}.{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="text-center">
                      {canSimulate && (
                        <Button 
                          onClick={() => simulateWeekend(race1, race2)}
                          className="bg-black hover:bg-gray-800 text-white border-2 border-black"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          SIMULAR FIM DE SEMANA
                        </Button>
                      )}
                      {weekendComplete && (
                        <Badge variant="outline" className="text-sm px-4 py-2 border-2 border-green-500 text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          FIM DE SEMANA COMPLETO
                        </Badge>
                      )}
                      {!canSimulate && !weekendComplete && (
                        <Badge variant="secondary" className="text-sm px-4 py-2">
                          <Lock className="h-4 w-4 mr-1" />
                          AGUARDANDO
                        </Badge>
                      )}
                    </div>
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