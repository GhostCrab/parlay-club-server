import http from "http";
import https from "https";
import express, { Express } from "express";
import morgan from "morgan";
import routes from "./routes/posts";
import Websocket from "./modules/websocket/websocket";
import { map } from "rxjs/operators";
import { NFLData, NFLResult } from "./interfaces/nfl-api.interface";

import { teams, teamsByAbbr } from "./interfaces/team-db.interface";
import { Game, addGames, games, IGame, gamesByWeekTeam } from "./interfaces/game-db.interface";

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

if (false) {
  const apiUrl =
    "https://metabet.static.api.areyouwatchingthis.com/api/odds.json";
  const apiSearchParams = {
    apiKey: "219f64094f67ed781035f5f7a08840fc",
    leagueCode: "FBP",
  };
  const allWeekPromises: Promise<Response>[] = [];
  for (let week = 1; week <= 18; week++) {
    const url = new URL(apiUrl);
    for (const [key, value] of Object.entries(apiSearchParams)) {
      url.searchParams.set(key, value);
    }

    url.searchParams.set("round", `Week ${week}`);
    allWeekPromises.push(fetch(url.href));
  }

  Promise.all(allWeekPromises).then((responses) => {
    const allResponsesPromises: Promise<NFLData>[] = [];
    for (const response of responses) {
      allResponsesPromises.push(response.json());;
    }

    Promise.all(allResponsesPromises).then((datas) => {
      for (const data of datas) {
        console.log(`Got Results ${data.results[0].round}`);
        addGames(data.results);
      }
      console.log(Object.values(games).length);

      //for (let i = 0; i < 3; i++) {
      //  console.log('====================================================');
      //  Object.values(games)[i].toString();
      //}

      fs.writeFile(dbPath, JSON.stringify(Object.values(games)), () => {});
    });
  });
}
