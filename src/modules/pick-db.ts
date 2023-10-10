import { IPick, Pick, PickData } from "../interfaces/pick.interface";

import fs from "fs";
import path from "path";
import { IGame } from "../interfaces/game.interface";

export interface PickSetUpdate {
  userID: number,
  week: number,
  picks: PickData[]
}

class PickDB {
  private static db: PickDB;
  private dbPath = path.resolve(path.join(__dirname, '../../db/picks'));

  private static picks: IPick[] = [];

  public static init() {
    PickDB.db = new PickDB();
    const db = PickDB.getInstance();

    console.log(`Pick Database Path: ${db.dbPath}`);
    const dbBuffer = fs.readFileSync(db.dbPath);
    const dbData: PickData[] = JSON.parse(dbBuffer.toString());
    for (const result of dbData) {
      PickDB.picks.push(new Pick(result));
    }
  }

  public static getInstance(): PickDB {
    if (!PickDB.db) {
      PickDB.init();
    }

    return PickDB.db;
  }

  public ingest(pickData: PickSetUpdate): PickSetUpdate {
    PickDB.picks = PickDB.picks.filter( pick => !(pick.user.data.id === pickData.userID && pick.game.getWeek() === pickData.week) );

    for (const data of pickData.picks) {
      PickDB.picks.push(new Pick(data));
    }

    return pickData;
  }
  
  public allPicks(): IPick[] {
    return PickDB.picks;
  }

  public addPick(data: PickData) {
    PickDB.picks.push(new Pick(data));
  }

  public writeDB(): void {
    fs.writeFile(this.dbPath, JSON.stringify(PickDB.picks.map(pick => pick.data)), () => {});
  }
}

export default PickDB;
