import { Observable, from } from "rxjs";
import { IGame } from "../interfaces/game.interface";

class NFLAPI {
  private static apiUrl = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
  private static apiSearchParams = {
    limit: '1000',
    dates:  '2024',
    seasontype: '2',
  };

  public static getAllGames(): Promise<Response> {
    const url = new URL(this.apiUrl);
    for (const [key, value] of Object.entries(this.apiSearchParams)) {
      url.searchParams.set(key, value);
    }
    return fetch(url.href);
  }

  public static getGamesForWeek(week: number): Promise<Response> {
    const url = new URL(this.apiUrl);
    for (const [key, value] of Object.entries(this.apiSearchParams)) {
      url.searchParams.set(key, value);
    }
    url.searchParams.set("week", week.toString());
    
    return fetch(url.href);
  }

  public static getAllGamesArr(): Promise<Response>[] {
    const allWeekPromises: Promise<Response>[] = [];
    for (let week = 1; week <= 18; week++) {
      const url = new URL(this.apiUrl);
      for (const [key, value] of Object.entries(this.apiSearchParams)) {
        url.searchParams.set(key, value);
      }

      url.searchParams.set("week", week.toString());
      allWeekPromises.push(fetch(url.href));
    }

    return allWeekPromises;
  }

  public static getOdds(game: IGame): Promise<Response> {
    const url = new URL(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${game.data.id}/competitions/${game.data.id}/odds`);
    return fetch(url.href);
  }
}

export default NFLAPI;
