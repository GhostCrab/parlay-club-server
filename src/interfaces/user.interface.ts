export interface UserData {
  id: number;
  name: string;
  email: string;
};

export interface IUser {
  data: UserData;

  toString(): string;
}

export class User implements User {
  public data: UserData;

  constructor(data: UserData) {
    this.data = data;
  }

  toString(): string {
    return `${this.data.id.toString()} ${this.data.name} ${this.data.email}`;
  }
}