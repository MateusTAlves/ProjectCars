import type { Driver, Team, Manufacturer } from "./stock-car-data"

export interface HistoricalEvent {
  id: string
  year: number
  type: "driver_entry" | "driver_exit" | "team_entry" | "team_exit" | "manufacturer_entry" | "manufacturer_exit"
  entityId: string
  entityName: string
  reason: string
  impact: "low" | "medium" | "high"
  description: string
}

export interface NewDriver extends Omit<Driver, "id" | "points" | "wins" | "podiums"> {
  id: string
}

export interface NewTeam extends Omit<Team, "id" | "drivers"> {
  id: string
  drivers: string[]
  logo: string
}

export interface NewManufacturer extends Omit<Manufacturer, "id" | "championships"> {
  id: string
  championships: number
  logo: string
  models: string[]
  brandColors: {
    primary: string
    secondary: string
  }
}

export class HistoricalEvolutionManager {
  private events: HistoricalEvent[] = []
  private usedDriverIds: Set<string> = new Set() // Track used drivers to prevent repetition
  private usedTeamIds: Set<string> = new Set() // Track used teams to prevent repetition
  private usedManufacturerIds: Set<string> = new Set() // Track used manufacturers to prevent repetition

  private potentialNewDrivers: NewDriver[] = [
    {
      id: "felipe-fraga",
      name: "Felipe Fraga",
      age: 28,
      nationality: "Brasil",
      experience: 5,
      skill: 85,
      consistency: 82,
      aggression: 88,
      teamId: "",
      manufacturerId: "",
      championships: 0,
      active: false,
      joinedYear: 2025,
    },
    {
      id: "daniel-serra",
      name: "Daniel Serra",
      age: 32,
      nationality: "Brasil",
      experience: 10,
      skill: 90,
      consistency: 88,
      aggression: 75,
      teamId: "",
      manufacturerId: "",
      championships: 1,
      active: false,
      joinedYear: 2025,
    },
    {
      id: "thiago-camilo",
      name: "Thiago Camilo",
      age: 45,
      nationality: "Brasil",
      experience: 20,
      skill: 88,
      consistency: 92,
      aggression: 70,
      teamId: "",
      manufacturerId: "",
      championships: 2,
      active: false,
      joinedYear: 2026,
    },
    {
      id: "cesar-ramos",
      name: "César Ramos",
      age: 29,
      nationality: "Brasil",
      experience: 6,
      skill: 83,
      consistency: 85,
      aggression: 80,
      teamId: "",
      manufacturerId: "",
      championships: 0,
      active: false,
      joinedYear: 2026,
    },
    {
      id: "marcos-gomes",
      name: "Marcos Gomes",
      age: 26,
      nationality: "Brasil",
      experience: 4,
      skill: 78,
      consistency: 80,
      aggression: 85,
      teamId: "",
      manufacturerId: "",
      championships: 0,
      active: false,
      joinedYear: 2027,
    },
  ]

  private potentialNewTeams: NewTeam[] = [
    {
      id: "red-bull-racing",
      name: "Red Bull Racing Brasil",
      founded: 2025,
      owner: "Red Bull",
      headquarters: "São Paulo, SP",
      manufacturerId: "toyota",
      budget: 25,
      reputation: 85,
      facilities: 95,
      active: false,
      championships: 0,
      drivers: [],
      colors: { primary: "#1E3A8A", secondary: "#FFD100" },
      logo: "/red-bull-logo.jpg",
    },
    {
      id: "petrobras-racing",
      name: "Petrobras Racing Team",
      founded: 2025,
      owner: "Petrobras",
      headquarters: "Rio de Janeiro, RJ",
      manufacturerId: "chevrolet",
      budget: 20,
      reputation: 80,
      facilities: 85,
      active: false,
      championships: 0,
      drivers: [],
      colors: { primary: "#16A34A", secondary: "#FACC15" },
      logo: "/petrobras-logo.jpg",
    },
    {
      id: "banco-do-brasil-racing",
      name: "Banco do Brasil Racing",
      founded: 2026,
      owner: "Banco do Brasil",
      headquarters: "Brasília, DF",
      manufacturerId: "hyundai",
      budget: 18,
      reputation: 75,
      facilities: 80,
      active: false,
      championships: 0,
      drivers: [],
      colors: { primary: "#FFD700", secondary: "#0066CC" },
      logo: "/bb-racing-logo.jpg",
    },
    {
      id: "jbs-motorsport",
      name: "JBS Motorsport",
      founded: 2027,
      owner: "JBS",
      headquarters: "São Paulo, SP",
      manufacturerId: "volkswagen",
      budget: 22,
      reputation: 78,
      facilities: 85,
      active: false,
      championships: 0,
      drivers: [],
      colors: { primary: "#DC2626", secondary: "#FFFFFF" },
      logo: "/jbs-motorsport-logo.jpg",
    },
  ]

