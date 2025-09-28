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
import { type QualifyingResult } from "./qualifying-simulation"

export interface PitStop {
  lap: number
  driverId: string
  duration: number // in seconds
  tyreChange: boolean
  reason: "mandatory" | "strategy" | "damage"
}

export interface WeatherCondition {
  lap: number
  condition: "sunny" | "cloudy" | "rainy"
  intensity?: number // 1-10 for rain intensity
}

export interface RaceSimulationData {
  race: Race
  startingGrid: QualifyingResult[]
  pitStops: PitStop[]
  weatherChanges: WeatherCondition[]
  results: RaceResult[]
}

export class RaceSimulator {
  private drivers: Driver[]
  private teams: Team[]
  private manufacturers: Manufacturer[]

  constructor() {
    this.drivers = [...DRIVERS]
    this.teams = [...TEAMS]
    this.manufacturers = [...MANUFACTURERS]
  }

  simulateRace(race: Race, startingGrid: QualifyingResult[], raceType: "main" | "inverted" = "main"): RaceSimulationData {
    // Prepare grid based on race type
    let grid = [...startingGrid]
    if (raceType === "inverted") {
      // Invert top 10 positions
      const top10 = grid.slice(0, 10).reverse()
      const rest = grid.slice(10)
      grid = [...top10, ...rest]
      
      // Update positions
      grid.forEach((result, index) => {
        result.position = index + 1
      })
    }

    // Generate dynamic weather
    const weatherChanges = this.generateDynamicWeather(race)
    
    // Generate mandatory pit stops
    const pitStops = this.generatePitStops(race, grid)
    
    // Simulate race with all factors
    const results = this.simulateRaceProgression(race, grid, pitStops, weatherChanges)

    return results
  }

  private generateDynamicWeather(race: Race): WeatherCondition[] {
    const changes: WeatherCondition[] = []
    let currentWeather = race.weather
    
    changes.push({
      lap: 1,
      condition: currentWeather,
      intensity: currentWeather === "rainy" ? Math.floor(Math.random() * 5) + 3 : undefined
    })

    // 30% chance of weather change during race
    if (Math.random() < 0.3) {
      const changeLap = Math.floor(race.laps * 0.3) + Math.floor(Math.random() * (race.laps * 0.4))
      
      if (currentWeather === "sunny") {
        const newWeather = Math.random() < 0.7 ? "cloudy" : "rainy"
        changes.push({
          lap: changeLap,
          condition: newWeather,
          intensity: newWeather === "rainy" ? Math.floor(Math.random() * 8) + 2 : undefined
        })
        currentWeather = newWeather
      } else if (currentWeather === "cloudy") {
        const newWeather = Math.random() < 0.5 ? "sunny" : "rainy"
        changes.push({
          lap: changeLap,
          condition: newWeather,
          intensity: newWeather === "rainy" ? Math.floor(Math.random() * 6) + 4 : undefined
        })
        currentWeather = newWeather
      } else if (currentWeather === "rainy") {
        // Rain can stop
        if (Math.random() < 0.6) {
          changes.push({
            lap: changeLap,
            condition: "cloudy"
          })
          currentWeather = "cloudy"
          
          // Might clear up completely
          if (Math.random() < 0.4) {
            const clearLap = changeLap + Math.floor(Math.random() * 10) + 5
            if (clearLap < race.laps) {
              changes.push({
                lap: clearLap,
                condition: "sunny"
              })
            }
          }
        }
      }
    }

    return changes
  }

