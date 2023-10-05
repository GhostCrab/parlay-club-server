import { GameData } from "./game.interface";

export interface NFLMetaData {
  code: number;
  count: number;
  description: string;
}

export interface NFLData {
  meta: NFLMetaData;
  results: GameData[];
  rounds: string[];
}
