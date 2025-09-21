"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TEAMS, DRIVERS, MANUFACTURERS } from "@/lib/stock-car-data"
import { Trophy, Users, DollarSign } from "lucide-react"
import Image from "next/image"

interface TeamSelectionProps {
  onTeamSelected: (teamId: string) => void
}

export function TeamSelection({ onTeamSelected }: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  const handleConfirm = () => {
    if (selectedTeam) {
      onTeamSelected(selectedTeam)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Escolha sua Equipe</h1>
          <p className="text-lg text-muted-foreground">
            Selecione a equipe que você deseja acompanhar como manager no Stock Car Brasil 2025
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {TEAMS.map((team) => {
            const manufacturer = MANUFACTURERS.find((m) => m.id === team.manufacturerId)
            const teamDrivers = DRIVERS.filter((d) => d.teamId === team.id)
            const isSelected = selectedTeam === team.id

            return (
              <Card
                key={team.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary shadow-lg" : ""
                }`}
                onClick={() => handleTeamSelect(team.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={team.logo || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{team.headquarters}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Manufacturer */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded overflow-hidden bg-muted">
                      <Image
                        src={manufacturer?.logo || ""}
                        alt={`${manufacturer?.name} logo`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{manufacturer?.name}</span>
                  </div>

                  {/* Drivers */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      Pilotos
                    </div>
                    {teamDrivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between text-sm">
                        <span>{driver.name}</span>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          <span>{driver.wins}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold">{team.championships}</div>
                      <div className="text-xs text-muted-foreground">Títulos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{team.reputation}</div>
                      <div className="text-xs text-muted-foreground">Reputação</div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Orçamento</span>
                    </div>
                    <Badge variant="outline">R$ {team.budget}M</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {selectedTeam && (
          <div className="text-center">
            <Button onClick={handleConfirm} size="lg" className="px-8 py-3 text-lg">
              Confirmar Seleção
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
