"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, SkipForward, Trophy, Clock } from "lucide-react"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import type { Race, RaceResult } from "@/lib/stock-car-data"
import Image from "next/image"

interface LapByLapSimulationProps {
  race: Race
  onRaceComplete: (race: Race, results: RaceResult[]) => void
}

interface LapPosition {
  driverId: string
  position: number
  lapTime: number
  totalTime: number
  gap: number
  sector1: number
  sector2: number
  sector3: number
}

export function LapByLapSimulation({ race, onRaceComplete }: LapByLapSimulationProps) {
  const [currentLap, setCurrentLap] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [positions, setPositions] = useState<LapPosition[]>([])
  const [raceComplete, setRaceComplete] = useState(false)
  const [speed, setSpeed] = useState(1000) // milliseconds between laps

  // Initialize race positions
  useEffect(() => {
    const initialPositions: LapPosition[] = DRIVERS.filter((d) => d.active)
      .map((driver, index) => ({
        driverId: driver.id,
        position: index + 1,
        lapTime: 0,
        totalTime: 0,
        gap: 0,
        sector1: 0,
        sector2: 0,
        sector3: 0,
      }))
      .sort(() => Math.random() - 0.5) // Random starting grid
      .map((pos, index) => ({ ...pos, position: index + 1 }))

    setPositions(initialPositions)
  }, [])

  // Simulate lap progression
  useEffect(() => {
    if (!isRunning || raceComplete || currentLap >= race.laps) return

    const timer = setTimeout(() => {
      simulateNextLap()
    }, speed)

    return () => clearTimeout(timer)
  }, [isRunning, currentLap, raceComplete, speed, positions])

  const simulateNextLap = () => {
    const nextLap = currentLap + 1

    if (nextLap >= race.laps) {
      completeRace()
      return
    }

    // Simulate lap times and position changes
    const newPositions = positions.map((pos) => {
      const driver = DRIVERS.find((d) => d.id === pos.driverId)!
      const team = TEAMS.find((t) => t.id === driver.teamId)!
      const manufacturer = MANUFACTURERS.find((m) => m.id === driver.manufacturerId)!

      // Generate realistic lap time based on driver/team/manufacturer performance
      const baseTime = 85000 + Math.random() * 5000 // 1:25-1:30 base time in ms
      const skillFactor = (100 - driver.skill) * 100
      const teamFactor = (100 - team.reputation) * 50
      const manufacturerFactor = (100 - manufacturer.performance) * 30
      const weatherFactor = race.weather === "rainy" ? 3000 : race.weather === "cloudy" ? 1000 : 0

      const lapTime =
        baseTime + skillFactor + teamFactor + manufacturerFactor + weatherFactor + (Math.random() * 2000 - 1000)

      // Generate sector times
      const sector1 = lapTime * (0.3 + Math.random() * 0.1)
      const sector2 = lapTime * (0.35 + Math.random() * 0.1)
      const sector3 = lapTime - sector1 - sector2

      return {
        ...pos,
        lapTime,
        totalTime: pos.totalTime + lapTime,
        sector1,
        sector2,
        sector3,
      }
    })

    // Sort by total time and update positions
    const sortedPositions = newPositions
      .sort((a, b) => a.totalTime - b.totalTime)
      .map((pos, index) => ({
        ...pos,
        position: index + 1,
        gap: index === 0 ? 0 : pos.totalTime - newPositions.sort((a, b) => a.totalTime - b.totalTime)[0].totalTime,
      }))

    setPositions(sortedPositions)
    setCurrentLap(nextLap)
  }

  const completeRace = () => {
    setIsRunning(false)
    setRaceComplete(true)

    // Generate final results
    const results: RaceResult[] = positions.map((pos, index) => {
      const driver = DRIVERS.find((d) => d.id === pos.driverId)!
      const team = TEAMS.find((t) => t.id === driver.teamId)!

      // Points system: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1
      const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
      const points = index < pointsSystem.length ? pointsSystem[index] : 0

      return {
        position: pos.position,
        driverId: pos.driverId,
        teamId: team.id,
        manufacturerId: driver.manufacturerId,
        points,
        fastestLap: false, // Could implement fastest lap logic
        dnf: false,
        lapTime: formatTime(pos.lapTime),
      }
    })

    // Mark fastest lap
    const fastestLapIndex = positions.findIndex((pos) => pos.lapTime === Math.min(...positions.map((p) => p.lapTime)))
    if (fastestLapIndex !== -1) {
      results[fastestLapIndex].fastestLap = true
    }

    const completedRace = {
      ...race,
      completed: true,
      results,
    }

    onRaceComplete(completedRace, results)
  }

  const formatTime = (timeMs: number): string => {
    const minutes = Math.floor(timeMs / 60000)
    const seconds = Math.floor((timeMs % 60000) / 1000)
    const milliseconds = Math.floor((timeMs % 1000) / 10)
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  const formatGap = (gapMs: number): string => {
    if (gapMs === 0) return "Líder"
    if (gapMs < 1000) return `+${Math.floor(gapMs)}ms`
    return `+${(gapMs / 1000).toFixed(3)}s`
  }

  const progress = (currentLap / race.laps) * 100

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{race.name}</CardTitle>
              <p className="text-muted-foreground">
                {race.track} • {race.location}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                Volta {currentLap}/{race.laps}
              </div>
              <div className="text-sm text-muted-foreground">{race.distance}km</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                disabled={raceComplete}
                variant={isRunning ? "secondary" : "default"}
              >
                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? "Pausar" : "Iniciar"}
              </Button>

              <Button onClick={() => setSpeed(speed === 1000 ? 500 : speed === 500 ? 100 : 1000)} variant="outline">
                <SkipForward className="h-4 w-4 mr-2" />
                {speed === 1000 ? "1x" : speed === 500 ? "2x" : "10x"}
              </Button>

              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {race.weather === "sunny" ? "☀️ Ensolarado" : race.weather === "cloudy" ? "☁️ Nublado" : "🌧️ Chuva"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação ao Vivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {positions.map((pos, index) => {
              const driver = DRIVERS.find((d) => d.id === pos.driverId)!
              const team = TEAMS.find((t) => t.id === driver.teamId)!
              const manufacturer = MANUFACTURERS.find((m) => m.id === driver.manufacturerId)!

              return (
                <div
                  key={pos.driverId}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    index < 3 ? "bg-muted/50" : "bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                            ? "bg-gray-400 text-black"
                            : index === 2
                              ? "bg-amber-600 text-white"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {pos.position}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded overflow-hidden bg-muted">
                        <Image
                          src={team.logo || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-xs text-muted-foreground">{team.name}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-mono">{formatGap(pos.gap)}</div>
                      <div className="text-xs text-muted-foreground">Gap</div>
                    </div>

                    {pos.lapTime > 0 && (
                      <div className="text-right">
                        <div className="font-mono">{formatTime(pos.lapTime)}</div>
                        <div className="text-xs text-muted-foreground">Última volta</div>
                      </div>
                    )}

                    <div className="relative w-4 h-4 rounded overflow-hidden bg-muted">
                      <Image
                        src={manufacturer.logo || "/placeholder.svg"}
                        alt={`${manufacturer.name} logo`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {raceComplete && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Corrida Finalizada!</h3>
              <p className="text-muted-foreground mb-4">
                {DRIVERS.find((d) => d.id === positions[0]?.driverId)?.name} venceu o {race.name}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
