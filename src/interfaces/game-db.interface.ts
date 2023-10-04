import { NFLResult } from "./nfl-api.interface";

export interface IGame {
  getData(): NFLResult;
}

export class Game implements IGame {
  private data: NFLResult;

  constructor(data: NFLResult) {
    this.data = fixOdds(data);
  }

  getData() {
    return this.data;
  }
}

function fixOdds(data: NFLResult) {
  data.odds = data.odds.filter((a) => a.provider === "CONSENSUS");
  if (data.odds.length) {
    data.odds[0].spread = Math.round(data.odds[0].spread * 2) / 2;
    data.odds[0].overUnder = Math.round(data.odds[0].overUnder * 2) / 2;
  }

  return data;
}

export const games: Record<number, IGame> = {};

export function addGames(data: NFLResult[]) {
  for (const result of data) {
    games[result.gameID] = new Game(result);
  }
}
