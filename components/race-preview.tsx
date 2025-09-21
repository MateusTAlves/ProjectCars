"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Users, Gauge } from "lucide-react"
import { type Race, DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"

interface RacePreviewProps {
  race: Race
  onStartRace: () => void
}

export function RacePreview({ race, onStartRace }: RacePreviewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return "☀️"
      case "cloudy":
        return "☁️"
      case "rainy":
        return "🌧️"
      default:
        return "☀️"
    }
  }

  const activeDrivers = DRIVERS.filter((d) => d.active)
  const activeTeams = TEAMS.filter((t) => t.active)
  const activeManufacturers = MANUFACTURERS.filter((m) => m.active)

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-primary mb-2">{race.name}</CardTitle>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {race.track} • {race.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(race.date)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl mb-2">
                <span>{getWeatherIcon(race.weather)}</span>
                <span className="capitalize font-semibold">{race.weather}</span>
              </div>
              <Badge variant="outline" className="text-sm">
                Condições da Pista
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Race Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{race.laps}</div>
                <div className="text-sm text-muted-foreground">Voltas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{race.distance}</div>
                <div className="text-sm text-muted-foreground">Quilômetros</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeDrivers.length}</div>
                <div className="text-sm text-muted-foreground">Pilotos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipes Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTeams.slice(0, 5).map((team) => {
                const manufacturer = MANUFACTURERS.find((m) => m.id === team.manufacturerId)
                return (
                  <div key={team.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-muted-foreground">{manufacturer?.name}</div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: team.colors.primary }} />
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: team.colors.secondary }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favoritos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeDrivers
                .sort((a, b) => b.skill - a.skill)
                .slice(0, 5)
                .map((driver, index) => {
                  const team = TEAMS.find((t) => t.id === driver.teamId)
                  return (
                    <div key={driver.id} className="flex items-center gap-3">
                      <div className="text-lg font-bold text-primary w-6">{index + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team?.name} • {driver.wins} vitórias
                        </div>
                      </div>
                      <Badge variant="outline">{driver.skill}/100</Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Race Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button onClick={onStartRace} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3">
              Iniciar Corrida
            </Button>
            <p className="text-sm text-muted-foreground mt-2">Clique para simular esta corrida</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
