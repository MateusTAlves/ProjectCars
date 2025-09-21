"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Wrench, DollarSign } from "lucide-react"
import { MANUFACTURERS, TEAMS, DRIVERS, type Manufacturer } from "@/lib/stock-car-data"
import Image from "next/image"

interface ManufacturerShowcaseProps {
  season?: any
}

export function ManufacturerShowcase({ season }: ManufacturerShowcaseProps) {
  const getManufacturerStats = (manufacturer: Manufacturer) => {
    const manufacturerTeams = TEAMS.filter((team) => team.manufacturerId === manufacturer.id && team.active)
    const manufacturerDrivers = DRIVERS.filter((driver) => driver.manufacturerId === manufacturer.id && driver.active)

    const totalWins = manufacturerDrivers.reduce((sum, driver) => sum + driver.wins, 0)
    const totalPodiums = manufacturerDrivers.reduce((sum, driver) => sum + driver.podiums, 0)

    return {
      teams: manufacturerTeams.length,
      drivers: manufacturerDrivers.length,
      totalWins,
      totalPodiums,
      avgPerformance: manufacturer.performance,
      avgReliability: manufacturer.reliability,
    }
  }

  const activeManufacturers = MANUFACTURERS.filter((m) => m.active)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">Montadoras do Stock Car Brasil</h2>
        <p className="text-muted-foreground">
          Conheça as marcas que competem no campeonato mais emocionante do automobilismo nacional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeManufacturers.map((manufacturer) => {
          const stats = getManufacturerStats(manufacturer)

          return (
            <Card
              key={manufacturer.id}
              className="overflow-hidden border-2 hover:shadow-xl transition-all duration-300"
              style={{ borderColor: manufacturer.brandColors.primary + "40" }}
            >
              <CardHeader
                className="text-white relative"
                style={{
                  background: `linear-gradient(135deg, ${manufacturer.brandColors.primary}, ${manufacturer.brandColors.primary}dd)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                      <Image
                        src={manufacturer.logo || "/placeholder.svg"}
                        alt={`${manufacturer.name} logo`}
                        width={60}
                        height={30}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">{manufacturer.name}</CardTitle>
                      <p className="text-white/80">{manufacturer.country}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {manufacturer.championships} títulos
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Performance</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">{manufacturer.performance}</div>
                      <div className="text-xs text-muted-foreground">de 100</div>
                    </div>

                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Confiabilidade</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">{manufacturer.reliability}</div>
                      <div className="text-xs text-muted-foreground">de 100</div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{stats.teams}</div>
                      <div className="text-xs text-muted-foreground">Equipes</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{stats.drivers}</div>
                      <div className="text-xs text-muted-foreground">Pilotos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{stats.totalWins}</div>
                      <div className="text-xs text-muted-foreground">Vitórias</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{stats.totalPodiums}</div>
                      <div className="text-xs text-muted-foreground">Pódios</div>
                    </div>
                  </div>

                  {/* Teams */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Equipes Ativas
                    </h4>
                    <div className="space-y-2">
                      {TEAMS.filter((team) => team.manufacturerId === manufacturer.id && team.active).map((team) => (
                        <div key={team.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                          <Image
                            src={team.logo || "/placeholder.svg"}
                            alt={`${team.name} logo`}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{team.name}</div>
                            <div className="text-xs text-muted-foreground">{team.headquarters}</div>
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: team.colors.primary,
                              color: team.colors.primary,
                            }}
                          >
                            {team.championships} títulos
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Info */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">No Stock Car desde {manufacturer.enteredYear}</span>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">R$ {manufacturer.budget}M orçamento</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
