"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Trophy, Target, Zap, TrendingUp } from "lucide-react"
import type { Season } from "@/lib/stock-car-data"
import { DRIVERS, MANUFACTURERS } from "@/lib/stock-car-data"
import { ChampionshipCalculator } from "@/lib/championship-calculator"

interface ChampionshipStatsProps {
  season: Season
}

export function ChampionshipStats({ season }: ChampionshipStatsProps) {
  const calculator = useMemo(() => new ChampionshipCalculator(), [])
  const driverStandings = useMemo(() => calculator.calculateDriverStandings(season), [calculator, season])
  const teamStandings = useMemo(() => calculator.calculateTeamStandings(season), [calculator, season])

  const completedRaces = season.races.filter((r) => r.completed)

  // Points distribution data
  const pointsData = driverStandings.slice(0, 10).map((standing) => {
    const driver = DRIVERS.find((d) => d.id === standing.driverId)
    return {
      name: driver?.name.split(" ")[0] || "Unknown",
      points: standing.points,
      wins: standing.wins,
    }
  })

  // Manufacturer distribution
  const manufacturerData = MANUFACTURERS.filter((m) => m.active).map((manufacturer) => {
    const standing = calculator.calculateManufacturerStandings(season).find((s) => s.manufacturerId === manufacturer.id)
    return {
      name: manufacturer.name,
      points: standing?.points || 0,
      color: manufacturer.id === "toyota" ? "#E31E24" : manufacturer.id === "chevrolet" ? "#FFD100" : "#4B5563",
    }
  })

  // Race winners
  const raceWinners = completedRaces.map((race) => {
    const winner = race.results?.find((r) => r.position === 1)
    const driver = DRIVERS.find((d) => d.id === winner?.driverId)
    return {
      race: race.name,
      winner: driver?.name || "Unknown",
      points: winner?.points || 0,
    }
  })

  // Win distribution
  const winDistribution = driverStandings
    .filter((s) => s.wins > 0)
    .map((standing) => {
      const driver = DRIVERS.find((d) => d.id === standing.driverId)
      return {
        name: driver?.name.split(" ")[0] || "Unknown",
        wins: standing.wins,
      }
    })

  // Championship battle (top 5)
  const championshipBattle = driverStandings.slice(0, 5).map((standing, index) => {
    const driver = DRIVERS.find((d) => d.id === standing.driverId)
    const gap = index === 0 ? 0 : driverStandings[0].points - standing.points
    return {
      position: standing.position,
      name: driver?.name || "Unknown",
      points: standing.points,
      gap,
    }
  })

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedRaces.length}</div>
                <div className="text-sm text-muted-foreground">Corridas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{winDistribution.length}</div>
                <div className="text-sm text-muted-foreground">Vencedores</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{driverStandings.reduce((acc, s) => acc + s.fastestLaps, 0)}</div>
                <div className="text-sm text-muted-foreground">V. Rápidas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{driverStandings[0]?.points || 0}</div>
                <div className="text-sm text-muted-foreground">Líder</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Championship Battle */}
      <Card>
        <CardHeader>
          <CardTitle>Batalha pelo Título</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {championshipBattle.map((driver) => {
              const maxPoints = championshipBattle[0].points
              const percentage = maxPoints > 0 ? (driver.points / maxPoints) * 100 : 0

              return (
                <div key={driver.position} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={driver.position === 1 ? "default" : "secondary"}>P{driver.position}</Badge>
                      <span className="font-medium">{driver.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary">{driver.points} pts</span>
                      {driver.gap > 0 && <span className="text-sm text-muted-foreground ml-2">(-{driver.gap})</span>}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Points Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Pontos (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Manufacturer Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Montadora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={manufacturerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, points }) => `${name}: ${points}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="points"
                >
                  {manufacturerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Win Distribution */}
      {winDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Vitórias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="wins" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Winners */}
      {raceWinners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vencedores Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {raceWinners
                .slice(-5)
                .reverse()
                .map((race, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">{race.race}</div>
                      <div className="text-sm text-muted-foreground">Vencedor: {race.winner}</div>
                    </div>
                    <Badge variant="outline">{race.points} pts</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
