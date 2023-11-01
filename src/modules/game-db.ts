import { Game, GameData, GameState, IGame } from "../interfaces/game.interface";
import fs from "fs";
import path from "path";

class GameDB {
  private static db: GameDB;
  private static currentWeek: number = 0;
  //private dbPath = path.resolve(path.join(__dirname, '../../db/games'))
  private dbPath = '/usr/local/db/games';

  private games: IGame[] = [];
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
    if (dbBuffer.length) {
      const dbResults: GameData[] = JSON.parse(dbBuffer.toString());
      db.ingest(dbResults);
    }
  }

  public static getInstance(): GameDB {
    if (!GameDB.db) {
      GameDB.init();
    }

    return GameDB.db;
  }

  public clear(): void {
    this.games = [];
    this.gamesByID = {};
    this.gamesByWeekTeam = {};
    this.gamesByWeek = {};
  }

  private addGame(result: GameData): IGame {
    const game = new Game(result);
    const week = game.data.week;
    this.games.push(game);
    this.gamesByID[result.id] = game;
    this.gamesByWeek[week].push(game);
    this.gamesByWeekTeam[week][game.data.away] = game;
    this.gamesByWeekTeam[week][game.data.home] = game;

    return game;
  }

  public ingest(results: GameData[]): IGame[] {
    const updatedGames: IGame[] = [];
    for (const result of results) {
      if (!this.gamesByID[result.id]) {
        const newGame = this.addGame(result)
        updatedGames.push(newGame)
      } else {
        if (this.gamesByID[result.id].update(result)) {
          updatedGames.push(this.gamesByID[result.id]);
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
    return this.games;
  }

  public writeDB(): void {
    fs.writeFile(this.dbPath, JSON.stringify(this.games.map(game => game.data)), (err) => {
      if (err) console.error(`Failed to write to ${this.dbPath}: ${err}`);
    });
  }

  static getCurrentWeek(force: boolean = false): number {
    if (GameDB.currentWeek === 0 || force) {
      GameDB.currentWeek = 1;

      const db = GameDB.getInstance();
      
      for(const game of db.allGames().sort((a, b) => a.date.getTime() - b.date.getTime())) {
        if (game.data.state !== GameState.COMPLETE) {
          GameDB.currentWeek = game.data.week;
          break;
        }
      }
    }

    return GameDB.currentWeek;
  }
}

export default GameDB;





