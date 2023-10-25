import { Observable, from } from "rxjs";

class NFLAPI {
  private static apiUrl = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
  private static apiSearchParams = {
    limit: '1000',
    dates:  '2023',
    seasontype: '2',
  };

  public static getAllGames(): Observable<Response[]> {
    const allWeekPromises: Promise<Response>[] = [];
    for (let week = 1; week <= 18; week++) {
      const url = new URL(this.apiUrl);
      for (const [key, value] of Object.entries(this.apiSearchParams)) {
        url.searchParams.set(key, value);
      }

      url.searchParams.set("week", week.toString());
      allWeekPromises.push(fetch(url.href));
    }

    return from(Promise.all(allWeekPromises));
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
}

export default NFLAPI;