  private potentialNewManufacturers: NewManufacturer[] = [
    {
      id: "hyundai",
      name: "Hyundai",
      country: "Coreia do Sul",
      enteredYear: 2026,
      active: false,
      championships: 0,
      reliability: 88,
      performance: 85,
      development: 92,
      budget: 40,
      logo: "/hyundai-logo.jpg",
      brandColors: {
        primary: "#002C5F",
        secondary: "#FFFFFF",
      },
      models: ["HB20 Stock Car", "Creta Stock Car"],
    },
    {
      id: "volkswagen",
      name: "Volkswagen",
      country: "Alemanha",
      enteredYear: 2027,
      active: false,
      championships: 0,
      reliability: 90,
      performance: 87,
      development: 89,
      budget: 45,
      logo: "/volkswagen-logo.jpg",
      brandColors: {
        primary: "#1E3A8A",
        secondary: "#FFFFFF",
      },
      models: ["T-Cross Stock Car", "Nivus Stock Car"],
    },
    {
      id: "fiat",
      name: "Fiat",
      country: "Itália",
      enteredYear: 2028,
      active: false,
      championships: 0,
      reliability: 85,
      performance: 83,
      development: 86,
      budget: 35,
      logo: "/fiat-logo.jpg",
      brandColors: {
        primary: "#DC2626",
        secondary: "#FFFFFF",
      },
      models: ["Pulse Stock Car", "Fastback Stock Car"],
    },
    {
      id: "renault",
      name: "Renault",
      country: "França",
      enteredYear: 2029,
      active: false,
      championships: 0,
      reliability: 87,
      performance: 84,
      development: 88,
      budget: 38,
      logo: "/renault-logo.jpg",
      brandColors: {
        primary: "#FFD700",
        secondary: "#000000",
      },
      models: ["Duster Stock Car", "Kardian Stock Car"],
    },
    {
      id: "nissan",
      name: "Nissan",
      country: "Japão",
      enteredYear: 2030,
      active: false,
      championships: 0,
      reliability: 89,
      performance: 86,
      development: 87,
      budget: 42,
      logo: "/nissan-logo.jpg",
      brandColors: {
        primary: "#C41E3A",
        secondary: "#FFFFFF",
      },
      models: ["Kicks Stock Car", "Sentra Stock Car"],
    },
  ]

