import { IUser, User } from "../interfaces/user.interface";

class UserDB {
  private static db: UserDB;
  private static users: IUser[] = [
    new User({ id: 0, name: 'ANDREW', email: 'ACKILPATRICK@GMAIL.COM' }),
    new User({ id: 1, name: 'BARDIA', email: 'BBAKHTARI@GMAIL.COM' }),
    new User({ id: 2, name: 'COOPER', email: 'COOPER.KOCSIS@MATTEL.COM' }),
    new User({ id: 3, name: 'MICAH', email: 'MICAHGOLDMAN@GMAIL.COM' }),
    new User({ id: 4, name: 'RYAN', email: 'RYAN.PIELOW@GMAIL.COM' }),
    new User({ id: 5, name: 'TJ', email: 'TYERKE@YAHOO.COM' }),
    new User({ id: 6, name: 'BRAD', email: 'BRADVASSAR@GMAIL.COM' })
  ];

  private usersByID: Record<number, IUser> = {};

  constructor() {
    for (const user of UserDB.users) {
      this.usersByID[user.data.id] = user;
    }
  }

  public static getInstance(): UserDB {
    if (!UserDB.db) {
      UserDB.db = new UserDB();
    }

    return UserDB.db;
  }

  public fromID(id: number): IUser {
    if (id in this.usersByID) return this.usersByID[id];
  
    throw new Error("Unable to find user with id " + id.toString());
  }
  
  public allUsers(): IUser[] {
    return UserDB.users;
  }
}

export default UserDB;
