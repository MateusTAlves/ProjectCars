"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, Zap, Trophy, Clock, Flag, CloudRain, Sun, Cloud } from "lucide-react"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import { QualifyingSimulator, type QualifyingWeekend, type QualifyingSession } from "@/lib/qualifying-simulation"
import Image from "next/image"

interface QualifyingSessionProps {
  raceId: string
  weather: "sunny" | "cloudy" | "rainy"
  onQualifyingComplete: (qualifying: QualifyingWeekend) => void
}

export function QualifyingSessionComponent({ raceId, weather, onQualifyingComplete }: QualifyingSessionProps) {
  const [currentSession, setCurrentSession] = useState<"Q1" | "Q2" | "Q3" | "complete">("Q1")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [qualifying, setQualifying] = useState<QualifyingWeekend | null>(null)
  const [simulator] = useState(() => new QualifyingSimulator())

  const startQualifying = async () => {
    setIsRunning(true)
    setProgress(0)

    // Simulate Q1
    setCurrentSession("Q1")
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProgress(33)

    // Simulate Q2
    setCurrentSession("Q2")
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProgress(66)

    // Simulate Q3
    setCurrentSession("Q3")
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProgress(100)

    // Complete qualifying
    const qualifyingResult = simulator.simulateQualifying(raceId, weather)
    setQualifying(qualifyingResult)
    setCurrentSession("complete")
    setIsRunning(false)
    
    onQualifyingComplete(qualifyingResult)
  }

  const getWeatherIcon = (weather: "sunny" | "cloudy" | "rainy") => {
    switch (weather) {
      case "sunny": return <Sun className="h-5 w-5 text-yellow-500" />
      case "cloudy": return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy": return <CloudRain className="h-5 w-5 text-blue-500" />
    }
  }

  const getSessionColor = (session: "Q1" | "Q2" | "Q3") => {
    switch (session) {
      case "Q1": return "bg-red-500"
      case "Q2": return "bg-yellow-500"
      case "Q3": return "bg-green-500"
    }
  }

  const getPositionColor = (position: number) => {
    if (position === 1) return "text-yellow-600 font-bold"
    if (position <= 3) return "text-gray-600 font-semibold"
    if (position <= 10) return "text-green-600"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Qualifying Header */}
      <Card className="border-2 border-black">
        <CardHeader className="bg-black text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Timer className="h-8 w-8" />
              CLASSIFICAÇÃO
            </CardTitle>
            <div className="flex items-center gap-4">
              {getWeatherIcon(weather)}
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-white text-black">
                {weather.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!qualifying && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Sistema de Classificação</h3>
                <p className="text-muted-foreground mb-6">
                  Três sessões eliminatórias para definir o grid de largada
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                        Q1
                      </div>
                      <h4 className="font-semibold">Primeira Fase</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Todos os pilotos • Top 15 avançam
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                        Q2
                      </div>
                      <h4 className="font-semibold">Segunda Fase</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        15 pilotos • Top 10 avançam
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                        Q3
                      </div>
                      <h4 className="font-semibold">Super Pole</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        10 pilotos • Luta pela pole
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!isRunning ? (
                <div className="text-center">
                  <Button 
                    onClick={startQualifying} 
                    size="lg" 
                    className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-4"
                  >
                    <Flag className="h-5 w-5 mr-2" />
                    INICIAR CLASSIFICAÇÃO
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className={`w-4 h-4 rounded-full ${getSessionColor(currentSession)} animate-pulse`} />
                      <span className="text-xl font-bold">
                        {currentSession === "Q1" ? "Q1 EM ANDAMENTO" : 
                         currentSession === "Q2" ? "Q2 EM ANDAMENTO" : "Q3 - SUPER POLE"}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-200" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {progress.toFixed(0)}% concluído
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Qualifying Results */}
      {qualifying && (
        <Card className="border-2 border-black">
          <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              GRID DE LARGADA OFICIAL
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {qualifying.finalGrid.map((result, index) => {
                const driver = DRIVERS.find(d => d.id === result.driverId)!
                const team = TEAMS.find(t => t.id === driver.teamId)!
                const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!

                return (
                  <div 
                    key={result.driverId}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      index === 0 ? 'border-yellow-400 bg-yellow-50' :
                      index < 3 ? 'border-gray-400 bg-gray-50' :
                      index < 10 ? 'border-green-400 bg-green-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 ${
                        index === 0 ? 'bg-yellow-400 text-black border-yellow-600' :
                        index < 3 ? 'bg-gray-400 text-white border-gray-600' :
                        index < 10 ? 'bg-green-400 text-white border-green-600' :
                        'bg-white text-black border-gray-400'
                      }`}>
                        {result.position}
                      </div>
                      
                      {index === 0 && (
                        <div className="flex flex-col items-center">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                          <span className="text-xs font-bold text-yellow-600">POLE</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border-2 border-black">
                        <Image
                          src={team.logo || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-lg">{driver.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{team.name}</span>
                          <span>•</span>
                          <span>{manufacturer.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-lg font-bold">
                        {simulator.formatTime(result.lapTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {simulator.formatGap(result.gap)}
                      </div>
                    </div>

                    <div className="relative w-8 h-8 rounded overflow-hidden bg-white border">
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
      )}
    </div>
  )
}