import { NFLResult } from "./nfl-api.interface";

export interface IGame {
  getData(): NFLResult;
  toString(): void;
}

export class Game implements IGame {
  private data: NFLResult;
  private oddsCutoffDate: Date;

  constructor(data: NFLResult) {
    this.data = fixOdds(data);

    const date = new Date(this.data.date);
    let weekDay = date.getDay();
    if (weekDay < 4) weekDay += 7;
    this.oddsCutoffDate = new Date(this.data.date);
    this.oddsCutoffDate.setHours(0, 0, 0, 0);
    this.oddsCutoffDate.setDate(this.oddsCutoffDate.getDate() - (weekDay - 4));
  }

  getData() {
    return this.data;
  }

  toString() {
    for (const prop in this.data) {
      console.log(`${prop}: ${this.data[prop]}`);
    }

    console.log(this.oddsCutoffDate.toLocaleString());
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
