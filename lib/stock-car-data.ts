export interface Driver {
  id: string
  name: string
  age: number
  nationality: string
  experience: number // years in Stock Car
  skill: number // 1-100
  consistency: number // 1-100
  aggression: number // 1-100
  teamId: string
  manufacturerId: string
  wins: number
  podiums: number
  points: number
  championships: number
  active: boolean
  joinedYear: number
}

export interface Team {
  id: string
  name: string
  founded: number
  owner: string
  headquarters: string
  manufacturerId: string
  budget: number // in millions BRL
  reputation: number // 1-100
  facilities: number // 1-100
  active: boolean
  championships: number
  drivers: string[] // driver IDs
  colors: {
    primary: string
    secondary: string
  }
  logo: string
}

export interface Manufacturer {
  id: string
  name: string
  country: string
  enteredYear: number
  exitedYear?: number
  active: boolean
  championships: number
  reliability: number // 1-100
  performance: number // 1-100
  development: number // 1-100
  budget: number // in millions BRL
  logo: string
  brandColors: {
    primary: string
    secondary: string
  }
}

export interface Race {
  id: string
  name: string
  track: string
  location: string
  state?: string // Added state field
  flag?: string // Added flag field
  date: Date
  laps: number
  distance: number // km
  completed: boolean
  results?: RaceResult[]
  weather: "sunny" | "cloudy" | "rainy"
  raceType?: "main" | "inverted" // Added race type
  qualifying?: any // Qualifying results
  race1Results?: RaceResult[] // Results from race 1 (for race 2 grid)
}

export interface RaceResult {
  position: number
  driverId: string
  teamId: string
  manufacturerId: string
  points: number
  fastestLap: boolean
  dnf: boolean
  dnfReason?: string
  lapTime?: string
}

export interface Season {
  year: number
  races: Race[]
  driverStandings: DriverStanding[]
  teamStandings: TeamStanding[]
  manufacturerStandings: ManufacturerStanding[]
  completed: boolean
  evolutionEvents?: HistoricalEvent[]
}

export interface DriverStanding {
  driverId: string
  position: number
  points: number
  wins: number
  podiums: number
  fastestLaps: number
}

export interface TeamStanding {
  teamId: string
  position: number
  points: number
  wins: number
  podiums: number
}

export interface ManufacturerStanding {
  manufacturerId: string
  position: number
  points: number
  wins: number
  podiums: number
}

export interface HistoricalEvent {
  id: string
  name: string
  year: number
  description: string
}

// Real Brazilian Stock Car data
export const MANUFACTURERS: Manufacturer[] = [
  {
    id: "chevrolet",
    name: "Chevrolet",
    country: "Estados Unidos",
    enteredYear: 1979,
    active: true,
    championships: 15,
    reliability: 88,
    performance: 92,
    development: 90,
    budget: 45,
    logo: "/chevrolet-logo-golden-bowtie.jpg",
    brandColors: {
      primary: "#FFD700",
      secondary: "#000000",
    },
  },
  {
    id: "toyota",
    name: "Toyota",
    country: "Japão",
    enteredYear: 2012,
    active: true,
    championships: 8,
    reliability: 95,
    performance: 89,
    development: 93,
    budget: 50,
    logo: "/toyota-logo-red-oval.jpg",
    brandColors: {
      primary: "#EB0A1E",
      secondary: "#FFFFFF",
    },
  },
  {
    id: "mitsubishi",
    name: "Mitsubishi",
    country: "Japão",
    enteredYear: 2025,
    active: true,
    championships: 0,
    reliability: 85,
    performance: 87,
    development: 88,
    budget: 35,
    logo: "/mitsubishi-logo-red-diamonds.jpg",
    brandColors: {
      primary: "#DC143C",
      secondary: "#FFFFFF",
    },
  },
]

