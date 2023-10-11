import { Request, Response, NextFunction } from "express";
import { GameData } from "../interfaces/game.interface";
import { PickData } from "../interfaces/pick.interface";
import { TeamData } from "../interfaces/team.interface";
import { UserData } from "../interfaces/user.interface";
import GameDB from "../modules/game-db";
import PickDB from "../modules/pick-db";
import TeamDB from "../modules/team-db";
import UserDB from "../modules/user-db";
import { msgId } from "../server";

export interface ServerData {
  users?: UserData[],
  teams?: TeamData[],
  games?: GameData[],
  picks?: PickData[]  
}

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  const data: ServerData = {
    users: UserDB.getInstance().allUsers().map(user => user.data),
    teams: TeamDB.getInstance().allTeams().map(team => team.data),
    games: GameDB.getInstance().allGames().map(game => game.data),
    picks: PickDB.getInstance().allPicks().map(pick => pick.data)
  }

  return res.status(200).json({msgId: msgId, data: data});
};


export default { getAll };
