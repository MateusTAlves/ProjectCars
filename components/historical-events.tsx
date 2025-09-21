"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, UserPlus, UserMinus, Building, Building2, Factory, TrendingUp, Calendar, Filter } from "lucide-react"
import type { HistoricalEvent } from "@/lib/historical-evolution"

interface HistoricalEventsProps {
  events: HistoricalEvent[]
  currentYear: number
}

export function HistoricalEvents({ events, currentYear }: HistoricalEventsProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")

  const getEventIcon = (type: HistoricalEvent["type"]) => {
    switch (type) {
      case "driver_entry":
        return <UserPlus className="h-4 w-4 text-green-600" />
      case "driver_exit":
        return <UserMinus className="h-4 w-4 text-red-600" />
      case "team_entry":
        return <Building className="h-4 w-4 text-blue-600" />
      case "team_exit":
        return <Building2 className="h-4 w-4 text-orange-600" />
      case "manufacturer_entry":
        return <Factory className="h-4 w-4 text-purple-600" />
      case "manufacturer_exit":
        return <Factory className="h-4 w-4 text-gray-600" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  const getEventTypeLabel = (type: HistoricalEvent["type"]) => {
    switch (type) {
      case "driver_entry":
        return "Entrada de Piloto"
      case "driver_exit":
        return "Saída de Piloto"
      case "team_entry":
        return "Nova Equipe"
      case "team_exit":
        return "Saída de Equipe"
      case "manufacturer_entry":
        return "Nova Montadora"
      case "manufacturer_exit":
        return "Saída de Montadora"
      default:
        return "Evento"
    }
  }

  const getImpactColor = (impact: HistoricalEvent["impact"]) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getImpactLabel = (impact: HistoricalEvent["impact"]) => {
    switch (impact) {
      case "high":
        return "Alto Impacto"
      case "medium":
        return "Médio Impacto"
      case "low":
        return "Baixo Impacto"
      default:
        return "Impacto"
    }
  }

  const filteredEvents = events.filter((event) => {
    if (selectedYear && event.year !== selectedYear) return false
    if (selectedType !== "all" && event.type !== selectedType) return false
    return true
  })

  const eventsByYear = events.reduce(
    (acc, event) => {
      if (!acc[event.year]) acc[event.year] = []
      acc[event.year].push(event)
      return acc
    },
    {} as Record<number, HistoricalEvent[]>,
  )

  const years = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const eventTypes = [
    { value: "all", label: "Todos os Eventos" },
    { value: "driver_entry", label: "Entradas de Pilotos" },
    { value: "driver_exit", label: "Saídas de Pilotos" },
    { value: "team_entry", label: "Novas Equipes" },
    { value: "team_exit", label: "Saídas de Equipes" },
    { value: "manufacturer_entry", label: "Novas Montadoras" },
    { value: "manufacturer_exit", label: "Saídas de Montadoras" },
  ]

  const recentEvents = events.filter((event) => event.year === currentYear).sort((a, b) => b.year - a.year)

  const highImpactEvents = events.filter((event) => event.impact === "high")

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Evolução Histórica do Campeonato
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="recent">Eventos Recentes</TabsTrigger>
          <TabsTrigger value="impact">Alto Impacto</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear || ""}
                  onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="">Todos os Anos</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedYear(null)
                    setSelectedType("all")
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum evento encontrado com os filtros selecionados.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredEvents
                .sort((a, b) => b.year - a.year)
                .map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-muted">{getEventIcon(event.type)}</div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{event.entityName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getEventTypeLabel(event.type)}
                            </Badge>
                            <Badge className={`text-xs ${getImpactColor(event.impact)}`}>
                              {getImpactLabel(event.impact)}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground mb-2">{event.description}</p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{event.year}</span>
                            </div>
                            <span>Motivo: {event.reason}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        {/* Recent Events */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos da Temporada {currentYear}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum evento registrado nesta temporada ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        {getEventIcon(event.type)}
                        <div className="flex-1">
                          <div className="font-medium">{event.entityName}</div>
                          <div className="text-sm text-muted-foreground">{event.description}</div>
                        </div>
                        <Badge className={`text-xs ${getImpactColor(event.impact)}`}>
                          {getImpactLabel(event.impact)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* High Impact Events */}
        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Eventos de Alto Impacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {highImpactEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum evento de alto impacto registrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highImpactEvents
                    .sort((a, b) => b.year - a.year)
                    .map((event) => (
                      <div key={event.id} className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-red-100">{getEventIcon(event.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{event.entityName}</h3>
                              <Badge variant="outline">{event.year}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{event.description}</p>
                            <div className="text-sm text-muted-foreground">
                              <strong>Motivo:</strong> {event.reason}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter((e) => e.type.includes("entry")).length}
              </div>
              <div className="text-sm text-muted-foreground">Entradas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {events.filter((e) => e.type.includes("exit")).length}
              </div>
              <div className="text-sm text-muted-foreground">Saídas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{highImpactEvents.length}</div>
              <div className="text-sm text-muted-foreground">Alto Impacto</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{years.length}</div>
              <div className="text-sm text-muted-foreground">Anos Ativos</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
