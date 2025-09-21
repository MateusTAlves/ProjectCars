import type { Season, DriverStanding, TeamStanding, ManufacturerStanding } from "./stock-car-data"
import { DRIVERS, TEAMS, MANUFACTURERS } from "./stock-car-data"

export class ChampionshipCalculator {
  calculateDriverStandings(season: Season): DriverStanding[] {
    const driverPoints: { [driverId: string]: DriverStanding } = {}

    // Initialize all active drivers
    DRIVERS.filter((d) => d.active).forEach((driver) => {
      driverPoints[driver.id] = {
        driverId: driver.id,
        position: 0,
        points: 0,
        wins: 0,
        podiums: 0,
        fastestLaps: 0,
      }
    })

    // Calculate points from completed races
    season.races
      .filter((race) => race.completed && race.results)
      .forEach((race) => {
        race.results!.forEach((result) => {
          if (driverPoints[result.driverId]) {
            driverPoints[result.driverId].points += result.points
            if (result.position === 1) driverPoints[result.driverId].wins++
            if (result.position <= 3 && !result.dnf) driverPoints[result.driverId].podiums++
            if (result.fastestLap) driverPoints[result.driverId].fastestLaps++
          }
        })
      })

    // Sort by points (then by wins, then by podiums)
    const standings = Object.values(driverPoints).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.podiums - a.podiums
    })

    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1
    })

    return standings
  }

  calculateTeamStandings(season: Season): TeamStanding[] {
    const teamPoints: { [teamId: string]: TeamStanding } = {}

    // Initialize all active teams
    TEAMS.filter((t) => t.active).forEach((team) => {
      teamPoints[team.id] = {
        teamId: team.id,
        position: 0,
        points: 0,
        wins: 0,
        podiums: 0,
      }
    })

    // Calculate points from completed races
    season.races
      .filter((race) => race.completed && race.results)
      .forEach((race) => {
        race.results!.forEach((result) => {
          if (teamPoints[result.teamId]) {
            teamPoints[result.teamId].points += result.points
            if (result.position === 1) teamPoints[result.teamId].wins++
            if (result.position <= 3 && !result.dnf) teamPoints[result.teamId].podiums++
          }
        })
      })

    // Sort by points
    const standings = Object.values(teamPoints).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.podiums - a.podiums
    })

    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1
    })

    return standings
  }

  calculateManufacturerStandings(season: Season): ManufacturerStanding[] {
    const manufacturerPoints: { [manufacturerId: string]: ManufacturerStanding } = {}

    // Initialize all active manufacturers
    MANUFACTURERS.filter((m) => m.active).forEach((manufacturer) => {
      manufacturerPoints[manufacturer.id] = {
        manufacturerId: manufacturer.id,
        position: 0,
        points: 0,
        wins: 0,
        podiums: 0,
      }
    })

    // Calculate points from completed races
    season.races
      .filter((race) => race.completed && race.results)
      .forEach((race) => {
        race.results!.forEach((result) => {
          if (manufacturerPoints[result.manufacturerId]) {
            manufacturerPoints[result.manufacturerId].points += result.points
            if (result.position === 1) manufacturerPoints[result.manufacturerId].wins++
            if (result.position <= 3 && !result.dnf) manufacturerPoints[result.manufacturerId].podiums++
          }
        })
      })

    // Sort by points
    const standings = Object.values(manufacturerPoints).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.podiums - a.podiums
    })

    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1
    })

    return standings
  }

  getDriverForm(driverId: string, season: Season, lastRaces = 5): number[] {
    const recentRaces = season.races.filter((race) => race.completed && race.results).slice(-lastRaces)

    return recentRaces.map((race) => {
      const result = race.results!.find((r) => r.driverId === driverId)
      return result ? result.position : 0
    })
  }

  getPointsGap(standings: DriverStanding[], position: number): number {
    if (position === 1) return 0
    const leader = standings[0]
    const current = standings[position - 1]
    return leader.points - current.points
  }

  getPositionChange(driverId: string, currentSeason: Season, previousSeason?: Season): number {
    if (!previousSeason) return 0

    const currentStandings = this.calculateDriverStandings(currentSeason)
    const previousStandings = this.calculateDriverStandings(previousSeason)

    const currentPos = currentStandings.find((s) => s.driverId === driverId)?.position || 0
    const previousPos = previousStandings.find((s) => s.driverId === driverId)?.position || 0

    return previousPos - currentPos // Positive = moved up, negative = moved down
  }
}
