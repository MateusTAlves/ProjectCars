import { DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"
import type {
  RaceSession,
  RacePosition,
  RaceResult,
  RaceStrategy,
  RaceEvent,
  PitStop,
  QualifyingResult,
} from "./advanced-weekend-types"
import { TYRE_COMPOUNDS, FUEL_LOADS, RACE_RHYTHMS, POINTS_SYSTEM } from "./advanced-weekend-types"

export class AdvancedRaceSimulator {
  private baseTime = 70000

  createRaceSession(
    raceNumber: 1 | 2,
    grid: QualifyingResult[],
    totalLaps: number,
    weather: "sunny" | "cloudy" | "rainy",
    invertTop12: boolean = false
  ): RaceSession {
    let positions: RacePosition[] = grid.map((gridPos, index) => {
      const driver = DRIVERS.find((d) => d.id === gridPos.driverId)!

      return {
        position: index + 1,
        driverId: gridPos.driverId,
        lapsCompleted: 0,
        lastLapTime: 0,
        gap: index === 0 ? "LÍDER" : "—",
        interval: "—",
        tyre: weather === "rainy" ? "wet" : "medium",
        tyreLaps: 0,
        tyreCondition: 100,
        fuel: 80,
        pitStops: 0,
        status: "racing",
      }
    })

    // Invert top 12 for Race 1
    if (invertTop12 && raceNumber === 1) {
      const top12 = positions.slice(0, 12).reverse()
      const rest = positions.slice(12)
      positions = [...top12, ...rest]
      positions.forEach((pos, idx) => {
        pos.position = idx + 1
      })
    }

    return {
      id: `race-${raceNumber}`,
      raceNumber,
      duration: raceNumber === 1 ? 30 : 50,
      totalLaps,
      currentLap: 0,
      timeRemaining: raceNumber === 1 ? 30 : 50,
      isActive: false,
      isPaused: false,
      speed: 1,
      positions,
      events: [],
      weather,
      trackCondition: weather === "rainy" ? "wet" : "dry",
      safetyCarActive: false,
    }
  }

  simulateLap(session: RaceSession): RaceSession {
    session.currentLap++

    session.positions.forEach((pos) => {
      if (pos.status !== "racing") return

      const driver = DRIVERS.find((d) => d.id === pos.driverId)!
      const team = TEAMS.find((t) => t.id === driver.teamId)!

      // Calculate lap time with tyre wear, fuel, etc
      const tyreConditionFactor = 1 + (100 - pos.tyreCondition) * 0.0005
      const fuelFactor = 1 - (pos.fuel / 100) * 0.01

      const lapTime = (this.baseTime + (Math.random() - 0.5) * 1000 - team.performance * 500) *
                      tyreConditionFactor * fuelFactor

      pos.lastLapTime = Math.round(lapTime)
      pos.lapsCompleted++
      pos.tyreLaps++
      pos.tyreCondition = Math.max(0, pos.tyreCondition - 2)
      pos.fuel = Math.max(0, pos.fuel - 2)

      // Random pit stop if tyres too worn
      if (pos.tyreCondition < 20 && Math.random() > 0.7) {
        this.executePitStop(session, pos.driverId)
      }

      // Random DNF (1% chance)
      if (Math.random() < 0.01) {
        pos.status = "dnf"
        session.events.push({
          lap: session.currentLap,
          type: "dnf",
          description: `${driver.name} abandona com problema mecânico`,
          driversInvolved: [pos.driverId],
        })
      }
    })

    // Update positions based on laps completed and last lap time
    this.updatePositions(session)

    return { ...session }
  }

  executePitStop(session: RaceSession, driverId: string): void {
    const pos = session.positions.find((p) => p.driverId === driverId)
    if (!pos) return

    pos.status = "pit"
    pos.tyre = session.weather === "rainy" ? "wet" : "medium"
    pos.tyreLaps = 0
    pos.tyreCondition = 100
    pos.fuel = 80
    pos.pitStops++

    setTimeout(() => {
      pos.status = "racing"
    }, 1000)

    const driver = DRIVERS.find((d) => d.id === driverId)!
    session.events.push({
      lap: session.currentLap,
      type: "pit",
      description: `${driver.name} realiza pit stop`,
      driversInvolved: [driverId],
    })
  }

  private updatePositions(session: RaceSession): void {
    session.positions.sort((a, b) => {
      if (b.lapsCompleted !== a.lapsCompleted) {
        return b.lapsCompleted - a.lapsCompleted
      }
      return a.lastLapTime - b.lastLapTime
    })

    session.positions.forEach((pos, index) => {
      pos.position = index + 1
      if (index === 0) {
        pos.gap = "LÍDER"
        pos.interval = "—"
      } else {
        const leader = session.positions[0]
        const lapsDiff = leader.lapsCompleted - pos.lapsCompleted
        pos.gap = lapsDiff > 0 ? `+${lapsDiff} volta${lapsDiff > 1 ? "s" : ""}` : `+${(Math.random() * 10).toFixed(1)}s`
        pos.interval = `+${(Math.random() * 2).toFixed(1)}s`
      }
    })
  }

  finalizeRace(session: RaceSession): RaceResult[] {
    return session.positions.map((pos, index) => {
      const driver = DRIVERS.find((d) => d.id === pos.driverId)!
      const isDNF = pos.status === "dnf"

      return {
        position: index + 1,
        driverId: pos.driverId,
        teamId: driver.teamId,
        lapsCompleted: pos.lapsCompleted,
        totalTime: isDNF ? "DNF" : `${session.duration}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}.${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
        bestLap: this.baseTime + (Math.random() - 0.5) * 1000,
        averageLap: this.baseTime + (Math.random() - 0.5) * 1500,
        gap: pos.gap,
        pitStops: pos.pitStops,
        points: isDNF ? 0 : POINTS_SYSTEM[Math.min(index, POINTS_SYSTEM.length - 1)] || 0,
        fastestLap: index === Math.floor(Math.random() * 3),
        dnf: isDNF,
        dnfReason: isDNF ? "Problema mecânico" : undefined,
      }
    })
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = milliseconds / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const ms = milliseconds % 1000
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }
}
