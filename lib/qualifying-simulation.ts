import { type Driver, type Team, type Manufacturer, DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"

export interface QualifyingSession {
  id: string
  type: "Q1" | "Q2" | "Q3"
  participants: string[] // driver IDs
  results: QualifyingResult[]
  weather: "sunny" | "cloudy" | "rainy"
  completed: boolean
}

export interface QualifyingResult {
  position: number
  driverId: string
  lapTime: number // in milliseconds
  gap: number // gap to pole in milliseconds
  eliminated: boolean
}

export interface QualifyingWeekend {
  id: string
  raceId: string
  sessions: QualifyingSession[]
  finalGrid: QualifyingResult[]
  weather: "sunny" | "cloudy" | "rainy"
  completed: boolean
}

export class QualifyingSimulator {
  simulateQualifying(raceId: string, weather: "sunny" | "cloudy" | "rainy"): QualifyingWeekend {
    const activeDrivers = DRIVERS.filter(d => d.active)
    
    const qualifying: QualifyingWeekend = {
      id: `${raceId}-qualifying`,
      raceId,
      sessions: [],
      finalGrid: [],
      weather,
      completed: false
    }

    // Q1 - All drivers participate, eliminate 5 slowest
    const q1Results = this.simulateSession("Q1", activeDrivers.map(d => d.id), weather)
    const q1Advancing = q1Results.slice(0, 15) // Top 15 advance
    qualifying.sessions.push({
      id: `${raceId}-q1`,
      type: "Q1",
      participants: activeDrivers.map(d => d.id),
      results: q1Results,
      weather,
      completed: true
    })

    // Q2 - Top 15 from Q1, eliminate 5 more
    const q2Results = this.simulateSession("Q2", q1Advancing.map(r => r.driverId), weather)
    const q2Advancing = q2Results.slice(0, 10) // Top 10 advance
    qualifying.sessions.push({
      id: `${raceId}-q2`,
      type: "Q2",
      participants: q1Advancing.map(r => r.driverId),
      results: q2Results,
      weather,
      completed: true
    })

    // Q3 - Top 10 from Q2, fight for pole
    const q3Results = this.simulateSession("Q3", q2Advancing.map(r => r.driverId), weather)
    qualifying.sessions.push({
      id: `${raceId}-q3`,
      type: "Q3",
      participants: q2Advancing.map(r => r.driverId),
      results: q3Results,
      weather,
      completed: true
    })

    // Build final grid
    const finalGrid: QualifyingResult[] = []
    
    // Positions 1-10 from Q3
    q3Results.forEach((result, index) => {
      finalGrid.push({
        ...result,
        position: index + 1,
        eliminated: false
      })
    })

    // Positions 11-15 from Q2 (those who didn't make Q3)
    const q2Eliminated = q1Advancing.slice(10)
    q2Eliminated.forEach((result, index) => {
      const q2Result = q2Results.find(r => r.driverId === result.driverId)!
      finalGrid.push({
        ...q2Result,
        position: 11 + index,
        eliminated: true
      })
    })

    // Positions 16-20 from Q1 (those who didn't make Q2)
    const q1Eliminated = q1Results.slice(15)
    q1Eliminated.forEach((result, index) => {
      finalGrid.push({
        ...result,
        position: 16 + index,
        eliminated: true
      })
    })

    qualifying.finalGrid = finalGrid
    qualifying.completed = true

    return qualifying
  }

  private simulateSession(sessionType: "Q1" | "Q2" | "Q3", driverIds: string[], weather: "sunny" | "cloudy" | "rainy"): QualifyingResult[] {
    const results: QualifyingResult[] = []
    
    driverIds.forEach(driverId => {
      const driver = DRIVERS.find(d => d.id === driverId)!
      const team = TEAMS.find(t => t.id === driver.teamId)!
      const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!

      // Base lap time (around 1:10 for most tracks)
      let baseTime = 70000 + Math.random() * 2000 // 70-72 seconds in milliseconds

      // Driver skill impact
      const skillFactor = (100 - driver.skill) * 100
      
      // Team reputation impact
      const teamFactor = (100 - team.reputation) * 50
      
      // Manufacturer performance impact
      const manufacturerFactor = (100 - manufacturer.performance) * 30

      // Weather impact
      let weatherFactor = 0
      if (weather === "rainy") {
        weatherFactor = 5000 + (Math.random() * 3000) // 5-8 seconds slower
        // Skilled drivers handle rain better
        weatherFactor -= (driver.skill - 50) * 30
      } else if (weather === "cloudy") {
        weatherFactor = 500 + (Math.random() * 1000) // 0.5-1.5 seconds slower
      }

      // Session pressure (Q3 has more pressure)
      let pressureFactor = 0
      if (sessionType === "Q3") {
        pressureFactor = (100 - driver.consistency) * 20 // Less consistent drivers struggle more under pressure
      } else if (sessionType === "Q2") {
        pressureFactor = (100 - driver.consistency) * 10
      }

      // Random factor for unpredictability
      const randomFactor = (Math.random() - 0.5) * 1000

      const finalTime = Math.max(65000, baseTime + skillFactor + teamFactor + manufacturerFactor + weatherFactor + pressureFactor + randomFactor)

      results.push({
        position: 0, // Will be set after sorting
        driverId,
        lapTime: finalTime,
        gap: 0, // Will be calculated after sorting
        eliminated: false
      })
    })

    // Sort by lap time
    results.sort((a, b) => a.lapTime - b.lapTime)

    // Set positions and gaps
    const poleTime = results[0].lapTime
    results.forEach((result, index) => {
      result.position = index + 1
      result.gap = result.lapTime - poleTime
    })

    return results
  }

  formatTime(timeMs: number): string {
    const minutes = Math.floor(timeMs / 60000)
    const seconds = Math.floor((timeMs % 60000) / 1000)
    const milliseconds = Math.floor((timeMs % 1000))
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }

  formatGap(gapMs: number): string {
    if (gapMs === 0) return "POLE"
    if (gapMs < 1000) return `+${gapMs}ms`
    return `+${(gapMs / 1000).toFixed(3)}s`
  }
}