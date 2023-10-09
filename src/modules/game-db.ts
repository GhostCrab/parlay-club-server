import { Game, GameData, IGame } from "../interfaces/game.interface";
import fs from "fs";
import path from "path";

class GameDB {
  private static db: GameDB;
  private dbPath = path.resolve(path.join(__dirname, '../../db/games'));

  private static games: IGame[] = [];
  private gamesByID: Record<number, IGame>;
  private gamesByWeek: Record<number, IGame[]>;
  private gamesByWeekTeam: Record<number, Record<string, IGame>>;

  constructor() {
    this.gamesByID = {};
    this.gamesByWeekTeam = {};
    this.gamesByWeek = {};

    for (let i = 1; i <= 18; i++) {
      this.gamesByWeekTeam[i] = {};
      this.gamesByWeek[i] = [];
    }
  }

  public static init() {
    GameDB.db = new GameDB();
    const db = GameDB.getInstance();

    console.log(`Game Database Path: ${db.dbPath}`);
    const dbBuffer = fs.readFileSync(db.dbPath);
    const dbResults: GameData[] = JSON.parse(dbBuffer.toString());
    for (const result of dbResults) {
      db.addGame(result);
    }
  }

  public static getInstance(): GameDB {
    if (!GameDB.db) {
      GameDB.init();
    }

    return GameDB.db;
  }

  private addGame(result: GameData): IGame {
    const game = new Game(result);
    const week = game.getWeek();
    GameDB.games.push(game);
    this.gamesByID[result.gameID] = game;
    this.gamesByWeek[week].push(game);
    this.gamesByWeekTeam[week][game.data.team1Initials] = game;
    this.gamesByWeekTeam[week][game.data.team2Initials] = game;

    return game;
  }

  public ingest(results: GameData[]): IGame[] {
    const updatedGames: IGame[] = [];
    for (const result of results) {
      if (!this.gamesByID[result.gameID]) {
        const newGame = this.addGame(result)
        updatedGames.push(newGame)
      } else {
        if (this.gamesByID[result.gameID].update(result)) {
          updatedGames.push(this.gamesByID[result.gameID]);
        }
      }
    }

    return updatedGames;
  }

  public fromWeekTeam(week: number, teamAbbr: string): IGame {
    if (this.gamesByWeekTeam[week])
      return this.gamesByWeekTeam[week][teamAbbr];
    
    throw new Error(`Attempted to retrieve from an undefined week: ${week}`);
  }

  public fromWeek(week: number): IGame[] {
    return this.gamesByWeek[week];
  }

  public fromID(id: number) {
    return this.gamesByID[id];
  }

  public allGames(): IGame[] {
    return GameDB.games;
  }
}

export default GameDB;





