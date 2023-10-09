import GameDB from "../modules/game-db";
import TeamDB from "../modules/team-db";
import UserDB from "../modules/user-db";
import { IGame } from "./game.interface";
import { ITeam } from "./team.interface";
import { IUser } from "./user.interface";

export interface PickData {
  user: number;
  game: number;
  team: number;
}

export interface IPick {
  data: PickData;
  user: IUser;
  game: IGame;
  team: ITeam;

  toString(): string;
}

export class Pick implements Pick {
  public data: PickData;

  static gdb: GameDB = GameDB.getInstance();
  static udb: UserDB = UserDB.getInstance();
  static tdb: TeamDB = TeamDB.getInstance();

  user: IUser;
  game: IGame;
  team: ITeam;

  constructor(data: PickData) {
    this.data = data;

    this.user = Pick.udb.fromID(data.user);
    this.game = Pick.gdb.fromID(data.game);
    this.team = Pick.tdb.fromID(data.team);
  }

  toString(): string {
    return `WEEK ${this.game.getWeek()} ${this.user.data.name}: ${this.game.toString(false)} | ${this.team.data.abbr}`
  }
}