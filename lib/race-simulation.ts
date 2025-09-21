import {
  type Driver,
  type Team,
  type Manufacturer,
  type Race,
  type RaceResult,
  DRIVERS,
  TEAMS,
  MANUFACTURERS,
} from "./stock-car-data"

export class RaceSimulator {
  private drivers: Driver[]
  private teams: Team[]
  private manufacturers: Manufacturer[]

  constructor() {
    this.drivers = [...DRIVERS]
    this.teams = [...TEAMS]
    this.manufacturers = [...MANUFACTURERS]
  }

  simulateRace(race: Race): RaceResult[] {
    const activeDrivers = this.drivers.filter((d) => d.active)
    const results: RaceResult[] = []

    // Calculate race performance for each driver
    const driverPerformances = activeDrivers.map((driver) => {
      const team = this.teams.find((t) => t.id === driver.teamId)!
      const manufacturer = this.manufacturers.find((m) => m.id === driver.manufacturerId)!

      // Base performance calculation
      let performance = driver.skill * 0.4 + driver.consistency * 0.3

      // Team factors
      performance += team.reputation * 0.15
      performance += team.facilities * 0.1

      // Manufacturer factors
      performance += manufacturer.performance * 0.05

      // Weather impact
      if (race.weather === "rainy") {
        performance += (driver.skill - 50) * 0.2 // Skilled drivers perform better in rain
      }

      // Random factor for unpredictability
      const randomFactor = (Math.random() - 0.5) * 20
      performance += randomFactor

      // DNF probability (lower for more reliable drivers/teams)
      const dnfProbability = Math.max(0, (100 - driver.consistency - manufacturer.reliability) / 200)
      const dnf = Math.random() < dnfProbability

      return {
        driver,
        team,
        manufacturer,
        performance: dnf ? -1 : Math.max(0, performance),
        dnf,
        dnfReason: dnf ? this.getRandomDNFReason() : undefined,
      }
    })

    // Sort by performance (DNF drivers go to the end)
    driverPerformances.sort((a, b) => {
      if (a.dnf && !b.dnf) return 1
      if (!a.dnf && b.dnf) return -1
      return b.performance - a.performance
    })

    // Create race results
    driverPerformances.forEach((perf, index) => {
      const position = index + 1
      const points = this.calculatePoints(position, perf.dnf)

      results.push({
        position,
        driverId: perf.driver.id,
        teamId: perf.team.id,
        manufacturerId: perf.manufacturer.id,
        points,
        fastestLap: false, // Will be assigned separately
        dnf: perf.dnf,
        dnfReason: perf.dnfReason,
        lapTime: perf.dnf ? undefined : this.generateLapTime(race, perf.performance),
      })
    })

    // Assign fastest lap (only to top 10 finishers)
    const finishers = results.filter((r) => !r.dnf).slice(0, 10)
    if (finishers.length > 0) {
      const fastestLapIndex = Math.floor(Math.random() * Math.min(3, finishers.length))
      results[fastestLapIndex].fastestLap = true
      results[fastestLapIndex].points += 1 // Bonus point for fastest lap
    }

    return results
  }

  private calculatePoints(position: number, dnf: boolean): number {
    if (dnf) return 0
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
    return position <= pointsSystem.length ? pointsSystem[position - 1] : 0
  }

  private getRandomDNFReason(): string {
    const reasons = [
      "Problema mecânico",
      "Acidente",
      "Problema no motor",
      "Problema na transmissão",
      "Superaquecimento",
      "Problema elétrico",
      "Pneu furado",
      "Problema no combustível",
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  private generateLapTime(race: Race, performance: number): string {
    // Base lap time varies by track
    const baseTimes: { [key: string]: number } = {
      Interlagos: 72.5,
      Goiânia: 68.2,
      "Santa Cruz do Sul": 65.8,
      Cascavel: 70.1,
      Curitiba: 69.5,
      Londrina: 67.3,
      "Campo Grande": 68.9,
      Brasília: 71.2,
      "Ribeirão Preto": 66.7,
      Tarumã: 64.9,
    }

    const baseTime = baseTimes[race.track] || 70.0
    const performanceModifier = (100 - performance) * 0.02
    const finalTime = baseTime + performanceModifier

    const minutes = Math.floor(finalTime / 60)
    const seconds = (finalTime % 60).toFixed(3)

    return `${minutes}:${seconds.padStart(6, "0")}`
  }

  updateDriverStats(results: RaceResult[]): void {
    results.forEach((result) => {
      const driver = this.drivers.find((d) => d.id === result.driverId)
      if (driver) {
        driver.points += result.points
        if (result.position === 1) driver.wins++
        if (result.position <= 3 && !result.dnf) driver.podiums++
      }
    })
  }
}
