export interface TeamData {
  id: number;
  name: string;
  city: string;
  abbr: string;
  iconURL: string;
  active: boolean;
}

export interface ITeam {
  data: TeamData;

  isActive(): boolean;
  isPush(): boolean;
  isOU(): boolean;
  toString(): string;
}

export class Team implements ITeam {
  data: TeamData;

  constructor(data: TeamData) {
    this.data = data;
  }

  isActive(): boolean {
    return this.data.active;
  }

  isPush(): boolean {
    return this.data.name === "PUSH";
  }

  isOU(): boolean {
    return this.data.name === "OVER" || this.data.name === "UNDER";
  }

  toString(): string {
    return `${this.data.id}: ${this.data.city} ${this.data.name} [${this.data.abbr}]`;
  }
}
