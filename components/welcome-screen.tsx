"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Play, Users, Flag } from "lucide-react"

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-8">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-muted border-2 border-border">
                <Trophy className="h-16 w-16 text-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4">Stock Car Brasil Manager</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Gerencie o campeonato mais emocionante do automobilismo brasileiro. Simule corridas volta a volta,
              acompanhe a evolução dos pilotos e equipes, e viva a paixão do Stock Car Brasil.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <Card className="border hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-lg bg-muted w-fit mx-auto mb-4">
                  <Play className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Simulação Volta a Volta</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe cada volta em tempo real com dados autênticos de pilotos, equipes e montadoras.
                </p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-lg bg-muted w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Escolha sua Equipe</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione e acompanhe sua equipe favorita através de temporadas completas do campeonato.
                </p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-lg bg-muted w-fit mx-auto mb-4">
                  <Flag className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Calendário Completo 2025</h3>
                <p className="text-sm text-muted-foreground">
                  12 corridas em pistas brasileiras com bandeiras dos estados e dados reais do campeonato.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Start Button */}
          <div className="space-y-4">
            <Button onClick={onStart} size="lg" className="text-lg px-8 py-4">
              <Trophy className="h-5 w-5 mr-2" />
              Iniciar Jogo
            </Button>
            <p className="text-sm text-muted-foreground">Comece sua jornada como manager do Stock Car Brasil</p>
          </div>
        </div>
      </div>
    </div>
  )
}