  generateEventsForSeason(
    year: number,
    currentDrivers: Driver[],
    currentTeams: Team[],
    currentManufacturers: Manufacturer[],
  ): HistoricalEvent[] {
    const newEvents: HistoricalEvent[] = []

    // Driver retirements (based on age and performance)
    const retirementCandidates = currentDrivers.filter(
      (driver) => driver.active && (driver.age > 40 || (driver.age > 35 && driver.skill < 75)),
    )

    retirementCandidates.forEach((driver) => {
      const retirementChance = this.calculateRetirementChance(driver)
      if (Math.random() < retirementChance) {
        newEvents.push({
          id: `${driver.id}-retirement-${year}`,
          year,
          type: "driver_exit",
          entityId: driver.id,
          entityName: driver.name,
          reason: driver.age > 40 ? "Aposentadoria" : "Falta de performance",
          impact: driver.skill > 85 ? "high" : driver.skill > 75 ? "medium" : "low",
          description: `${driver.name} anunciou sua aposentadoria do Stock Car Brasil após ${driver.experience} anos de carreira.`,
        })
      }
    })

    // New driver entries - Check if driver was already used
    if (newEvents.filter((e) => e.type === "driver_exit").length > 0 || Math.random() < 0.3) {
      const availableDrivers = this.potentialNewDrivers.filter((d) => !d.active && !this.usedDriverIds.has(d.id))
      if (availableDrivers.length > 0) {
        const newDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)]
        this.usedDriverIds.add(newDriver.id) // Mark driver as used
        newEvents.push({
          id: `${newDriver.id}-entry-${year}`,
          year,
          type: "driver_entry",
          entityId: newDriver.id,
          entityName: newDriver.name,
          reason: "Nova contratação",
          impact: newDriver.skill > 85 ? "high" : newDriver.skill > 75 ? "medium" : "low",
          description: `${newDriver.name} ingressa no Stock Car Brasil trazendo experiência de outras categorias.`,
        })
      }
    }

    // Team changes - Check if team was already used
    if (Math.random() < 0.15) {
      const strugglingTeams = currentTeams.filter((team) => team.active && team.reputation < 70 && team.budget < 10)

      if (strugglingTeams.length > 0) {
        const exitingTeam = strugglingTeams[Math.floor(Math.random() * strugglingTeams.length)]
        newEvents.push({
          id: `${exitingTeam.id}-exit-${year}`,
          year,
          type: "team_exit",
          entityId: exitingTeam.id,
          entityName: exitingTeam.name,
          reason: "Dificuldades financeiras",
          impact: "medium",
          description: `${exitingTeam.name} anuncia sua saída do Stock Car Brasil devido a problemas financeiros.`,
        })

        // Potentially add a new team
        if (Math.random() < 0.7) {
          const availableTeams = this.potentialNewTeams.filter((t) => !t.active && !this.usedTeamIds.has(t.id))
          if (availableTeams.length > 0) {
            const newTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)]
            this.usedTeamIds.add(newTeam.id) // Mark team as used
            newEvents.push({
              id: `${newTeam.id}-entry-${year}`,
              year,
              type: "team_entry",
              entityId: newTeam.id,
              entityName: newTeam.name,
              reason: "Expansão do grid",
              impact: "high",
              description: `${newTeam.name} entra no Stock Car Brasil com grandes investimentos e ambições.`,
            })
          }
        }
      }
    }

    // Manufacturer changes - Check if manufacturer was already used
    if (Math.random() < 0.05) {
      const availableManufacturers = this.potentialNewManufacturers.filter(
        (m) => !m.active && m.enteredYear <= year && !this.usedManufacturerIds.has(m.id),
      )
      if (availableManufacturers.length > 0) {
        const newManufacturer = availableManufacturers[Math.floor(Math.random() * availableManufacturers.length)]
        this.usedManufacturerIds.add(newManufacturer.id) // Mark manufacturer as used
        newEvents.push({
          id: `${newManufacturer.id}-entry-${year}`,
          year,
          type: "manufacturer_entry",
          entityId: newManufacturer.id,
          entityName: newManufacturer.name,
          reason: "Estratégia de marketing",
          impact: "high",
          description: `${newManufacturer.name} anuncia sua entrada no Stock Car Brasil como nova montadora oficial.`,
        })
      }
    }

    this.events.push(...newEvents)
    return newEvents
  }

  private calculateRetirementChance(driver: Driver): number {
    let chance = 0

    // Age factor
    if (driver.age > 45) chance += 0.4
    else if (driver.age > 40) chance += 0.2
    else if (driver.age > 35) chance += 0.1

    // Performance factor
    if (driver.skill < 70) chance += 0.3
    else if (driver.skill < 75) chance += 0.15

    // Experience factor (very experienced drivers might retire)
    if (driver.experience > 20) chance += 0.1

    // Championships (champions more likely to retire on top)
    if (driver.championships > 2) chance += 0.1

    return Math.min(chance, 0.6) // Max 60% chance
  }

  applyEvents(
    events: HistoricalEvent[],
    drivers: Driver[],
    teams: Team[],
    manufacturers: Manufacturer[],
  ): {
    drivers: Driver[]
    teams: Team[]
    manufacturers: Manufacturer[]
  } {
    let updatedDrivers = [...drivers]
    let updatedTeams = [...teams]
    let updatedManufacturers = [...manufacturers]

    events.forEach((event) => {
      switch (event.type) {
        case "driver_exit":
          updatedDrivers = updatedDrivers.map((driver) =>
            driver.id === event.entityId ? { ...driver, active: false } : driver,
          )
          break

        case "driver_entry":
          const newDriver = this.potentialNewDrivers.find((d) => d.id === event.entityId)
          if (newDriver && !updatedDrivers.some((d) => d.id === newDriver.id)) {
            // Check if driver already exists
            // Assign to a team that needs drivers
            const availableTeam = updatedTeams.find((team) => team.active && team.drivers.length < 2)
            if (availableTeam) {
              const driverToAdd: Driver = {
                ...newDriver,
                active: true,
                teamId: availableTeam.id,
                manufacturerId: availableTeam.manufacturerId,
                points: 0,
                wins: 0,
                podiums: 0,
              }
              updatedDrivers.push(driverToAdd)
              updatedTeams = updatedTeams.map((team) =>
                team.id === availableTeam.id ? { ...team, drivers: [...team.drivers, newDriver.id] } : team,
              )
            }
          }
          break

        case "team_exit":
          updatedTeams = updatedTeams.map((team) => (team.id === event.entityId ? { ...team, active: false } : team))
          // Deactivate team drivers
          updatedDrivers = updatedDrivers.map((driver) =>
            driver.teamId === event.entityId ? { ...driver, active: false } : driver,
          )
          break

        case "team_entry":
          const newTeam = this.potentialNewTeams.find((t) => t.id === event.entityId)
          if (newTeam && !updatedTeams.some((t) => t.id === newTeam.id)) {
            // Check if team already exists
            updatedTeams.push({ ...newTeam, active: true })
          }
          break

        case "manufacturer_entry":
          const newManufacturer = this.potentialNewManufacturers.find((m) => m.id === event.entityId)
          if (newManufacturer && !updatedManufacturers.some((m) => m.id === newManufacturer.id)) {
            // Check if manufacturer already exists
            updatedManufacturers.push({ ...newManufacturer, active: true })
          }
          break

        case "manufacturer_exit":
          updatedManufacturers = updatedManufacturers.map((manufacturer) =>
            manufacturer.id === event.entityId ? { ...manufacturer, active: false } : manufacturer,
          )
          break
      }
    })

    return {
      drivers: updatedDrivers,
      teams: updatedTeams,
      manufacturers: updatedManufacturers,
    }
  }

  getEventsForYear(year: number): HistoricalEvent[] {
    return this.events.filter((event) => event.year === year)
  }

  getAllEvents(): HistoricalEvent[] {
    return [...this.events]
  }

  getEventsByType(type: HistoricalEvent["type"]): HistoricalEvent[] {
    return this.events.filter((event) => event.type === type)
  }

  getHighImpactEvents(): HistoricalEvent[] {
    return this.events.filter((event) => event.impact === "high")
  }

  simulateSeasonEvolution(year: number): HistoricalEvent[] {
    const newEvents: HistoricalEvent[] = []

    // Random chance for new manufacturer entry (5% chance)
    if (Math.random() < 0.05) {
      const availableManufacturers = this.potentialNewManufacturers.filter(
        (m) => !m.active && m.enteredYear <= year && !this.usedManufacturerIds.has(m.id),
      )
      if (availableManufacturers.length > 0) {
        const newManufacturer = availableManufacturers[Math.floor(Math.random() * availableManufacturers.length)]
        this.usedManufacturerIds.add(newManufacturer.id)
        newEvents.push({
          id: `${newManufacturer.id}-entry-${year}`,
          year,
          type: "manufacturer_entry",
          entityId: newManufacturer.id,
          entityName: newManufacturer.name,
          reason: "Estratégia de marketing",
          impact: "high",
          description: `${newManufacturer.name} anuncia sua entrada no Stock Car Brasil como nova montadora oficial.`,
        })
      }
    }

    // Random chance for new team entry (10% chance)
    if (Math.random() < 0.1) {
      const availableTeams = this.potentialNewTeams.filter((t) => !t.active && !this.usedTeamIds.has(t.id))
      if (availableTeams.length > 0) {
        const newTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)]
        this.usedTeamIds.add(newTeam.id)
        newEvents.push({
          id: `${newTeam.id}-entry-${year}`,
          year,
          type: "team_entry",
          entityId: newTeam.id,
          entityName: newTeam.name,
          reason: "Expansão do grid",
          impact: "high",
          description: `${newTeam.name} entra no Stock Car Brasil com grandes investimentos e ambições.`,
        })
      }
    }

    // Random chance for new driver entry (15% chance)
    if (Math.random() < 0.15) {
      const availableDrivers = this.potentialNewDrivers.filter((d) => !d.active && !this.usedDriverIds.has(d.id))
      if (availableDrivers.length > 0) {
        const newDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)]
        this.usedDriverIds.add(newDriver.id)
        newEvents.push({
          id: `${newDriver.id}-entry-${year}`,
          year,
          type: "driver_entry",
          entityId: newDriver.id,
          entityName: newDriver.name,
          reason: "Nova contratação",
          impact: newDriver.skill > 85 ? "high" : newDriver.skill > 75 ? "medium" : "low",
          description: `${newDriver.name} ingressa no Stock Car Brasil trazendo experiência de outras categorias.`,
        })
      }
    }

    this.events.push(...newEvents)
    return newEvents
  }

  getPotentialDriver(id: string): NewDriver | undefined {
    return this.potentialNewDrivers.find((d) => d.id === id)
  }

  getPotentialTeam(id: string): NewTeam | undefined {
    return this.potentialNewTeams.find((t) => t.id === id)
  }

  getPotentialManufacturer(id: string): NewManufacturer | undefined {
    return this.potentialNewManufacturers.find((m) => m.id === id)
  }
}
