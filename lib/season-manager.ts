import {
  type Season,
  type Race,
  TRACKS,
  type Driver,
  type Team,
  type Manufacturer,
  DRIVERS,
  TEAMS,
  MANUFACTURERS,
} from "./stock-car-data"
import { RaceSimulator } from "./race-simulation"
import { QualifyingSimulator } from "./qualifying-simulation"
import { HistoricalEvolutionManager, type HistoricalEvent } from "./historical-evolution"

export class SeasonManager {
  private raceSimulator: RaceSimulator
  private qualifyingSimulator: QualifyingSimulator
  private evolutionManager: HistoricalEvolutionManager

  constructor() {
    this.raceSimulator = new RaceSimulator()
    this.qualifyingSimulator = new QualifyingSimulator()
    this.evolutionManager = new HistoricalEvolutionManager()
  }

  createSeason(year: number): Season {
    const evolutionEvents = this.evolutionManager.simulateSeasonEvolution(year)
    if (evolutionEvents.length > 0) {
      this.applyEvolutionToGlobalData(evolutionEvents)
    }

    const races = this.generateRaceCalendar(year)

    return {
      year,
      races,
      driverStandings: [],
      teamStandings: [],
      manufacturerStandings: [],
      completed: false,
      evolutionEvents,
    }
  }

  private generateRaceCalendar(year: number): Race[] {
    const races: Race[] = []
    const startDate = new Date(year, 2, 15) // Start in March

    const selectedTracks = TRACKS.slice(0, 12) // 12 race weekends

    selectedTracks.forEach((track, index) => {
      const raceDate = new Date(startDate)
      raceDate.setDate(startDate.getDate() + index * 21) // Race weekend every 3 weeks

      // Saturday - Qualifying + Race 1
      races.push({
        id: `${year}-${track.name.toLowerCase().replace(/\s+/g, "-")}-race1`,
        name: `GP ${track.location} - Corrida 1`,
        track: track.name,
        location: track.location,
        state: track.state,
        flag: track.flag,
        date: raceDate,
        laps: track.laps,
        distance: track.distance,
        completed: false,
        weather: this.generateWeather(),
        raceType: "main"
      })

      // Sunday - Race 2 (Inverted Grid)
      const sundayDate = new Date(raceDate)
      sundayDate.setDate(raceDate.getDate() + 1) // Next day (Sunday)

      races.push({
        id: `${year}-${track.name.toLowerCase().replace(/\s+/g, "-")}-race2`,
        name: `GP ${track.location} - Corrida 2`,
        track: track.name,
        location: track.location,
        state: track.state,
        flag: track.flag,
        date: sundayDate,
        laps: Math.floor(track.laps * 0.8), // Shorter race
        distance: track.distance * 0.8,
        completed: false,
        weather: this.generateWeather(),
        raceType: "inverted"
      })
    })

    return races
  }

  private generateWeather(): "sunny" | "cloudy" | "rainy" {
    const rand = Math.random()
    if (rand < 0.7) return "sunny"
    if (rand < 0.9) return "cloudy"
    return "rainy"
  }

  simulateNextRace(season: Season): Season {
    const nextRace = season.races.find((race) => !race.completed)
    if (!nextRace) return season

    if (nextRace.raceType === "main") {
      // First, simulate qualifying
      const qualifying = this.qualifyingSimulator.simulateQualifying(nextRace.id, nextRace.weather)
      nextRace.qualifying = qualifying
      
      // Then simulate Race 1 with qualifying grid
      const raceSimulation = this.raceSimulator.simulateRace(nextRace, qualifying.finalGrid, "main")
      nextRace.results = raceSimulation.results
      
      // Store Race 1 results for Race 2 grid
      const race2 = season.races.find(r => r.id === nextRace.id.replace('-race1', '-race2'))
      if (race2) {
        race2.race1Results = raceSimulation.results
      }
    } else {
      // Race 2 - use inverted grid from Race 1
      const race1 = season.races.find(r => r.id === nextRace.id.replace('-race2', '-race1'))
      if (race1 && race1.results) {
        // Create grid from Race 1 results
        const race1Grid = race1.results.filter(r => !r.dnf).map((result, index) => ({
          position: result.position,
          driverId: result.driverId,
          lapTime: 70000, // Placeholder
          gap: 0,
          eliminated: false
        }))
        
        const raceSimulation = this.raceSimulator.simulateRace(nextRace, race1Grid, "inverted")
        nextRace.results = raceSimulation.results
      }
    }
    
    nextRace.completed = true

    // Update driver stats
    if (nextRace.results) {
      this.raceSimulator.updateDriverStats(nextRace.results)
    }

    // Update standings
    this.updateStandings(season)

    // Check if season is complete
    season.completed = season.races.every((race) => race.completed)

    return season
  }