export const TEAMS: Team[] = [
  {
    id: "scuderia-chiarelli",
    name: "Scuderia Chiarelli",
    founded: 2020,
    owner: "Chiarelli Family",
    headquarters: "São Paulo, SP",
    manufacturerId: "chevrolet",
    budget: 15,
    reputation: 85,
    facilities: 80,
    active: true,
    championships: 0,
    drivers: ["caca-bueno", "lucas-kohl"],
    colors: { primary: "#FF0000", secondary: "#FFFFFF" },
    logo: "/scuderia-chiarelli-logo.jpg",
  },
  {
    id: "crown-racing",
    name: "Crown Racing",
    founded: 2015,
    owner: "Crown Group",
    headquarters: "São Paulo, SP",
    manufacturerId: "toyota",
    budget: 18,
    reputation: 88,
    facilities: 85,
    active: true,
    championships: 1,
    drivers: ["julio-campos", "arthur-leist"],
    colors: { primary: "#000000", secondary: "#FFD700" },
    logo: "/crown-racing-team-logo-black-gold.jpg",
  },
  {
    id: "full-time-cavaleiro",
    name: "Full Time Cavaleiro",
    founded: 2018,
    owner: "Full Time Sports",
    headquarters: "São Paulo, SP",
    manufacturerId: "toyota",
    budget: 20,
    reputation: 92,
    facilities: 90,
    active: true,
    championships: 2,
    drivers: ["denis-navarro", "rubens-barrichello"],
    colors: { primary: "#0066CC", secondary: "#FFFFFF" },
    logo: "/full-time-cavaleiro-logo.jpg",
  },
  {
    id: "full-time-gazoo",
    name: "Full Time Gazoo Racing",
    founded: 2019,
    owner: "Full Time Sports",
    headquarters: "São Paulo, SP",
    manufacturerId: "toyota",
    budget: 22,
    reputation: 90,
    facilities: 88,
    active: true,
    championships: 1,
    drivers: ["joao-paulo-oliveira", "arthur-gama"],
    colors: { primary: "#EB0A1E", secondary: "#000000" },
    logo: "/full-time-gazoo-logo.jpg",
  },
  {
    id: "rtr-sport",
    name: "RTR Sport Team",
    founded: 2021,
    owner: "RTR Group",
    headquarters: "São Paulo, SP",
    manufacturerId: "chevrolet",
    budget: 25,
    reputation: 95,
    facilities: 92,
    active: true,
    championships: 0,
    drivers: ["helio-castroneves", "nelson-piquet-jr"],
    colors: { primary: "#FF6600", secondary: "#000000" },
    logo: "/rtr-sport-logo.jpg",
  },
  {
    id: "rcm-motorsport",
    name: "RCM Motorsport",
    founded: 2016,
    owner: "RCM Group",
    headquarters: "São Paulo, SP",
    manufacturerId: "mitsubishi",
    budget: 12,
    reputation: 75,
    facilities: 70,
    active: true,
    championships: 0,
    drivers: ["ricardo-zonta", "bruno-baptista"],
    colors: { primary: "#800080", secondary: "#FFFFFF" },
    logo: "/rcm-motorsport-logo.jpg",
  },
  {
    id: "car-racing-ktf",
    name: "CAR Racing KTF",
    founded: 2019,
    owner: "KTF Group",
    headquarters: "São Paulo, SP",
    manufacturerId: "mitsubishi",
    budget: 14,
    reputation: 78,
    facilities: 75,
    active: true,
    championships: 0,
    drivers: ["gianluca-petecof", "felipe-baptista"],
    colors: { primary: "#FF1493", secondary: "#000000" },
    logo: "/car-racing-ktf-logo.jpg",
  },
  {
    id: "eurofarma-rc",
    name: "Eurofarma RC",
    founded: 2008,
    owner: "Eurofarma",
    headquarters: "São Paulo, SP",
    manufacturerId: "mitsubishi",
    budget: 18,
    reputation: 92,
    facilities: 88,
    active: true,
    championships: 3,
    drivers: ["gaetano-di-mauro", "felipe-fraga"],
    colors: { primary: "#FF6B00", secondary: "#FFFFFF" },
    logo: "/eurofarma-racing-team-logo-orange-white.jpg",
  },
  {
    id: "mattheis-vogel",
    name: "A.Mattheis Vogel",
    founded: 2012,
    owner: "Vogel Motorsport",
    headquarters: "São Paulo, SP",
    manufacturerId: "chevrolet",
    budget: 16,
    reputation: 82,
    facilities: 78,
    active: true,
    championships: 1,
    drivers: ["lucas-foresti", "gabriel-casagrande"],
    colors: { primary: "#0066CC", secondary: "#FFFFFF" },
    logo: "/vogel-motorsport-team-logo-blue-white.jpg",
  },
  {
    id: "blau-motorsport",
    name: "Blau Motorsport",
    founded: 2020,
    owner: "Blau Group",
    headquarters: "São Paulo, SP",
    manufacturerId: "mitsubishi",
    budget: 13,
    reputation: 80,
    facilities: 76,
    active: true,
    championships: 0,
    drivers: ["allam-khodair", "daniel-serra"],
    colors: { primary: "#0000FF", secondary: "#FFFFFF" },
    logo: "/blau-motorsport-logo.jpg",
  },
]

