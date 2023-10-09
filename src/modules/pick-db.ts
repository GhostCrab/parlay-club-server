import { IPick, Pick, PickData } from "../interfaces/pick.interface";

import fs from "fs";
import path from "path";

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
