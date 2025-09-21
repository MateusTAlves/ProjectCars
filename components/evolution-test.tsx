"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Car, Users, Zap, RefreshCw } from "lucide-react"
import { HistoricalEvolutionManager } from "@/lib/historical-evolution"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import Image from "next/image"

export function EvolutionTest() {
  const [currentYear, setCurrentYear] = useState(2025)
  const [events, setEvents] = useState<any[]>([])
  const [evolutionManager] = useState(new HistoricalEvolutionManager())
  const [refreshKey, setRefreshKey] = useState(0)

  const activeManufacturers = MANUFACTURERS.filter((m) => m.active)
  const activeTeams = TEAMS.filter((t) => t.active)
  const activeDrivers = DRIVERS.filter((d) => d.active)

  const simulateEvolution = () => {
    console.log("[v0] Simulating evolution for year:", currentYear)
    console.log(
      "[v0] Current active manufacturers:",
      activeManufacturers.map((m) => m.name),
    )
    console.log(
      "[v0] Current active teams:",
      activeTeams.map((t) => t.name),
    )
    console.log(
      "[v0] Current active drivers:",
      activeDrivers.map((d) => d.name),
    )

    // Generate events for the current year using current global data
    const newEvents = evolutionManager.generateEventsForSeason(currentYear, DRIVERS, TEAMS, MANUFACTURERS)

    console.log("[v0] Generated events:", newEvents)

    if (newEvents.length > 0) {
      // Apply the events to update the global data
      const {
        drivers: updatedDrivers,
        teams: updatedTeams,
        manufacturers: updatedManufacturers,
      } = evolutionManager.applyEvents(newEvents, DRIVERS, TEAMS, MANUFACTURERS)

      // Update global arrays
      DRIVERS.length = 0
      DRIVERS.push(...updatedDrivers)

      TEAMS.length = 0
      TEAMS.push(...updatedTeams)

      MANUFACTURERS.length = 0
      MANUFACTURERS.push(...updatedManufacturers)

      setEvents((prev) => [...prev, ...newEvents])
      setCurrentYear((prev) => prev + 1)
      setRefreshKey((prev) => prev + 1) // Force re-render

      console.log("[v0] Applied events, updated global data")
      console.log(
        "[v0] New active manufacturers:",
        MANUFACTURERS.filter((m) => m.active).map((m) => m.name),
      )
      console.log(
        "[v0] New active teams:",
        TEAMS.filter((t) => t.active).map((t) => t.name),
      )
      console.log(
        "[v0] New active drivers:",
        DRIVERS.filter((d) => d.active).map((d) => d.name),
      )
    } else {
      console.log("[v0] No events generated for this year")
      setCurrentYear((prev) => prev + 1)
    }
  }

  const forceAddManufacturer = () => {
    const availableManufacturers = ["hyundai", "volkswagen", "fiat", "renault", "nissan"]
    const unusedManufacturers = availableManufacturers.filter(
      (id) => !MANUFACTURERS.some((m) => m.id === id && m.active),
    )

    if (unusedManufacturers.length === 0) {
      console.log("[v0] No more manufacturers available to add")
      return
    }

    const randomManufacturer = unusedManufacturers[Math.floor(Math.random() * unusedManufacturers.length)]

    const newEvents = [
      {
        id: `${randomManufacturer}-entry-${currentYear}`,
        year: currentYear,
        type: "manufacturer_entry" as const,
        entityId: randomManufacturer,
        entityName: randomManufacturer.charAt(0).toUpperCase() + randomManufacturer.slice(1),
        reason: "Teste de inserção",
        impact: "high" as const,
        description: `${randomManufacturer.charAt(0).toUpperCase() + randomManufacturer.slice(1)} entra no Stock Car Brasil como teste de funcionalidade.`,
      },
    ]

    const {
      drivers: updatedDrivers,
      teams: updatedTeams,
      manufacturers: updatedManufacturers,
    } = evolutionManager.applyEvents(newEvents, DRIVERS, TEAMS, MANUFACTURERS)

    // Update global arrays
    DRIVERS.length = 0
    DRIVERS.push(...updatedDrivers)

    TEAMS.length = 0
    TEAMS.push(...updatedTeams)

    MANUFACTURERS.length = 0
    MANUFACTURERS.push(...updatedManufacturers)

    setEvents((prev) => [...prev, ...newEvents])
    setRefreshKey((prev) => prev + 1) // Force re-render

    console.log(`[v0] Forced ${randomManufacturer} entry`)
  }

  const forceAddTeam = () => {
    const availableTeams = ["red-bull-racing", "petrobras-racing", "banco-do-brasil-racing", "jbs-motorsport"]
    const unusedTeams = availableTeams.filter((id) => !TEAMS.some((t) => t.id === id && t.active))

    if (unusedTeams.length === 0) {
      console.log("[v0] No more teams available to add")
      return
    }

    const randomTeam = unusedTeams[Math.floor(Math.random() * unusedTeams.length)]

    const teamNames = {
      "red-bull-racing": "Red Bull Racing Brasil",
      "petrobras-racing": "Petrobras Racing Team",
      "banco-do-brasil-racing": "Banco do Brasil Racing",
      "jbs-motorsport": "JBS Motorsport",
    }

    const newEvents = [
      {
        id: `${randomTeam}-entry-${currentYear}`,
        year: currentYear,
        type: "team_entry" as const,
        entityId: randomTeam,
        entityName: teamNames[randomTeam as keyof typeof teamNames],
        reason: "Teste de inserção",
        impact: "high" as const,
        description: `${teamNames[randomTeam as keyof typeof teamNames]} entra no campeonato como teste de funcionalidade.`,
      },
    ]

    const {
      drivers: updatedDrivers,
      teams: updatedTeams,
      manufacturers: updatedManufacturers,
    } = evolutionManager.applyEvents(newEvents, DRIVERS, TEAMS, MANUFACTURERS)

    // Update global arrays
    DRIVERS.length = 0
    DRIVERS.push(...updatedDrivers)

    TEAMS.length = 0
    TEAMS.push(...updatedTeams)

    MANUFACTURERS.length = 0
    MANUFACTURERS.push(...updatedManufacturers)

    setEvents((prev) => [...prev, ...newEvents])
    setRefreshKey((prev) => prev + 1) // Force re-render

    console.log(`[v0] Forced ${randomTeam} entry`)
  }

  const forceAddDriver = () => {
    const availableDrivers = ["felipe-fraga", "daniel-serra", "thiago-camilo", "cesar-ramos", "marcos-gomes"]
    const unusedDrivers = availableDrivers.filter((id) => !DRIVERS.some((d) => d.id === id && d.active))

    if (unusedDrivers.length === 0) {
      console.log("[v0] No more drivers available to add")
      return
    }

    const randomDriver = unusedDrivers[Math.floor(Math.random() * unusedDrivers.length)]
    const driverNames = {
      "felipe-fraga": "Felipe Fraga",
      "daniel-serra": "Daniel Serra",
      "thiago-camilo": "Thiago Camilo",
      "cesar-ramos": "César Ramos",
      "marcos-gomes": "Marcos Gomes",
    }

    const newEvents = [
      {
        id: `${randomDriver}-entry-${currentYear}`,
        year: currentYear,
        type: "driver_entry" as const,
        entityId: randomDriver,
        entityName: driverNames[randomDriver as keyof typeof driverNames],
        reason: "Teste de inserção",
        impact: "medium" as const,
        description: `${driverNames[randomDriver as keyof typeof driverNames]} ingressa no Stock Car Brasil como teste de funcionalidade.`,
      },
    ]

    const {
      drivers: updatedDrivers,
      teams: updatedTeams,
      manufacturers: updatedManufacturers,
    } = evolutionManager.applyEvents(newEvents, DRIVERS, TEAMS, MANUFACTURERS)

    // Update global arrays
    DRIVERS.length = 0
    DRIVERS.push(...updatedDrivers)

    TEAMS.length = 0
    TEAMS.push(...updatedTeams)

    MANUFACTURERS.length = 0
    MANUFACTURERS.push(...updatedManufacturers)

    setEvents((prev) => [...prev, ...newEvents])
    setRefreshKey((prev) => prev + 1) // Force re-render

    console.log(`[v0] Forced ${randomDriver} entry`)
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Teste de Evolução Histórica - {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button onClick={simulateEvolution} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Simular Evolução Natural
            </Button>
            <Button onClick={forceAddManufacturer} variant="outline">
              <Car className="h-4 w-4 mr-2" />
              Forçar Nova Montadora
            </Button>
            <Button onClick={forceAddTeam} variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Forçar Nova Equipe
            </Button>
            <Button onClick={forceAddDriver} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Forçar Novo Piloto
            </Button>
            <Button onClick={() => setRefreshKey((prev) => prev + 1)} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Manufacturers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Montadoras ({activeManufacturers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activeManufacturers.map((manufacturer) => (
                    <div
                      key={manufacturer.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border">
                        <Image
                          src={
                            manufacturer.logo || `/placeholder.svg?height=40&width=40&query=${manufacturer.name} logo`
                          }
                          alt={`${manufacturer.name} logo`}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{manufacturer.name}</div>
                        <div className="text-xs text-muted-foreground">{manufacturer.country}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Perf: {manufacturer.performance}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Conf: {manufacturer.reliability}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Equipes ({activeTeams.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activeTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border">
                        <Image
                          src={team.logo || `/placeholder.svg?height=40&width=40&query=${team.name} logo`}
                          alt={`${team.name} logo`}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{team.name}</div>
                        <div className="text-xs text-muted-foreground">{team.headquarters}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Rep: {team.reputation}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ${team.budget}M
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drivers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Pilotos ({activeDrivers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {activeDrivers.slice(0, 15).map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{driver.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Skill: {driver.skill} | Idade: {driver.age} | Exp: {driver.experience}a
                        </div>
                        {driver.championships > 0 && (
                          <Badge variant="default" className="text-xs mt-1">
                            {driver.championships} título{driver.championships > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {activeDrivers.length > 15 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      +{activeDrivers.length - 15} pilotos...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {events
                .slice(-8)
                .reverse()
                .map((event, index) => (
                  <div key={`${event.id}-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge
                      variant={
                        event.impact === "high" ? "default" : event.impact === "medium" ? "secondary" : "outline"
                      }
                    >
                      {event.year}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-semibold">{event.entityName}</div>
                      <div className="text-sm text-muted-foreground">{event.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant={
                            event.impact === "high"
                              ? "destructive"
                              : event.impact === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {event.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
