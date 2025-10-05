import { DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"
import type {
  QualifyingSession,
  QualifyingResult,
  QualifyingStrategy,
  QualifyingLap,
} from "./advanced-weekend-types"
import { TYRE_COMPOUNDS } from "./advanced-weekend-types"

export class AdvancedQualifyingSimulator {
  private baseTime = 69000 // 1:09.000 (faster than practice)

  createQualifyingSession(
    type: "Q1" | "Q2" | "Q3",
    participants: string[],
    weather: "sunny" | "cloudy" | "rainy"
  ): QualifyingSession {
    const durations = { Q1: 15, Q2: 12, Q3: 10 }
    const duration = durations[type]

    const results: QualifyingResult[] = participants.map((driverId) => ({
      position: 0,
      driverId,
      bestLap: Infinity,
      gap: 0,
      eliminated: false,
      attempts: 0,
    }))

    return {
      id: `${type}-session`,
      type,
      duration,
      timeRemaining: duration,
      isActive: false,
      participants,
      results,
      qualified: [],
      eliminated: [],
      weather,
    }
  }

  simulateQualifyingLap(
    driverId: string,
    strategy: QualifyingStrategy,
    weather: "sunny" | "cloudy" | "rainy",
    sessionType: "Q1" | "Q2" | "Q3"
  ): QualifyingLap {
    const driver = DRIVERS.find((d) => d.id === driverId)!
    const team = TEAMS.find((t) => t.id === driver.teamId)!
    const manufacturer = MANUFACTURERS.find((m) => m.id === driver.manufacturerId)!

    const tyreCompound = TYRE_COMPOUNDS[strategy.tyre]

    // Session difficulty increases (Q3 is hardest)
    const sessionMultiplier = sessionType === "Q1" ? 1.01 : sessionType === "Q2" ? 1.005 : 1.0

    // Weather impact
    const weatherMultiplier =
      weather === "sunny" ? 1.0 : weather === "cloudy" ? 1.01 : strategy.tyre === "wet" ? 1.015 : 1.12

    // Exit timing strategy
    const exitBonus =
      strategy.exitTiming === "start"
        ? -100 // Better track, fewer cars
        : strategy.exitTiming === "middle"
        ? 0
        : -200 // Learn from others

    // Fuel load (minimal is faster)
    const fuelBonus = strategy.fuelLoad === "minimal" ? -300 : -150

    // Push level
    const pushMultiplier = strategy.pushLevel === "maximum" ? 0.998 : 1.002

    // Tyre performance
    const tyreBonus = tyreCompound.grip * 1200

    // Driver, team, manufacturer factors
    const driverVariance = (Math.random() - 0.5) * 1000
    const teamFactor = team.performance * 1000
    const manufacturerFactor = manufacturer.reliability * 500

    // Calculate lap time
    const lapTime =
      (this.baseTime +
        driverVariance -
        teamFactor -
        manufacturerFactor -
        tyreBonus +
        exitBonus +
        fuelBonus) *
      sessionMultiplier *
      weatherMultiplier *
      pushMultiplier

    // Simulate sectors
    const sector1 = lapTime * (0.3 + Math.random() * 0.05)
    const sector2 = lapTime * (0.35 + Math.random() * 0.05)
    const sector3 = lapTime - sector1 - sector2

    // Small chance of invalid lap (track limits, yellow flag)
    const isValid = Math.random() > 0.03

    return {
      driverId,
      lapTime: isValid ? Math.round(lapTime) : Infinity,
      sector1: Math.round(sector1),
      sector2: Math.round(sector2),
      sector3: Math.round(sector3),
      isValid,
      tyre: strategy.tyre,
    }
  }

  simulateDriverAttempts(
    session: QualifyingSession,
    driverId: string,
    attempts: number = 3
  ): QualifyingSession {
    const result = session.results.find((r) => r.driverId === driverId)
    if (!result) return session

    // Generate strategy for the driver
    const strategy: QualifyingStrategy = {
      driverId,
      exitTiming: ["start", "middle", "end"][Math.floor(Math.random() * 3)] as any,
      tyre: session.weather === "rainy" ? "wet" : "soft",
      fuelLoad: "minimal",
      pushLevel: session.type === "Q3" ? "maximum" : "safe",
    }

    for (let i = 0; i < attempts; i++) {
      const lap = this.simulateQualifyingLap(driverId, strategy, session.weather, session.type)

      if (lap.isValid && lap.lapTime < result.bestLap) {
        result.bestLap = lap.lapTime
      }

      result.attempts++
    }

    this.updatePositions(session)
    return { ...session }
  }

  autoSimulateSession(session: QualifyingSession): QualifyingSession {
    // Simulate 2-4 attempts for each driver
    session.participants.forEach((driverId) => {
      const attempts = 2 + Math.floor(Math.random() * 3)
      session = this.simulateDriverAttempts(session, driverId, attempts)
    })

    // Determine qualified and eliminated
    const cutoffs = { Q1: 16, Q2: 10, Q3: 10 }
    const cutoff = cutoffs[session.type]

    session.results.forEach((result, index) => {
      if (index < cutoff) {
        session.qualified.push(result.driverId)
        result.eliminated = false
      } else {
        session.eliminated.push(result.driverId)
        result.eliminated = true
      }
    })

    session.isActive = false
    session.timeRemaining = 0

    return session
  }

  private updatePositions(session: QualifyingSession): void {
    session.results.sort((a, b) => {
      if (a.bestLap === Infinity) return 1
      if (b.bestLap === Infinity) return -1
      return a.bestLap - b.bestLap
    })

    const fastestTime = session.results[0].bestLap

    session.results.forEach((result, index) => {
      result.position = index + 1
      result.gap = result.bestLap === Infinity ? Infinity : result.bestLap - fastestTime
    })
  }

  buildFinalGrid(q1: QualifyingSession, q2: QualifyingSession, q3: QualifyingSession): QualifyingResult[] {
    const grid: QualifyingResult[] = []

    // Q3 participants (top 10)
    q3.results.forEach((result) => {
      grid.push({ ...result })
    })

    // Q2 eliminated (11-16)
    q2.results.filter((r) => r.eliminated).forEach((result) => {
      grid.push({ ...result, eliminatedIn: "Q2" })
    })

    // Q1 eliminated (17-20)
    q1.results.filter((r) => r.eliminated).forEach((result) => {
      grid.push({ ...result, eliminatedIn: "Q1" })
    })

    // Reorder positions
    grid.forEach((result, index) => {
      result.position = index + 1
    })

    return grid
  }

  formatTime(milliseconds: number): string {
    if (milliseconds === Infinity) return "—"

    const totalSeconds = milliseconds / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const ms = milliseconds % 1000

    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }

  formatGap(gap: number): string {
    if (gap === 0) return "—"
    if (gap === Infinity) return "—"
    return `+${(gap / 1000).toFixed(3)}s`
  }

  formatSectorTime(milliseconds: number): string {
    const seconds = milliseconds / 1000
    return `${seconds.toFixed(3)}s`
  }
}
