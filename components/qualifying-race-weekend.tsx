"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, Trophy, Flag, Users, Clock, Zap, CircleCheck as CheckCircle, Circle as XCircle, Play, Pause, ArrowLeft } from "lucide-react"
import { DRIVERS, TEAMS, MANUFACTURERS, type Race } from "@/lib/stock-car-data"
import { QualifyingSimulator, type QualifyingWeekend, type QualifyingSession } from "@/lib/qualifying-simulation"
import { RaceSimulator, type RaceSimulationData } from "@/lib/race-simulation"
import Image from "next/image"

interface QualifyingRaceWeekendProps {
  race1: Race
  race2: Race
  onWeekendComplete: (race1: Race, race2: Race) => void
  onBack: () => void
}

type WeekendPhase = "qualifying" | "race1" | "race2" | "complete"
type QualifyingPhase = "q1" | "q2" | "q3" | "complete"
type RacePhase = "preview" | "live" | "complete"

export function QualifyingRaceWeekend({ race1, race2, onWeekendComplete, onBack }: QualifyingRaceWeekendProps) {
  const [currentPhase, setCurrentPhase] = useState<WeekendPhase>("qualifying")
  const [qualifyingPhase, setQualifyingPhase] = useState<QualifyingPhase>("q1")
  const [racePhase, setRacePhase] = useState<RacePhase>("preview")
  
  const [qualifying, setQualifying] = useState<QualifyingWeekend | null>(null)
  const [currentSession, setCurrentSession] = useState<QualifyingSession | null>(null)
  const [eliminatedDrivers, setEliminatedDrivers] = useState<string[]>([])
  
  const [race1Data, setRace1Data] = useState<RaceSimulationData | null>(null)
  const [race2Data, setRace2Data] = useState<RaceSimulationData | null>(null)
  const [currentLap, setCurrentLap] = useState(0)
  const [livePositions, setLivePositions] = useState<any[]>([])
  const [isRaceRunning, setIsRaceRunning] = useState(false)
  
  const [qualifyingSimulator] = useState(() => new QualifyingSimulator())
  const [raceSimulator] = useState(() => new RaceSimulator())

  // Qualifying simulation by phases
  const simulateQ1 = async () => {
    const activeDrivers = DRIVERS.filter(d => d.active)
    const session = qualifyingSimulator.simulateSession("Q1", activeDrivers.map(d => d.id), race1.weather)
    
    const q1Session: QualifyingSession = {
      id: `${race1.id}-q1`,
      type: "Q1",
      participants: activeDrivers.map(d => d.id),
      results: session,
      qualified: session.slice(0, 15).map(r => r.driverId),
      eliminated: session.slice(15).map(r => r.driverId),
      weather: race1.weather,
      completed: true,
      polePosition: session[0]
    }
    
    setCurrentSession(q1Session)
    setEliminatedDrivers(q1Session.eliminated)
    
    // Wait for user to proceed
  }

  const simulateQ2 = async () => {
    if (!currentSession) return
    
    const q1Qualified = currentSession.qualified
    const session = qualifyingSimulator.simulateSession("Q2", q1Qualified, race1.weather)
    
    const q2Session: QualifyingSession = {
      id: `${race1.id}-q2`,
      type: "Q2", 
      participants: q1Qualified,
      results: session,
      qualified: session.slice(0, 10).map(r => r.driverId),
      eliminated: session.slice(10).map(r => r.driverId),
      weather: race1.weather,
      completed: true,
      polePosition: session[0]
    }
    
    setCurrentSession(q2Session)
    setEliminatedDrivers(prev => [...prev, ...q2Session.eliminated])
  }

  const simulateQ3 = async () => {
    if (!currentSession) return
    
    const q2Qualified = currentSession.qualified
    const session = qualifyingSimulator.simulateSession("Q3", q2Qualified, race1.weather)
    
    const q3Session: QualifyingSession = {
      id: `${race1.id}-q3`,
      type: "Q3",
      participants: q2Qualified,
      results: session,
      qualified: [],
      eliminated: [],
      weather: race1.weather,
      completed: true,
      polePosition: session[0]
    }
    
    setCurrentSession(q3Session)
    
    // Build complete qualifying
    const fullQualifying = qualifyingSimulator.simulateQualifying(race1.id, race1.weather)
    setQualifying(fullQualifying)
    setQualifyingPhase("complete")
  }

  const proceedToRace1 = () => {
    setCurrentPhase("race1")
    setRacePhase("preview")
  }

  const startRace1 = async () => {
    if (!qualifying) return
    
    setRacePhase("live")
    setIsRaceRunning(true)
    setCurrentLap(0)
    
    const simulation = raceSimulator.simulateRace(race1, qualifying.finalGrid, "main")
    setRace1Data(simulation)
    
    // Simulate lap by lap
    for (let lap = 1; lap <= race1.laps; lap++) {
      setCurrentLap(lap)
      
      // Update positions (simplified for demo)
      const positions = simulation.results.map((result, index) => ({
        position: index + 1,
        driverId: result.driverId,
        gap: index === 0 ? "LÍDER" : `+${(Math.random() * 30).toFixed(1)}s`
      }))
      setLivePositions(positions)
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    setIsRaceRunning(false)
    setRacePhase("complete")
  }

  const proceedToRace2 = () => {
    setCurrentPhase("race2")
    setRacePhase("preview")
    setCurrentLap(0)
  }

  const startRace2 = async () => {
    if (!race1Data) return
    
    setRacePhase("live")
    setIsRaceRunning(true)
    setCurrentLap(0)
    
    // Create inverted grid from race 1
    const race1Grid = race1Data.results.filter(r => !r.dnf).map((result, index) => ({
      position: result.position,
      driverId: result.driverId,
      lapTime: 70000,
      gap: 0,
      eliminated: false
    }))
    
    const simulation = raceSimulator.simulateRace(race2, race1Grid, "inverted")
    setRace2Data(simulation)
    
    // Simulate lap by lap
    for (let lap = 1; lap <= race2.laps; lap++) {
      setCurrentLap(lap)
      
      const positions = simulation.results.map((result, index) => ({
        position: index + 1,
        driverId: result.driverId,
        gap: index === 0 ? "LÍDER" : `+${(Math.random() * 25).toFixed(1)}s`
      }))
      setLivePositions(positions)
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    setIsRaceRunning(false)
    setRacePhase("complete")
    setCurrentPhase("complete")
    
    // Complete weekend
    const updatedRace1 = { ...race1, completed: true, results: race1Data.results, qualifying }
    const updatedRace2 = { ...race2, completed: true, results: simulation.results }
    onWeekendComplete(updatedRace1, updatedRace2)
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny": return "☀️"
      case "cloudy": return "☁️"
      case "rainy": return "🌧️"
      default: return "☀️"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="text-4xl">{race1.flag}</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">GP {race1.location}</h1>
                  <p className="text-lg text-gray-600">{race1.track}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>{race1.state}</span>
                <span>•</span>
                <span>{getWeatherIcon(race1.weather)} {race1.weather}</span>
                <span>•</span>
                <span>{race1.laps} voltas</span>
              </div>
            </div>

            <div className="text-right">
              <Badge variant="outline" className="text-lg px-4 py-2 border-2">
                {currentPhase === "qualifying" ? "CLASSIFICAÇÃO" :
                 currentPhase === "race1" ? "CORRIDA 1" :
                 currentPhase === "race2" ? "CORRIDA 2" : "COMPLETO"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="container mx-auto px-6 py-6">
        <Card className="border-2 border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[
                { key: "qualifying", label: "CLASSIFICAÇÃO", icon: Timer, color: "blue" },
                { key: "race1", label: "CORRIDA 1", icon: Flag, color: "green" },
                { key: "race2", label: "CORRIDA 2", icon: Trophy, color: "purple" }
              ].map((phase, index) => {
                const Icon = phase.icon
                const isActive = currentPhase === phase.key
                const isCompleted = 
                  (phase.key === "qualifying" && currentPhase !== "qualifying") ||
                  (phase.key === "race1" && ["race2", "complete"].includes(currentPhase)) ||
                  (phase.key === "race2" && currentPhase === "complete")

                return (
                  <div key={phase.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                        isCompleted ? `bg-${phase.color}-500 border-${phase.color}-600 text-white` :
                        isActive ? `bg-${phase.color}-100 border-${phase.color}-500 text-${phase.color}-700 animate-pulse` :
                        "bg-white border-gray-300 text-gray-400"
                      }`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <span className={`mt-2 font-bold text-sm ${
                        isActive ? `text-${phase.color}-700` : "text-gray-500"
                      }`}>
                        {phase.label}
                      </span>
                    </div>

                    {index < 2 && (
                      <div className={`w-24 h-1 mx-4 transition-all ${
                        isCompleted ? `bg-${phase.color}-500` : "bg-gray-300"
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
      <div className="container mx-auto px-6 pb-6">
        {currentPhase === "qualifying" && (
          <QualifyingPhaseComponent
            race={race1}
            phase={qualifyingPhase}
            currentSession={currentSession}
            eliminatedDrivers={eliminatedDrivers}
            onSimulateQ1={simulateQ1}
            onSimulateQ2={simulateQ2}
            onSimulateQ3={simulateQ3}
            onProceedToRace={proceedToRace1}
            qualifying={qualifying}
          />
        )}

        {currentPhase === "race1" && (
          <RacePhaseComponent
            race={race1}
            raceNumber={1}
            phase={racePhase}
            currentLap={currentLap}
            totalLaps={race1.laps}
            livePositions={livePositions}
            isRunning={isRaceRunning}
            raceData={race1Data}
            startingGrid={qualifying?.finalGrid || []}
            onStartRace={startRace1}
            onProceedToNext={proceedToRace2}
          />
        )}

        {currentPhase === "race2" && (
          <RacePhaseComponent
            race={race2}
            raceNumber={2}
            phase={racePhase}
            currentLap={currentLap}
            totalLaps={race2.laps}
            livePositions={livePositions}
            isRunning={isRaceRunning}
            raceData={race2Data}
            startingGrid={race1Data?.results.filter(r => !r.dnf).slice(0, 10).reverse().map((result, index) => ({
              position: index + 1,
              driverId: result.driverId,
              lapTime: 70000,
              gap: 0,
              eliminated: false
            })) || []}
            onStartRace={startRace2}
            onProceedToNext={() => setCurrentPhase("complete")}
            isInverted={true}
          />
        )}

        {currentPhase === "complete" && (
          <WeekendSummary
            race1={race1}
            race2={race2}
            race1Data={race1Data}
            race2Data={race2Data}
            qualifying={qualifying}
          />
        )}
      </div>
    </div>
  )
}

function QualifyingPhaseComponent({
  race,
  phase,
  currentSession,
  eliminatedDrivers,
  onSimulateQ1,
  onSimulateQ2,
  onSimulateQ3,
  onProceedToRace,
  qualifying
}: {
  race: Race
  phase: QualifyingPhase
  currentSession: QualifyingSession | null
  eliminatedDrivers: string[]
  onSimulateQ1: () => void
  onSimulateQ2: () => void
  onSimulateQ3: () => void
  onProceedToRace: () => void
  qualifying: QualifyingWeekend | null
}) {
  const activeDrivers = DRIVERS.filter(d => d.active && !eliminatedDrivers.includes(d.id))

  return (
    <div className="space-y-6">
      {/* Qualifying Header */}
      <Card className="border-4 border-blue-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
            <Timer className="h-8 w-8" />
            SESSÃO DE CLASSIFICAÇÃO
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl border-2 text-center transition-all ${
              phase === "q1" ? "border-red-400 bg-red-50 shadow-lg" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="w-12 h-12 bg-red-500 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-lg">
                Q1
              </div>
              <h3 className="font-bold text-lg mb-2">Primeira Eliminação</h3>
              <p className="text-sm text-gray-600 mb-4">
                {DRIVERS.filter(d => d.active).length} pilotos • Top 15 avançam
              </p>
              {phase === "q1" && !currentSession && (
                <Button onClick={onSimulateQ1} className="bg-red-500 hover:bg-red-600 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Simular Q1
                </Button>
              )}
              {currentSession?.type === "Q1" && (
                <Badge className="bg-red-100 text-red-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completo
                </Badge>
              )}
            </div>

            <div className={`p-6 rounded-xl border-2 text-center transition-all ${
              phase === "q2" ? "border-yellow-400 bg-yellow-50 shadow-lg" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="w-12 h-12 bg-yellow-500 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-lg">
                Q2
              </div>
              <h3 className="font-bold text-lg mb-2">Segunda Eliminação</h3>
              <p className="text-sm text-gray-600 mb-4">
                15 pilotos • Top 10 avançam
              </p>
              {phase === "q2" && currentSession?.type === "Q1" && (
                <Button onClick={onSimulateQ2} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Simular Q2
                </Button>
              )}
              {currentSession?.type === "Q2" && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completo
                </Badge>
              )}
            </div>

            <div className={`p-6 rounded-xl border-2 text-center transition-all ${
              phase === "q3" ? "border-green-400 bg-green-50 shadow-lg" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="w-12 h-12 bg-green-500 text-white rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-lg">
                Q3
              </div>
              <h3 className="font-bold text-lg mb-2">Luta pela Pole</h3>
              <p className="text-sm text-gray-600 mb-4">
                10 pilotos • Disputa final
              </p>
              {phase === "q3" && currentSession?.type === "Q2" && (
                <Button onClick={onSimulateQ3} className="bg-green-500 hover:bg-green-600 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Simular Q3
                </Button>
              )}
              {qualifying && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completo
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Results */}
      {currentSession && (
        <SessionResultsDisplay 
          session={currentSession} 
          eliminatedDrivers={eliminatedDrivers}
        />
      )}

      {/* Final Grid */}
      {qualifying && (
        <FinalGridDisplay 
          qualifying={qualifying} 
          onProceedToRace={onProceedToRace}
        />
      )}
    </div>
  )
}

function SessionResultsDisplay({ 
  session, 
  eliminatedDrivers 
}: { 
  session: QualifyingSession
  eliminatedDrivers: string[]
}) {
  const qualifyingSimulator = new QualifyingSimulator()

  return (
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader className={`text-white ${
        session.type === "Q1" ? "bg-red-500" :
        session.type === "Q2" ? "bg-yellow-500" : "bg-green-500"
      }`}>
        <CardTitle className="text-xl font-bold text-center">
          RESULTADOS {session.type}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Qualified */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-green-700">
                {session.type === "Q3" ? "TOP 10 FINAL" : `CLASSIFICADOS PARA ${session.type === "Q1" ? "Q2" : "Q3"}`}
                ({session.qualified.length || session.results.length})
              </h3>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(session.type === "Q3" ? session.results : session.results.slice(0, session.qualified.length)).map((result, index) => {
                const driver = DRIVERS.find(d => d.id === result.driverId)!
                const team = TEAMS.find(t => t.id === driver.teamId)!
                const isPole = index === 0 && session.type === "Q3"
                
                return (
                  <div 
                    key={result.driverId}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      isPole ? "border-yellow-400 bg-yellow-50 shadow-md" :
                      index < 3 && session.type === "Q3" ? "border-gray-400 bg-gray-50" :
                      "border-green-200 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                      isPole ? "bg-yellow-400 text-black border-yellow-600" :
                      index < 3 && session.type === "Q3" ? "bg-gray-400 text-white border-gray-600" :
                      "bg-green-500 text-white border-green-600"
                    }`}>
                      {result.position}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border">
                        <Image
                          src={team.logo || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <div className="font-bold">{driver.name}</div>
                        <div className="text-sm text-gray-600">{team.name}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg">
                        {qualifyingSimulator.formatTime(result.lapTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {qualifyingSimulator.formatGap(result.gap)}
                      </div>
                    </div>

                    {isPole && (
                      <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1">
                        <Trophy className="h-3 w-3 mr-1" />
                        POLE
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Eliminated */}
          {session.eliminated.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-red-700">
                  ELIMINADOS EM {session.type} ({session.eliminated.length})
                </h3>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {session.results.slice(session.qualified.length).map((result) => {
                  const driver = DRIVERS.find(d => d.id === result.driverId)!
                  const team = TEAMS.find(t => t.id === driver.teamId)!
                  
                  return (
                    <div 
                      key={result.driverId}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 bg-red-500 text-white border-red-600">
                        {result.position}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border">
                          <Image
                            src={team.logo || "/placeholder.svg"}
                            alt={`${team.name} logo`}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-red-700">{driver.name}</div>
                          <div className="text-sm text-red-600">{team.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono font-bold text-red-700">
                          {qualifyingSimulator.formatTime(result.lapTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {qualifyingSimulator.formatGap(result.gap)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* All Eliminated Summary */}
        {eliminatedDrivers.length > 0 && (
          <Card className="mt-6 border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Todos os Eliminados ({eliminatedDrivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {eliminatedDrivers.map(driverId => {
                  const driver = DRIVERS.find(d => d.id === driverId)!
                  return (
                    <div key={driverId} className="text-center p-2 bg-white rounded border">
                      <div className="font-medium text-sm">{driver.name.split(' ')[0]}</div>
                      <div className="text-xs text-gray-500">{driver.name.split(' ').slice(-1)[0]}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

function FinalGridDisplay({ 
  qualifying, 
  onProceedToRace 
}: { 
  qualifying: QualifyingWeekend
  onProceedToRace: () => void
}) {
  const qualifyingSimulator = new QualifyingSimulator()

  return (
    <Card className="border-4 border-green-500 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-400" />
          GRID DE LARGADA OFICIAL
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {qualifying.finalGrid.map((result, index) => {
            const driver = DRIVERS.find(d => d.id === result.driverId)!
            const team = TEAMS.find(t => t.id === driver.teamId)!
            const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!
            const isPole = index === 0
            const isTop3 = index < 3
            
            return (
              <div 
                key={result.driverId}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                  isPole ? "border-yellow-400 bg-yellow-50 shadow-lg" :
                  isTop3 ? "border-gray-400 bg-gray-50" :
                  "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                  isPole ? "bg-yellow-400 text-black border-yellow-600" :
                  isTop3 ? "bg-gray-400 text-white border-gray-600" :
                  "bg-white text-black border-gray-400"
                }`}>
                  {result.position}
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border">
                    <Image
                      src={team.logo || "/placeholder.svg"}
                      alt={`${team.name} logo`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{driver.name}</div>
                    <div className="text-sm text-gray-600">{team.name} • {manufacturer.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-bold text-lg">
                    {qualifyingSimulator.formatTime(result.lapTime)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {qualifyingSimulator.formatGap(result.gap)}
                  </div>
                </div>

                {isPole && (
                  <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    POLE
                  </Badge>
                )}

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
        
        <div className="text-center mt-6 pt-6 border-t">
          <Button 
            onClick={onProceedToRace}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
          >
            <Flag className="h-5 w-5 mr-2" />
            PROSSEGUIR PARA CORRIDA 1
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RacePhaseComponent({
  race,
  raceNumber,
  phase,
  currentLap,
  totalLaps,
  livePositions,
  isRunning,
  raceData,
  startingGrid,
  onStartRace,
  onProceedToNext,
  isInverted = false
}: {
  race: Race
  raceNumber: number
  phase: RacePhase
  currentLap: number
  totalLaps: number
  livePositions: any[]
  isRunning: boolean
  raceData: RaceSimulationData | null
  startingGrid: any[]
  onStartRace: () => void
  onProceedToNext: () => void
  isInverted?: boolean
}) {
  const progress = totalLaps > 0 ? (currentLap / totalLaps) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <Card className="border-4 border-black shadow-xl">
        <CardHeader className="bg-gradient-to-r from-black via-gray-900 to-black text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">
                CORRIDA {raceNumber} {isInverted ? "- GRID INVERTIDO" : ""}
              </CardTitle>
              <p className="text-lg opacity-90">{race.track}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {phase === "live" ? `VOLTA ${currentLap}/${totalLaps}` : `${totalLaps} VOLTAS`}
              </div>
              <div className="text-lg opacity-80">
                {getWeatherIcon(race.weather)} {race.weather.toUpperCase()}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {phase === "live" && (
            <div className="space-y-4">
              <Progress value={progress} className="h-4 bg-gray-200" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <Badge className="bg-red-500 text-white animate-pulse px-4 py-2">
                      <div className="w-2 h-2 bg-white rounded-full mr-2" />
                      AO VIVO
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-4 py-2">
                      PAUSADO
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {progress.toFixed(1)}% completo • {totalLaps - currentLap} voltas restantes
                </div>
              </div>
            </div>
          )}
          
          {phase === "preview" && (
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">
                {isInverted ? "Grid Invertido - Top 10" : "Grid Oficial da Classificação"}
              </h3>
              <Button 
                onClick={onStartRace}
                size="lg"
                className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-3"
              >
                <Flag className="h-5 w-5 mr-2" />
                INICIAR CORRIDA {raceNumber}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Positions */}
      {phase === "live" && livePositions.length > 0 && (
        <LivePositionsDisplay positions={livePositions} currentLap={currentLap} />
      )}

      {/* Starting Grid Preview */}
      {phase === "preview" && startingGrid.length > 0 && (
        <StartingGridPreview grid={startingGrid} isInverted={isInverted} />
      )}

      {/* Race Results */}
      {phase === "complete" && raceData && (
        <RaceResultsDisplay 
          raceData={raceData} 
          raceNumber={raceNumber}
          onProceedToNext={onProceedToNext}
        />
      )}
    </div>
  )
}

function LivePositionsDisplay({ positions, currentLap }: { positions: any[], currentLap: number }) {
  return (
    <Card className="border-4 border-red-500 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
          <Users className="h-6 w-6" />
          POSIÇÕES AO VIVO - VOLTA {currentLap}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {positions.slice(0, 10).map((pos, index) => {
            const driver = DRIVERS.find(d => d.id === pos.driverId)!
            const team = TEAMS.find(t => t.id === driver.teamId)!
            
            return (
              <div 
                key={pos.driverId}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all animate-fade-in ${
                  index === 0 ? "border-yellow-400 bg-yellow-50" :
                  index < 3 ? "border-gray-400 bg-gray-50" :
                  "border-gray-200 bg-white"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                  index === 0 ? "bg-yellow-400 text-black border-yellow-600" :
                  index < 3 ? "bg-gray-400 text-white border-gray-600" :
                  "bg-white text-black border-gray-400"
                }`}>
                  {pos.position}
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border">
                    <Image
                      src={team.logo || "/placeholder.svg"}
                      alt={`${team.name} logo`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{driver.name}</div>
                    <div className="text-sm text-gray-600">{team.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-bold">
                    {pos.gap}
                  </div>
                  <div className="text-xs text-gray-500">
                    Volta {currentLap}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function StartingGridPreview({ grid, isInverted }: { grid: any[], isInverted: boolean }) {
  return (
    <Card className="border-2 border-blue-500 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="text-xl font-bold text-center">
          {isInverted ? "GRID INVERTIDO - TOP 10" : "GRID DE LARGADA"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {grid.slice(0, 10).map((gridPos, index) => {
            const driver = DRIVERS.find(d => d.id === gridPos.driverId)!
            const team = TEAMS.find(t => t.id === driver.teamId)!
            
            return (
              <div 
                key={gridPos.driverId}
                className="p-3 rounded-lg border-2 border-gray-300 bg-white text-center hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full mx-auto mb-2 flex items-center justify-center font-bold">
                  {gridPos.position}
                </div>
                <div className="text-sm font-bold">{driver.name.split(' ')[0]}</div>
                <div className="text-xs text-gray-500">{driver.name.split(' ').slice(-1)[0]}</div>
                <div className="text-xs text-gray-500 mt-1">{team.name}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RaceResultsDisplay({ 
  raceData, 
  raceNumber, 
  onProceedToNext 
}: { 
  raceData: RaceSimulationData
  raceNumber: number
  onProceedToNext: () => void
}) {
  const winner = raceData.results[0]
  const winnerDriver = DRIVERS.find(d => d.id === winner?.driverId)
  const winnerTeam = TEAMS.find(t => t.id === winner?.teamId)

  return (
    <div className="space-y-6">
      {/* Winner Celebration */}
      <Card className="border-4 border-green-500 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-600 via-green-700 to-green-600 text-white">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-400" />
            VENCEDOR DA CORRIDA {raceNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-2">{winnerDriver?.name}</h2>
            <p className="text-xl text-gray-600 mb-6">{winnerTeam?.name}</p>
            <Badge className="bg-green-100 text-green-800 text-lg px-6 py-2">
              {winner?.points} PONTOS
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Full Results */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">RESULTADO COMPLETO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {raceData.results.map((result, index) => {
              const driver = DRIVERS.find(d => d.id === result.driverId)!
              const team = TEAMS.find(t => t.id === driver.teamId)!
              const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!
              
              return (
                <div 
                  key={result.driverId}
                  className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all ${
                    index === 0 ? "border-yellow-400 bg-yellow-50" :
                    index < 3 ? "border-gray-400 bg-gray-50" :
                    "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                    index === 0 ? "bg-yellow-400 text-black border-yellow-600" :
                    index < 3 ? "bg-gray-400 text-white border-gray-600" :
                    "bg-white text-black border-gray-400"
                  }`}>
                    {result.position}
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border">
                      <Image
                        src={team.logo || "/placeholder.svg"}
                        alt={`${team.name} logo`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <div className="font-bold">{driver.name}</div>
                      <div className="text-sm text-gray-600">{team.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {result.dnf ? (
                      <div>
                        <Badge variant="destructive" className="font-bold">DNF</Badge>
                        <div className="text-xs text-gray-500 mt-1">{result.dnfReason}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-lg">{result.points} pts</div>
                        {result.fastestLap && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">
                            <Zap className="h-3 w-3 mr-1" />
                            V. Rápida
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative w-6 h-6 rounded overflow-hidden bg-white border">
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
          
          {phase === "complete" && (
            <div className="text-center mt-6 pt-6 border-t">
              <Button 
                onClick={onProceedToNext}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3"
              >
                {raceNumber === 1 ? (
                  <>
                    <Flag className="h-5 w-5 mr-2" />
                    PROSSEGUIR PARA CORRIDA 2
                  </>
                ) : (
                  <>
                    <Trophy className="h-5 w-5 mr-2" />
                    FINALIZAR FIM DE SEMANA
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function WeekendSummary({
  race1,
  race2,
  race1Data,
  race2Data,
  qualifying
}: {
  race1: Race
  race2: Race
  race1Data: RaceSimulationData | null
  race2Data: RaceSimulationData | null
  qualifying: QualifyingWeekend | null
}) {
  const race1Winner = race1Data?.results[0]
  const race2Winner = race2Data?.results[0]
  const poleDriver = qualifying?.polePosition

  return (
    <div className="space-y-6">
      <Card className="border-4 border-purple-500 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <CardTitle className="text-3xl font-bold text-center">
            🏁 FIM DE SEMANA COMPLETO 🏁
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">GP {race1.location} Finalizado!</h2>
            <p className="text-lg text-gray-600">
              Classificação e duas corridas foram concluídas com sucesso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pole Position */}
            <Card className="border-2 border-yellow-400 bg-yellow-50">
              <CardHeader className="bg-yellow-400 text-black">
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Timer className="h-5 w-5" />
                  POLE POSITION
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {poleDriver ? DRIVERS.find(d => d.id === poleDriver.driverId)?.name : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {poleDriver ? TEAMS.find(t => t.id === DRIVERS.find(d => d.id === poleDriver.driverId)?.teamId)?.name : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Race 1 Winner */}
            <Card className="border-2 border-green-500 bg-green-50">
              <CardHeader className="bg-green-500 text-white">
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Flag className="h-5 w-5" />
                  CORRIDA 1
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {race1Winner ? DRIVERS.find(d => d.id === race1Winner.driverId)?.name : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {race1Winner ? TEAMS.find(t => t.id === race1Winner.teamId)?.name : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Race 2 Winner */}
            <Card className="border-2 border-blue-500 bg-blue-50">
              <CardHeader className="bg-blue-500 text-white">
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5" />
                  CORRIDA 2
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {race2Winner ? DRIVERS.find(d => d.id === race2Winner.driverId)?.name : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {race2Winner ? TEAMS.find(t => t.id === race2Winner.teamId)?.name : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getWeatherIcon(weather: string) {
  switch (weather) {
    case "sunny": return "☀️"
    case "cloudy": return "☁️"
    case "rainy": return "🌧️"
    default: return "☀️"
  }
}