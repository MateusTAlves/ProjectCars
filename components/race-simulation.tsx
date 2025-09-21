"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Zap, AlertTriangle } from "lucide-react"
import { type Race, type RaceResult, DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import { RaceSimulator } from "@/lib/race-simulation"

interface RaceSimulationProps {
  race: Race
  onRaceComplete: (results: RaceResult[]) => void
}

export function RaceSimulation({ race, onRaceComplete }: RaceSimulationProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentLap, setCurrentLap] = useState(0)
  const [results, setResults] = useState<RaceResult[] | null>(null)
  const [simulator] = useState(() => new RaceSimulator())

  const simulateRace = async () => {
    setIsSimulating(true)
    setProgress(0)
    setCurrentLap(0)
    setResults(null)

    // Simulate race progression
    for (let lap = 1; lap <= race.laps; lap++) {
      await new Promise((resolve) => setTimeout(resolve, 50)) // Animation delay
      setCurrentLap(lap)
      setProgress((lap / race.laps) * 100)
    }

    // Generate final results
    const raceResults = simulator.simulateRace(race)
    setResults(raceResults)
    setIsSimulating(false)
    onRaceComplete(raceResults)
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

  const getPositionColor = (position: number) => {
    if (position === 1) return "text-yellow-600"
    if (position === 2) return "text-gray-500"
    if (position === 3) return "text-amber-600"
    return "text-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">{race.name}</CardTitle>
              <p className="text-muted-foreground">
                {race.track} • {race.location}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg">
                <span>{getWeatherIcon(race.weather)}</span>
                <span className="capitalize">{race.weather}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {race.laps} voltas • {race.distance} km
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Race Simulation Controls */}
      {!results && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Simulação da Corrida</h3>
                <Button onClick={simulateRace} disabled={isSimulating} className="bg-primary hover:bg-primary/90">
                  {isSimulating ? "Simulando..." : "Iniciar Corrida"}
                </Button>
              </div>

              {isSimulating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Volta {currentLap} de {race.laps}
                    </span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Race Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Resultado Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => {
                const driver = DRIVERS.find((d) => d.id === result.driverId)
                const team = TEAMS.find((t) => t.id === result.teamId)
                const manufacturer = MANUFACTURERS.find((m) => m.id === result.manufacturerId)

                return (
                  <div
                    key={result.driverId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold w-8 text-center ${getPositionColor(result.position)}`}>
                        {result.position}
                      </div>
                      <div>
                        <div className="font-semibold">{driver?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team?.name} • {manufacturer?.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {result.fastestLap && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Volta Mais Rápida
                        </Badge>
                      )}

                      {result.dnf ? (
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            DNF
                          </Badge>
                          <div className="text-xs text-muted-foreground">{result.dnfReason}</div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="font-semibold text-primary">{result.points} pts</div>
                          {result.lapTime && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {result.lapTime}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
