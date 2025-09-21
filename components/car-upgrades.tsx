"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Wind, Gauge, Settings, TrendingUp, DollarSign, Clock } from "lucide-react"

interface UpgradeCategory {
  id: string
  name: string
  icon: any
  description: string
  upgrades: Upgrade[]
}

interface Upgrade {
  id: string
  name: string
  description: string
  cost: number
  researchTime: number // in days
  currentLevel: number
  maxLevel: number
  effect: string
  unlocked: boolean
}

export function CarUpgrades({ selectedTeam }: { selectedTeam: any }) {
  const [budget] = useState(25000000) // 25 million BRL
  const [researchPoints] = useState(150)
  const [activeResearch, setActiveResearch] = useState<string[]>([])

  const upgradeCategories: UpgradeCategory[] = [
    {
      id: "engine",
      name: "Motor",
      icon: Zap,
      description: "Potência e eficiência do motor",
      upgrades: [
        {
          id: "engine-power",
          name: "Potência do Motor",
          description: "Aumenta a potência máxima do motor",
          cost: 2500000,
          researchTime: 14,
          currentLevel: 1,
          maxLevel: 5,
          effect: "+2% velocidade máxima",
          unlocked: true,
        },
        {
          id: "fuel-efficiency",
          name: "Eficiência de Combustível",
          description: "Reduz o consumo de combustível",
          cost: 1800000,
          researchTime: 10,
          currentLevel: 0,
          maxLevel: 3,
          effect: "+5% economia de combustível",
          unlocked: true,
        },
        {
          id: "turbo-system",
          name: "Sistema Turbo",
          description: "Melhora a resposta do turbo",
          cost: 3200000,
          researchTime: 21,
          currentLevel: 0,
          maxLevel: 4,
          effect: "+3% aceleração",
          unlocked: false,
        },
      ],
    },
    {
      id: "aerodynamics",
      name: "Aerodinâmica",
      icon: Wind,
      description: "Downforce e resistência ao ar",
      upgrades: [
        {
          id: "front-wing",
          name: "Asa Dianteira",
          description: "Melhora o downforce dianteiro",
          cost: 1500000,
          researchTime: 8,
          currentLevel: 2,
          maxLevel: 5,
          effect: "+1% estabilidade em curvas",
          unlocked: true,
        },
        {
          id: "rear-wing",
          name: "Asa Traseira",
          description: "Otimiza o downforce traseiro",
          cost: 1800000,
          researchTime: 12,
          currentLevel: 1,
          maxLevel: 5,
          effect: "+2% tração",
          unlocked: true,
        },
        {
          id: "underbody",
          name: "Assoalho",
          description: "Melhora o efeito solo",
          cost: 2200000,
          researchTime: 16,
          currentLevel: 0,
          maxLevel: 3,
          effect: "+3% downforce total",
          unlocked: false,
        },
      ],
    },
    {
      id: "suspension",
      name: "Suspensão",
      icon: Settings,
      description: "Handling e estabilidade",
      upgrades: [
        {
          id: "shock-absorbers",
          name: "Amortecedores",
          description: "Melhora a absorção de impactos",
          cost: 1200000,
          researchTime: 7,
          currentLevel: 1,
          maxLevel: 4,
          effect: "+2% estabilidade",
          unlocked: true,
        },
        {
          id: "anti-roll-bars",
          name: "Barras Estabilizadoras",
          description: "Reduz a rolagem do carro",
          cost: 900000,
          researchTime: 5,
          currentLevel: 0,
          maxLevel: 3,
          effect: "+1% handling",
          unlocked: true,
        },
      ],
    },
    {
      id: "electronics",
      name: "Eletrônica",
      icon: Gauge,
      description: "Sistemas eletrônicos e telemetria",
      upgrades: [
        {
          id: "ecu-mapping",
          name: "Mapeamento ECU",
          description: "Otimiza o mapeamento do motor",
          cost: 800000,
          researchTime: 6,
          currentLevel: 1,
          maxLevel: 3,
          effect: "+1% eficiência geral",
          unlocked: true,
        },
        {
          id: "telemetry",
          name: "Sistema de Telemetria",
          description: "Melhora a coleta de dados",
          cost: 1500000,
          researchTime: 12,
          currentLevel: 0,
          maxLevel: 2,
          effect: "+5% precisão de setup",
          unlocked: false,
        },
      ],
    },
  ]

  const startResearch = (upgradeId: string) => {
    if (!activeResearch.includes(upgradeId)) {
      setActiveResearch([...activeResearch, upgradeId])
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header with Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(budget)}</div>
                <div className="text-sm text-muted-foreground">Orçamento Disponível</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{researchPoints}</div>
                <div className="text-sm text-muted-foreground">Pontos de Pesquisa</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeResearch.length}</div>
                <div className="text-sm text-muted-foreground">Pesquisas Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Categories */}
      <Tabs defaultValue="engine" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {upgradeCategories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {category.name}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {upgradeCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.name}
                </CardTitle>
                <p className="text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {category.upgrades.map((upgrade) => (
                    <Card key={upgrade.id} className={`${!upgrade.unlocked ? "opacity-60" : ""}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{upgrade.name}</h3>
                              {!upgrade.unlocked && <Badge variant="secondary">Bloqueado</Badge>}
                              {activeResearch.includes(upgrade.id) && <Badge variant="default">Em Pesquisa</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{upgrade.description}</p>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>
                                  Nível {upgrade.currentLevel}/{upgrade.maxLevel}
                                </span>
                                <span className="text-muted-foreground">{upgrade.effect}</span>
                              </div>
                              <Progress value={(upgrade.currentLevel / upgrade.maxLevel) * 100} className="h-2" />
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {formatCurrency(upgrade.cost)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {upgrade.researchTime} dias
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            <Button
                              onClick={() => startResearch(upgrade.id)}
                              disabled={
                                !upgrade.unlocked ||
                                upgrade.currentLevel >= upgrade.maxLevel ||
                                activeResearch.includes(upgrade.id) ||
                                budget < upgrade.cost
                              }
                              size="sm"
                            >
                              {activeResearch.includes(upgrade.id) ? "Pesquisando..." : "Pesquisar"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
