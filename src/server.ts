import http from "http";
import https from "https";
import express, { Express } from "express";
import morgan from "morgan";
import routes from "./routes/posts";
import Websocket from "./modules/websocket/websocket";
import { map } from "rxjs/operators";
import { NFLData } from "./interfaces/nfl-api.interface";
import fs from "fs";

import { teams, teamsByAbbr } from "./interfaces/team-db.interface";
import { Game, addGames, games } from "./interfaces/game-db.interface";

const router: Express = express();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Logging */
router.use(morgan("dev"));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
  // set the CORS policy
  res.header("Access-Control-Allow-Origin", "*");
  // set the CORS headers
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With,Content-Type,Accept, Authorization",
  );
  // set the CORS method headers
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
    return res.status(200).json({});
  }
  next();
});

/** Routes */
router.use("/", routes);

/** Error handling */
router.use((req, res, next) => {
  const error = new Error("not found");
  return res.status(404).json({
    message: error.message,
  });
});

/** Server */
const httpServer = http.createServer(router);
const io = Websocket.getInstance(httpServer);
const PORT: any = process.env.PORT ?? 3000;
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`),
);

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

//initialize
const apiUrl =
  "https://metabet.static.api.areyouwatchingthis.com/api/odds.json";
const apiSearchParams = {
  apiKey: "219f64094f67ed781035f5f7a08840fc",
  leagueCode: "FBP",
};

// https.get(url.href, (response) => {
//   response.on('data', data => {
//     console.log(data);
//   })
// });

fs.readFile("/home/pi/db/games", (err, data) => {});

const allWeekPromises: Promise<Response>[] = [];
for (let week = 1; week <= 18; week++) {
  const url = new URL(apiUrl);
  for (const [key, value] of Object.entries(apiSearchParams)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("round", `Week ${week}`);

  // fetch(url.href).then((response) => {
  //   response.json().then((data: NFLData) => {
  //     console.log(`Got Results Week ${week}`);
  //     addGames(data.results);
  //     resultCount++;
  //   });
  // });

  allWeekPromises.push(fetch(url.href));
}

Promise.all(allWeekPromises).then((responses) => {
  for (const response of responses) {
    response.json().then((data: NFLData) => {
      console.log(`Got Results ${data.results[0].round}`);
      addGames(data.results);
    });
  }
});

//fs.writeFile('/home/pi/db/games', JSON.stringify(data.results), ()=>{});

console.log(Object.values(games).length);

// http.get(url.href).pipe(
//   map((data) => {
//     const newGames: IParlayGame[] = [];
//     const updatedGames: IParlayGame[] = [];
//     for (const result of data.results) {
//       try {
//         const dbGame = this.gamedb.fromTeamDate(
//           result.team2Name,
//           result.date
//         );
//         const refGame = new ParlayGame(
//           result.team2Name,
//           result.team1Name,
//           result.date,
//           this.teamdb
//         );
//         refGame.updateFromAPI(result);
//         refGame.updateOddsFromAPI(result);
//         dbGame.updateAll(refGame);
//         updatedGames.push(dbGame);
//       } catch (e) {
//         const newGame = new ParlayGame(
//           result.team2Name,
//           result.team1Name,
//           result.date,
//           this.teamdb
//         );
//         newGame.updateFromAPI(result);
//         newGame.updateOddsFromAPI(result);
//         console.log(`Adding new game: ${newGame.toString()}`);
//         newGames.push(newGame);
//       }
//     }
//     this.gamesSub$.next([...newGames, ...updatedGames])
//     return [newGames, updatedGames];
//   })
// );