  simulateFullSeason(season: Season): Season {
    while (!season.completed) {
      this.simulateNextRace(season)
    }
    return season
  }

  private updateStandings(season: Season): void {
    // This will be implemented when we create the championship interface
    // For now, we'll leave it as a placeholder
  }

  private applyEvolutionToGlobalData(events: HistoricalEvent[]): void {
    events.forEach((event) => {
      switch (event.type) {
        case "driver_entry":
          const newDriverData = this.evolutionManager.getPotentialDriver(event.entityId)
          if (newDriverData && !DRIVERS.some((d) => d.id === newDriverData.id)) {
            // Find a team that needs drivers
            const availableTeam = TEAMS.find((team) => team.active && team.drivers.length < 2)
            if (availableTeam) {
              const driverToAdd: Driver = {
                ...newDriverData,
                active: true,
                teamId: availableTeam.id,
                manufacturerId: availableTeam.manufacturerId,
                points: 0,
                wins: 0,
                podiums: 0,
              }
              DRIVERS.push(driverToAdd)
              availableTeam.drivers.push(newDriverData.id)
              console.log(`[v0] Added new driver: ${newDriverData.name} to team ${availableTeam.name}`)
            }
          }
          break

        case "team_entry":
          const newTeamData = this.evolutionManager.getPotentialTeam(event.entityId)
          if (newTeamData && !TEAMS.some((t) => t.id === newTeamData.id)) {
            TEAMS.push({ ...newTeamData, active: true })
            console.log(`[v0] Added new team: ${newTeamData.name}`)
          }
          break

        case "manufacturer_entry":
          const newManufacturerData = this.evolutionManager.getPotentialManufacturer(event.entityId)
          if (newManufacturerData && !MANUFACTURERS.some((m) => m.id === newManufacturerData.id)) {
            MANUFACTURERS.push({ ...newManufacturerData, active: true })
            console.log(`[v0] Added new manufacturer: ${newManufacturerData.name}`)
          }
          break

        case "driver_exit":
          const driverIndex = DRIVERS.findIndex((d) => d.id === event.entityId)
          if (driverIndex !== -1) {
            DRIVERS[driverIndex].active = false
            console.log(`[v0] Deactivated driver: ${DRIVERS[driverIndex].name}`)
          }
          break

        case "team_exit":
          const teamIndex = TEAMS.findIndex((t) => t.id === event.entityId)
          if (teamIndex !== -1) {
            TEAMS[teamIndex].active = false
            // Deactivate team drivers
            DRIVERS.forEach((driver) => {
              if (driver.teamId === event.entityId) {
                driver.active = false
              }
            })
            console.log(`[v0] Deactivated team: ${TEAMS[teamIndex].name}`)
          }
          break

        case "manufacturer_exit":
          const manufacturerIndex = MANUFACTURERS.findIndex((m) => m.id === event.entityId)
          if (manufacturerIndex !== -1) {
            MANUFACTURERS[manufacturerIndex].active = false
            console.log(`[v0] Deactivated manufacturer: ${MANUFACTURERS[manufacturerIndex].name}`)
          }
          break
      }
    })
  }

  getSeasonProgress(season: Season): number {
    const completedRaces = season.races.filter((race) => race.completed).length
    return (completedRaces / season.races.length) * 100
  }

  getCurrentRace(season: Season): Race | null {
    return season.races.find((race) => !race.completed) || null
  }

  getLastRace(season: Season): Race | null {
    const completedRaces = season.races.filter((race) => race.completed)
    return completedRaces.length > 0 ? completedRaces[completedRaces.length - 1] : null
  }

  getCurrentDrivers(): Driver[] {
    return DRIVERS.filter((d) => d.active)
  }

  getCurrentTeams(): Team[] {
    return TEAMS.filter((t) => t.active)
  }

  getCurrentManufacturers(): Manufacturer[] {
    return MANUFACTURERS.filter((m) => m.active)
  }

  getEvolutionEvents(year: number): HistoricalEvent[] {
    return this.evolutionManager.getEventsForYear(year)
  }
}
