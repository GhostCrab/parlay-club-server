export interface NFLMetaData {
  code: number;
  count: number;
  description: string;
}

export interface NFLOdds {
  date: number;
  moneyLine1: number;
  moneyLine2: number;
  overUnder: number;
  overUnderLineOver: number;
  overUnderLineUnder: number;
  provider: string;
  spread: number;
  spreadLine1: number;
  spreadLine2: number;
}

export interface NFLResult {
  date: number;
  gameID: number;
  headline: string;
  highPoints: number;
  leagueCode: string;
  location: string;
  odds: NFLOdds[];
  points: number;
  pointsLevel: string;
  rationale?: string;
  round: string;
  sport: string;
  team1City: string;
  team1Color: string;
  team1ID: number;
  team1Initials: string;
  team1Name: string;
  team1Score?: number;
  team2City: string;
  team2Color: string;
  team2ID: number;
  team2Initials: string;
  team2Name: string;
  team2Score?: number;
  time?: number;
  timeLeft?: string;
}

export interface NFLData {
  meta: NFLMetaData;
  results: NFLResult[];
  rounds: string[];
}
