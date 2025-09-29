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
        <div className="text-center mb-12">
          <h1 className="title-large mb-6">Escolha Sua Equipe</h1>
          <p className="text-xl text-muted-foreground">
            Selecione a equipe que você deseja acompanhar como manager no Stock Car Brasil 2025
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {TEAMS.map((team) => {
            const manufacturer = MANUFACTURERS.find((m) => m.id === team.manufacturerId)
            const teamDrivers = DRIVERS.filter((d) => d.teamId === team.id)
            const isSelected = selectedTeam === team.id

            return (
              <Card
                key={team.id}
                className={`cursor-pointer clean-card hover-lift ${
                  isSelected ? "ring-2 ring-primary shadow-lg" : ""
                }`}
                onClick={() => handleTeamSelect(team.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary border">
                        <Image
                          src={team.logo || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
                        <p className="text-subtle">{team.headquarters}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-items">
                  {/* Manufacturer */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded overflow-hidden bg-secondary border">
                      <Image
                        src={manufacturer?.logo || ""}
                        alt={`${manufacturer?.name} logo`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="font-medium">{manufacturer?.name}</span>
                  </div>

                  {/* Drivers */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <Users className="h-5 w-5" />
                      Pilotos
                    </div>
                    {teamDrivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                        <span className="font-medium">{driver.name}</span>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-600">{driver.wins}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{team.championships}</div>
                      <div className="text-subtle">Títulos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{team.reputation}</div>
                      <div className="text-subtle">Reputação</div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 accent-green" />
                      <span className="font-medium">Orçamento</span>
                    </div>
                    <Badge className="clean-badge">R$ {team.budget}M</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {selectedTeam && (
          <div className="text-center">
            <Button onClick={handleConfirm} className="clean-button text-lg px-12 py-4 hover-scale">
              <Trophy className="h-5 w-5 mr-3" />
              Confirmar Seleção
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
