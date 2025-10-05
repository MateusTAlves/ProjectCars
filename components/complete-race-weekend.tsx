"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Play, Pause, SkipForward, Clock, Timer, Flag, Trophy, ArrowLeft,
  Settings, Zap, Target, TrendingUp, CircleCheck, Wrench, Fuel, Gauge
} from "lucide-react"
import type { Race } from "@/lib/stock-car-data"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import { AdvancedPracticeSimulator } from "@/lib/advanced-practice-simulator"
import { AdvancedQualifyingSimulator } from "@/lib/advanced-qualifying-simulator"
import { AdvancedRaceSimulator } from "@/lib/advanced-race-simulator"
import type {
  WeekendState,
  PracticeSession,
  PracticeStrategy,
  QualifyingSession,
  QualifyingStrategy,
  RaceSession,
  TyreType,
  FuelLoad,
} from "@/lib/advanced-weekend-types"
import { TYRE_COMPOUNDS } from "@/lib/advanced-weekend-types"
import Image from "next/image"

interface CompleteRaceWeekendProps {
  race1: Race
  race2: Race
  onWeekendComplete: (race1: Race, race2: Race) => void
  onBack: () => void
}

export function CompleteRaceWeekend({
  race1,
  race2,
  onWeekendComplete,
  onBack,
}: CompleteRaceWeekendProps) {
  const [practiceSimulator] = useState(() => new AdvancedPracticeSimulator())
  const [qualifyingSimulator] = useState(() => new AdvancedQualifyingSimulator())
  const [raceSimulator] = useState(() => new AdvancedRaceSimulator())

  const [weekendState, setWeekendState] = useState<WeekendState>({
    raceWeekendId: `weekend-${race1.id}`,
    race1,
    race2,
    currentPhase: "fp1",
    qualifyingGrid: [],
    playerTeamId: TEAMS[0].id,
    playerDriverId: DRIVERS.filter(d => d.active)[0].id,
    autoMode: false,
    showDetailedTiming: false,
  })

  const [selectedTyre, setSelectedTyre] = useState<TyreType>("medium")
  const [selectedFuel, setSelectedFuel] = useState<FuelLoad>("medium")
  const [raceSpeed, setRaceSpeed] = useState<1 | 2 | 4 | 8>(1)

  // ========== TREINO LIVRE ==========
  const startFP1 = () => {
    const session = practiceSimulator.createPracticeSession("FP1", race1.weather)
    setWeekendState(prev => ({ ...prev, fp1: session }))
  }

  const simulateFP1Auto = () => {
    if (!weekendState.fp1) return
    const completedSession = practiceSimulator.autoSimulateSession(weekendState.fp1)
    setWeekendState(prev => ({ ...prev, fp1: completedSession }))
  }

  const completeFP1 = () => {
    setWeekendState(prev => ({ ...prev, currentPhase: "fp2" }))
  }

  const startFP2 = () => {
    const session = practiceSimulator.createPracticeSession("FP2", race1.weather)
    setWeekendState(prev => ({ ...prev, fp2: session }))
  }

  const simulateFP2Auto = () => {
    if (!weekendState.fp2) return
    const completedSession = practiceSimulator.autoSimulateSession(weekendState.fp2)
    setWeekendState(prev => ({ ...prev, fp2: completedSession }))
  }

  const completeFP2 = () => {
    setWeekendState(prev => ({ ...prev, currentPhase: "qualifying", currentSubPhase: "q1" }))
  }

  const runPracticeLaps = () => {
    const currentSession = weekendState.currentPhase === "fp1" ? weekendState.fp1 : weekendState.fp2
    if (!currentSession) return

    const strategy: PracticeStrategy = {
      driverId: weekendState.playerDriverId,
      tyre: selectedTyre,
      fuel: selectedFuel,
      setupFocus: "speed"
    }

    const updatedSession = practiceSimulator.simulateMultipleLaps(currentSession, strategy, 5)

    if (weekendState.currentPhase === "fp1") {
      setWeekendState(prev => ({ ...prev, fp1: updatedSession }))
    } else {
      setWeekendState(prev => ({ ...prev, fp2: updatedSession }))
    }
  }

  // ========== CLASSIFICAÇÃO ==========
  const startQ1 = () => {
    const activeDrivers = DRIVERS.filter(d => d.active).map(d => d.id)
    const session = qualifyingSimulator.createQualifyingSession("Q1", activeDrivers, race1.weather)
    setWeekendState(prev => ({ ...prev, q1: session }))
  }

  const simulateQ1Auto = () => {
    if (!weekendState.q1) return
    const completedSession = qualifyingSimulator.autoSimulateSession(weekendState.q1)
    setWeekendState(prev => ({ ...prev, q1: completedSession, currentSubPhase: "q2" }))
  }

  const startQ2 = () => {
    if (!weekendState.q1) return
    const session = qualifyingSimulator.createQualifyingSession("Q2", weekendState.q1.qualified, race1.weather)
    setWeekendState(prev => ({ ...prev, q2: session }))
  }

  const simulateQ2Auto = () => {
    if (!weekendState.q2) return
    const completedSession = qualifyingSimulator.autoSimulateSession(weekendState.q2)
    setWeekendState(prev => ({ ...prev, q2: completedSession, currentSubPhase: "q3" }))
  }

  const startQ3 = () => {
    if (!weekendState.q2) return
    const session = qualifyingSimulator.createQualifyingSession("Q3", weekendState.q2.qualified, race1.weather)
    setWeekendState(prev => ({ ...prev, q3: session }))
  }

  const simulateQ3Auto = () => {
    if (!weekendState.q3) return
    const completedSession = qualifyingSimulator.autoSimulateSession(weekendState.q3)

    if (weekendState.q1 && weekendState.q2) {
      const finalGrid = qualifyingSimulator.buildFinalGrid(weekendState.q1, weekendState.q2, completedSession)
      setWeekendState(prev => ({
        ...prev,
        q3: completedSession,
        qualifyingGrid: finalGrid,
        currentPhase: "race1"
      }))
    }
  }

  // ========== CORRIDAS ==========
  const startRace1 = () => {
    const session = raceSimulator.createRaceSession(1, weekendState.qualifyingGrid, race1.laps, race1.weather, true)
    setWeekendState(prev => ({ ...prev, race1Session: session }))
  }

  const simulateRace1 = () => {
    if (!weekendState.race1Session) return

    let session = { ...weekendState.race1Session, isActive: true }

    const interval = setInterval(() => {
      if (session.currentLap >= session.totalLaps) {
        clearInterval(interval)
        const results = raceSimulator.finalizeRace(session)
        setWeekendState(prev => ({
          ...prev,
          race1Session: { ...session, isActive: false },
          race1Results: results,
          currentPhase: "race2"
        }))
        return
      }

      session = raceSimulator.simulateLap(session)
      setWeekendState(prev => ({ ...prev, race1Session: session }))
    }, 1000 / raceSpeed)
  }

  const startRace2 = () => {
    const session = raceSimulator.createRaceSession(2, weekendState.qualifyingGrid, race2.laps, race2.weather, false)
    setWeekendState(prev => ({ ...prev, race2Session: session }))
  }

  const simulateRace2 = () => {
    if (!weekendState.race2Session) return

    let session = { ...weekendState.race2Session, isActive: true }

    const interval = setInterval(() => {
      if (session.currentLap >= session.totalLaps) {
        clearInterval(interval)
        const results = raceSimulator.finalizeRace(session)
        setWeekendState(prev => ({
          ...prev,
          race2Session: { ...session, isActive: false },
          race2Results: results,
          currentPhase: "complete"
        }))

        // Complete weekend
        const updatedRace1 = { ...race1, completed: true, results: weekendState.race1Results || [] }
        const updatedRace2 = { ...race2, completed: true, results: results }
        onWeekendComplete(updatedRace1, updatedRace2)
        return
      }

      session = raceSimulator.simulateLap(session)
      setWeekendState(prev => ({ ...prev, race2Session: session }))
    }, 1000 / raceSpeed)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Menu
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{race1.flag}</span>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">GP {race1.location}</h1>
                  <p className="text-sm text-slate-600">{race1.track}</p>
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-lg px-4 py-2">
              {weekendState.currentPhase.toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-6 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {["FP1", "FP2", "Quali", "R1", "R2"].map((phase, idx) => (
                <div key={phase} className="flex items-center">
                  <div className={`flex flex-col items-center ${
                    idx === 0 && weekendState.currentPhase === "fp1" ||
                    idx === 1 && weekendState.currentPhase === "fp2" ||
                    idx === 2 && weekendState.currentPhase === "qualifying" ||
                    idx === 3 && weekendState.currentPhase === "race1" ||
                    idx === 4 && weekendState.currentPhase === "race2"
                    ? "text-blue-600" : "text-slate-400"
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      idx === 0 && weekendState.currentPhase === "fp1" ||
                      idx === 1 && weekendState.currentPhase === "fp2" ||
                      idx === 2 && weekendState.currentPhase === "qualifying" ||
                      idx === 3 && weekendState.currentPhase === "race1" ||
                      idx === 4 && weekendState.currentPhase === "race2"
                      ? "bg-blue-500 text-white" : "bg-slate-200"
                    }`}>
                      {phase}
                    </div>
                    <span className="text-xs mt-1">{phase}</span>
                  </div>
                  {idx < 4 && <div className="w-12 h-1 bg-slate-200 mx-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="mt-6 space-y-6">
          {/* FP1 */}
          {weekendState.currentPhase === "fp1" && (
            <PracticeSessionView
              title="Treino Livre 1 - Sexta-feira"
              subtitle="60 minutos de teste e coleta de dados"
              session={weekendState.fp1}
              onStart={startFP1}
              onSimulate={simulateFP1Auto}
              onComplete={completeFP1}
              onRunLaps={runPracticeLaps}
              selectedTyre={selectedTyre}
              selectedFuel={selectedFuel}
              setSelectedTyre={setSelectedTyre}
              setSelectedFuel={setSelectedFuel}
              simulator={practiceSimulator}
            />
          )}

          {/* FP2 */}
          {weekendState.currentPhase === "fp2" && (
            <PracticeSessionView
              title="Treino Livre 2 - Sexta-feira"
              subtitle="60 minutos de refinamento de setup"
              session={weekendState.fp2}
              onStart={startFP2}
              onSimulate={simulateFP2Auto}
              onComplete={completeFP2}
              onRunLaps={runPracticeLaps}
              selectedTyre={selectedTyre}
              selectedFuel={selectedFuel}
              setSelectedTyre={setSelectedTyre}
              setSelectedFuel={setSelectedFuel}
              simulator={practiceSimulator}
            />
          )}

          {/* QUALIFYING */}
          {weekendState.currentPhase === "qualifying" && (
            <QualifyingView
              weekendState={weekendState}
              onStartQ1={startQ1}
              onSimulateQ1={simulateQ1Auto}
              onStartQ2={startQ2}
              onSimulateQ2={simulateQ2Auto}
              onStartQ3={startQ3}
              onSimulateQ3={simulateQ3Auto}
              simulator={qualifyingSimulator}
            />
          )}

          {/* RACE 1 */}
          {weekendState.currentPhase === "race1" && (
            <RaceView
              title="Corrida 1 - Sábado (30min + 1 volta)"
              subtitle="Grid invertido dos 12 primeiros"
              session={weekendState.race1Session}
              results={weekendState.race1Results}
              onStart={startRace1}
              onSimulate={simulateRace1}
              raceSpeed={raceSpeed}
              setRaceSpeed={setRaceSpeed}
              simulator={raceSimulator}
            />
          )}

          {/* RACE 2 */}
          {weekendState.currentPhase === "race2" && (
            <RaceView
              title="Corrida 2 - Domingo (50min + 1 volta)"
              subtitle="Grid original da classificação"
              session={weekendState.race2Session}
              results={weekendState.race2Results}
              onStart={startRace2}
              onSimulate={simulateRace2}
              raceSpeed={raceSpeed}
              setRaceSpeed={setRaceSpeed}
              simulator={raceSimulator}
            />
          )}

          {/* COMPLETE */}
          {weekendState.currentPhase === "complete" && (
            <WeekendCompleteView
              race1Results={weekendState.race1Results!}
              race2Results={weekendState.race2Results!}
              qualifyingGrid={weekendState.qualifyingGrid}
              onBack={onBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ========== PRACTICE SESSION VIEW ==========
function PracticeSessionView({
  title,
  subtitle,
  session,
  onStart,
  onSimulate,
  onComplete,
  onRunLaps,
  selectedTyre,
  selectedFuel,
  setSelectedTyre,
  setSelectedFuel,
  simulator,
}: any) {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardTitle className="flex items-center gap-3">
          <Clock className="h-6 w-6" />
          <div>
            <div className="text-xl font-bold">{title}</div>
            <div className="text-sm opacity-90">{subtitle}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!session ? (
          <div className="text-center py-8">
            <Button onClick={onStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-5 w-5 mr-2" />
              Iniciar Sessão
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Pneu</label>
                <Select value={selectedTyre} onValueChange={(v: TyreType) => setSelectedTyre(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">🔴 Macio (mais grip)</SelectItem>
                    <SelectItem value="medium">🟡 Médio (balanceado)</SelectItem>
                    <SelectItem value="hard">⚪ Duro (mais durável)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Carga de Combustível</label>
                <Select value={selectedFuel} onValueChange={(v: FuelLoad) => setSelectedFuel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">⚡ Leve (10 voltas)</SelectItem>
                    <SelectItem value="medium">➡️ Médio (20 voltas)</SelectItem>
                    <SelectItem value="heavy">🔋 Pesado (30 voltas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={onRunLaps} className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Dar 5 Voltas
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={onSimulate} variant="outline">
                <SkipForward className="h-4 w-4 mr-2" />
                Pular Treino
              </Button>
              <Button onClick={onComplete} className="ml-auto">
                <CircleCheck className="h-4 w-4 mr-2" />
                Encerrar Sessão
              </Button>
            </div>

            {/* Results */}
            {session.results.some((r: any) => r.lapsCompleted > 0) && (
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Classificação Atual</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {session.results.slice(0, 10).map((result: any, idx: number) => {
                    const driver = DRIVERS.find(d => d.id === result.driverId)!
                    const team = TEAMS.find(t => t.id === driver.teamId)!

                    return (
                      <div key={result.driverId} className="flex items-center gap-4 p-3 bg-white border rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold">
                          {result.position}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold">{driver.name}</div>
                          <div className="text-sm text-slate-600">{team.name} • {result.lapsCompleted} voltas</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold">
                            {simulator.formatTime(result.bestLap)}
                          </div>
                          <div className="text-sm text-slate-500">
                            {simulator.formatGap(result.gap)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ========== QUALIFYING VIEW ==========
function QualifyingView({ weekendState, onStartQ1, onSimulateQ1, onStartQ2, onSimulateQ2, onStartQ3, onSimulateQ3, simulator }: any) {
  return (
    <div className="space-y-6">
      {/* Q1 */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardTitle>Q1 - Primeira Eliminação (15 minutos)</CardTitle>
          <p className="text-sm opacity-90">20 pilotos • Top 16 avançam</p>
        </CardHeader>
        <CardContent className="pt-6">
          {!weekendState.q1 ? (
            <Button onClick={onStartQ1} size="lg">
              <Play className="h-5 w-5 mr-2" />
              Iniciar Q1
            </Button>
          ) : !weekendState.q1.qualified.length ? (
            <Button onClick={onSimulateQ1} size="lg">
              <SkipForward className="h-5 w-5 mr-2" />
              Simular Q1
            </Button>
          ) : (
            <SessionResults session={weekendState.q1} simulator={simulator} />
          )}
        </CardContent>
      </Card>

      {/* Q2 */}
      {weekendState.currentSubPhase && ["q2", "q3"].includes(weekendState.currentSubPhase) && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle>Q2 - Segunda Eliminação (12 minutos)</CardTitle>
            <p className="text-sm opacity-90">16 pilotos • Top 10 avançam</p>
          </CardHeader>
          <CardContent className="pt-6">
            {!weekendState.q2 ? (
              <Button onClick={onStartQ2} size="lg">
                <Play className="h-5 w-5 mr-2" />
                Iniciar Q2
              </Button>
            ) : !weekendState.q2.qualified.length ? (
              <Button onClick={onSimulateQ2} size="lg">
                <SkipForward className="h-5 w-5 mr-2" />
                Simular Q2
              </Button>
            ) : (
              <SessionResults session={weekendState.q2} simulator={simulator} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Q3 */}
      {weekendState.currentSubPhase === "q3" && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardTitle>Q3 - Luta pela Pole (10 minutos)</CardTitle>
            <p className="text-sm opacity-90">10 pilotos • Define grid de largada</p>
          </CardHeader>
          <CardContent className="pt-6">
            {!weekendState.q3 ? (
              <Button onClick={onStartQ3} size="lg">
                <Play className="h-5 w-5 mr-2" />
                Iniciar Q3
              </Button>
            ) : !weekendState.qualifyingGrid.length ? (
              <Button onClick={onSimulateQ3} size="lg">
                <SkipForward className="h-5 w-5 mr-2" />
                Simular Q3
              </Button>
            ) : (
              <SessionResults session={weekendState.q3} simulator={simulator} isPole />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SessionResults({ session, simulator, isPole = false }: any) {
  return (
    <div className="space-y-2">
      {session.results.slice(0, 10).map((result: any, idx: number) => {
        const driver = DRIVERS.find(d => d.id === result.driverId)!
        const team = TEAMS.find(t => t.id === driver.teamId)!

        return (
          <div key={result.driverId} className={`flex items-center gap-4 p-3 rounded-lg border ${
            isPole && idx === 0 ? "bg-yellow-50 border-yellow-400" : "bg-white border-slate-200"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              isPole && idx === 0 ? "bg-yellow-400 text-black" : "bg-slate-200"
            }`}>
              {result.position}
            </div>
            <div className="flex-1">
              <div className="font-bold">{driver.name}</div>
              <div className="text-sm text-slate-600">{team.name}</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold">{simulator.formatTime(result.bestLap)}</div>
              <div className="text-sm text-slate-500">{simulator.formatGap(result.gap)}</div>
            </div>
            {isPole && idx === 0 && (
              <Badge className="bg-yellow-400 text-black">
                <Trophy className="h-3 w-3 mr-1" />
                POLE
              </Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ========== RACE VIEW ==========
function RaceView({ title, subtitle, session, results, onStart, onSimulate, raceSpeed, setRaceSpeed, simulator }: any) {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardTitle>
          <div className="text-xl font-bold">{title}</div>
          <div className="text-sm opacity-90">{subtitle}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!session ? (
          <Button onClick={onStart} size="lg">
            <Flag className="h-5 w-5 mr-2" />
            Iniciar Corrida
          </Button>
        ) : !session.isActive && !results ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Velocidade da Simulação</label>
                <Select value={raceSpeed.toString()} onValueChange={(v) => setRaceSpeed(Number(v) as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="4">4x</SelectItem>
                    <SelectItem value="8">8x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={onSimulate} size="lg" className="ml-auto">
                <Play className="h-5 w-5 mr-2" />
                Iniciar Corrida
              </Button>
            </div>
          </div>
        ) : session.isActive ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="text-sm text-slate-600">Volta</div>
                <div className="text-2xl font-bold">{session.currentLap} / {session.totalLaps}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Tempo Restante</div>
                <div className="text-2xl font-bold">{session.timeRemaining}min</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Velocidade</div>
                <div className="text-2xl font-bold">{raceSpeed}x</div>
              </div>
            </div>

            <Progress value={(session.currentLap / session.totalLaps) * 100} />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {session.positions.slice(0, 15).map((pos: any) => {
                const driver = DRIVERS.find(d => d.id === pos.driverId)!
                const team = TEAMS.find(t => t.id === driver.teamId)!

                return (
                  <div key={pos.driverId} className="flex items-center gap-4 p-3 bg-white border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold">
                      {pos.position}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{driver.name}</div>
                      <div className="text-sm text-slate-600">{team.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{pos.gap}</div>
                      <div className="text-xs text-slate-500">Pneu: {pos.tyreLaps} voltas</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : results ? (
          <RaceResults results={results} />
        ) : null}
      </CardContent>
    </Card>
  )
}

function RaceResults({ results }: any) {
  return (
    <div className="space-y-2">
      {results.slice(0, 10).map((result: any, idx: number) => {
        const driver = DRIVERS.find(d => d.id === result.driverId)!
        const team = TEAMS.find(t => t.id === driver.teamId)!

        return (
          <div key={result.driverId} className={`flex items-center gap-4 p-3 rounded-lg border ${
            idx === 0 ? "bg-yellow-50 border-yellow-400" :
            idx < 3 ? "bg-slate-50 border-slate-300" :
            "bg-white border-slate-200"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              idx === 0 ? "bg-yellow-400 text-black" :
              idx < 3 ? "bg-slate-400 text-white" :
              "bg-slate-200"
            }`}>
              {result.position}
            </div>
            <div className="flex-1">
              <div className="font-bold">{driver.name}</div>
              <div className="text-sm text-slate-600">{team.name} • {result.pitStops} pit stops</div>
            </div>
            <div className="text-right">
              {result.dnf ? (
                <Badge variant="destructive">DNF</Badge>
              ) : (
                <>
                  <div className="font-bold">{result.points} pts</div>
                  {result.fastestLap && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      <Zap className="h-3 w-3 mr-1" />
                      V.Rápida
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ========== WEEKEND COMPLETE ==========
function WeekendCompleteView({ race1Results, race2Results, qualifyingGrid, onBack }: any) {
  const poleDriver = DRIVERS.find(d => d.id === qualifyingGrid[0]?.driverId)
  const race1Winner = DRIVERS.find(d => d.id === race1Results[0]?.driverId)
  const race2Winner = DRIVERS.find(d => d.id === race2Results[0]?.driverId)

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center">
        <CardTitle className="text-3xl">🏁 FIM DE SEMANA COMPLETO 🏁</CardTitle>
        <p className="text-lg opacity-90">FP1 → FP2 → Classificação → Corrida 1 → Corrida 2</p>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-3" />
              <div className="text-sm font-medium opacity-80">POLE POSITION</div>
              <div className="text-xl font-bold">{poleDriver?.name}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6 text-center">
              <Flag className="h-12 w-12 mx-auto mb-3" />
              <div className="text-sm font-medium opacity-90">VENCEDOR CORRIDA 1</div>
              <div className="text-xl font-bold">{race1Winner?.name}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-3" />
              <div className="text-sm font-medium opacity-90">VENCEDOR CORRIDA 2</div>
              <div className="text-xl font-bold">{race2Winner?.name}</div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={onBack} size="lg">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Menu Principal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
