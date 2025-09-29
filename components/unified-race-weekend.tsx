"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Clock, CheckCircle, XCircle, Users, Target, Timer } from "lucide-react"
import type { Race } from "@/lib/stock-car-data"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import { QualifyingSimulator, type QualifyingWeekend } from "@/lib/qualifying-simulation"
import { RaceSimulator, type RaceSimulationData } from "@/lib/race-simulation"
import Image from "next/image"

interface UnifiedRaceWeekendProps {
  race1: Race
  race2: Race
  onWeekendComplete: (race1: Race, race2: Race) => void
  onBack: () => void
}

type WeekendPhase = "qualifying" | "race1" | "race2" | "complete"
type QualifyingView = "overview" | "q1" | "q2" | "q3" | "finalGrid"

export function UnifiedRaceWeekend({
  race1,
  race2,
  onWeekendComplete,
  onBack,
}: UnifiedRaceWeekendProps) {
  const [currentPhase, setCurrentPhase] = useState<WeekendPhase>("qualifying")
  const [qualifyingView, setQualifyingView] = useState<QualifyingView>("overview")
  const [qualifying, setQualifying] = useState<QualifyingWeekend | null>(null)
  const [race1Results, setRace1Results] = useState<RaceSimulationData | null>(null)
  const [race2Results, setRace2Results] = useState<RaceSimulationData | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [progress, setProgress] = useState(0)

  const [qualifyingSimulator] = useState(() => new QualifyingSimulator())
  const [raceSimulator] = useState(() => new RaceSimulator())

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

  function QualifyingNavigation({ qualifying, currentView, onViewChange }: {
    qualifying: QualifyingWeekend
    currentView: QualifyingView
    onViewChange: (view: QualifyingView) => void
  }) {
    return (
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg border">
        <Button
          variant={currentView === "overview" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("overview")}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Resumo
        </Button>
        
        <Button
          variant={currentView === "q1" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("q1")}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">1</div>
          Q1
        </Button>
        
        <Button
          variant={currentView === "q2" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("q2")}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold">2</div>
          Q2
        </Button>
        
        <Button
          variant={currentView === "q3" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("q3")}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">3</div>
          Q3
        </Button>
        
        <Button
          variant={currentView === "finalGrid" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("finalGrid")}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Grid Final
        </Button>
      </div>
    )
  }

  function QualifyingOverview({ qualifying }: { qualifying: QualifyingWeekend }) {
    const q1 = qualifying.sessions.find(s => s.type === "Q1")!
    const q2 = qualifying.sessions.find(s => s.type === "Q2")!
    const q3 = qualifying.sessions.find(s => s.type === "Q3")!

    return (
      <div className="space-y-6">
        {/* Header com informações gerais */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Classificação Completa</h2>
              <p className="text-blue-100">
                {race1.name} • {race1.weather === "sunny" ? "☀️ Ensolarado" : race1.weather === "cloudy" ? "☁️ Nublado" : "🌧️ Chuvoso"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{DRIVERS.filter(d => d.active).length}</div>
              <div className="text-sm text-blue-100">Pilotos</div>
            </div>
          </div>
        </div>

        {/* Resumo das sessões */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">Q1</div>
              <span className="font-semibold text-blue-700">Primeira Eliminação</span>
            </div>
            <div className="space-y-2 text-sm text-blue-600">
              <div className="flex justify-between">
                <span>Participantes:</span>
                <span className="font-bold">{q1.participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Classificados:</span>
                <span className="font-bold text-green-600">{q1.qualified.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Eliminados:</span>
                <span className="font-bold text-red-600">{q1.eliminated.length}</span>
              </div>
              <div className="pt-2 border-t border-blue-200">
                <div className="text-xs text-blue-500">Melhor tempo:</div>
                <div className="font-mono font-bold">
                  {qualifyingSimulator.formatTime(q1.polePosition?.lapTime || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">Q2</div>
              <span className="font-semibold text-green-700">Segunda Eliminação</span>
            </div>
            <div className="space-y-2 text-sm text-green-600">
              <div className="flex justify-between">
                <span>Participantes:</span>
                <span className="font-bold">{q2.participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Classificados:</span>
                <span className="font-bold text-green-600">{q2.qualified.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Eliminados:</span>
                <span className="font-bold text-red-600">{q2.eliminated.length}</span>
              </div>
              <div className="pt-2 border-t border-green-200">
                <div className="text-xs text-green-500">Melhor tempo:</div>
                <div className="font-mono font-bold">
                  {qualifyingSimulator.formatTime(q2.polePosition?.lapTime || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">Q3</div>
              <span className="font-semibold text-yellow-700">Luta pela Pole</span>
            </div>
            <div className="space-y-2 text-sm text-yellow-600">
              <div className="flex justify-between">
                <span>Finalistas:</span>
                <span className="font-bold">{q3.participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pole Position:</span>
                <span className="font-bold text-yellow-700">P1</span>
              </div>
              <div className="pt-2 border-t border-yellow-200">
                <div className="text-xs text-yellow-500">Tempo da pole:</div>
                <div className="font-mono font-bold">
                  {qualifyingSimulator.formatTime(q3.polePosition?.lapTime || 0)}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                POLE POSITION
              </Badge>
            </div>
          </div>
        </div>

        {/* Pole Position Destaque */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-lg text-black shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-black bg-opacity-20 p-3 rounded-full">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <div className="text-sm font-medium opacity-80">POLE POSITION</div>
                <div className="text-2xl font-bold">
                  {DRIVERS.find(d => d.id === qualifying.polePosition?.driverId)?.name || "N/A"}
                </div>
                <div className="text-lg font-mono">
                  {qualifyingSimulator.formatTime(qualifying.polePosition?.lapTime || 0)}
                </div>
                <div className="text-sm opacity-80">
                  {TEAMS.find(t => DRIVERS.find(d => d.id === qualifying.polePosition?.driverId)?.teamId === t.id)?.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-8xl font-bold opacity-30">1</div>
            </div>
          </div>
        </div>

        {/* Grid Top 10 Preview */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top 10 - Grid de Largada
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {qualifying.finalGrid.slice(0, 10).map((result, idx) => {
              const driver = DRIVERS.find(d => d.id === result.driverId)
              const team = TEAMS.find(t => t.id === driver?.teamId)
              const isPole = idx === 0
              
              return (
                <div 
                  key={result.driverId}
                  className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 cursor-pointer ${
                    isPole 
                      ? "border-yellow-400 bg-yellow-50 shadow-lg" 
                      : "border-gray-300 bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2 ${
                    isPole 
                      ? "bg-yellow-400 text-black" 
                      : "bg-gray-600 text-white"
                  }`}>
                    {result.position}
                  </div>
                  <div className="text-sm font-medium truncate">{driver?.name.split(' ')[0]}</div>
                  <div className="text-xs text-muted-foreground truncate">{driver?.name.split(' ').slice(-1)[0]}</div>
                  <div className="text-xs text-muted-foreground truncate mt-1">{team?.name}</div>
                  <div className="text-xs font-mono mt-1">
                    {qualifyingSimulator.formatTime(result.lapTime)}
                  </div>
                  {isPole && (
                    <div className="text-xs text-yellow-700 font-bold mt-1">POLE</div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQualifyingView("finalGrid")}
            >
              Ver Grid Completo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function SessionResults({ session, sessionType }: {
    session: any
    sessionType: "Q1" | "Q2" | "Q3"
  }) {
    const isQ3 = sessionType === "Q3"
    const sessionColors = {
      Q1: { bg: "bg-blue-50", border: "border-blue-200", button: "bg-blue-500", text: "text-blue-700" },
      Q2: { bg: "bg-green-50", border: "border-green-200", button: "bg-green-500", text: "text-green-700" },
      Q3: { bg: "bg-yellow-50", border: "border-yellow-200", button: "bg-yellow-500", text: "text-yellow-700" }
    }
    const colors = sessionColors[sessionType]
    
    return (
      <div className="space-y-6">
        {/* Header da Sessão */}
        <div className={`p-6 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 ${colors.button} text-white rounded-full flex items-center justify-center font-bold text-lg`}>
              {sessionType}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {sessionType === "Q1" ? "Q1 - Primeira Eliminação" :
                 sessionType === "Q2" ? "Q2 - Segunda Eliminação" :
                 "Q3 - Luta pela Pole Position"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {sessionType === "Q1" ? `${session.participants.length} pilotos • Top ${session.qualified.length} avançam • ${session.eliminated.length} eliminados` :
                 sessionType === "Q2" ? `${session.participants.length} pilotos • Top ${session.qualified.length} avançam • ${session.eliminated.length} eliminados` :
                 `${session.participants.length} pilotos • Definição do grid de largada`}
              </p>
            </div>
          </div>

          {/* Pole Position da Sessão */}
          <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <Timer className="h-6 w-6 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Melhor tempo de {sessionType}</div>
                <div className="font-bold">
                  {DRIVERS.find(d => d.id === session.polePosition?.driverId)?.name || "N/A"}
                </div>
                <div className="font-mono text-primary text-lg">
                  {qualifyingSimulator.formatTime(session.polePosition?.lapTime || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {isQ3 ? (
          /* Layout especial para Q3 - Top 10 */
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top 10 Final - Grid de Largada
            </h3>
            {session.results.map((result: any, idx: number) => {
              const driver = DRIVERS.find(d => d.id === result.driverId)
              const team = TEAMS.find(t => t.id === driver?.teamId)
              const manufacturer = MANUFACTURERS.find(m => m.id === driver?.manufacturerId)
              const isPole = idx === 0
              const isTop3 = idx < 3
              
              return (
                <div 
                  key={result.driverId} 
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all shadow-sm hover:shadow-md ${
                    isPole 
                      ? "border-yellow-400 bg-yellow-50 shadow-lg" 
                      : isTop3 
                        ? "border-gray-400 bg-gray-50" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                    isPole 
                      ? "bg-yellow-400 text-black border-yellow-600" 
                      : isTop3 
                        ? "bg-gray-400 text-white border-gray-600" 
                        : "bg-white text-black border-gray-400"
                  }`}>
                    {result.position}
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border">
                      <Image
                        src={team?.logo || "/placeholder.svg"}
                        alt={`${team?.name} logo`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{driver?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {team?.name} • {manufacturer?.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono font-bold text-primary text-lg">
                      {qualifyingSimulator.formatTime(result.lapTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {qualifyingSimulator.formatGap(result.gap)}
                    </div>
                  </div>
                  
                  {isPole && (
                    <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 px-3 py-1">
                      <Trophy className="h-3 w-3 mr-1" />
                      POLE
                    </Badge>
                  )}

                  <div className="relative w-6 h-6 rounded overflow-hidden bg-white border">
                    <Image
                      src={manufacturer?.logo || "/placeholder.svg"}
                      alt={`${manufacturer?.name} logo`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Layout para Q1 e Q2 - Com classificados e eliminados */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classificados */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-700">
                  Classificados para {sessionType === "Q1" ? "Q2" : "Q3"} ({session.qualified.length})
                </h4>
              </div>
              
              <div className="space-y-2">
                {session.results.slice(0, session.qualified.length).map((result: any) => {
                  const driver = DRIVERS.find(d => d.id === result.driverId)
                  const team = TEAMS.find(t => t.id === driver?.teamId)
                  
                  return (
                    <div 
                      key={result.driverId} 
                      className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-700 w-8 text-center">{result.position}.</span>
                        <div className="relative w-6 h-6 rounded overflow-hidden bg-white border">
                          <Image
                            src={team?.logo || "/placeholder.svg"}
                            alt={`${team?.name} logo`}
                            fill
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{driver?.name}</div>
                          <div className="text-xs text-green-600">{team?.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-green-700">
                          {qualifyingSimulator.formatTime(result.lapTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {qualifyingSimulator.formatGap(result.gap)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Eliminados */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-700">
                  Eliminados em {sessionType} ({session.eliminated.length})
                </h4>
              </div>
              
              <div className="space-y-2">
                {session.results.slice(session.qualified.length).map((result: any) => {
                  const driver = DRIVERS.find(d => d.id === result.driverId)
                  const team = TEAMS.find(t => t.id === driver?.teamId)
                  
                  return (
                    <div 
                      key={result.driverId} 
                      className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-700 w-8 text-center">{result.position}.</span>
                        <div className="relative w-6 h-6 rounded overflow-hidden bg-white border">
                          <Image
                            src={team?.logo || "/placeholder.svg"}
                            alt={`${team?.name} logo`}
                            fill
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-red-600">{driver?.name}</div>
                          <div className="text-xs text-red-500">{team?.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-red-600">
                          {qualifyingSimulator.formatTime(result.lapTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {qualifyingSimulator.formatGap(result.gap)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  function FinalGrid({ qualifying }: { qualifying: QualifyingWeekend }) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Grid de Largada - Corrida 1</h2>
          <p className="text-muted-foreground">
            Posições finais após as três sessões de classificação
          </p>
        </div>

        <div className="space-y-3">
          {qualifying.finalGrid.map((result, index) => {
            const driver = DRIVERS.find(d => d.id === result.driverId)
            const team = TEAMS.find(t => t.id === driver?.teamId)
            const manufacturer = MANUFACTURERS.find(m => m.id === driver?.manufacturerId)
            const isPole = index === 0
            const isTop3 = index < 3
            const isTop10 = index < 10
            
            return (
              <div
                key={result.driverId}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all shadow-sm hover:shadow-md ${
                  isPole
                    ? "border-yellow-400 bg-yellow-50 shadow-lg"
                    : isTop3
                      ? "border-gray-400 bg-gray-50"
                      : isTop10
                        ? "border-blue-200 bg-blue-50"
                        : result.eliminatedIn === "Q2"
                          ? "border-orange-200 bg-orange-50"
                          : "border-red-200 bg-red-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                    isPole
                      ? "bg-yellow-400 text-black border-yellow-600"
                      : isTop3
                        ? "bg-gray-400 text-white border-gray-600"
                        : isTop10
                          ? "bg-blue-400 text-white border-blue-600"
                          : result.eliminatedIn === "Q2"
                            ? "bg-orange-400 text-white border-orange-600"
                            : "bg-red-400 text-white border-red-600"
                  }`}
                >
                  {result.position}
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border">
                    <Image
                      src={team?.logo || "/placeholder.svg"}
                      alt={`${team?.name} logo`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-lg">{driver?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {team?.name} • {manufacturer?.name}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-primary text-lg">
                    {qualifyingSimulator.formatTime(result.lapTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {qualifyingSimulator.formatGap(result.gap)}
                  </div>
                  {result.eliminatedIn && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs mt-1 ${
                        result.eliminatedIn === "Q1" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      Eliminado em {result.eliminatedIn}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  {isPole && (
                    <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 px-3 py-1">
                      <Trophy className="h-3 w-3 mr-1" />
                      POLE
                    </Badge>
                  )}
                  
                  <div className="relative w-8 h-8 rounded overflow-hidden bg-white border">
                    <Image
                      src={manufacturer?.logo || "/placeholder.svg"}
                      alt={`${manufacturer?.name} logo`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Legenda:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded border"></div>
              <span>Pole Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded border"></div>
              <span>Top 3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded border"></div>
              <span>Q3 (Top 10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded border"></div>
              <span>Eliminados Q2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded border"></div>
              <span>Eliminados Q1</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function RaceResultsTable({
    raceResults,
    raceNumber,
    showInvertedGrid = false,
  }: {
    raceResults: RaceSimulationData
    raceNumber: number
    showInvertedGrid?: boolean
  }) {
    const resultsToShow = showInvertedGrid
      ? raceResults.results.filter((r) => !r.dnf).slice(0, 10).reverse().concat(raceResults.results.filter((r) => !r.dnf).slice(10))
      : raceResults.results

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">
            {showInvertedGrid ? "GRID PARA CORRIDA 2 (INVERTIDO)" : `RESULTADO FINAL - CORRIDA ${raceNumber}`}
          </h3>
          {showInvertedGrid && (
            <p className="text-muted-foreground">Top 10 da Corrida 1 em posições invertidas</p>
          )}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {resultsToShow.map((result, index) => {
            const driver = DRIVERS.find((d) => d.id === result.driverId)!
            const team = TEAMS.find((t) => t.id === driver.teamId)!
            const manufacturer = MANUFACTURERS.find((m) => m.id === driver.manufacturerId)!
            const displayPosition = showInvertedGrid ? index + 1 : result.position

            return (
              <div
                key={`${result.driverId}-${index}`}
                className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  displayPosition === 1
                    ? "border-yellow-400 bg-yellow-50"
                    : displayPosition <= 3
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                    displayPosition === 1
                      ? "bg-yellow-400 text-black border-yellow-600"
                      : displayPosition <= 3
                        ? "bg-gray-400 text-white border-gray-600"
                        : "bg-white text-black border-gray-400"
                  }`}
                >
                  {displayPosition}
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

                  <div className="flex-1">
                    <div className="font-bold">{driver.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {team.name} • {manufacturer.name}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {result.dnf ? (
                    <div>
                      <Badge variant="destructive" className="font-bold">
                        DNF
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">{result.dnfReason}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-primary">{result.points} pts</div>
                      {result.fastestLap && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Zap className="h-3 w-3 mr-1" />
                          V. Rápida
                        </Badge>
                      )}
                      {result.lapTime && (
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {result.lapTime}
                        </div>
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
      </div>
    )
  }

  function RaceLapByLap({ raceData }: { raceData: RaceSimulationData }) {
    const firstResult = raceData.results[0] as any
    const hasLaps =
      raceData.results.length > 0 &&
      firstResult.laps && Array.isArray(firstResult.laps) && firstResult.laps.length > 0

    if (!hasLaps) {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold mb-2">Volta a Volta</h3>
          <div className="text-muted-foreground text-center">
            Dados de voltas não disponíveis para esta corrida.
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold mb-2">Volta a Volta</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 border-b">Volta</th>
                {raceData.results.map((r: any) => (
                  <th key={r.driverId} className="text-center p-2 border-b">
                    {DRIVERS.find((d) => d.id === r.driverId)?.name.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {firstResult.laps.map((_: any, idx: number) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-2 font-bold">{idx + 1}</td>
                  {raceData.results.map((r: any, i: number) => (
                    <td key={i} className="text-center p-2">{r.laps?.[idx]?.position ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controle de simulação */}
      {isSimulating && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-center text-muted-foreground text-sm">
            {currentPhase === "qualifying" ? "Simulando Classificação..." : 
             currentPhase === "race1" ? "Simulando Corrida 1..." : 
             "Simulando Corrida 2..."}
          </p>
        </div>
      )}

      {currentPhase === "qualifying" && (
        <div className="space-y-6">
          {!qualifying && (
            <div className="text-center">
              <Button 
                onClick={simulateQualifying} 
                disabled={isSimulating}
                size="lg"
                className="font-semibold"
              >
                {isSimulating ? "Simulando..." : "Iniciar Classificação"}
              </Button>
            </div>
          )}
          
          {qualifying && (
            <>
              <QualifyingNavigation 
                qualifying={qualifying} 
                currentView={qualifyingView} 
                onViewChange={setQualifyingView} 
              />
              
              {qualifyingView === "overview" && <QualifyingOverview qualifying={qualifying} />}
              {qualifyingView === "q1" && <SessionResults session={qualifying.sessions[0]} sessionType="Q1" />}
              {qualifyingView === "q2" && <SessionResults session={qualifying.sessions[1]} sessionType="Q2" />}
              {qualifyingView === "q3" && <SessionResults session={qualifying.sessions[2]} sessionType="Q3" />}
              {qualifyingView === "finalGrid" && <FinalGrid qualifying={qualifying} />}
            </>
          )}
        </div>
      )}

      {currentPhase === "race1" && (
        <div className="space-y-6">
          <div className="text-center">
            <Button onClick={simulateRace1} disabled={isSimulating} size="lg">
              {isSimulating ? "Simulando..." : "Iniciar Corrida 1"}
            </Button>
          </div>
          
          {qualifying && qualifyingView === "overview" && (
            <QualifyingOverview qualifying={qualifying} />
          )}
          
          {race1Results && (
            <>
              <RaceResultsTable raceResults={race1Results} raceNumber={1} />
              <RaceLapByLap raceData={race1Results} />
            </>
          )}
        </div>
      )}

      {currentPhase === "race2" && (
        <div className="space-y-6">
          <div className="text-center">
            <Button onClick={simulateRace2} disabled={isSimulating} size="lg">
              {isSimulating ? "Simulando..." : "Iniciar Corrida 2"}
            </Button>
          </div>
          
          {race1Results && <RaceResultsTable raceResults={race1Results} raceNumber={1} />}
          {race2Results && (
            <>
              <RaceResultsTable raceResults={race2Results} raceNumber={2} />
              <RaceLapByLap raceData={race2Results} />
            </>
          )}
        </div>
      )}

      {currentPhase === "complete" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">🏁 Fim de semana concluído!</h2>
            <p className="text-muted-foreground">
              Confira os resultados finais das duas corridas
            </p>
          </div>
          
          {race1Results && <RaceResultsTable raceResults={race1Results} raceNumber={1} />}
          {race2Results && <RaceResultsTable raceResults={race2Results} raceNumber={2} />}
        </div>
      )}

      <div className="text-center pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          ← Voltar ao Menu
        </Button>
      </div>
    </div>
  )
}