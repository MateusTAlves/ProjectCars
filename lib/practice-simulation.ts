import { DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"

export interface PracticeSession {
  id: string
  type: "FP1" | "FP2" | "FP3"
  participants: string[]
  results: PracticeResult[]
  weather: "sunny" | "cloudy" | "rainy"
  completed: boolean
  fastestLap: PracticeResult | null
  totalLaps: number
}

export interface PracticeResult {
  position: number
  driverId: string
  fastestLap: number
  gap: number
  totalLaps: number
  averageLap: number
}

export class PracticeSimulator {
  private baseTime = 70000

  simulatePracticeSession(
    sessionType: "FP1" | "FP2" | "FP3",
    weather: "sunny" | "cloudy" | "rainy"
  ): PracticeSession {
    const activeDrivers = DRIVERS.filter(d => d.active)
    const results: PracticeResult[] = []

    activeDrivers.forEach((driver) => {
      const team = TEAMS.find(t => t.id === driver.teamId)!
      const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!

      let sessionMultiplier = 1.0
      if (sessionType === "FP1") sessionMultiplier = 1.02
      if (sessionType === "FP2") sessionMultiplier = 1.01
      if (sessionType === "FP3") sessionMultiplier = 1.0

      const weatherMultiplier =
        weather === "sunny" ? 1.0 :
        weather === "cloudy" ? 1.015 :
        1.05

      const driverVariance = (Math.random() - 0.5) * 2000
      const teamFactor = team.performance * 1000
      const manufacturerFactor = manufacturer.reliability * 500

      const fastestLap = Math.round(
        (this.baseTime + driverVariance - teamFactor - manufacturerFactor) *
        sessionMultiplier *
        weatherMultiplier
      )

      const totalLaps = Math.floor(15 + Math.random() * 10)
      const averageLap = fastestLap + Math.random() * 2000

      results.push({
        position: 0,
        driverId: driver.id,
        fastestLap,
        gap: 0,
        totalLaps,
        averageLap
      })
    })

    results.sort((a, b) => a.fastestLap - b.fastestLap)

    const fastestTime = results[0].fastestLap
    results.forEach((result, index) => {
      result.position = index + 1
      result.gap = result.fastestLap - fastestTime
    })

    return {
      id: `practice-${sessionType}`,
      type: sessionType,
      participants: activeDrivers.map(d => d.id),
      results,
      weather,
      completed: true,
      fastestLap: results[0],
      totalLaps: results.reduce((sum, r) => sum + r.totalLaps, 0)
    }
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = milliseconds / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const ms = milliseconds % 1000

    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }

  formatGap(gap: number): string {
    if (gap === 0) return "—"
    return `+${(gap / 1000).toFixed(3)}s`
  }
}
