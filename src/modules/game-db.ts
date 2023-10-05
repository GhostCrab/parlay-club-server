import { Game, IGame } from "../interfaces/game-db.interface";
import { NFLResult } from "../interfaces/nfl-api.interface";
import fs from "fs";
import path from "path";

class GameDB {
  private static db: GameDB;
  private dbPath = path.resolve(path.join(__dirname, '/db/games'));

  private games: Record<number, IGame>;
  private gamesByWeekTeam: Record<number, Record<string, IGame>>;

  constructor() {
    this.games = {};
    this.gamesByWeekTeam = {};
    for (let i = 1; i <= 18; i++) this.gamesByWeekTeam[i] = {};
  }

  public static init() {
    GameDB.db = new GameDB();

    console.log(`Game Datbase Path: ${GameDB.db.dbPath}`);
    const dbBuffer = fs.readFileSync(GameDB.db.dbPath);
    const dbResults: NFLResult[] = JSON.parse(dbBuffer.toString());
    for (const result of dbResults) {
      GameDB.db.addGame(result);
    }
  
    for (const game of Object.values(GameDB.db.games).sort((a,b) => a.data.date - b.data.date).filter(game => game.getWeek() === 1 || game.getWeek() === 18)) {
      console.log(game.toString());
    }
  
    // console.log(GameDB.db.gamesByWeekTeam[16]['PIT'].toString());
    // for (const prop in GameDB.db.gamesByWeekTeam[16]['PIT'].data) {
    //   console.log(`${prop}: ${GameDB.db.gamesByWeekTeam[16]['PIT'].data[prop]}`);
    // }
  }

  public static getInstance(): GameDB {
    if (!GameDB.db) {
      GameDB.init();
    }

    return GameDB.db;
  }

  private addGame(result: NFLResult): IGame {
    const game = new Game(result);
    const week = game.getWeek();
    this.games[result.gameID] = game;
    this.gamesByWeekTeam[week][game.data.team1Initials] = game;
    this.gamesByWeekTeam[week][game.data.team2Initials] = game;

    return game;
  }

  public ingest(results: NFLResult[]): IGame[] {
    const updatedGames: IGame[] = [];
    for (const result of results) {
      if (!this.games[result.gameID]) {
        const newGame = this.addGame(result)
        updatedGames.push(newGame)
      } else {
        if (this.games[result.gameID].update(result))
          updatedGames.push(this.games[result.gameID]);
      }
    }

    return updatedGames;
  }
}

export default GameDB;





