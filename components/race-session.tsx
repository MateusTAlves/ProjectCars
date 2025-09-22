"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Flag, Zap, Clock, Wrench, CloudRain, Sun, Cloud, Fuel } from "lucide-react"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import { RaceSimulator, type RaceSimulationData, type PitStop, type WeatherCondition } from "@/lib/race-simulation"
import type { Race } from "@/lib/stock-car-data"
import type { QualifyingResult } from "@/lib/qualifying-simulation"
import Image from "next/image"

interface RaceSessionProps {
  race: Race
  startingGrid: QualifyingResult[]
  raceType: "main" | "inverted"
  onRaceComplete: (simulation: RaceSimulationData) => void
  title: string
}

export function RaceSessionComponent({ race, startingGrid, raceType, onRaceComplete, title }: RaceSessionProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentLap, setCurrentLap] = useState(0)
  const [raceComplete, setRaceComplete] = useState(false)
  const [simulation, setSimulation] = useState<RaceSimulationData | null>(null)
  const [currentWeather, setCurrentWeather] = useState(race.weather)
  const [recentPitStops, setRecentPitStops] = useState<PitStop[]>([])
  const [speed, setSpeed] = useState(1000)
  const [simulator] = useState(() => new RaceSimulator())

  const startRace = () => {
    setIsRunning(true)
    setCurrentLap(0)
    setRaceComplete(false)
    
    // Generate full race simulation
    const raceSimulation = simulator.simulateRace(race, startingGrid, raceType)
    setSimulation(raceSimulation)
  }

  // Simulate race progression
  useEffect(() => {
    if (!isRunning || raceComplete || !simulation || currentLap >= race.laps) return

    const timer = setTimeout(() => {
      const nextLap = currentLap + 1
      setCurrentLap(nextLap)

      // Check for weather changes
      const weatherChange = simulation.weatherChanges.find(wc => wc.lap === nextLap)
      if (weatherChange) {
        setCurrentWeather(weatherChange.condition)
      }

      // Check for pit stops
      const lapPitStops = simulation.pitStops.filter(ps => ps.lap === nextLap)
      if (lapPitStops.length > 0) {
        setRecentPitStops(prev => [...lapPitStops, ...prev.slice(0, 4)])
      }

      // Complete race
      if (nextLap >= race.laps) {
        setIsRunning(false)
        setRaceComplete(true)
        onRaceComplete(simulation)
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [isRunning, currentLap, raceComplete, simulation, speed])

  const getWeatherIcon = (weather: "sunny" | "cloudy" | "rainy") => {
    switch (weather) {
      case "sunny": return <Sun className="h-5 w-5 text-yellow-500" />
      case "cloudy": return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy": return <CloudRain className="h-5 w-5 text-blue-500" />
    }
  }

  const getPitStopIcon = (reason: string) => {
    switch (reason) {
      case "mandatory": return <Wrench className="h-4 w-4 text-blue-500" />
      case "strategy": return <Zap className="h-4 w-4 text-purple-500" />
      case "damage": return <Flag className="h-4 w-4 text-red-500" />
      default: return <Wrench className="h-4 w-4" />
    }
  }

  const progress = (currentLap / race.laps) * 100

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{title}</CardTitle>
              <p className="text-lg opacity-90">{race.track}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                VOLTA {currentLap}/{race.laps}
              </div>
              <div className="flex items-center gap-2 justify-end">
                {getWeatherIcon(currentWeather)}
                <span className="text-lg">{currentWeather.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Progress value={progress} className="h-4 bg-gray-200" />
            
            <div className="flex items-center gap-4">
              {!raceComplete && (
                <>
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    variant={isRunning ? "secondary" : "default"}
                    className="bg-black hover:bg-gray-800 text-white border-2 border-black"
                  >
                    {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isRunning ? "PAUSAR" : simulation ? "CONTINUAR" : "INICIAR CORRIDA"}
                  </Button>

                  {!simulation && (
                    <Button onClick={startRace} className="bg-green-600 hover:bg-green-700 text-white">
                      <Flag className="h-4 w-4 mr-2" />
                      LARGADA!
                    </Button>
                  )}
                </>
              )}

              <Button 
                onClick={() => setSpeed(speed === 1000 ? 500 : speed === 500 ? 100 : 1000)} 
                variant="outline"
                className="border-2 border-black"
              >
                <Zap className="h-4 w-4 mr-2" />
                {speed === 1000 ? "1x" : speed === 500 ? "2x" : "10x"}
              </Button>

              <Badge variant="outline" className="text-lg px-4 py-2 border-2 border-black">
                <Clock className="h-4 w-4 mr-1" />
                {race.distance}km
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Race Data */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Positions */}
          <div className="lg:col-span-2">
            <Card className="border-4 border-black shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-black via-gray-900 to-black text-white">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  POSIÇÕES AO VIVO
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {simulation.results.map((result, index) => {
                    const driver = DRIVERS.find(d => d.id === result.driverId)!
                    const team = TEAMS.find(t => t.id === result.teamId)!
                    const manufacturer = MANUFACTURERS.find(m => m.id === result.manufacturerId)!

                    return (
                      <div
                        key={result.driverId}
                        className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-all hover:shadow-md ${
                          index === 0 ? 'border-yellow-400 bg-yellow-50' :
                          index < 3 ? 'border-gray-400 bg-gray-50' :
                          'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                          index === 0 ? 'bg-yellow-400 text-black border-yellow-600' :
                          index === 1 ? 'bg-gray-400 text-white border-gray-600' :
                          index === 2 ? 'bg-amber-600 text-white border-amber-800' :
                          'bg-white text-black border-gray-400'
                        }`}>
                          {result.position}
                        </div>

                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative w-6 h-6 rounded overflow-hidden bg-white border">
                            <Image
                              src={team.logo || "/placeholder.svg"}
                              alt={`${team.name} logo`}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          
                          <div>
                            <div className="font-bold text-sm">{driver.name}</div>
                            <div className="text-xs text-muted-foreground">{team.name}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          {result.dnf ? (
                            <Badge variant="destructive" className="font-bold">
                              DNF
                            </Badge>
                          ) : (
                            <div className="font-mono text-xs">
                              {index === 0 ? "LÍDER" : `+${(Math.random() * 30).toFixed(1)}s`}
                            </div>
                          )}
                        </div>

                        <div className="relative w-5 h-5 rounded overflow-hidden bg-white border">
                          <Image
                            src={manufacturer.logo || "/placeholder.svg"}
                            alt={`${manufacturer.name} logo`}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Updates */}
          <div className="space-y-4">
            {/* Weather Updates */}
            <Card className="border-2 border-blue-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getWeatherIcon(currentWeather)}
                  CONDIÇÕES
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-xl font-bold">{currentWeather.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentWeather === "rainy" ? "Pneus de chuva obrigatórios" :
                       currentWeather === "cloudy" ? "Condições instáveis" :
                       "Pista seca - pneus slick"}
                    </div>
                  </div>
                  
                  {simulation.weatherChanges.length > 1 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Mudanças Previstas:</h4>
                      {simulation.weatherChanges.slice(1).map((change, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span>Volta {change.lap}</span>
                          <div className="flex items-center gap-1">
                            {getWeatherIcon(change.condition)}
                            <span>{change.condition}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Pit Stops */}
            <Card className="border-2 border-orange-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5" />
                  PIT STOPS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {recentPitStops.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Nenhum pit stop ainda
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentPitStops.map((pitStop, index) => {
                      const driver = DRIVERS.find(d => d.id === pitStop.driverId)
                      return (
                        <div key={`${pitStop.driverId}-${pitStop.lap}-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                          {getPitStopIcon(pitStop.reason)}
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{driver?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Volta {pitStop.lap} • {pitStop.duration.toFixed(1)}s
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {pitStop.reason === "mandatory" ? "OBRIG" : 
                             pitStop.reason === "strategy" ? "ESTR" : "DANO"}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Race Info */}
            <Card className="border-2 border-purple-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="text-lg">INFORMAÇÕES</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Tipo de Corrida:</span>
                    <Badge variant="outline">
                      {raceType === "main" ? "PRINCIPAL" : "GRID INVERTIDO"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pit Stop Obrigatório:</span>
                    <Badge variant="secondary">
                      Voltas {Math.floor(race.laps * 0.3)}-{Math.floor(race.laps * 0.7)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reabastecimento:</span>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      PROIBIDO
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Troca Mínima:</span>
                    <Badge variant="outline">2 PNEUS</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tempo Atual:</span>
                    <Badge variant="outline" className="font-mono">
                      {Math.floor(currentLap * 1.2)}:{((currentLap * 1.2 % 1) * 60).toFixed(0).padStart(2, '0')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Race Complete */}
      {raceComplete && simulation && (
        <Card className="border-4 border-green-500 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-white">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
              <Flag className="h-8 w-8" />
              CORRIDA FINALIZADA!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">
                🏆 {DRIVERS.find(d => d.id === simulation.results[0]?.driverId)?.name}
              </h3>
              <p className="text-lg text-muted-foreground">
                Venceu {race.name}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                Tempo Total: {Math.floor(race.laps * 1.2)}:{((race.laps * 1.2 % 1) * 60).toFixed(0).padStart(2, '0')}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Top 3 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {simulation.results.slice(0, 3).map((result, index) => {
                const driver = DRIVERS.find(d => d.id === result.driverId)!
                const team = TEAMS.find(t => t.id === result.teamId)!
                const positions = ["🥇", "🥈", "🥉"]
                const colors = ["border-yellow-400 bg-yellow-50", "border-gray-400 bg-gray-50", "border-amber-600 bg-amber-50"]

                return (
                  <Card key={result.driverId} className={`border-2 ${colors[index]}`}>
                    <CardContent className="pt-4 text-center">
                      <div className="text-3xl mb-2">{positions[index]}</div>
                      <div className="font-bold">{driver.name}</div>
                      <div className="text-sm text-muted-foreground">{team.name}</div>
                      <Badge variant="outline" className="mt-2">
                        {result.points} pts
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        +{(index * 0.5 + Math.random() * 2).toFixed(3)}s
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Weather Summary */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Condições da Corrida</h4>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {getWeatherIcon(race.weather)}
                      <span>Largada: {race.weather}</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      {getWeatherIcon(currentWeather)}
                      <span>Final: {currentWeather}</span>
                    </div>
                  </div>
                  {simulation.weatherChanges.length > 1 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {simulation.weatherChanges.length - 1} mudança(s) de tempo durante a corrida
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  )
}