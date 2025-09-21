"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, Flag, Users, TrendingUp } from "lucide-react"
import { type Race, DRIVERS, TEAMS } from "@/lib/stock-car-data"

interface LiveRaceTrackerProps {
  race: Race
  isLive: boolean
}

export function LiveRaceTracker({ race, isLive }: LiveRaceTrackerProps) {
  const [currentLap, setCurrentLap] = useState(1)
  const [positions, setPositions] = useState<string[]>([])
  const [incidents, setIncidents] = useState<string[]>([])

  useEffect(() => {
    if (!isLive) return

    // Simulate live race updates
    const interval = setInterval(() => {
      setCurrentLap((prev) => {
        if (prev >= race.laps) return prev
        return prev + 1
      })

      // Simulate position changes
      if (Math.random() < 0.3) {
        const activeDrivers = DRIVERS.filter((d) => d.active)
        const shuffled = [...activeDrivers].sort(() => Math.random() - 0.5)
        setPositions(shuffled.slice(0, 5).map((d) => d.id))
      }

      // Simulate incidents
      if (Math.random() < 0.1) {
        const incidents = [
          "Toque entre pilotos na curva 3",
          "Bandeira amarela - detritos na pista",
          "Pit stop estratégico",
          "Ultrapassagem espetacular!",
          "Problema mecânico reportado",
        ]
        const randomIncident = incidents[Math.floor(Math.random() * incidents.length)]
        setIncidents((prev) => [randomIncident, ...prev.slice(0, 4)])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isLive, race.laps])

  const progress = (currentLap / race.laps) * 100

  return (
    <div className="space-y-4">
      {/* Race Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              {isLive ? "AO VIVO" : "Aguardando"}
            </CardTitle>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>
                Volta {currentLap} de {race.laps}
              </span>
              <span>{progress.toFixed(0)}% completo</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                Tempo estimado: {Math.max(0, race.laps - currentLap)} min
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {DRIVERS.filter((d) => d.active).length} pilotos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Positions */}
      {isLive && positions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Posições Atuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {positions.map((driverId, index) => {
                const driver = DRIVERS.find((d) => d.id === driverId)
                const team = TEAMS.find((t) => t.id === driver?.teamId)

                return (
                  <div key={driverId} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-primary w-6">{index + 1}</div>
                    <div className="flex-1">
                      <div className="font-medium">{driver?.name}</div>
                      <div className="text-xs text-muted-foreground">{team?.name}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Incidents */}
      {isLive && incidents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Últimas Atualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incidents.map((incident, index) => (
                <div key={index} className="p-2 rounded-lg bg-accent/50 text-sm border-l-2 border-primary">
                  {incident}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
