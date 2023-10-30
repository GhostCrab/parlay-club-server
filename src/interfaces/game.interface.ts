import GameDB from "../modules/game-db";
import TeamDB from "../modules/team-db";
import { fmt, postfmt } from "../modules/utility";
import { NFLAPICompetition, NFLAPIEvent, Odds, StatusName } from "./nfl-api.interface";

declare global { 
  interface Date { 
    stdTimezoneOffset: () => number;
    isDstObserved: () => boolean; 
  } 
}

Date.prototype.stdTimezoneOffset = function (): number {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

export enum WEEKDAY {
  sun = 0,
  mon,
  tue,
  wed,
  thu,
  fri,
  sat,
  sunmon,
}

/*
  Gamestate dictates how often the game is polled for updates.
  PRE - Game State & Odds are polled every 8 hours, queued
  CURRENT - Game Odds are polled every 15 minutes, queued
  LOCKED - Game State is polled hourly, queued
  ACTIVE - Game State is polled every 10 seconds, instant
  COMPLETE - Game State is polled once a day (shouldnt change), queued
*/

export enum GameState {
  PRE = 0,      // Game happening after this week
  CURRENT,      // Game happening this week
  LOCKED,       // Odds are locked for this game
  ACTIVE,       // Game is in progress
  COMPLETE      // Game is complete
}

export interface GameData {
  id: number;
  date: string;
  week: number;
  away: string;
  home: string;
  state: GameState;
  awayScore: number;
  homeScore: number;
  quarter: number;
  odds?: {
    spread: number;
    ou: number;
  }
  status?: {
    displayClock: string;
    possession: string;
    possessionText: string;
    shortDownDistanceText: string;
  }
}

export interface IGame {
  data: GameData;
  date: Date;
  oddsCutoffDate: Date;
  revealDate: Date;

  update(data: GameData): boolean;
  updateOdds(spread: number, ou: number): void;
  toString(): void;
  toString(showWeek: boolean): void;
}

export class Game implements IGame {
  data: GameData;
  date: Date;
  oddsCutoffDate: Date;
  revealDate: Date;

  constructor(data: GameData) {
    this.data = data;
    this.updateDates();
  }

  private updateDates() {
    // date
    this.date = new Date(this.data.date);
    const dstOffset = this.date.isDstObserved() ? 0 : 1;

    // oddsCutoffDate
    this.oddsCutoffDate = new Date(this.data.date);
    this.oddsCutoffDate.setUTCHours(this.oddsCutoffDate.getUTCHours() - 7);
    let weekDay: WEEKDAY = this.oddsCutoffDate.getUTCDay();
    if (weekDay < WEEKDAY.thu) weekDay += 7;    
    this.oddsCutoffDate.setUTCDate(this.oddsCutoffDate.getUTCDate() - (weekDay - 4));
    this.oddsCutoffDate.setUTCHours(7, 0, 0, 0);

    // revealDate
    this.revealDate = new Date(this.data.date);
    this.revealDate.setUTCHours(this.revealDate.getUTCHours() - 7);
    weekDay = this.revealDate.getUTCDay();
    
    if (weekDay === WEEKDAY.sat)
      this.revealDate.setUTCHours(20 + dstOffset, 30, 0, 0);
    if (weekDay === WEEKDAY.mon)
      this.revealDate.setUTCDate(this.revealDate.getUTCDate() - 1);
    if (weekDay === WEEKDAY.sun || weekDay === WEEKDAY.mon)
      this.revealDate.setUTCHours(17 + dstOffset, 0, 0, 0);
    if (weekDay === WEEKDAY.thu || this.revealDate.getTime() > this.date.getTime())
      this.revealDate = new Date(this.data.date);

    this.updateState();
  }

  public getData() {
    return this.data;
  }

  public getWeek() {
    return this.data.week;
  }

  public getFav() {
    let fav = this.data.away;
    if (this.data.odds && this.data.odds.spread <= 0)
      fav = this.data.home;

    return fav;
  }

  public getSpread() {
    let spread = '-0';
    if (this.data.odds)
      spread = `-${Math.abs(this.data.odds.spread).toString()}`

    return postfmt(spread, 5);
  }

  public getOU() {
    let ou = '+0';
    if (this.data.odds)
      ou = `+${this.data.odds.ou.toString()}`

    return postfmt(ou, 5);
  }

  public getATSWinner() {
    if (this.data.odds && this.data.state >= GameState.ACTIVE) {
      const modScore = this.data.homeScore + this.data.odds.spread;
      if (modScore > this.data.awayScore)
        return this.data.home;
      return this.data.away;
    }

    return 'PSH';
  }

  public getOUResult() {
    if (this.data.odds && this.data.state >= GameState.ACTIVE) {
      const score = this.data.homeScore + this.data.awayScore;
      if (score > this.data.odds.ou) return 'OVR';
      else if (score < this.data.odds.ou) return 'UND';
    }

    return 'PSH';
  }

  public toString(showWeek: boolean = false) {
    let homeInit = fmt(this.data.home, 3);
    let awayInit = fmt(this.data.away, 3);
    let favInit = fmt(this.getFav(), 3);
    let weekStr = '';
    if (showWeek) weekStr = `WEEK ${fmt(this.getWeek().toString(), 2)} `;
    
    let out = `${weekStr}${awayInit} @ ${homeInit}: ${favInit} ${this.getSpread()} ${this.getOU()}`;
    let append = '';
    if (this.data.state >= GameState.ACTIVE) {
      let awayResult = `${awayInit} ${fmt(this.data.awayScore.toString(), 2)}`
      let homeResult = `${homeInit} ${fmt(this.data.homeScore.toString(), 2)}`
      if (this.getATSWinner() === this.data.home) {
        awayResult = ` ${awayResult} `;
        homeResult = `[${homeResult}]`;
      } else {
        awayResult = `[${awayResult}]`;
        homeResult = ` ${homeResult} `;
      }
      append = ` | ${awayResult} ${homeResult} ${this.getOUResult().substring(0,1)} (${fmt((this.data.homeScore + this.data.awayScore).toString(), 2)})` 
    }
    
    return `${out}${append} ${GameState[this.data.state]}`;
  }

  public update(data: GameData): boolean {
    let updated = false;
    const updates: string[] = [];

    // id: number;
    if (this.data.id !== data.id) {
      throw new Error("Attempted to update a game when gameID does not match");
    }
    // date: string;
    if (this.data.date !== data.date) {
      updates.push(`date: ${this.data.date} => ${data.date}`);

      this.data.date = data.date;
      updated = true;
    }
    // week: string;
    if (this.data.week !== data.week) {
      throw new Error("Attempted to update a game when week does not match");
    }
    // away: string;
    if (this.data.away !== data.away) {
      throw new Error("Attempted to update a game when away does not match");
    }
    // home: string;
    if (this.data.home !== data.home) {
      throw new Error("Attempted to update a game when home does not match");
    }
    // state: number;
    if (this.data.state !== data.state){
      if (this.data.state === GameState.LOCKED && data.state === GameState.CURRENT) {
        // Block updating from LOCKED => CURRENT, processed GameData can't detect LOCKED
      } else {
        updates.push(`state: ${GameState[this.data.state]} => ${GameState[data.state]}`);

        this.data.state = data.state;
        updated = true;

        // Updates done when a game is completed
        if (this.data.state === GameState.COMPLETE) {
          updates.push(`state updated to COMPLETE - deleting status`);
          delete this.data.status;

          // Force update of game db current week in case the current week is done
          GameDB.getCurrentWeek(true);
        }
      }
    }
    // awayScore: string;
    if (this.data.awayScore !== data.awayScore) {
      updates.push(`awayScore: ${this.data.awayScore} => ${data.awayScore}`);

      this.data.awayScore = data.awayScore;
      updated = true;
    }
    // homeScore: string;
    if (this.data.homeScore !== data.homeScore) {
      updates.push(`homeScore: ${this.data.homeScore} => ${data.homeScore}`);

      this.data.homeScore = data.homeScore;
      updated = true;
    }
    // quarter: number;
    if (this.data.quarter !== data.quarter) {
      updates.push(`quarter: ${this.data.quarter} => ${data.quarter}`);

      this.data.quarter = data.quarter;
      updated = true;
    }

    // odds: NFLOdds[];
    if (data.odds && Date.now() < this.oddsCutoffDate.getTime()) {
      if (this.data.odds === undefined) {
        updates.push(`odds.spread: 0 => ${data.odds.spread}`);
        updates.push(`odds.ou: 0 => ${data.odds.ou}`);

        this.data.odds = data.odds;
        updated = true;
      } else {
        if (this.data.odds.spread !== data.odds.spread) {
          updates.push(`odds.spread: ${this.data.odds.spread} => ${data.odds.spread}`);
    
          this.data.odds.spread = data.odds.spread;
          updated = true;
        }

        if (this.data.odds.ou !== data.odds.ou) {
          updates.push(`odds.ou: ${this.data.odds.ou} => ${data.odds.ou}`);
    
          this.data.odds.ou = data.odds.ou;
          updated = true;
        }
      }
    }

    if (data.status && this.data.state === GameState.ACTIVE) {
      if (this.data.status === undefined) {
        updates.push(`status.displayClock: -- => ${data.status.displayClock}`);
        updates.push(`status.possession: -- => ${data.status.possession}`);
        updates.push(`status.possessionText: -- => ${data.status.possessionText}`);
        updates.push(`status.shortDownDistanceText: -- => ${data.status.shortDownDistanceText}`);

        this.data.status = data.status;
        updated = true;
      } else {
        if (this.data.status.displayClock !== data.status.displayClock) {
          updates.push(`status.displayClock: ${this.data.status.displayClock} => ${data.status.displayClock}`);
    
          this.data.status.displayClock = data.status.displayClock;
          updated = true;
        }

        if (this.data.status.possession !== data.status.possession) {
          updates.push(`status.possession: ${this.data.status.possession} => ${data.status.possession}`);
    
          this.data.status.possession = data.status.possession;
          updated = true;
        }

        if (this.data.status.possessionText !== data.status.possessionText) {
          updates.push(`status.possessionText: ${this.data.status.possessionText} => ${data.status.possessionText}`);
    
          this.data.status.possessionText = data.status.possessionText;
          updated = true;
        }

        if (this.data.status.shortDownDistanceText !== data.status.shortDownDistanceText) {
          updates.push(`status.shortDownDistanceText: ${this.data.status.shortDownDistanceText} => ${data.status.shortDownDistanceText}`);
    
          this.data.status.shortDownDistanceText = data.status.shortDownDistanceText;
          updated = true;
        }
      }
    }

    if (this.data.status && this.data.state !== GameState.ACTIVE) {
      updates.push(`state detected as ${GameState[this.data.state]} - deleting status`);
      delete this.data.status;

      // Force update of game db current week in case the current week is done
      GameDB.getCurrentWeek(true);
    }

    if (updates.length) {
      console.log(`${this.toString(true)} UPDATES:`)
      for (const update of updates)
        console.log(`  ${update}`);
    }

    return updated;
  }

  updateOdds(spread: number, ou: number): void {
    this.data.odds = {
      spread: spread,
      ou: ou
    };
  }

  getState() {
    this.updateState();
    return this.data.state;
  }

  updateState() {
    if (this.data.state <= GameState.CURRENT) {
      if (Date.now() >= this.oddsCutoffDate.getTime()) {
        this.data.state = GameState.LOCKED;
      }
    }

    // if (this.data.state <= GameState.LOCKED) {
    //   if (Date.now() >= this.date.getTime()) {
    //     this.data.state = GameState.ACTIVE;
    //   }
    // }
  }
}

export function fromNFLAIPEvent(data: NFLAPIEvent): GameData {
  if (data.competitions && data.competitions.length > 0) {
    const competition = data.competitions[0];
    let state = GameState.PRE;

    if (data.week.number === GameDB.getCurrentWeek())
      state = GameState.CURRENT;

    if (competition.status.type.name === StatusName.InProgress || 
        competition.status.type.name === StatusName.EndPeriod || 
        competition.status.type.name === StatusName.Halftime)
      state = GameState.ACTIVE;
    else if (competition.status.type.name === 'STATUS_FINAL')
      state = GameState.COMPLETE;

    const gameData: GameData = {
      id: Number(competition.id),
      date: competition.date,
      week: data.week.number,
      away: competition.competitors[1].team.abbreviation,
      home: competition.competitors[0].team.abbreviation,
      state: state,
      awayScore: Number(competition.competitors[1].score),
      homeScore: Number(competition.competitors[0].score),
      quarter: competition.status.period
    }

    if(competition.odds && competition.odds.length > 0) {
      const odds = competition.odds[0];

      const [fav, spreadStr] = odds.details.split(' ');
      let spread = Number(spreadStr);

      if (odds.details === 'EVEN') spread = 0;
      if (fav === gameData.away) spread = Math.abs(spread);

      gameData.odds = {
        spread: spread,
        ou: odds.overUnder ? odds.overUnder : 0
      }
    }

    if(competition.situation && state !== GameState.COMPLETE) {
      const tdb = TeamDB.getInstance();
      const possessionTeamID = competition.situation.possession ? competition.situation.possession : competition.situation.lastPlay.end.team.id;
      try {
        gameData.status = {
          displayClock: competition.status.displayClock,
          possession: tdb.fromID(Number(possessionTeamID)).data.abbr,
          possessionText: competition.situation.possessionText ? competition.situation.possessionText : '',
          shortDownDistanceText: competition.situation.shortDownDistanceText ? competition.situation.shortDownDistanceText : ''
        }
      } catch (e) {
        console.log(competition.situation);
        throw e;
      }
    }

    return gameData;
  }

  throw new Error("Attempted to create a game with no data.competitions");
}