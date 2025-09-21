"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, MapPin, Trophy, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import type { Season, Race } from "@/lib/stock-car-data"

interface SeasonCalendarProps {
  season: Season
  onRaceSelect: (race: Race) => void
  selectedRace?: Race
}

export function SeasonCalendar({ season, onRaceSelect, selectedRace }: SeasonCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(season.year)

  const completedRaces = season.races.filter((race) => race.completed).length
  const progress = (completedRaces / season.races.length) * 100

  const monthNames = [
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

  const getRacesForMonth = (month: number, year: number) => {
    return season.races.filter((race) => {
      const raceDate = new Date(race.date)
      return raceDate.getMonth() === month && raceDate.getFullYear() === year
    })
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const getRaceStatus = (race: Race) => {
    if (race.completed) return "completed"
    const now = new Date()
    const raceDate = new Date(race.date)
    if (raceDate < now) return "current"
    return "upcoming"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "current":
        return "bg-primary/10 text-primary border-primary/20"
      case "upcoming":
        return "bg-gray-100 text-gray-600 border-gray-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída"
      case "current":
        return "Próxima"
      case "upcoming":
        return "Agendada"
      default:
        return "Agendada"
    }
  }

  const currentMonthRaces = getRacesForMonth(currentMonth, currentYear)

  return (
    <div className="space-y-6">
      {/* Season Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Temporada {season.year}
            </CardTitle>
            <Badge variant={season.completed ? "default" : "secondary"}>
              {season.completed ? "Finalizada" : "Em Andamento"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>
                {completedRaces} de {season.races.length} corridas concluídas
              </span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentMonthRaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma corrida agendada para este mês</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentMonthRaces
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((race) => {
                  const status = getRaceStatus(race)
                  const isSelected = selectedRace?.id === race.id

                  return (
                    <div
                      key={race.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/50"
                      }`}
                      onClick={() => onRaceSelect(race)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{race.name}</h3>
                            <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {race.track} • {race.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(race.date).toLocaleDateString("pt-BR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {race.laps} voltas • {race.distance} km
                          </div>
                          {race.completed && race.results && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground">Vencedor:</div>
                              <div className="font-medium text-primary">
                                {/* We'll get the winner from results */}
                                P1
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{season.races.length}</div>
              <div className="text-sm text-muted-foreground">Total de Corridas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedRaces}</div>
              <div className="text-sm text-muted-foreground">Concluídas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{season.races.length - completedRaces}</div>
              <div className="text-sm text-muted-foreground">Restantes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(season.races.reduce((acc, race) => acc + race.distance, 0))}
              </div>
              <div className="text-sm text-muted-foreground">KM Total</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