export const DRIVERS: Driver[] = [
  {
    id: "caca-bueno",
    name: "Cacá Bueno",
    age: 45,
    nationality: "Brasil",
    experience: 20,
    skill: 95,
    consistency: 90,
    aggression: 75,
    teamId: "scuderia-chiarelli",
    manufacturerId: "chevrolet",
    wins: 32,
    podiums: 95,
    points: 0,
    championships: 2,
    active: true,
    joinedYear: 2004,
  },
  {
    id: "lucas-kohl",
    name: "Lucas Kohl",
    age: 28,
    nationality: "Brasil",
    experience: 5,
    skill: 78,
    consistency: 75,
    aggression: 82,
    teamId: "scuderia-chiarelli",
    manufacturerId: "chevrolet",
    wins: 2,
    podiums: 12,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2020,
  },
  {
    id: "julio-campos",
    name: "Júlio Campos",
    age: 35,
    nationality: "Brasil",
    experience: 12,
    skill: 88,
    consistency: 85,
    aggression: 80,
    teamId: "crown-racing",
    manufacturerId: "toyota",
    wins: 18,
    podiums: 55,
    points: 0,
    championships: 1,
    active: true,
    joinedYear: 2013,
  },
  {
    id: "arthur-leist",
    name: "Arthur Leist",
    age: 26,
    nationality: "Brasil",
    experience: 4,
    skill: 82,
    consistency: 78,
    aggression: 85,
    teamId: "crown-racing",
    manufacturerId: "toyota",
    wins: 3,
    podiums: 15,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2021,
  },
  {
    id: "denis-navarro",
    name: "Denis Navarro",
    age: 38,
    nationality: "Brasil",
    experience: 15,
    skill: 85,
    consistency: 88,
    aggression: 70,
    teamId: "full-time-cavaleiro",
    manufacturerId: "toyota",
    wins: 12,
    podiums: 42,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2009,
  },
  {
    id: "rubens-barrichello",
    name: "Rubens Barrichello",
    age: 52,
    nationality: "Brasil",
    experience: 8,
    skill: 92,
    consistency: 95,
    aggression: 65,
    teamId: "full-time-cavaleiro",
    manufacturerId: "toyota",
    wins: 15,
    podiums: 48,
    points: 0,
    championships: 1,
    active: true,
    joinedYear: 2017,
  },
  {
    id: "joao-paulo-oliveira",
    name: "João Paulo de Oliveira",
    age: 33,
    nationality: "Brasil",
    experience: 10,
    skill: 80,
    consistency: 82,
    aggression: 78,
    teamId: "full-time-gazoo",
    manufacturerId: "toyota",
    wins: 8,
    podiums: 28,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2015,
  },
  {
    id: "arthur-gama",
    name: "Arthur Gama",
    age: 24,
    nationality: "Brasil",
    experience: 3,
    skill: 75,
    consistency: 72,
    aggression: 88,
    teamId: "full-time-gazoo",
    manufacturerId: "toyota",
    wins: 1,
    podiums: 8,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2022,
  },
  {
    id: "helio-castroneves",
    name: "Hélio Castroneves",
    age: 50,
    nationality: "Brasil",
    experience: 6,
    skill: 98,
    consistency: 92,
    aggression: 80,
    teamId: "rtr-sport",
    manufacturerId: "chevrolet",
    wins: 8,
    podiums: 25,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2019,
  },
  {
    id: "nelson-piquet-jr",
    name: "Nelson Piquet Jr.",
    age: 39,
    nationality: "Brasil",
    experience: 3,
    skill: 89,
    consistency: 85,
    aggression: 82,
    teamId: "rtr-sport",
    manufacturerId: "chevrolet",
    wins: 4,
    podiums: 18,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2022,
  },
  {
    id: "ricardo-zonta",
    name: "Ricardo Zonta",
    age: 52,
    nationality: "Brasil",
    experience: 12,
    skill: 88,
    consistency: 92,
    aggression: 68,
    teamId: "rcm-motorsport",
    manufacturerId: "mitsubishi",
    wins: 10,
    podiums: 38,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2013,
  },
  {
    id: "bruno-baptista",
    name: "Bruno Baptista",
    age: 29,
    nationality: "Brasil",
    experience: 6,
    skill: 76,
    consistency: 74,
    aggression: 85,
    teamId: "rcm-motorsport",
    manufacturerId: "mitsubishi",
    wins: 2,
    podiums: 10,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2019,
  },
  {
    id: "gianluca-petecof",
    name: "Gianluca Petecof",
    age: 25,
    nationality: "Brasil",
    experience: 4,
    skill: 84,
    consistency: 78,
    aggression: 88,
    teamId: "car-racing-ktf",
    manufacturerId: "mitsubishi",
    wins: 3,
    podiums: 12,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2021,
  },
  {
    id: "felipe-baptista",
    name: "Felipe Baptista",
    age: 27,
    nationality: "Brasil",
    experience: 5,
    skill: 79,
    consistency: 76,
    aggression: 83,
    teamId: "car-racing-ktf",
    manufacturerId: "mitsubishi",
    wins: 1,
    podiums: 8,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2020,
  },
  {
    id: "gaetano-di-mauro",
    name: "Gaetano di Mauro",
    age: 35,
    nationality: "Brasil",
    experience: 12,
    skill: 87,
    consistency: 85,
    aggression: 72,
    teamId: "eurofarma-rc",
    manufacturerId: "mitsubishi",
    wins: 14,
    podiums: 45,
    points: 0,
    championships: 1,
    active: true,
    joinedYear: 2013,
  },
  {
    id: "felipe-fraga",
    name: "Felipe Fraga",
    age: 32,
    nationality: "Brasil",
    experience: 9,
    skill: 86,
    consistency: 83,
    aggression: 78,
    teamId: "eurofarma-rc",
    manufacturerId: "mitsubishi",
    wins: 11,
    podiums: 32,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2016,
  },
  {
    id: "lucas-foresti",
    name: "Lucas Foresti",
    age: 30,
    nationality: "Brasil",
    experience: 7,
    skill: 81,
    consistency: 79,
    aggression: 80,
    teamId: "mattheis-vogel",
    manufacturerId: "chevrolet",
    wins: 4,
    podiums: 18,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2018,
  },
  {
    id: "gabriel-casagrande",
    name: "Gabriel Casagrande",
    age: 29,
    nationality: "Brasil",
    experience: 8,
    skill: 82,
    consistency: 80,
    aggression: 85,
    teamId: "mattheis-vogel",
    manufacturerId: "chevrolet",
    wins: 6,
    podiums: 24,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2017,
  },
  {
    id: "allam-khodair",
    name: "Allam Khodair",
    age: 31,
    nationality: "Brasil",
    experience: 6,
    skill: 78,
    consistency: 75,
    aggression: 90,
    teamId: "blau-motorsport",
    manufacturerId: "mitsubishi",
    wins: 2,
    podiums: 12,
    points: 0,
    championships: 0,
    active: true,
    joinedYear: 2019,
  },
  {
    id: "daniel-serra",
    name: "Daniel Serra",
    age: 33,
    nationality: "Brasil",
    experience: 11,
    skill: 90,
    consistency: 87,
    aggression: 75,
    teamId: "blau-motorsport",
    manufacturerId: "mitsubishi",
    wins: 16,
    podiums: 52,
    points: 0,
    championships: 2,
    active: true,
    joinedYear: 2014,
  },
]

