"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from "lucide-react"
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
    <div className="space-y-6">
      {/* Championship Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Classificação do Campeonato {season.year}
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drivers">Pilotos</TabsTrigger>
          <TabsTrigger value="teams">Equipes</TabsTrigger>
          <TabsTrigger value="manufacturers">Montadoras</TabsTrigger>
        </TabsList>

        {/* Driver Standings */}
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classificação dos Pilotos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedDriver === standing.driverId ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/50"
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
                                  <span className="text-xs text-muted-foreground">{Math.abs(positionChange)}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{driver?.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {team?.name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {manufacturer?.name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{standing.wins} vitórias</span>
                              <span>{standing.podiums} pódios</span>
                              <span>{standing.fastestLaps} voltas rápidas</span>
                              {pointsGap > 0 && <span className="text-red-500">-{pointsGap} pts do líder</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{standing.points}</div>
                          <div className="text-xs text-muted-foreground">pontos</div>

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
          <Card>
            <CardHeader>
              <CardTitle>Classificação das Equipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teamStandings.map((standing) => {
                  const team = TEAMS.find((t) => t.id === standing.teamId)
                  const manufacturer = MANUFACTURERS.find((m) => m.id === team?.manufacturerId)
                  const teamDrivers = DRIVERS.filter((d) => d.teamId === standing.teamId && d.active)

                  return (
                    <div key={standing.teamId} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getPositionIcon(standing.position)}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{team?.name}</h3>
                              <Badge variant="secondary" className="text-xs">
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
                                <span className="font-mono">
                                  Melhor: 1:{(8 + Math.random() * 4).toFixed(0)}.{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{standing.wins} vitórias</span>
                              <span>{standing.podiums} pódios</span>
                              <span>Pilotos: {teamDrivers.map((d) => d.name.split(" ")[0]).join(", ")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{standing.points}</div>
                          <div className="text-xs text-muted-foreground">pontos</div>
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
          <Card>
            <CardHeader>
              <CardTitle>Classificação das Montadoras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getPositionIcon(standing.position)}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{manufacturer?.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {manufacturer?.country}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{standing.wins} vitórias</span>
                              <span>{standing.podiums} pódios</span>
                              <span>{manufacturerTeams.length} equipes</span>
                              <span>{manufacturerDrivers.length} pilotos</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{standing.points}</div>
                          <div className="text-xs text-muted-foreground">pontos</div>
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
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {(() => {
                const driver = DRIVERS.find((d) => d.id === selectedDriver)
                const team = TEAMS.find((t) => t.id === driver?.teamId)
                const standing = driverStandings.find((s) => s.driverId === selectedDriver)
                const form = getDriverForm(selectedDriver)

                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">{driver?.name}</h2>
                      <Button variant="outline" onClick={() => setSelectedDriver(null)}>
                        Fechar
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{standing?.position}</div>
                            <div className="text-sm text-muted-foreground">Posição</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{standing?.points}</div>
                            <div className="text-sm text-muted-foreground">Pontos</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{standing?.wins}</div>
                            <div className="text-sm text-muted-foreground">Vitórias</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{standing?.podiums}</div>
                            <div className="text-sm text-muted-foreground">Pódios</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{standing?.fastestLaps}</div>
                            <div className="text-sm text-muted-foreground">V. Rápidas</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {form.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Últimas Corridas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            {form.map((position, index) => (
                              <div
                                key={index}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getFormColor(
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
