import { type Driver, type Team, type Manufacturer, DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"

export interface QualifyingSession {
  id: string
  type: "Q1" | "Q2" | "Q3"
  participants: string[] // driver IDs
  results: QualifyingResult[]
  qualified: string[] // drivers advancing to next session
  eliminated: string[] // drivers eliminated in this session
  weather: "sunny" | "cloudy" | "rainy"
  completed: boolean
  polePosition?: QualifyingResult // Added to track pole position per session
}

export interface QualifyingResult {
  position: number
  driverId: string
  lapTime: number // in milliseconds
  gap: number // gap to pole in milliseconds
  eliminated: boolean
  eliminatedIn?: "Q1" | "Q2" // which session they were eliminated in
  isCurrentSessionPole?: boolean // pole for current session
}

export interface QualifyingWeekend {
  id: string
  raceId: string
  sessions: QualifyingSession[]
  finalGrid: QualifyingResult[]
  weather: "sunny" | "cloudy" | "rainy"
  completed: boolean
  polePosition: QualifyingResult | null // Overall pole position
  summary: {
    q1Eliminated: QualifyingResult[]
    q2Eliminated: QualifyingResult[]
    q3Top10: QualifyingResult[]
  }
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
      completed: false,
      polePosition: null,
      summary: {
        q1Eliminated: [],
        q2Eliminated: [],
        q3Top10: []
      }
    }

    // Q1 - All drivers participate, eliminate 5 slowest
    const q1Results = this.simulateSession("Q1", activeDrivers.map(d => d.id), weather)
    const q1Qualified = q1Results.slice(0, 15) // Top 15 advance
    const q1Eliminated = q1Results.slice(15) // Bottom 5 eliminated

    // Mark eliminated drivers
    q1Eliminated.forEach(result => {
      result.eliminated = true
      result.eliminatedIn = "Q1"
    })

    const q1Session: QualifyingSession = {
      id: `${raceId}-q1`,
      type: "Q1",
      participants: activeDrivers.map(d => d.id),
      results: q1Results,
      qualified: q1Qualified.map(r => r.driverId),
      eliminated: q1Eliminated.map(r => r.driverId),
      weather,
      completed: true,
      polePosition: q1Results[0]
    }
    
    // Mark session pole
    q1Results[0].isCurrentSessionPole = true
    qualifying.sessions.push(q1Session)
    qualifying.summary.q1Eliminated = q1Eliminated

    // Q2 - Top 15 from Q1, eliminate 5 more
    const q2Results = this.simulateSession("Q2", q1Qualified.map(r => r.driverId), weather)
    const q2Qualified = q2Results.slice(0, 10) // Top 10 advance
    const q2Eliminated = q2Results.slice(10) // Bottom 5 eliminated

    // Mark eliminated drivers
    q2Eliminated.forEach(result => {
      result.eliminated = true
      result.eliminatedIn = "Q2"
    })

    const q2Session: QualifyingSession = {
      id: `${raceId}-q2`,
      type: "Q2",
      participants: q1Qualified.map(r => r.driverId),
      results: q2Results,
      qualified: q2Qualified.map(r => r.driverId),
      eliminated: q2Eliminated.map(r => r.driverId),
      weather,
      completed: true,
      polePosition: q2Results[0]
    }

    // Mark session pole
    q2Results[0].isCurrentSessionPole = true
    qualifying.sessions.push(q2Session)
    qualifying.summary.q2Eliminated = q2Eliminated

    // Q3 - Top 10 from Q2, fight for pole
    const q3Results = this.simulateSession("Q3", q2Qualified.map(r => r.driverId), weather)

    const q3Session: QualifyingSession = {
      id: `${raceId}-q3`,
      type: "Q3",
      participants: q2Qualified.map(r => r.driverId),
      results: q3Results,
      qualified: [], // No one advances from Q3
      eliminated: [], // No one is eliminated from Q3
      weather,
      completed: true,
      polePosition: q3Results[0]
    }

    // Mark session pole and overall pole
    q3Results[0].isCurrentSessionPole = true
    qualifying.sessions.push(q3Session)
    qualifying.summary.q3Top10 = q3Results
    qualifying.polePosition = q3Results[0]

    // Build final grid with proper elimination tracking
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
    q2Eliminated.forEach((result, index) => {
      const q2Result = q2Results.find(r => r.driverId === result.driverId)!
      finalGrid.push({
        ...q2Result,
        position: 11 + index,
        eliminated: true,
        eliminatedIn: "Q2"
      })
    })

    // Positions 16-20 from Q1 (those who didn't make Q2)
    q1Eliminated.forEach((result, index) => {
      finalGrid.push({
        ...result,
        position: 16 + index,
        eliminated: true,
        eliminatedIn: "Q1"
      })
    })

    qualifying.finalGrid = finalGrid
    qualifying.completed = true

    return qualifying
  }

  private simulateSession(sessionType: "Q1" | "Q2" | "Q3", driverIds: string[], weather: "sunny" | "cloudy" | "rainy"): QualifyingResult[] {
    const results: QualifyingResult[] = []
    
    // Create more varied performance by adding track-specific factors
    const trackFactor = Math.random() * 0.3 + 0.85 // 0.85-1.15 multiplier

    driverIds.forEach(driverId => {
      const driver = DRIVERS.find(d => d.id === driverId)!
      const team = TEAMS.find(t => t.id === driver.teamId)!
      const manufacturer = MANUFACTURERS.find(m => m.id === driver.manufacturerId)!

      // Base lap time (around 1:10 for most tracks)
      let baseTime = 70000 + Math.random() * 3000 // 70-73 seconds in milliseconds

      // Driver skill impact (more varied)
      const skillFactor = (100 - driver.skill) * (80 + Math.random() * 40) // 80-120 multiplier

      // Team reputation impact (more significant)
      const teamFactor = (100 - team.reputation) * (40 + Math.random() * 30) // 40-70 multiplier

      // Manufacturer performance impact (track-dependent)
      const manufacturerFactor = ((100 - (manufacturer?.performance ?? 50)) * (20 + Math.random() * 25) * trackFactor)

      // Driver form factor (some drivers perform better on certain days)
      const formFactor = (Math.random() - 0.5) * 2000 // ±1 second random form

      // Setup factor (some teams nail the setup, others don't)
      const setupFactor = (Math.random() - 0.5) * 1500 // ±0.75 second setup variation

      // Weather impact
      let weatherFactor = 0
      if (weather === "rainy") {
        weatherFactor = 4000 + (Math.random() * 4000) // 4-8 seconds slower
        // Skilled drivers handle rain better
        weatherFactor -= (driver.skill - 50) * (25 + Math.random() * 15) // More variation in rain skill
      } else if (weather === "cloudy") {
        weatherFactor = 300 + (Math.random() * 1200) // 0.3-1.5 seconds slower
      }

      // Session pressure (Q3 has more pressure)
      let pressureFactor = 0
      if (sessionType === "Q3") {
        pressureFactor = (100 - driver.consistency) * (15 + Math.random() * 15) // 15-30 multiplier
      } else if (sessionType === "Q2") {
        pressureFactor = (100 - driver.consistency) * (8 + Math.random() * 8) // 8-16 multiplier
      }

      // Random factor for unpredictability (larger range)
      const randomFactor = (Math.random() - 0.5) * 1800

      const finalTime = Math.max(65000, 
        baseTime + 
        skillFactor + 
        teamFactor + 
        manufacturerFactor + 
        weatherFactor + 
        pressureFactor + 
        randomFactor + 
        formFactor + 
        setupFactor
      )

      results.push({
        position: 0, // Will be set after sorting
        driverId,
        lapTime: finalTime,
        gap: 0, // Will be calculated after sorting
        eliminated: false,
        isCurrentSessionPole: false
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

  // Método para obter estatísticas da sessão
  getSessionStats(session: QualifyingSession) {
    return {
      totalParticipants: session.participants.length,
      qualified: session.qualified.length,
      eliminated: session.eliminated.length,
      fastestLap: session.results[0]?.lapTime || 0,
      slowestLap: session.results[session.results.length - 1]?.lapTime || 0,
      polePosition: session.polePosition
    }
  }

  // Método para obter resumo completo da classificação
  getQualifyingSummary(qualifying: QualifyingWeekend) {
    return {
      overallPole: qualifying.polePosition,
      q1Stats: this.getSessionStats(qualifying.sessions[0]),
      q2Stats: this.getSessionStats(qualifying.sessions[1]),
      q3Stats: this.getSessionStats(qualifying.sessions[2]),
      eliminationSummary: {
        q1Eliminated: qualifying.summary.q1Eliminated.length,
        q2Eliminated: qualifying.summary.q2Eliminated.length,
        q3Finalists: qualifying.summary.q3Top10.length
      }
    }
  }

  // Método para verificar se um piloto foi eliminado em determinada sessão
  isDriverEliminatedIn(qualifying: QualifyingWeekend, driverId: string): "Q1" | "Q2" | null {
    const finalResult = qualifying.finalGrid.find(r => r.driverId === driverId)
    return finalResult?.eliminatedIn || null
  }

  // Método para obter a melhor volta de um piloto em todas as sessões
  getDriverBestLap(qualifying: QualifyingWeekend, driverId: string): { sessionType: string, lapTime: number, position: number } | null {
    let bestLap = null
    let bestTime = Infinity

    qualifying.sessions.forEach(session => {
      const result = session.results.find(r => r.driverId === driverId)
      if (result && result.lapTime < bestTime) {
        bestTime = result.lapTime
        bestLap = {
          sessionType: session.type,
          lapTime: result.lapTime,
          position: result.position
        }
      }
    })

    return bestLap
  }
}