export const TRACKS = [
  {
    name: "Autódromo José Carlos Pace (Interlagos)",
    location: "São Paulo, SP",
    state: "SP",
    flag: "🏁",
    laps: 71,
    distance: 305.9,
  },
  {
    name: "Autódromo Internacional de Cascavel",
    location: "Cascavel, PR",
    state: "PR",
    flag: "🏁",
    laps: 60,
    distance: 240.0,
  },
  {
    name: "Velopark",
    location: "Nova Santa Rita, RS",
    state: "RS",
    flag: "🏁",
    laps: 45,
    distance: 180.0,
  },
  {
    name: "Velocitta",
    location: "Mogi Guaçu, SP",
    state: "SP",
    flag: "🏁",
    laps: 55,
    distance: 220.0,
  },
  {
    name: "Circuito dos Cristais",
    location: "Curvelo, MG",
    state: "MG",
    flag: "🏁",
    laps: 52,
    distance: 208.0,
  },
  {
    name: "Autódromo Internacional Orlando Moura",
    location: "Campo Grande, MS",
    state: "MS",
    flag: "🏁",
    laps: 50,
    distance: 200.0,
  },
  {
    name: "Autódromo Internacional Ayrton Senna",
    location: "Goiânia, GO",
    state: "GO",
    flag: "🏁",
    laps: 48,
    distance: 192.0,
  },
  {
    name: "Autódromo Internacional Nelson Piquet",
    location: "Brasília, DF",
    state: "DF",
    flag: "🏁",
    laps: 58,
    distance: 232.0,
  },
  {
    name: "Autódromo de Tarumã",
    location: "Viamão, RS",
    state: "RS",
    flag: "🏁",
    laps: 65,
    distance: 195.0,
  },
  {
    name: "Autódromo de Londrina",
    location: "Londrina, PR",
    state: "PR",
    flag: "🏁",
    laps: 55,
    distance: 165.0,
  },
  {
    name: "Autódromo Internacional de Curitiba",
    location: "Curitiba, PR",
    state: "PR",
    flag: "🏁",
    laps: 62,
    distance: 186.0,
  },
  {
    name: "Autódromo de Jacarepaguá",
    location: "Rio de Janeiro, RJ",
    state: "RJ",
    flag: "🏁",
    laps: 68,
    distance: 272.0,
  },
]

// Points system (current Stock Car Brasil)
export const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]