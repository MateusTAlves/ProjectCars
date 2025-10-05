import type { Race } from "./stock-car-data"

// ========== TIPOS DE ESTRATÉGIA ==========

export type TyreType = "soft" | "medium" | "hard" | "wet"
export type FuelLoad = "light" | "medium" | "heavy"
export type SessionTime = "start" | "middle" | "end"
export type RaceRhythm = "aggressive" | "normal" | "conservative"
export type RaceSpeed = 1 | 2 | 4 | 8 | 10

export interface TyreCompound {
  type: TyreType
  name: string
  color: string
  grip: number
  durability: number
  performanceLoss: number
}

// ========== TREINO LIVRE ==========

export interface PracticeStrategy {
  driverId: string
  tyre: TyreType
  fuel: FuelLoad
  setupFocus: "speed" | "handling" | "balance"
}

export interface PracticeLap {
  lapNumber: number
  time: number
  tyre: TyreType
  fuel: FuelLoad
  isValid: boolean
}

export interface PracticeResult {
  driverId: string
  bestLap: number
  averageLap: number
  lapsCompleted: number
  laps: PracticeLap[]
  position: number
  gap: number
  setupData: {
    speed: number
    handling: number
    balance: number
  }
}

export interface PracticeSession {
  id: string
  type: "FP1" | "FP2"
  duration: number // minutes
  timeRemaining: number
  isActive: boolean
  results: PracticeResult[]
  currentLap: number
  playerStrategy?: PracticeStrategy
  weather: "sunny" | "cloudy" | "rainy"
}

// ========== CLASSIFICAÇÃO ==========

export interface QualifyingStrategy {
  driverId: string
  exitTiming: SessionTime
  tyre: TyreType
  fuelLoad: "minimal" | "low"
  pushLevel: "maximum" | "safe"
}

export interface QualifyingLap {
  driverId: string
  lapTime: number
  sector1: number
  sector2: number
  sector3: number
  isValid: boolean
  tyre: TyreType
}

export interface QualifyingResult {
  position: number
  driverId: string
  bestLap: number
  gap: number
  eliminated: boolean
  eliminatedIn?: "Q1" | "Q2"
  attempts: number
}

export interface QualifyingSession {
  id: string
  type: "Q1" | "Q2" | "Q3"
  duration: number
  timeRemaining: number
  isActive: boolean
  participants: string[]
  results: QualifyingResult[]
  qualified: string[]
  eliminated: string[]
  playerStrategy?: QualifyingStrategy
  weather: "sunny" | "cloudy" | "rainy"
}

// ========== CORRIDA ==========

export interface RaceStrategy {
  driverId: string
  startTyre: TyreType
  fuelLoad: FuelLoad
  pitWindow: { min: number; max: number }
  rhythm: RaceRhythm
  plannedStops: number
}

export interface PitStop {
  lap: number
  duration: number
  tyreChange: TyreType
  fuelAdded: number
  reason: "planned" | "damage" | "weather"
}

export interface RacePosition {
  position: number
  driverId: string
  lapsCompleted: number
  lastLapTime: number
  gap: string
  interval: string
  tyre: TyreType
  tyreLaps: number
  tyreCondition: number
  fuel: number
  pitStops: number
  status: "racing" | "pit" | "dnf"
}

export interface RaceEvent {
  lap: number
  type: "overtake" | "pit" | "dnf" | "safety-car" | "weather" | "incident"
  description: string
  driversInvolved: string[]
}

export interface RaceSession {
  id: string
  raceNumber: 1 | 2
  duration: number // minutes
  totalLaps: number
  currentLap: number
  timeRemaining: number
  isActive: boolean
  isPaused: boolean
  speed: RaceSpeed
  positions: RacePosition[]
  events: RaceEvent[]
  weather: "sunny" | "cloudy" | "rainy"
  trackCondition: "dry" | "damp" | "wet"
  safetyCarActive: boolean
  playerStrategy?: RaceStrategy
}

export interface RaceResult {
  position: number
  driverId: string
  teamId: string
  lapsCompleted: number
  totalTime: string
  bestLap: number
  averageLap: number
  gap: string
  pitStops: number
  points: number
  fastestLap: boolean
  dnf: boolean
  dnfReason?: string
}

// ========== FIM DE SEMANA COMPLETO ==========

export interface WeekendState {
  raceWeekendId: string
  race1: Race
  race2: Race
  currentPhase: "fp1" | "fp2" | "qualifying" | "race1" | "race2" | "complete"
  currentSubPhase?: "q1" | "q2" | "q3"

  // Sessões
  fp1?: PracticeSession
  fp2?: PracticeSession
  q1?: QualifyingSession
  q2?: QualifyingSession
  q3?: QualifyingSession
  race1Session?: RaceSession
  race2Session?: RaceSession

  // Resultados finais
  qualifyingGrid: QualifyingResult[]
  race1Results?: RaceResult[]
  race2Results?: RaceResult[]

  // Dados do jogador
  playerTeamId: string
  playerDriverId: string

  // Configurações
  autoMode: boolean
  showDetailedTiming: boolean
}

// ========== ESTATÍSTICAS FINAIS ==========

export interface WeekendStatistics {
  bestQualifier: { driverId: string; time: number }
  race1Winner: { driverId: string; points: number }
  race2Winner: { driverId: string; points: number }
  fastestLapRace1: { driverId: string; time: number }
  fastestLapRace2: { driverId: string; time: number }
  fastestPitStop: { driverId: string; time: number }
  mostPositionsGained: { driverId: string; positions: number }
  driverOfTheWeekend: { driverId: string; score: number }
  topTeam: { teamId: string; points: number }
}

// ========== CONSTANTES ==========

export const TYRE_COMPOUNDS: Record<TyreType, TyreCompound> = {
  soft: {
    type: "soft",
    name: "Macio",
    color: "#EF4444",
    grip: 1.0,
    durability: 0.7,
    performanceLoss: 0.15,
  },
  medium: {
    type: "medium",
    name: "Médio",
    color: "#F59E0B",
    grip: 0.9,
    durability: 0.85,
    performanceLoss: 0.1,
  },
  hard: {
    type: "hard",
    name: "Duro",
    color: "#6B7280",
    grip: 0.8,
    durability: 1.0,
    performanceLoss: 0.05,
  },
  wet: {
    type: "wet",
    name: "Chuva",
    color: "#3B82F6",
    grip: 0.75,
    durability: 0.9,
    performanceLoss: 0.08,
  },
}

export const FUEL_LOADS: Record<FuelLoad, { laps: number; weight: number }> = {
  light: { laps: 10, weight: 0.95 },
  medium: { laps: 20, weight: 1.0 },
  heavy: { laps: 30, weight: 1.05 },
}

export const RACE_RHYTHMS: Record<RaceRhythm, { speed: number; tyreWear: number; fuelConsumption: number }> = {
  aggressive: { speed: 1.05, tyreWear: 1.3, fuelConsumption: 1.2 },
  normal: { speed: 1.0, tyreWear: 1.0, fuelConsumption: 1.0 },
  conservative: { speed: 0.95, tyreWear: 0.7, fuelConsumption: 0.85 },
}

export const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
