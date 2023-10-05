import { Observable, from } from "rxjs";
import { NFLData } from "../interfaces/nfl-api.interface";

class NFLAPI {
  private static apiUrl = "https://metabet.static.api.areyouwatchingthis.com/api/odds.json";
  private static apiSearchParams = {
    apiKey: "219f64094f67ed781035f5f7a08840fc",
    leagueCode: "FBP",
  };

  public static getAllGames(): Observable<Response[]> {
    const allWeekPromises: Promise<Response>[] = [];
    for (let week = 1; week <= 18; week++) {
      const url = new URL(this.apiUrl);
      for (const [key, value] of Object.entries(this.apiSearchParams)) {
        url.searchParams.set(key, value);
      }

      url.searchParams.set("round", `Week ${week}`);
      allWeekPromises.push(fetch(url.href));
    }

    return from(Promise.all(allWeekPromises));

    // Promise.all(allWeekPromises).then((responses) => {
    //   const allResponsesPromises: Promise<NFLData>[] = [];
    //   for (const response of responses) {
    //     allResponsesPromises.push(response.json());
    //   }

    //   Promise.all(allResponsesPromises).then((datas) => {
    //     for (const data of datas) {
    //       console.log(`Got Results ${data.results[0].round}`);
    //       addGames(data.results);
    //     }
    //     console.log(Object.values(games).length);

    //     //for (let i = 0; i < 3; i++) {
    //     //  console.log('====================================================');
    //     //  Object.values(games)[i].toString();
    //     //}

    //     //fs.writeFile(dbPath, JSON.stringify(Object.values(games)), () => {});
    //   });
    // });
  }
}

export default NFLAPI;
