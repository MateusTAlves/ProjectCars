"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, Users, Building2, Car } from "lucide-react"
import type { Season } from "@/lib/stock-car-data"
import { DRIVERS, TEAMS, MANUFACTURERS } from "@/lib/stock-car-data"
import { ChampionshipCalculator } from "@/lib/championship-calculator"

interface ChampionshipStandingsProps {
  season: Season
  previousSeason?: Season
}

export function ChampionshipStandings({ season, previousSeason }: ChampionshipStandingsProps) {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const calculator = useMemo(() => new ChampionshipCalculator(), [])

  const driverStandings = useMemo(() => calculator.calculateDriverStandings(season), [calculator, season])
  const teamStandings = useMemo(() => calculator.calculateTeamStandings(season), [calculator, season])
  const manufacturerStandings = useMemo(() => calculator.calculateManufacturerStandings(season), [calculator, season])

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</div>
    }
  }

  const getPositionChange = (driverId: string) => {
    if (!previousSeason) return 0
    return calculator.getPositionChange(driverId, season, previousSeason)
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getDriverForm = (driverId: string) => {
    return calculator.getDriverForm(driverId, season)
  }

  const getFormColor = (position: number) => {
    if (position === 1) return "bg-green-500"
    if (position <= 3) return "bg-blue-500"
    if (position <= 10) return "bg-yellow-500"
    return "bg-gray-400"
  }

  return (
    <div className="space-content">
      {/* Championship Header */}
      <Card className="clean-card">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="title-medium">Classificação do Campeonato {season.year}</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="drivers" className="space-content">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-secondary rounded-lg border">
          <TabsTrigger value="drivers" className="clean-tab data-[state=active]:clean-tab-active">
            <Users className="h-5 w-5 mr-2" />
            Pilotos
          </TabsTrigger>
          <TabsTrigger value="teams" className="clean-tab data-[state=active]:clean-tab-active">
            <Building2 className="h-5 w-5 mr-2" />
            Equipes
          </TabsTrigger>
          <TabsTrigger value="manufacturers" className="clean-tab data-[state=active]:clean-tab-active">
            <Car className="h-5 w-5 mr-2" />
            Montadoras
          </TabsTrigger>
        </TabsList>

        {/* Driver Standings */}
        <TabsContent value="drivers" className="space-y-4">
          <Card className="clean-card">
            <CardHeader className="pb-6">
              <CardTitle className="title-small">Classificação dos Pilotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-items">
                {driverStandings.map((standing) => {
                  const driver = DRIVERS.find((d) => d.id === standing.driverId)
                  const team = TEAMS.find((t) => t.id === driver?.teamId)
                  const manufacturer = MANUFACTURERS.find((m) => m.id === driver?.manufacturerId)
                  const positionChange = getPositionChange(standing.driverId)
                  const form = getDriverForm(standing.driverId)
                  const pointsGap = calculator.getPointsGap(driverStandings, standing.position)

                  return (
                    <div
                      key={standing.driverId}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover-lift ${
                        selectedDriver === standing.driverId ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDriver(standing.driverId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getPositionIcon(standing.position)}
                            {previousSeason && (
                              <div className="flex items-center gap-1">
                                {getChangeIcon(positionChange)}
                                {positionChange !== 0 && (
                                  <span className="text-sm text-primary/70 font-bold">{Math.abs(positionChange)}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{driver?.name}</h3>
                              <Badge className="text-xs clean-badge">
                                {team?.name}
                              </Badge>
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {manufacturer?.name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-yellow-600 font-medium">{standing.wins} vitórias</span>
                              <span className="accent-green font-medium">{standing.podiums} pódios</span>
                              <span className="accent-purple font-medium">{standing.fastestLaps} voltas rápidas</span>
                              {pointsGap > 0 && <span className="accent-red font-medium">-{pointsGap} pts do líder</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">{standing.points}</div>
                          <div className="text-subtle">Pontos</div>

                          {/* Form indicator */}
                          {form.length > 0 && (
                            <div className="flex gap-1 mt-2 justify-end">
                              {form.slice(-5).map((position, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${getFormColor(position)}`}
                                  title={`P${position}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Standings */}
        <TabsContent value="teams" className="space-y-4">
          <Card className="clean-card">
            <CardHeader className="pb-6">
              <CardTitle className="title-small">Classificação das Equipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-items">
                {teamStandings.map((standing) => {
                  const team = TEAMS.find((t) => t.id === standing.teamId)
                  const manufacturer = MANUFACTURERS.find((m) => m.id === team?.manufacturerId)
                  const teamDrivers = DRIVERS.filter((d) => d.teamId === standing.teamId && d.active)

                  return (
                    <div key={standing.teamId} className="p-4 rounded-lg border hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getPositionIcon(standing.position)}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{team?.name}</h3>
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {manufacturer?.name}
                              </Badge>
                              <div className="flex gap-1">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: team?.colors.primary }}
                                />
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: team?.colors.secondary }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-yellow-600 font-medium">{standing.wins} vitórias</span>
                              <span className="accent-green font-medium">{standing.podiums} pódios</span>
                              <span className="text-muted-foreground">Pilotos: {teamDrivers.map((d) => d.name.split(" ")[0]).join(", ")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">{standing.points}</div>
                          <div className="text-subtle">Pontos</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manufacturer Standings */}
        <TabsContent value="manufacturers" className="space-y-4">
          <Card className="clean-card">
            <CardHeader className="pb-6">
              <CardTitle className="title-small">Classificação das Montadoras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-items">
                {manufacturerStandings.map((standing) => {
                  const manufacturer = MANUFACTURERS.find((m) => m.id === standing.manufacturerId)
                  const manufacturerTeams = TEAMS.filter(
                    (t) => t.manufacturerId === standing.manufacturerId && t.active,
                  )
                  const manufacturerDrivers = DRIVERS.filter(
                    (d) => d.manufacturerId === standing.manufacturerId && d.active,
                  )

                  return (
                    <div
                      key={standing.manufacturerId}
                      className="p-4 rounded-lg border hover-lift"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getPositionIcon(standing.position)}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{manufacturer?.name}</h3>
                              <Badge className="text-xs clean-badge">
                                {manufacturer?.country}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-yellow-600 font-medium">{standing.wins} vitórias</span>
                              <span className="accent-green font-medium">{standing.podiums} pódios</span>
                              <span className="accent-blue font-medium">{manufacturerTeams.length} equipes</span>
                              <span className="accent-purple font-medium">{manufacturerDrivers.length} pilotos</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">{standing.points}</div>
                          <div className="text-subtle">Pontos</div>
                          <div className="text-xs text-muted-foreground mt-1">Desde {manufacturer?.enteredYear}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="clean-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {(() => {
                const driver = DRIVERS.find((d) => d.id === selectedDriver)
                const team = TEAMS.find((t) => t.id === driver?.teamId)
                const standing = driverStandings.find((s) => s.driverId === selectedDriver)
                const form = getDriverForm(selectedDriver)

                return (
                  <div className="space-content">
                    <div className="flex items-center justify-between">
                      <h2 className="title-medium">{driver?.name}</h2>
                      <Button className="clean-button-secondary" onClick={() => setSelectedDriver(null)}>
                        Fechar
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Card className="clean-card">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{standing?.position}</div>
                            <div className="text-subtle">Posição</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="clean-card">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{standing?.points}</div>
                            <div className="text-subtle">Pontos</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Card className="clean-card">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{standing?.wins}</div>
                            <div className="text-subtle">Vitórias</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="clean-card">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold accent-green">{standing?.podiums}</div>
                            <div className="text-subtle">Pódios</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="clean-card">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold accent-purple">{standing?.fastestLaps}</div>
                            <div className="text-subtle">V. Rápidas</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {form.length > 0 && (
                      <Card className="clean-card">
                        <CardHeader className="pb-4">
                          <CardTitle className="font-semibold">Últimas Corridas</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="flex gap-3 justify-center">
                            {form.map((position, index) => (
                              <div
                                key={index}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getFormColor(
                                  position,
                                )}`}
                              >
                                {position}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
