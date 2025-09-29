"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Play, Users, Flag } from "lucide-react"

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="space-section text-center">
          {/* Logo and Title */}
          <div className="space-content">
            <div className="flex justify-center">
              <div className="p-8 rounded-full bg-primary text-primary-foreground">
                <Trophy className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">Stock Car Brasil Manager</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Gerencie o campeonato mais emocionante do automobilismo brasileiro. Simule corridas volta a volta,
              acompanhe a evolução dos pilotos e equipes, e viva a paixão do Stock Car Brasil.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="clean-card hover-lift">
              <CardContent className="p-8 text-center">
                <div className="p-4 rounded-lg bg-blue-100 w-fit mx-auto mb-6">
                  <Play className="h-8 w-8 accent-blue" />
                </div>
                <h3 className="title-small mb-4">Simulação Volta a Volta</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Acompanhe cada volta em tempo real com dados autênticos de pilotos, equipes e montadoras.
                </p>
              </CardContent>
            </Card>

            <Card className="clean-card hover-lift">
              <CardContent className="p-8 text-center">
                <div className="p-4 rounded-lg bg-green-100 w-fit mx-auto mb-6">
                  <Users className="h-8 w-8 accent-green" />
                </div>
                <h3 className="title-small mb-4">Escolha Sua Equipe</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Selecione e acompanhe sua equipe favorita através de temporadas completas do campeonato.
                </p>
              </CardContent>
            </Card>

            <Card className="clean-card hover-lift">
              <CardContent className="p-8 text-center">
                <div className="p-4 rounded-lg bg-purple-100 w-fit mx-auto mb-6">
                  <Flag className="h-8 w-8 accent-purple" />
                </div>
                <h3 className="title-small mb-4">Calendário Completo 2025</h3>
                <p className="text-muted-foreground leading-relaxed">
                  12 corridas em pistas brasileiras com bandeiras dos estados e dados reais do campeonato.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Start Button */}
          <div className="space-items">
            <Button onClick={onStart} className="clean-button text-lg px-12 py-4 hover-scale">
              <Trophy className="h-6 w-6 mr-3" />
              Iniciar Jogo
            </Button>
            <p className="text-muted-foreground">Comece sua jornada como manager do Stock Car Brasil</p>
          </div>
        </div>
      </div>
    </div>
  )
}
