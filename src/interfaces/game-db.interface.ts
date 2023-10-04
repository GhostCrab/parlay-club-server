import { NFLResult } from "./nfl-api.interface";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(path.join(__dirname, '/db/games'));
console.log(`Game Datbase Path: ${dbPath}`);

export interface IGame {
  data: NFLResult;
  oddsCutoffDate: Date;

  isComplete(): boolean;
  getData(): NFLResult;
  getWeek(): number;
  toString(): void;
}

export class Game implements IGame {
  data: NFLResult;
  oddsCutoffDate: Date;

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

  getWeek() {
    return Number(this.data.round.split(' ')[1]);
  }

  toString() {
    // for (const prop in this.data) {
    //   console.log(`${prop}: ${this.data[prop]}`);
    // }

    // console.log(this.oddsCutoffDate.toLocaleString());

    if (this.isComplete())
      return `${this.data.team1Initials} @ ${this.data.team2Initials}: ${this.data.timeLeft} ${this.data.team1Score} - ${this.data.team2Score}`
    
    return `${this.data.team1Initials} @ ${this.data.team2Initials}: ${new Date(this.data.date).toLocaleString()}`
  }

  isComplete(): boolean {
    return this.data.timeLeft?.includes('Final') || false;
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
export const gamesByWeekTeam: Record<number, Record<string, IGame>> = {};
for (let i = 1; i <= 18; i++) gamesByWeekTeam[i] = {};

export function addGames(data: NFLResult[]) {
  for (const result of data) {
    const game = new Game(result);
    games[result.gameID] = game;
    gamesByWeekTeam[game.getWeek()][game.data.team1Initials] = game;
    gamesByWeekTeam[game.getWeek()][game.data.team2Initials] = game;
  }
}

//initialize
fs.readFile(dbPath, (err, data) => {
  const inGames: NFLResult[] = JSON.parse(data.toString());
  addGames(inGames);

  for (const game of Object.values(games).sort((a,b) => a.data.date - b.data.date)) {
    console.log(game.toString());
  }

  console.log(gamesByWeekTeam[16]['PIT'].toString());
  for (const prop in gamesByWeekTeam[16]['PIT'].data) {
    console.log(`${prop}: ${gamesByWeekTeam[16]['PIT'].data[prop]}`);
  }

  for (const odd of gamesByWeekTeam[16]['PIT'].data.odds) {
    console.log(odd);
  }

  console.log(gamesByWeekTeam[16]['PIT'].oddsCutoffDate.toLocaleString());
});