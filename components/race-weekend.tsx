"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Flag, Trophy, Timer, MapPin, Gauge } from "lucide-react"
import type { Race } from "@/lib/stock-car-data"
import { QualifyingSessionComponent } from "./qualifying-session"
import { RaceSessionComponent } from "./race-session"
import type { QualifyingWeekend } from "@/lib/qualifying-simulation"

interface RaceWeekendProps {
  race1: Race
  race2: Race
  onWeekendComplete: (race1: Race, race2: Race) => void
  onBack: () => void
}

export function RaceWeekend({ race1, race2, onWeekendComplete, onBack }: RaceWeekendProps) {
  const [currentPhase, setCurrentPhase] = useState<"qualifying" | "race1" | "race2" | "complete">("qualifying")
  const [qualifying, setQualifying] = useState<QualifyingWeekend | null>(null)
  const [race1Results, setRace1Results] = useState<any>(null)
  const [race2Results, setRace2Results] = useState<any>(null)

  const handleQualifyingComplete = (qualifyingResult: QualifyingWeekend) => {
    setQualifying(qualifyingResult)
    setCurrentPhase("race1")
  }

  const handleRace1Complete = (results: any) => {
    setRace1Results(results)
    setCurrentPhase("race2")
  }

  const handleRace2Complete = (results: any) => {
    setRace2Results(results)
    setCurrentPhase("complete")
    
    // Update races with results
    const updatedRace1 = { ...race1, completed: true, results: race1Results.results, qualifying }
    const updatedRace2 = { ...race2, completed: true, results: results.results }
    
    onWeekendComplete(updatedRace1, updatedRace2)
  }

  const getPhaseStatus = (phase: string) => {
    if (currentPhase === phase) return "current"
    if (
      (phase === "qualifying" && ["race1", "race2", "complete"].includes(currentPhase)) ||
      (phase === "race1" && ["race2", "complete"].includes(currentPhase)) ||
      (phase === "race2" && currentPhase === "complete")
    ) return "completed"
    return "upcoming"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-4 border-black bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack} className="border-2 border-black">
              ← Voltar
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="text-4xl">{race1.flag}</div>
                <div>
                  <h1 className="text-3xl font-bold">GP {race1.location}</h1>
                  <p className="text-lg text-muted-foreground">{race1.track}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(race1.date).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{race1.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gauge className="h-4 w-4" />
                  <span>{race1.laps} voltas</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <Badge variant="outline" className="text-lg px-4 py-2 border-2 border-black">
                FIM DE SEMANA {currentPhase.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Timeline */}
      <div className="container mx-auto px-4 py-6">
        <Card className="border-2 border-black">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[
                { key: "qualifying", label: "CLASSIFICAÇÃO", icon: Timer },
                { key: "race1", label: "CORRIDA 1", icon: Flag },
                { key: "race2", label: "CORRIDA 2", icon: Trophy }
              ].map((phase, index) => {
                const status = getPhaseStatus(phase.key)
                const Icon = phase.icon
                
                return (
                  <div key={phase.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                        status === "completed" ? "bg-green-500 border-green-600 text-white" :
                        status === "current" ? "bg-black border-black text-white animate-pulse" :
                        "bg-white border-gray-300 text-gray-400"
                      }`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <span className={`mt-2 font-bold text-sm ${
                        status === "current" ? "text-black" : "text-muted-foreground"
                      }`}>
                        {phase.label}
                      </span>
                    </div>
                    
                    {index < 2 && (
                      <div className={`w-24 h-1 mx-4 ${
                        getPhaseStatus(["race1", "race2"][index]) !== "upcoming" ? "bg-black" : "bg-gray-300"
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-6">
        {currentPhase === "qualifying" && (
          <QualifyingSessionComponent
            raceId={race1.id}
            weather={race1.weather}
            onQualifyingComplete={handleQualifyingComplete}
          />
        )}

        {currentPhase === "race1" && qualifying && (
          <RaceSessionComponent
            race={race1}
            startingGrid={qualifying.finalGrid}
            raceType="main"
            onRaceComplete={handleRace1Complete}
            title="CORRIDA 1 - GRID OFICIAL"
          />
        )}

        {currentPhase === "race2" && race1Results && (
          <RaceSessionComponent
            race={race2}
            startingGrid={race1Results.results.filter((r: any) => !r.dnf).slice(0, 10).reverse().concat(
              race1Results.results.filter((r: any) => !r.dnf).slice(10)
            ).map((result: any, index: number) => ({
              position: index + 1,
              driverId: result.driverId,
              lapTime: 70000,
              gap: 0,
              eliminated: false
            }))}
            raceType="inverted"
            onRaceComplete={handleRace2Complete}
            title="CORRIDA 2 - GRID INVERTIDO"
          />
        )}

        {currentPhase === "complete" && (
          <Card className="border-4 border-black">
            <CardHeader className="bg-black text-white">
              <CardTitle className="text-3xl font-bold text-center">
                🏁 FIM DE SEMANA COMPLETO 🏁
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Trophy className="h-20 w-20 mx-auto mb-6 text-yellow-500" />
                <h2 className="text-2xl font-bold mb-4">GP {race1.location} Finalizado!</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Classificação e duas corridas foram concluídas com sucesso.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card className="border-2 border-green-500">
                    <CardHeader className="bg-green-500 text-white">
                      <CardTitle>Vencedor Corrida 1</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {DRIVERS.find(d => d.id === race1Results?.results[0]?.driverId)?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {TEAMS.find(t => t.id === race1Results?.results[0]?.teamId)?.name}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-500">
                    <CardHeader className="bg-blue-500 text-white">
                      <CardTitle>Vencedor Corrida 2</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {DRIVERS.find(d => d.id === race2Results?.results[0]?.driverId)?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {TEAMS.find(t => t.id === race2Results?.results[0]?.teamId)?.name}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}