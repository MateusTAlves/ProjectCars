import { DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"
import type {
  PracticeSession,
  PracticeResult,
  PracticeLap,
  PracticeStrategy,
  TyreType,
  FuelLoad,
} from "./advanced-weekend-types"
import { TYRE_COMPOUNDS, FUEL_LOADS } from "./advanced-weekend-types"

export class AdvancedPracticeSimulator {
  private baseTime = 70000 // 1:10.000

  createPracticeSession(
    type: "FP1" | "FP2",
    weather: "sunny" | "cloudy" | "rainy"
  ): PracticeSession {
    const duration = 60 // 60 minutes
    const activeDrivers = DRIVERS.filter((d) => d.active)

    const results: PracticeResult[] = activeDrivers.map((driver) => ({
      driverId: driver.id,
      bestLap: Infinity,
      averageLap: 0,
      lapsCompleted: 0,
      laps: [],
      position: 0,
      gap: 0,
      setupData: {
        speed: 50 + Math.random() * 50,
        handling: 50 + Math.random() * 50,
        balance: 50 + Math.random() * 50,
      },
    }))

    return {
      id: `${type}-session`,
      type,
      duration,
      timeRemaining: duration,
      isActive: false,
      results,
      currentLap: 0,
      weather,
    }
  }

  simulateLap(
    driverId: string,
    strategy: PracticeStrategy,
    weather: "sunny" | "cloudy" | "rainy",
    lapNumber: number
  ): PracticeLap {
    const driver = DRIVERS.find((d) => d.id === driverId)!
    const team = TEAMS.find((t) => t.id === driver.teamId)!
    const manufacturer = MANUFACTURERS.find((m) => m.id === driver.manufacturerId)!

    // Base calculations
    const tyreCompound = TYRE_COMPOUNDS[strategy.tyre]
    const fuelLoad = FUEL_LOADS[strategy.fuel]

    // Weather impact
    const weatherMultiplier =
      weather === "sunny" ? 1.0 : weather === "cloudy" ? 1.015 : strategy.tyre === "wet" ? 1.02 : 1.15

    // Tyre grip and wear
    const tyreGripBonus = tyreCompound.grip * 1000
    const tyreDegradation = Math.min(lapNumber * tyreCompound.performanceLoss * 50, 500)

    // Fuel weight impact
    const fuelPenalty = (1 - fuelLoad.weight) * -500

    // Setup focus bonus
    const setupBonus =
      strategy.setupFocus === "speed"
        ? -300
        : strategy.setupFocus === "handling"
        ? -200
        : -250

    // Driver and team performance
    const driverVariance = (Math.random() - 0.5) * 1500
    const teamFactor = team.performance * 800
    const manufacturerFactor = manufacturer.reliability * 400

    // Calculate lap time
    const lapTime = Math.round(
      this.baseTime +
        driverVariance -
        teamFactor -
        manufacturerFactor -
        tyreGripBonus +
        tyreDegradation +
        fuelPenalty +
        setupBonus
    ) * weatherMultiplier

    // 5% chance of invalid lap
    const isValid = Math.random() > 0.05

    return {
      lapNumber,
      time: isValid ? lapTime : Infinity,
      tyre: strategy.tyre,
      fuel: strategy.fuel,
      isValid,
    }
  }

  simulateMultipleLaps(
    session: PracticeSession,
    strategy: PracticeStrategy,
    numberOfLaps: number
  ): PracticeSession {
    const result = session.results.find((r) => r.driverId === strategy.driverId)
    if (!result) return session

    for (let i = 0; i < numberOfLaps; i++) {
      const lap = this.simulateLap(
        strategy.driverId,
        strategy,
        session.weather,
        result.lapsCompleted + 1
      )

      result.laps.push(lap)
      result.lapsCompleted++

      if (lap.isValid && lap.time < result.bestLap) {
        result.bestLap = lap.time
      }
    }

    // Calculate average
    const validLaps = result.laps.filter((l) => l.isValid)
    if (validLaps.length > 0) {
      result.averageLap =
        validLaps.reduce((sum, lap) => sum + lap.time, 0) / validLaps.length
    }

    // Update positions
    this.updatePositions(session)

    return { ...session, currentLap: session.currentLap + numberOfLaps }
  }

  autoSimulateSession(session: PracticeSession): PracticeSession {
    const strategies: Record<string, PracticeStrategy> = {}

    // Generate random strategies for all drivers
    DRIVERS.filter((d) => d.active).forEach((driver) => {
      const tyres: TyreType[] = ["soft", "medium", "hard"]
      const fuels: FuelLoad[] = ["light", "medium", "heavy"]
      const focuses: Array<"speed" | "handling" | "balance"> = ["speed", "handling", "balance"]

      strategies[driver.id] = {
        driverId: driver.id,
        tyre: tyres[Math.floor(Math.random() * tyres.length)],
        fuel: fuels[Math.floor(Math.random() * fuels.length)],
        setupFocus: focuses[Math.floor(Math.random() * focuses.length)],
      }
    })

    // Simulate 15-25 laps for each driver
    Object.values(strategies).forEach((strategy) => {
      const laps = 15 + Math.floor(Math.random() * 10)
      session = this.simulateMultipleLaps(session, strategy, laps)
    })

    session.isActive = false
    session.timeRemaining = 0

    return session
  }

  private updatePositions(session: PracticeSession): void {
    // Sort by best lap time
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

  getSetupRecommendation(session: PracticeSession, driverId: string): {
    recommendation: string
    bestTyre: TyreType
    bestFuel: FuelLoad
  } {
    const result = session.results.find((r) => r.driverId === driverId)
    if (!result) {
      return {
        recommendation: "Complete mais voltas para análise",
        bestTyre: "medium",
        bestFuel: "medium",
      }
    }

    // Analyze laps by tyre type
    const lapsByTyre: Record<TyreType, number[]> = {
      soft: [],
      medium: [],
      hard: [],
      wet: [],
    }

    result.laps.forEach((lap) => {
      if (lap.isValid) {
        lapsByTyre[lap.tyre].push(lap.time)
      }
    })

    let bestTyre: TyreType = "medium"
    let bestTime = Infinity

    Object.entries(lapsByTyre).forEach(([tyre, times]) => {
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length
        if (avg < bestTime) {
          bestTime = avg
          bestTyre = tyre as TyreType
        }
      }
    })

    const recommendation =
      result.setupData.speed > 70
        ? "Setup com boa velocidade. Considere pneus macios para classificação."
        : result.setupData.handling > 70
        ? "Setup com boa dirigibilidade. Ideal para corrida longa."
        : "Setup balanceado. Versátil para diferentes condições."

    return {
      recommendation,
      bestTyre,
      bestFuel: "medium",
    }
  }
}
