"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, Trophy, Flag, Users, Clock, Zap, ArrowLeft, Play, Pause, SkipForward } from "lucide-react"
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

export function QualifyingRaceWeekend({ race1, race2, onWeekendComplete, onBack }: QualifyingRaceWeekendProps) {
  const [currentPhase, setCurrentPhase] = useState<WeekendPhase>("qualifying")
  const [qualifyingPhase, setQualifyingPhase] = useState<QualifyingPhase>("q1")
  
  const [qualifying, setQualifying] = useState<QualifyingWeekend | null>(null)
  const [q1Session, setQ1Session] = useState<QualifyingSession | null>(null)
  const [q2Session, setQ2Session] = useState<QualifyingSession | null>(null)
  const [q3Session, setQ3Session] = useState<QualifyingSession | null>(null)
  
  const [race1Data, setRace1Data] = useState<RaceSimulationData | null>(null)
  const [race2Data, setRace2Data] = useState<RaceSimulationData | null>(null)
  const [currentLap, setCurrentLap] = useState(0)
  const [livePositions, setLivePositions] = useState<any[]>([])
  const [isRaceRunning, setIsRaceRunning] = useState(false)
  const [raceSpeed, setRaceSpeed] = useState(500) // milliseconds per lap
  
  const [qualifyingSimulator] = useState(() => new QualifyingSimulator())
  const [raceSimulator] = useState(() => new RaceSimulator())

  // Qualifying simulation by phases
  const simulateQ1 = async () => {
    const activeDrivers = DRIVERS.filter(d => d.active)
    const session = qualifyingSimulator.simulateSession("Q1", activeDrivers.map(d => d.id), race1.weather)
    
    const q1: QualifyingSession = {
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
    
    setQ1Session(q1)
    setQualifyingPhase("q2")
  }

  const simulateQ2 = async () => {
    if (!q1Session) return
    
    const session = qualifyingSimulator.simulateSession("Q2", q1Session.qualified, race1.weather)
    
    const q2: QualifyingSession = {
      id: `${race1.id}-q2`,
      type: "Q2", 
      participants: q1Session.qualified,
      results: session,
      qualified: session.slice(0, 10).map(r => r.driverId),
      eliminated: session.slice(10).map(r => r.driverId),
      weather: race1.weather,
      completed: true,
      polePosition: session[0]
    }
    
    setQ2Session(q2)
    setQualifyingPhase("q3")
  }

  const simulateQ3 = async () => {
    if (!q2Session) return
    
    const session = qualifyingSimulator.simulateSession("Q3", q2Session.qualified, race1.weather)
    
    const q3: QualifyingSession = {
      id: `${race1.id}-q3`,
      type: "Q3",
      participants: q2Session.qualified,
      results: session,
      qualified: [],
      eliminated: [],
      weather: race1.weather,
      completed: true,
      polePosition: session[0]
    }
    
    setQ3Session(q3)
    
    // Build complete qualifying
    const fullQualifying = qualifyingSimulator.simulateQualifying(race1.id, race1.weather)
    setQualifying(fullQualifying)
    setQualifyingPhase("complete")
  }

  const startRace1 = async () => {
    if (!qualifying) return
    
    setCurrentPhase("race1")
    setIsRaceRunning(true)
    setCurrentLap(0)
    
    const simulation = raceSimulator.simulateRace(race1, qualifying.finalGrid, "main")
    setRace1Data(simulation)
    
    // Simulate lap by lap
    for (let lap = 1; lap <= race1.laps; lap++) {
      setCurrentLap(lap)
      
      // Create dynamic positions with some variation
      const positions = simulation.results.map((result, index) => ({
        position: index + 1,
        driverId: result.driverId,
        gap: index === 0 ? "LÍDER" : `+${(index * 0.8 + Math.random() * 2).toFixed(1)}s`,
        lastLapTime: `1:${(10 + Math.random() * 5).toFixed(0)}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      }))
      setLivePositions(positions)
      
      await new Promise(resolve => setTimeout(resolve, raceSpeed))
    }
    
    setIsRaceRunning(false)
  }

  const startRace2 = async () => {
    if (!race1Data) return
    
    setCurrentPhase("race2")
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
        gap: index === 0 ? "LÍDER" : `+${(index * 0.6 + Math.random() * 1.5).toFixed(1)}s`,
        lastLapTime: `1:${(10 + Math.random() * 5).toFixed(0)}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      }))
      setLivePositions(positions)
      
      await new Promise(resolve => setTimeout(resolve, raceSpeed))
    }
    
    setIsRaceRunning(false)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-xl px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="text-3xl">{race1.flag}</div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">GP {race1.location}</h1>
                  <p className="text-sm text-slate-600">{race1.track} • {race1.state}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <span className="text-lg">{getWeatherIcon(race1.weather)}</span>
                <span className="text-sm font-medium capitalize">{race1.weather}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-8">
            {[
              { key: "qualifying", label: "Classificação", icon: Timer },
              { key: "race1", label: "Corrida 1", icon: Flag },
              { key: "race2", label: "Corrida 2", icon: Trophy }
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentPhase === step.key
              const isCompleted = 
                (step.key === "qualifying" && currentPhase !== "qualifying") ||
                (step.key === "race1" && ["race2", "complete"].includes(currentPhase)) ||
                (step.key === "race2" && currentPhase === "complete")

              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                        : isActive 
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-110" 
                          : "bg-slate-200 text-slate-400"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>

                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-6 transition-all duration-500 ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-200"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        {currentPhase === "qualifying" && (
          <QualifyingScreen
            race={race1}
            phase={qualifyingPhase}
            q1Session={q1Session}
            q2Session={q2Session}
            q3Session={q3Session}
            qualifying={qualifying}
            onSimulateQ1={simulateQ1}
            onSimulateQ2={simulateQ2}
            onSimulateQ3={simulateQ3}
            onStartRace1={startRace1}
          />
        )}

        {currentPhase === "race1" && (
          <RaceScreen
            race={race1}
            raceNumber={1}
            currentLap={currentLap}
            totalLaps={race1.laps}
            livePositions={livePositions}
            isRunning={isRaceRunning}
            raceData={race1Data}
            onStartRace2={startRace2}
            raceSpeed={raceSpeed}
            onSpeedChange={setRaceSpeed}
          />
        )}

        {currentPhase === "race2" && (
          <RaceScreen
            race={race2}
            raceNumber={2}
            currentLap={currentLap}
            totalLaps={race2.laps}
            livePositions={livePositions}
            isRunning={isRaceRunning}
            raceData={race2Data}
            onComplete={() => setCurrentPhase("complete")}
            raceSpeed={raceSpeed}
            onSpeedChange={setRaceSpeed}
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

function QualifyingScreen({
  race,
  phase,
  q1Session,
  q2Session,
  q3Session,
  qualifying,
  onSimulateQ1,
  onSimulateQ2,
  onSimulateQ3,
  onStartRace1
}: {
  race: Race
  phase: QualifyingPhase
  q1Session: QualifyingSession | null
  q2Session: QualifyingSession | null
  q3Session: QualifyingSession | null
  qualifying: QualifyingWeekend | null
  onSimulateQ1: () => void
  onSimulateQ2: () => void
  onSimulateQ3: () => void
  onStartRace1: () => void
}) {
  const qualifyingSimulator = new QualifyingSimulator()
  const activeDrivers = DRIVERS.filter(d => d.active)

  return (
    <div className="space-y-8">
      {/* Qualifying Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg">
          <Timer className="h-6 w-6" />
          <span className="text-xl font-bold">CLASSIFICAÇÃO</span>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Sistema de três sessões eliminatórias para definir o grid de largada. 
          Os pilotos mais lentos são eliminados em cada etapa.
        </p>
      </div>

      {/* Q1 Section */}
      <div className="space-y-6">
        <div className={`rounded-3xl border-2 transition-all duration-500 ${
          phase === "q1" ? "border-blue-500 shadow-xl shadow-blue-500/10" : 
          q1Session ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : 
          "border-slate-200"
        }`}>
          <div className={`p-6 rounded-t-3xl transition-all duration-500 ${
            phase === "q1" ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" :
            q1Session ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" :
            "bg-slate-50 text-slate-600"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                  q1Session ? "bg-white/20" : "bg-white/10"
                }`}>
                  Q1
                </div>
                <div>
                  <h3 className="text-xl font-bold">Primeira Eliminação</h3>
                  <p className="opacity-90">{activeDrivers.length} pilotos • Top 15 avançam • 5 eliminados</p>
                </div>
              </div>
              
              {!q1Session && phase === "q1" && (
                <Button 
                  onClick={onSimulateQ1}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-6 py-2 rounded-xl"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Simular Q1
                </Button>
              )}
              
              {q1Session && (
                <Badge className="bg-white/20 text-white px-4 py-2 rounded-xl">
                  ✓ Completo
                </Badge>
              )}
            </div>
          </div>

          {q1Session && (
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Qualified */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <h4 className="font-bold text-emerald-700">CLASSIFICADOS PARA Q2 (15)</h4>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {q1Session.results.slice(0, 15).map((result, index) => (
                      <QualifyingResultRow 
                        key={result.driverId} 
                        result={result} 
                        index={index}
                        type="qualified"
                        simulator={qualifyingSimulator}
                      />
                    ))}
                  </div>
                </div>

                {/* Eliminated */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <h4 className="font-bold text-red-700">ELIMINADOS EM Q1 (5)</h4>
                  </div>
                  <div className="space-y-2">
                    {q1Session.results.slice(15).map((result, index) => (
                      <QualifyingResultRow 
                        key={result.driverId} 
                        result={result} 
                        index={index + 15}
                        type="eliminated"
                        simulator={qualifyingSimulator}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Q2 Section */}
        {q1Session && (
          <div className={`rounded-3xl border-2 transition-all duration-500 ${
            phase === "q2" ? "border-amber-500 shadow-xl shadow-amber-500/10" : 
            q2Session ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : 
            "border-slate-200"
          }`}>
            <div className={`p-6 rounded-t-3xl transition-all duration-500 ${
              phase === "q2" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" :
              q2Session ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" :
              "bg-slate-50 text-slate-600"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    q2Session ? "bg-white/20" : "bg-white/10"
                  }`}>
                    Q2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Segunda Eliminação</h3>
                    <p className="opacity-90">15 pilotos • Top 10 avançam • 5 eliminados</p>
                  </div>
                </div>
                
                {!q2Session && phase === "q2" && (
                  <Button 
                    onClick={onSimulateQ2}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-6 py-2 rounded-xl"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Simular Q2
                  </Button>
                )}
                
                {q2Session && (
                  <Badge className="bg-white/20 text-white px-4 py-2 rounded-xl">
                    ✓ Completo
                  </Badge>
                )}
              </div>
            </div>

            {q2Session && (
              <div className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Qualified */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <h4 className="font-bold text-emerald-700">CLASSIFICADOS PARA Q3 (10)</h4>
                    </div>
                    <div className="space-y-2">
                      {q2Session.results.slice(0, 10).map((result, index) => (
                        <QualifyingResultRow 
                          key={result.driverId} 
                          result={result} 
                          index={index}
                          type="qualified"
                          simulator={qualifyingSimulator}
                        />
                      ))}
                    </div>
                  </div>

                  {/* All Eliminated */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h4 className="font-bold text-red-700">TODOS OS ELIMINADOS (10)</h4>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {/* Q2 Eliminated */}
                      {q2Session.results.slice(10).map((result, index) => (
                        <QualifyingResultRow 
                          key={result.driverId} 
                          result={result} 
                          index={index + 10}
                          type="eliminated"
                          simulator={qualifyingSimulator}
                          eliminatedIn="Q2"
                        />
                      ))}
                      {/* Q1 Eliminated */}
                      {q1Session.results.slice(15).map((result, index) => (
                        <QualifyingResultRow 
                          key={result.driverId} 
                          result={result} 
                          index={index + 15}
                          type="eliminated"
                          simulator={qualifyingSimulator}
                          eliminatedIn="Q1"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Q3 Section */}
        {q2Session && (
          <div className={`rounded-3xl border-2 transition-all duration-500 ${
            phase === "q3" ? "border-purple-500 shadow-xl shadow-purple-500/10" : 
            q3Session ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : 
            "border-slate-200"
          }`}>
            <div className={`p-6 rounded-t-3xl transition-all duration-500 ${
              phase === "q3" ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white" :
              q3Session ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" :
              "bg-slate-50 text-slate-600"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    q3Session ? "bg-white/20" : "bg-white/10"
                  }`}>
                    Q3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Luta pela Pole Position</h3>
                    <p className="opacity-90">10 pilotos • Disputa final pelo grid</p>
                  </div>
                </div>
                
                {!q3Session && phase === "q3" && (
                  <Button 
                    onClick={onSimulateQ3}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-6 py-2 rounded-xl"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Simular Q3
                  </Button>
                )}
                
                {q3Session && (
                  <Badge className="bg-white/20 text-white px-4 py-2 rounded-xl">
                    ✓ Completo
                  </Badge>
                )}
              </div>
            </div>

            {q3Session && (
              <div className="p-6 bg-white">
                {/* Pole Position Highlight */}
                <div className="mb-8 p-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl text-black shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="text-sm font-medium opacity-80">POLE POSITION</div>
                        <div className="text-2xl font-bold">
                          {DRIVERS.find(d => d.id === q3Session.polePosition?.driverId)?.name}
                        </div>
                        <div className="text-lg font-mono">
                          {qualifyingSimulator.formatTime(q3Session.polePosition?.lapTime || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="text-6xl font-bold opacity-20">1</div>
                  </div>
                </div>

                {/* Top 10 Grid */}
                <div className="space-y-3">
                  <h4 className="font-bold text-lg mb-4">TOP 10 - GRID DE LARGADA</h4>
                  {q3Session.results.map((result, index) => (
                    <QualifyingResultRow 
                      key={result.driverId} 
                      result={result} 
                      index={index}
                      type={index === 0 ? "pole" : "qualified"}
                      simulator={qualifyingSimulator}
                      showFullGrid={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Start Race Button */}
        {qualifying && (
          <div className="text-center pt-8">
            <Button 
              onClick={onStartRace1}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-12 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Flag className="h-6 w-6 mr-3" />
              INICIAR CORRIDA 1
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function QualifyingResultRow({ 
  result, 
  index, 
  type, 
  simulator, 
  eliminatedIn,
  showFullGrid = false 
}: {
  result: any
  index: number
  type: "qualified" | "eliminated" | "pole"
  simulator: QualifyingSimulator
  eliminatedIn?: "Q1" | "Q2"
  showFullGrid?: boolean
}) {
  const driver = DRIVERS.find(d => d.id === result.driverId)!
  const team = TEAMS.find(t => t.id === driver.teamId)!
  const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!
  
  const getRowStyle = () => {
    if (type === "pole") return "border-yellow-400 bg-yellow-50 shadow-md"
    if (type === "qualified") return "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
    return "border-red-200 bg-red-50/50"
  }

  const getPositionStyle = () => {
    if (type === "pole") return "bg-yellow-400 text-black border-yellow-500"
    if (type === "qualified") return "bg-emerald-500 text-white border-emerald-600"
    return "bg-red-500 text-white border-red-600"
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${getRowStyle()}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border-2 ${getPositionStyle()}`}>
        {result.position}
      </div>
      
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm">
          <Image
            src={team.logo || "/placeholder.svg"}
            alt={`${team.name} logo`}
            fill
            className="object-contain p-2"
          />
        </div>
        <div>
          <div className="font-bold text-slate-900">{driver.name}</div>
          <div className="text-sm text-slate-600">{team.name}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-mono font-bold text-lg text-slate-900">
          {simulator.formatTime(result.lapTime)}
        </div>
        <div className="text-sm text-slate-500">
          {simulator.formatGap(result.gap)}
        </div>
        {eliminatedIn && (
          <Badge variant="outline" className="text-xs mt-1 border-red-300 text-red-600">
            {eliminatedIn}
          </Badge>
        )}
      </div>

      {type === "pole" && (
        <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg font-bold">
          <Trophy className="h-3 w-3 mr-1" />
          POLE
        </Badge>
      )}

      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm">
        <Image
          src={manufacturer.logo || "/placeholder.svg"}
          alt={`${manufacturer.name} logo`}
          fill
          className="object-contain p-1"
        />
      </div>
    </div>
  )
}

function RaceScreen({
  race,
  raceNumber,
  currentLap,
  totalLaps,
  livePositions,
  isRunning,
  raceData,
  onStartRace2,
  onComplete,
  raceSpeed,
  onSpeedChange,
  isInverted = false
}: {
  race: Race
  raceNumber: number
  currentLap: number
  totalLaps: number
  livePositions: any[]
  isRunning: boolean
  raceData: RaceSimulationData | null
  onStartRace2?: () => void
  onComplete?: () => void
  raceSpeed: number
  onSpeedChange: (speed: number) => void
  isInverted?: boolean
}) {
  const progress = totalLaps > 0 ? (currentLap / totalLaps) * 100 : 0
  const isComplete = !isRunning && raceData && currentLap >= totalLaps

  return (
    <div className="space-y-8">
      {/* Race Header */}
      <div className="text-center space-y-4">
        <div className={`inline-flex items-center gap-3 px-6 py-3 text-white rounded-2xl shadow-lg ${
          isInverted 
            ? "bg-gradient-to-r from-orange-500 to-red-600" 
            : "bg-gradient-to-r from-green-500 to-emerald-600"
        }`}>
          <Flag className="h-6 w-6" />
          <span className="text-xl font-bold">
            CORRIDA {raceNumber} {isInverted ? "- GRID INVERTIDO" : ""}
          </span>
        </div>
        <div className="flex items-center justify-center gap-6 text-slate-600">
          <span>{totalLaps} voltas</span>
          <span>•</span>
          <span>{race.distance.toFixed(0)}km</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            {getWeatherIcon(race.weather)}
            <span className="capitalize">{race.weather}</span>
          </span>
        </div>
      </div>

      {/* Race Controls */}
      {!isComplete && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-slate-900">
                VOLTA {currentLap}/{totalLaps}
              </div>
              {isRunning && (
                <Badge className="bg-red-500 text-white px-3 py-1 rounded-lg animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  AO VIVO
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Velocidade:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSpeedChange(raceSpeed === 1000 ? 500 : raceSpeed === 500 ? 100 : 1000)}
                  className="rounded-lg"
                >
                  {raceSpeed === 1000 ? "1x" : raceSpeed === 500 ? "2x" : "10x"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Progress 
              value={progress} 
              className="h-3 bg-slate-100 rounded-full overflow-hidden"
            />
            <div className="flex justify-between text-sm text-slate-600">
              <span>{progress.toFixed(1)}% completo</span>
              <span>{totalLaps - currentLap} voltas restantes</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Positions */}
      {livePositions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Users className="h-6 w-6" />
                POSIÇÕES AO VIVO
              </h3>
              <div className="text-lg font-mono">
                VOLTA {currentLap}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {livePositions.slice(0, 12).map((pos, index) => {
                const driver = DRIVERS.find(d => d.id === pos.driverId)!
                const team = TEAMS.find(t => t.id === driver.teamId)!
                const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!
                
                return (
                  <div 
                    key={pos.driverId}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                      index === 0 ? "border-yellow-400 bg-yellow-50 shadow-md" :
                      index < 3 ? "border-slate-300 bg-slate-50" :
                      "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                    style={{ 
                      animation: `slideInLeft 0.3s ease-out ${index * 50}ms both`
                    }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
                      index === 0 ? "bg-yellow-400 text-black border-yellow-500" :
                      index < 3 ? "bg-slate-400 text-white border-slate-500" :
                      "bg-white text-slate-900 border-slate-300"
                    }`}>
                      {pos.position}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                        <Image
                          src={team.logo || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{driver.name}</div>
                        <div className="text-sm text-slate-600">{team.name}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg text-slate-900">
                        {pos.gap}
                      </div>
                      <div className="text-sm text-slate-500">
                        {pos.lastLapTime}
                      </div>
                    </div>

                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm">
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
          </div>
        </div>
      )}

      {/* Race Complete */}
      {isComplete && raceData && (
        <div className="space-y-6">
          {/* Winner Celebration */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-8 shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-2">
                {DRIVERS.find(d => d.id === raceData.results[0]?.driverId)?.name}
              </h2>
              <p className="text-xl opacity-90 mb-4">
                Venceu a Corrida {raceNumber}!
              </p>
              <Badge className="bg-white/20 text-white px-6 py-2 rounded-xl text-lg">
                {raceData.results[0]?.points} PONTOS
              </Badge>
            </div>
          </div>

          {/* Podium */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <h3 className="text-xl font-bold text-center mb-6">PÓDIO</h3>
            <div className="grid grid-cols-3 gap-4">
              {raceData.results.slice(0, 3).map((result, index) => {
                const driver = DRIVERS.find(d => d.id === result.driverId)!
                const team = TEAMS.find(t => t.id === result.teamId)!
                const positions = ["🥇", "🥈", "🥉"]
                const heights = ["h-24", "h-20", "h-16"]
                const colors = [
                  "bg-yellow-400 border-yellow-500",
                  "bg-slate-400 border-slate-500", 
                  "bg-amber-600 border-amber-700"
                ]

                return (
                  <div key={result.driverId} className="text-center">
                    <div className="text-4xl mb-2">{positions[index]}</div>
                    <div className={`${heights[index]} ${colors[index]} rounded-xl border-2 flex items-end justify-center p-4 mb-3 shadow-lg`}>
                      <div className="text-white font-bold text-2xl">{result.position}</div>
                    </div>
                    <div className="font-bold text-slate-900">{driver.name}</div>
                    <div className="text-sm text-slate-600">{team.name}</div>
                    <Badge variant="outline" className="mt-2">
                      {result.points} pts
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next Action */}
          <div className="text-center">
            {onStartRace2 && (
              <Button 
                onClick={onStartRace2}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-12 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Flag className="h-6 w-6 mr-3" />
                INICIAR CORRIDA 2
              </Button>
            )}
            
            {onComplete && (
              <Button 
                onClick={onComplete}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-12 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Trophy className="h-6 w-6 mr-3" />
                FINALIZAR FIM DE SEMANA
              </Button>
            )}
          </div>
        )}
      </div>
    )}
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
    <div className="space-y-8">
      {/* Weekend Complete Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-2xl shadow-xl">
          <Trophy className="h-8 w-8" />
          <span className="text-2xl font-bold">FIM DE SEMANA COMPLETO</span>
        </div>
        <p className="text-xl text-slate-600">
          GP {race1.location} foi concluído com sucesso!
        </p>
      </div>

      {/* Weekend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pole Position */}
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-6 text-black shadow-xl">
          <div className="text-center">
            <Timer className="h-8 w-8 mx-auto mb-3 opacity-80" />
            <div className="text-sm font-medium opacity-80 mb-1">POLE POSITION</div>
            <div className="text-xl font-bold mb-1">
              {poleDriver ? DRIVERS.find(d => d.id === poleDriver.driverId)?.name : "N/A"}
            </div>
            <div className="text-sm opacity-80">
              {poleDriver ? TEAMS.find(t => t.id === DRIVERS.find(d => d.id === poleDriver.driverId)?.teamId)?.name : "N/A"}
            </div>
          </div>
        </div>

        {/* Race 1 Winner */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="text-center">
            <Flag className="h-8 w-8 mx-auto mb-3 opacity-90" />
            <div className="text-sm font-medium opacity-90 mb-1">VENCEDOR CORRIDA 1</div>
            <div className="text-xl font-bold mb-1">
              {race1Winner ? DRIVERS.find(d => d.id === race1Winner.driverId)?.name : "N/A"}
            </div>
            <div className="text-sm opacity-90">
              {race1Winner ? TEAMS.find(t => t.id === race1Winner.teamId)?.name : "N/A"}
            </div>
          </div>
        </div>

        {/* Race 2 Winner */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="text-center">
            <Trophy className="h-8 w-8 mx-auto mb-3 opacity-90" />
            <div className="text-sm font-medium opacity-90 mb-1">VENCEDOR CORRIDA 2</div>
            <div className="text-xl font-bold mb-1">
              {race2Winner ? DRIVERS.find(d => d.id === race2Winner.driverId)?.name : "N/A"}
            </div>
            <div className="text-sm opacity-90">
              {race2Winner ? TEAMS.find(t => t.id === race2Winner.teamId)?.name : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
        <h3 className="text-xl font-bold text-center mb-6">PONTUAÇÃO DO FIM DE SEMANA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Race 1 Top 5 */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-4">CORRIDA 1 - TOP 5</h4>
            <div className="space-y-2">
              {race1Data?.results.slice(0, 5).map((result, index) => {
                const driver = DRIVERS.find(d => d.id === result.driverId)!
                return (
                  <div key={result.driverId} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700 w-6">{result.position}</span>
                      <span className="font-medium">{driver.name}</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {result.points} pts
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Race 2 Top 5 */}
          <div>
            <h4 className="font-bold text-blue-700 mb-4">CORRIDA 2 - TOP 5</h4>
            <div className="space-y-2">
              {race2Data?.results.slice(0, 5).map((result, index) => {
                const driver = DRIVERS.find(d => d.id === result.driverId)!
                return (
                  <div key={result.driverId} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-700 w-6">{result.position}</span>
                      <span className="font-medium">{driver.name}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {result.points} pts
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
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