"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Play, CheckCircle, Clock, Timer, Flag, Trophy,
  ChevronRight, Zap, ArrowLeft, Target
} from "lucide-react"
import type { Race } from "@/lib/stock-car-data"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import { PracticeSimulator, type PracticeSession } from "@/lib/practice-simulation"
import { QualifyingSimulator, type QualifyingWeekend } from "@/lib/qualifying-simulation"
import { RaceSimulator, type RaceSimulationData } from "@/lib/race-simulation"
import Image from "next/image"

interface CompleteRaceWeekendProps {
  race1: Race
  race2: Race
  onWeekendComplete: (race1: Race, race2: Race) => void
  onBack: () => void
}

type WeekendPhase = "fp1" | "fp2" | "fp3" | "qualifying" | "race1" | "race2" | "complete"

export function CompleteRaceWeekend({
  race1,
  race2,
  onWeekendComplete,
  onBack,
}: CompleteRaceWeekendProps) {
  const [currentPhase, setCurrentPhase] = useState<WeekendPhase>("fp1")
  const [fp1Session, setFp1Session] = useState<PracticeSession | null>(null)
  const [fp2Session, setFp2Session] = useState<PracticeSession | null>(null)
  const [fp3Session, setFp3Session] = useState<PracticeSession | null>(null)
  const [qualifying, setQualifying] = useState<QualifyingWeekend | null>(null)
  const [race1Results, setRace1Results] = useState<RaceSimulationData | null>(null)
  const [race2Results, setRace2Results] = useState<RaceSimulationData | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [progress, setProgress] = useState(0)

  const [practiceSimulator] = useState(() => new PracticeSimulator())
  const [qualifyingSimulator] = useState(() => new QualifyingSimulator())
  const [raceSimulator] = useState(() => new RaceSimulator())

  const simulatePractice = async (sessionType: "FP1" | "FP2" | "FP3") => {
    setIsSimulating(true)
    setProgress(0)

    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 150))
    }

    const session = practiceSimulator.simulatePracticeSession(sessionType, race1.weather)

    if (sessionType === "FP1") {
      setFp1Session(session)
      setCurrentPhase("fp2")
    } else if (sessionType === "FP2") {
      setFp2Session(session)
      setCurrentPhase("fp3")
    } else if (sessionType === "FP3") {
      setFp3Session(session)
      setCurrentPhase("qualifying")
    }

    setIsSimulating(false)
  }

  const simulateQualifying = async () => {
    setIsSimulating(true)
    setProgress(0)

    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    const qualifyingResult = qualifyingSimulator.simulateQualifying(race1.id, race1.weather)
    setQualifying(qualifyingResult)
    setIsSimulating(false)
    setCurrentPhase("race1")
  }

  const simulateRace1 = async () => {
    if (!qualifying) return

    setIsSimulating(true)
    setProgress(0)

    for (let i = 0; i <= 100; i += 5) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const raceSimulation = raceSimulator.simulateRace(race1, qualifying.finalGrid, "main")
    setRace1Results(raceSimulation)
    setIsSimulating(false)
    setCurrentPhase("race2")
  }

  const simulateRace2 = async () => {
    if (!race1Results) return

    setIsSimulating(true)
    setProgress(0)

    const race1Grid = [
      ...race1Results.results.filter((r) => !r.dnf).slice(0, 10).reverse(),
      ...race1Results.results.filter((r) => !r.dnf).slice(10),
    ].map((result, index) => ({
      position: index + 1,
      driverId: result.driverId,
      lapTime: 70000,
      gap: 0,
      eliminated: false,
    }))

    for (let i = 0; i <= 100; i += 5) {
      setProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const raceSimulation = raceSimulator.simulateRace(race2, race1Grid, "inverted")
    setRace2Results(raceSimulation)
    setIsSimulating(false)
    setCurrentPhase("complete")

    const updatedRace1 = { ...race1, completed: true, results: race1Results.results, qualifying }
    const updatedRace2 = { ...race2, completed: true, results: raceSimulation.results }
    onWeekendComplete(updatedRace1, updatedRace2)
  }

  const getPhaseStatus = (phase: WeekendPhase) => {
    const phases: WeekendPhase[] = ["fp1", "fp2", "fp3", "qualifying", "race1", "race2", "complete"]
    const currentIndex = phases.indexOf(currentPhase)
    const phaseIndex = phases.indexOf(phase)

    if (phaseIndex < currentIndex) return "completed"
    if (phaseIndex === currentIndex) return "current"
    return "upcoming"
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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-xl px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Voltar</span>
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

      {/* Progress Timeline */}
      <div className="container mx-auto px-6 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {[
                { key: "fp1" as WeekendPhase, label: "FP1", icon: Clock },
                { key: "fp2" as WeekendPhase, label: "FP2", icon: Clock },
                { key: "fp3" as WeekendPhase, label: "FP3", icon: Clock },
                { key: "qualifying" as WeekendPhase, label: "Quali", icon: Timer },
                { key: "race1" as WeekendPhase, label: "R1", icon: Flag },
                { key: "race2" as WeekendPhase, label: "R2", icon: Trophy },
              ].map((phase, index) => {
                const status = getPhaseStatus(phase.key)
                const Icon = phase.icon

                return (
                  <div key={phase.key} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          status === "completed"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                            : status === "current"
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-110"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {status === "completed" ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          status === "current"
                            ? "text-blue-600"
                            : status === "completed"
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {phase.label}
                      </span>
                    </div>

                    {index < 5 && (
                      <ChevronRight
                        className={`h-5 w-5 mx-2 transition-colors ${
                          status === "completed" ? "text-emerald-500" : "text-slate-300"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Simulation Progress */}
        {isSimulating && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Progress value={progress} className="mb-2" />
              <p className="text-center text-sm text-muted-foreground">
                Simulando {currentPhase.toUpperCase()}...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* FP1 Section */}
          {currentPhase === "fp1" && (
            <PracticeSessionCard
              title="Treino Livre 1"
              subtitle="Primeira sessão de treinos - Reconhecimento da pista"
              session={fp1Session}
              onSimulate={() => simulatePractice("FP1")}
              isSimulating={isSimulating}
              color="blue"
            />
          )}

          {/* FP2 Section */}
          {currentPhase === "fp2" && (
            <>
              {fp1Session && <PracticeResultsCard session={fp1Session} simulator={practiceSimulator} />}
              <PracticeSessionCard
                title="Treino Livre 2"
                subtitle="Segunda sessão - Ajustes e coleta de dados"
                session={fp2Session}
                onSimulate={() => simulatePractice("FP2")}
                isSimulating={isSimulating}
                color="green"
              />
            </>
          )}

          {/* FP3 Section */}
          {currentPhase === "fp3" && (
            <>
              {fp2Session && <PracticeResultsCard session={fp2Session} simulator={practiceSimulator} />}
              <PracticeSessionCard
                title="Treino Livre 3"
                subtitle="Sessão final antes da classificação - Setup definitivo"
                session={fp3Session}
                onSimulate={() => simulatePractice("FP3")}
                isSimulating={isSimulating}
                color="purple"
              />
            </>
          )}

          {/* Qualifying Section */}
          {currentPhase === "qualifying" && (
            <>
              {fp3Session && <PracticeResultsCard session={fp3Session} simulator={practiceSimulator} />}
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <Timer className="h-6 w-6" />
                    Classificação (Q1 → Q2 → Q3)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!qualifying ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-6">
                        Sistema de três sessões eliminatórias para definir o grid de largada
                      </p>
                      <Button
                        onClick={simulateQualifying}
                        disabled={isSimulating}
                        size="lg"
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Iniciar Classificação
                      </Button>
                    </div>
                  ) : (
                    <QualifyingResultsCard qualifying={qualifying} simulator={qualifyingSimulator} />
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Race 1 Section */}
          {currentPhase === "race1" && qualifying && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <Flag className="h-6 w-6" />
                  Corrida 1 - Grid Oficial
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!race1Results ? (
                  <div className="text-center py-8">
                    <Button
                      onClick={simulateRace1}
                      disabled={isSimulating}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Iniciar Corrida 1
                    </Button>
                  </div>
                ) : (
                  <RaceResultsCard results={race1Results} raceNumber={1} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Race 2 Section */}
          {currentPhase === "race2" && race1Results && (
            <>
              <RaceResultsCard results={race1Results} raceNumber={1} />
              <Card>
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <Trophy className="h-6 w-6" />
                    Corrida 2 - Grid Invertido (Top 10)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!race2Results ? (
                    <div className="text-center py-8">
                      <Button
                        onClick={simulateRace2}
                        disabled={isSimulating}
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Iniciar Corrida 2
                      </Button>
                    </div>
                  ) : (
                    <RaceResultsCard results={race2Results} raceNumber={2} />
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Complete Section */}
          {currentPhase === "complete" && race1Results && race2Results && (
            <Card className="border-4 border-emerald-500">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <CardTitle className="text-center text-2xl">
                  🏁 FIM DE SEMANA COMPLETO 🏁
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">GP {race1.location} Finalizado!</h2>
                  <p className="text-lg text-muted-foreground">
                    FP1 → FP2 → FP3 → Classificação → Corrida 1 → Corrida 2
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RaceResultsCard results={race1Results} raceNumber={1} compact />
                  <RaceResultsCard results={race2Results} raceNumber={2} compact />
                </div>

                <div className="text-center mt-8">
                  <Button variant="outline" size="lg" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Voltar ao Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function PracticeSessionCard({
  title,
  subtitle,
  session,
  onSimulate,
  isSimulating,
  color,
}: {
  title: string
  subtitle: string
  session: PracticeSession | null
  onSimulate: () => void
  isSimulating: boolean
  color: "blue" | "green" | "purple"
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  }

  return (
    <Card>
      <CardHeader className={`bg-gradient-to-r ${colorClasses[color]} text-white`}>
        <CardTitle className="flex items-center gap-3">
          <Clock className="h-6 w-6" />
          {title}
        </CardTitle>
        <p className="text-white/90 text-sm">{subtitle}</p>
      </CardHeader>
      <CardContent className="pt-6">
        {!session ? (
          <div className="text-center py-8">
            <Button
              onClick={onSimulate}
              disabled={isSimulating}
              size="lg"
              className={`bg-gradient-to-r ${colorClasses[color]}`}
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar {title}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Badge className="bg-emerald-500 text-white px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Sessão Concluída
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PracticeResultsCard({
  session,
  simulator,
}: {
  session: PracticeSession
  simulator: PracticeSimulator
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resultados {session.type}
          </span>
          <Badge variant="outline">{session.totalLaps} voltas totais</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {session.results.slice(0, 10).map((result, index) => {
            const driver = DRIVERS.find((d) => d.id === result.driverId)!
            const team = TEAMS.find((t) => t.id === driver.teamId)!

            return (
              <div
                key={result.driverId}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                  index === 0
                    ? "border-yellow-400 bg-yellow-50 shadow-md"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-black"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {result.position}
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="relative w-8 h-8 rounded overflow-hidden bg-white border">
                    <Image
                      src={team.logo || "/placeholder.svg"}
                      alt={team.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{driver.name}</div>
                    <div className="text-xs text-muted-foreground">{team.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-primary">
                    {simulator.formatTime(result.fastestLap)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {simulator.formatGap(result.gap)}
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

function QualifyingResultsCard({
  qualifying,
  simulator,
}: {
  qualifying: QualifyingWeekend
  simulator: QualifyingSimulator
}) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 rounded-lg text-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Trophy className="h-10 w-10" />
            <div>
              <div className="text-sm font-medium opacity-80">POLE POSITION</div>
              <div className="text-2xl font-bold">
                {DRIVERS.find((d) => d.id === qualifying.polePosition?.driverId)?.name}
              </div>
              <div className="text-lg font-mono">
                {simulator.formatTime(qualifying.polePosition?.lapTime || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {qualifying.finalGrid.slice(0, 10).map((result, index) => {
          const driver = DRIVERS.find((d) => d.id === result.driverId)!
          const team = TEAMS.find((t) => t.id === driver.teamId)!

          return (
            <div
              key={result.driverId}
              className={`flex items-center gap-4 p-3 rounded-lg border ${
                index === 0
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? "bg-yellow-400 text-black" : "bg-slate-200"
                }`}
              >
                {result.position}
              </div>

              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-8 h-8 rounded overflow-hidden bg-white border">
                  <Image
                    src={team.logo || "/placeholder.svg"}
                    alt={team.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <div className="font-bold">{driver.name}</div>
                  <div className="text-xs text-muted-foreground">{team.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold">
                  {simulator.formatTime(result.lapTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {simulator.formatGap(result.gap)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RaceResultsCard({
  results,
  raceNumber,
  compact = false,
}: {
  results: RaceSimulationData
  raceNumber: number
  compact?: boolean
}) {
  const displayResults = compact ? results.results.slice(0, 5) : results.results.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Corrida {raceNumber} - Resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayResults.map((result, index) => {
            const driver = DRIVERS.find((d) => d.id === result.driverId)!
            const team = TEAMS.find((t) => t.id === driver.teamId)!

            return (
              <div
                key={result.driverId}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  index === 0
                    ? "border-yellow-400 bg-yellow-50"
                    : index < 3
                    ? "border-slate-300 bg-slate-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-black"
                      : index < 3
                      ? "bg-slate-400 text-white"
                      : "bg-slate-200"
                  }`}
                >
                  {result.position}
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="relative w-8 h-8 rounded overflow-hidden bg-white border">
                    <Image
                      src={team.logo || "/placeholder.svg"}
                      alt={team.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{driver.name}</div>
                    <div className="text-xs text-muted-foreground">{team.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  {result.dnf ? (
                    <Badge variant="destructive">DNF</Badge>
                  ) : (
                    <>
                      <div className="font-bold text-primary">{result.points} pts</div>
                      {result.fastestLap && (
                        <Badge variant="secondary" className="text-xs">
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
      </CardContent>
    </Card>
  )
}