  private generatePitStops(race: Race, grid: QualifyingResult[]): PitStop[] {
    const pitStops: PitStop[] = []
    const mandatoryWindow = {
      start: Math.floor(race.laps * 0.3),
      end: Math.floor(race.laps * 0.7)
    }

    grid.forEach(gridPosition => {
      const driver = DRIVERS.find(d => d.id === gridPosition.driverId)
      if (!driver) return // pula se não encontrar o driver
      const team = TEAMS.find(t => t.id === driver.teamId)
      
      // Mandatory pit stop
      const pitLap = mandatoryWindow.start + Math.floor(Math.random() * (mandatoryWindow.end - mandatoryWindow.start))
      
      // Pit stop duration varies by team efficiency
      const baseDuration = 25 // 25 seconds base
      const teamEfficiency = team ? (team.facilities / 100) * 5 : 0 // Up to 5 seconds improvement, 0 if team is undefined
      const randomFactor = (Math.random() - 0.5) * 4 // ±2 seconds random
      
      const duration = Math.max(20, baseDuration - teamEfficiency + randomFactor)

      pitStops.push({
        lap: pitLap,
        driverId: gridPosition.driverId,
        duration,
        tyreChange: true,
        reason: "mandatory"
      })

      // 15% chance of additional strategic pit stop
      if (Math.random() < 0.15) {
        const strategicLap = Math.floor(race.laps * 0.8) + Math.floor(Math.random() * Math.floor(race.laps * 0.15))
        if (strategicLap < race.laps && strategicLap !== pitLap) {
          pitStops.push({
            lap: strategicLap,
            driverId: gridPosition.driverId,
            duration: duration + Math.random() * 3, // Slightly longer for strategy
            tyreChange: true,
            reason: "strategy"
          })
        }
      }

      // 5% chance of damage-related pit stop
      if (Math.random() < 0.05) {
        const damageLap = Math.floor(Math.random() * race.laps * 0.8) + 5
        if (damageLap !== pitLap) {
          pitStops.push({
            lap: damageLap,
            driverId: gridPosition.driverId,
            duration: duration + 10 + Math.random() * 15, // Much longer for repairs
            tyreChange: true,
            reason: "damage"
          })
        }
      }
    })

    return pitStops.sort((a, b) => a.lap - b.lap)
  }

