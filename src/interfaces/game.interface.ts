import { fmt, postfmt } from "../modules/utility";
import { NFLAPICompetition, NFLAPIEvent, Odds } from "./nfl-api.interface";

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
  odds?: {
    spread: number;
    ou: number;
  }
  status?: {
    awayScore: number;
    homeScore: number;
    timeLeft: string;
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
    if (this.data.odds && this.data.odds.spread < 0)
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
      const modScore = this.homeScore() + this.data.odds.spread;
      if (modScore > this.awayScore())
        return this.data.home;
      return this.data.away;
    }

    return 'PSH';
  }

  public getOUResult() {
    if (this.data.odds && this.data.state >= GameState.ACTIVE) {
      const score = this.homeScore() + this.awayScore();
      if (score > this.data.odds.ou) return 'OVR';
      else if (score < this.data.odds.ou) return 'UND';
    }

    return 'PSH';
  }

  public homeScore(): number {
    return (this.data.status?.homeScore || 0);
  }

  public awayScore(): number {
    return (this.data.status?.awayScore || 0);
  }

  public toString(showWeek: boolean = false) {
    let homeInit = fmt(this.data.home, 3);
    let awayInit = fmt(this.data.away, 3);
    let week = fmt(this.getWeek().toString(), 2);
    let favInit = fmt(this.getFav(), 3);
    let weekStr = '';
    if (showWeek) weekStr = `WEEK ${fmt(this.getWeek().toString(), 2)} `;
    
    if (this.data.state >= GameState.ACTIVE) {
      let awayResult = `${awayInit} ${fmt(this.awayScore().toString(), 2)}`
      let homeResult = `${homeInit} ${fmt(this.homeScore().toString(), 2)}`
      if (this.getATSWinner() === this.data.home) {
        awayResult = ` ${awayResult} `;
        homeResult = `[${homeResult}]`;
      } else {
        awayResult = `[${awayResult}]`;
        homeResult = ` ${homeResult} `;
      }
      return `${weekStr}${awayInit} @ ${homeInit}: ${favInit} ${this.getSpread()} ${this.getOU()} | ${awayResult} ${homeResult} ${this.getOUResult().substring(0,1)} (${fmt((this.homeScore() + this.awayScore()).toString(), 2)})` 
    }
    
    return `${weekStr}${awayInit} @ ${homeInit}: ${favInit} ${this.getSpread()} ${this.getOU()}`
  }

  public update(data: GameData): boolean {
    let updated = false;
    const updates: string[] = [];
    /*
    // date: string;
    if (this.data.date !== data.date) {
      updates.push(`date: ${this.data.date} => ${data.date}`);

      this.data.date = data.date;
      updated = true;
    }
    // id: number;
    if (this.data.id !== data.id) {
      throw new Error("Attempted to update a game when gameID does not match");
    }
    // round: string;
    if (this.data.round !== data.round) {
      throw new Error("Attempted to update a game when round does not match");
    }
    // sport: string;
    if (this.data.sport !== data.sport) {
      if (!onlyImportant) updates.push(`sport: ${this.data.sport} => ${data.sport}`);

      this.data.sport = data.sport;
      updated = true;
    }
    // team1City: string;
    if (this.data.team1City !== data.team1City) {
      throw new Error("Attempted to update a game when team1City does not match");
    }
    // team1Color: string;
    if (this.data.team1Color !== data.team1Color){
      throw new Error("Attempted to update a game when team1Color does not match");
    }
    // team1ID: number;
    if (this.data.team1ID !== data.team1ID){
      throw new Error("Attempted to update a game when team1ID does not match");
    }
    // team1Initials: string;
    if (this.data.team1Initials !== data.team1Initials){
      throw new Error("Attempted to update a game when team1Initials does not match");
    }
    // team1Name: string;
    if (this.data.team1Name !== data.team1Name){
      throw new Error("Attempted to update a game when team1Name does not match");
    }
    // team1Score?: number;
    if (this.data.team1Score !== data.team1Score){
      updates.push(`team1Score: ${this.data.team1Score} => ${data.team1Score}`);

      this.data.team1Score = data.team1Score;
      updated = true;
      important = true;
    }
    // team2City: string;
    if (this.data.team2City !== data.team2City){
      throw new Error("Attempted to update a game when team2City does not match");
    }
    // team2Color: string;
    if (this.data.team2Color !== data.team2Color){
      throw new Error("Attempted to update a game when team2Color does not match");
    }
    // team2ID: number;
    if (this.data.team2ID !== data.team2ID){
      throw new Error("Attempted to update a game when team2ID does not match");
    }
    // team2Initials: string;
    if (this.data.team2Initials !== data.team2Initials){
      throw new Error("Attempted to update a game when team2Initials does not match");
    }
    // team2Name: string;
    if (this.data.team2Name !== data.team2Name){
      throw new Error("Attempted to update a game when team2Name does not match");
    }
    // team2Score?: number;
    if (this.data.team2Score !== data.team2Score){
      updates.push(`team2Score: ${this.data.team2Score} => ${data.team2Score}`);

      this.data.team2Score = data.team2Score;
      updated = true;
      important = true;
    }
    // time?: number;
    if (this.data.time !== data.time){
      updates.push(`time: ${this.data.time} => ${data.time}`);

      this.data.time = data.time;
      updated = true;
      important = true;
    }
    // timeLeft?: string;
    if (this.data.timeLeft !== data.timeLeft){
      updates.push(`timeLeft: ${this.data.timeLeft} => ${data.timeLeft}`);

      this.data.timeLeft = data.timeLeft;
      updated = true;
      important = true;      
    }

    // odds: NFLOdds[];
    if (Date.now() < this.oddsCutoffDate.getTime()) {
      if (this.data.odds.length === 0 && data.odds.length === 1) {
        updates.push(`odds: spread 0 => ${data.odds[0].spread} ou 0 => ${data.odds[0].overUnder}`);

        this.data.odds = data.odds;
        updated = true;
        important = true;
      } else if (this.data.odds.length === 1 && data.odds.length === 1) {
        const oldOdds = this.data.odds[0],
              newOdds = data.odds[0];
        
        // date: number;
        if (oldOdds.date !== newOdds.date) {
          if (!onlyImportant) updates.push(`odds-date: ${oldOdds.date} => ${newOdds.date}`);

          oldOdds.date = newOdds.date;
          updated = true;
        }
        // moneyLine1: number;
        if (oldOdds.moneyLine1 !== newOdds.moneyLine1) {
          if (!onlyImportant) updates.push(`odds-moneyLine1: ${oldOdds.moneyLine1} => ${newOdds.moneyLine1}`);

          oldOdds.moneyLine1 = newOdds.moneyLine1;
          updated = true;
        }
        // moneyLine2: number;
        if (oldOdds.moneyLine2 !== newOdds.moneyLine2) {
          if (!onlyImportant) updates.push(`odds-moneyLine2: ${oldOdds.moneyLine2} => ${newOdds.moneyLine2}`);

          oldOdds.moneyLine2 = newOdds.moneyLine2;
          updated = true;
        }
        // overUnder: number;
        if (oldOdds.overUnder !== newOdds.overUnder) {
          updates.push(`odds-overUnder: ${oldOdds.overUnder} => ${newOdds.overUnder}`);

          oldOdds.overUnder = newOdds.overUnder;
          updated = true;
          important = true;
        }
        // overUnderLineOver: number;
        if (oldOdds.overUnderLineOver !== newOdds.overUnderLineOver) {
          if (!onlyImportant) updates.push(`odds-overUnderLineOver: ${oldOdds.overUnderLineOver} => ${newOdds.overUnderLineOver}`);

          oldOdds.overUnderLineOver = newOdds.overUnderLineOver;
          updated = true;
        }
        // overUnderLineUnder: number;
        if (oldOdds.overUnderLineUnder !== newOdds.overUnderLineUnder) {
          if (!onlyImportant) updates.push(`odds-overUnderLineUnder: ${oldOdds.overUnderLineUnder} => ${newOdds.overUnderLineUnder}`);

          oldOdds.overUnderLineUnder = newOdds.overUnderLineUnder;
          updated = true;
        }
        // provider: string;
        if (oldOdds.provider !== newOdds.provider) {
          throw new Error("Attempted to update a game when odds provider does not match");
        }
        // spread: number;
        if (oldOdds.spread !== newOdds.spread) {
          updates.push(`odds-spread: ${oldOdds.spread.toString()} => ${newOdds.spread.toString()}`);

          oldOdds.spread = newOdds.spread;
          updated = true;
          important = true;        
        }
        // spreadLine1: number;
        if (oldOdds.spreadLine1 !== newOdds.spreadLine1) {
          if (!onlyImportant) updates.push(`odds-spreadLine1: ${oldOdds.spreadLine1} => ${newOdds.spreadLine1}`);

          oldOdds.spreadLine1 = newOdds.spreadLine1;
          updated = true;
        }
        // spreadLine2: number;
        if (oldOdds.spreadLine2 !== newOdds.spreadLine2) {
          if (!onlyImportant) updates.push(`odds-spreadLine2: ${oldOdds.spreadLine2} => ${newOdds.spreadLine2}`);

          oldOdds.spreadLine2 = newOdds.spreadLine2;
          updated = true;
        }
      }
    }

    if (updates.length) {
      console.log(`${this.toString(true)} UPDATES:`)
      for (const update of updates)
        console.log(`  ${update}`);
    }
    */

    return updated;
  }

  updateOdds(spread: number, ou: number): void {
    if (this.data.state >= GameState.LOCKED)
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
    if (this.data.state === GameState.PRE) {
      if (Date.now() >= this.oddsCutoffDate.getTime()) {
        this.data.state = GameState.LOCKED;
      }
    }

    if (this.data.state <= GameState.LOCKED) {
      if (Date.now() >= this.date.getTime()) {
        this.data.state = GameState.ACTIVE;
      }
    }
  }
}

export function fromNFLAIPEvent(data: NFLAPIEvent): GameData {
  if (data.competitions && data.competitions.length > 0) {
    const competition = data.competitions[0];
    let state = GameState.PRE;

    if (competition.status.type.name === 'STATUS_FINAL')
      state = GameState.COMPLETE;

    return {
      id: Number(competition.id),
      date: competition.date,
      week: data.week.number,
      away: competition.competitors[0].team.abbreviation,
      home: competition.competitors[1].team.abbreviation,
      state: state,
      status: {
        awayScore: Number(competition.competitors[0].score),
        homeScore: Number(competition.competitors[1].score),
        timeLeft: competition.status.displayClock
      }
    }
  }

  throw new Error("Attempted to create a game with no data.competitions");
}