  private simulateRaceProgression(
    race: Race, 
    grid: QualifyingResult[], 
    pitStops: PitStop[], 
    weatherChanges: WeatherCondition[]
  ): RaceSimulationData {
    const racePositions = grid.map((gridPos, index) => ({
      driverId: gridPos.driverId,
      position: index + 1,
      totalTime: 0,
      lastLapTime: 0,
      onTrack: true,
      dnf: false,
      dnfReason: undefined as string | undefined,
      pitStopsCompleted: 0,
      currentTyres: "slick" as "slick" | "rain",
      mandatoryPitCompleted: false
    }))

    // Simulate each lap
    for (let lap = 1; lap <= race.laps; lap++) {
      const currentWeather = this.getCurrentWeather(lap, weatherChanges)
      
      // Handle pit stops for this lap
      const lapPitStops = pitStops.filter(ps => ps.lap === lap)
      lapPitStops.forEach(pitStop => {
        const driverPos = racePositions.find(rp => rp.driverId === pitStop.driverId)
        if (driverPos && driverPos.onTrack) {
          driverPos.totalTime += pitStop.duration * 1000 // Convert to milliseconds
          driverPos.pitStopsCompleted++
          if (pitStop.reason === "mandatory") {
            driverPos.mandatoryPitCompleted = true
          }
          
          // Change tyres based on weather
          if (currentWeather.condition === "rainy") {
            driverPos.currentTyres = "rain"
          } else {
            driverPos.currentTyres = "slick"
          }
        }
      })

      // Simulate lap times for each driver
      racePositions.forEach(racePos => {
        if (!racePos.onTrack) return

        const driver = DRIVERS.find(d => d.id === racePos.driverId)!
        const team = TEAMS.find(t => t.id === driver.teamId)!
        const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!

        // Base lap time
        let lapTime = 70000 + Math.random() * 2000 // 70-72 seconds

        // Driver factors
        const skillFactor = (100 - driver.skill) * 50
        const consistencyFactor = (100 - driver.consistency) * 30
        
        // Team factors
        const teamFactor = (100 - team.reputation) * 25
        
        // Manufacturer factors
        const manufacturerFactor = (100 - manufacturer.performance) * 20

        // Weather factors
        let weatherFactor = 0
        if (currentWeather.condition === "rainy") {
          weatherFactor = 3000 + (currentWeather.intensity || 5) * 500
          
          // Wrong tyres penalty
          if (racePos.currentTyres === "slick") {
            weatherFactor += 8000 // Massive penalty for slicks in rain
          }
          
          // Skilled drivers handle rain better
          weatherFactor -= (driver.skill - 50) * 40
        } else if (currentWeather.condition === "cloudy") {
          weatherFactor = 200 + Math.random() * 800
        }

        // Tyre degradation (gets worse as race progresses)
        const tyreDegradation = (lap / race.laps) * 1000 * (1 - (manufacturer.reliability / 100))

        // Fuel load (gets lighter as race progresses - no refueling allowed)
        const fuelFactor = Math.max(0, (race.laps - lap) * 20) // Lighter car = faster

        // Random factor
        const randomFactor = (Math.random() - 0.5) * 800

        // DNF probability (very low, but increases with damage)
        const dnfProbability = Math.max(0, (100 - driver.consistency - manufacturer.reliability) / 500)
        if (Math.random() < dnfProbability) {
          racePos.onTrack = false
          racePos.dnf = true
          racePos.dnfReason = this.getRandomDNFReason()
          return
        }

        const finalLapTime = lapTime + skillFactor + consistencyFactor + teamFactor + manufacturerFactor + weatherFactor + tyreDegradation - fuelFactor + randomFactor
        
        racePos.lastLapTime = Math.max(65000, finalLapTime)
        racePos.totalTime += racePos.lastLapTime
      })

      // Update positions based on total time (only for drivers on track)
      const onTrackDrivers = racePositions.filter(rp => rp.onTrack)
      onTrackDrivers.sort((a, b) => a.totalTime - b.totalTime)
      onTrackDrivers.forEach((racePos, index) => {
        racePos.position = index + 1
      })
    }

    // Penalize drivers who didn't complete mandatory pit stop
    racePositions.forEach(racePos => {
      if (racePos.onTrack && !racePos.mandatoryPitCompleted) {
        racePos.totalTime += 30000 // 30 second penalty
      }
    })

    // Final sort and create results
    const finalPositions = racePositions.filter(rp => rp.onTrack)
    const dnfDrivers = racePositions.filter(rp => !rp.onTrack)
    
    finalPositions.sort((a, b) => a.totalTime - b.totalTime)
    
    const results: RaceResult[] = []
    
    // Add finishers
    finalPositions.forEach((racePos, index) => {
      const driver = DRIVERS.find(d => d.id === racePos.driverId)!
      const team = TEAMS.find(t => t.id === driver.teamId)!
      
      results.push({
        position: index + 1,
        driverId: racePos.driverId,
        teamId: team.id,
        manufacturerId: driver.manufacturerId,
        points: this.calculatePoints(index + 1, false),
        fastestLap: false, // Will be assigned separately
        dnf: false,
        lapTime: this.formatTime(racePos.lastLapTime)
      })
    })

    // Add DNF drivers
    dnfDrivers.forEach(racePos => {
      const driver = DRIVERS.find(d => d.id === racePos.driverId)!
      const team = TEAMS.find(t => t.id === driver.teamId)!
      
      results.push({
        position: results.length + 1,
        driverId: racePos.driverId,
        teamId: team.id,
        manufacturerId: driver.manufacturerId,
        points: 0,
        fastestLap: false,
        dnf: true,
        dnfReason: racePos.dnfReason
      })
    })

    // Assign fastest lap (only to top 10 finishers)
    const finishers = results.filter(r => !r.dnf).slice(0, 10)
    if (finishers.length > 0) {
      const fastestLapIndex = Math.floor(Math.random() * Math.min(3, finishers.length))
      results[fastestLapIndex].fastestLap = true
      results[fastestLapIndex].points += 1 // Bonus point for fastest lap
    }

    return {
      race,
      startingGrid: grid,
      pitStops,
      weatherChanges,
      results
    }
  }

  private getCurrentWeather(lap: number, weatherChanges: WeatherCondition[]): WeatherCondition {
    // Find the most recent weather change for this lap
    const relevantChanges = weatherChanges.filter(wc => wc.lap <= lap)
    return relevantChanges[relevantChanges.length - 1] || weatherChanges[0]
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
      "Problema hidráulico",
      "Falha na suspensão",
      "Problema no câmbio"
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  private formatTime(timeMs: number): string {
    const minutes = Math.floor(timeMs / 60000)
    const seconds = (timeMs % 60000) / 1000
    return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`
  }

  updateDriverStats(results: RaceResult[]): void {
    // Garante que results é um array
    if (!Array.isArray(results)) {
      results = [results]
    }
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