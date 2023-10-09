import http from "http";
import express, { Express, response } from "express";
import morgan from "morgan";
import routes from "./routes/posts";
import Websocket from "./modules/websocket";
import { NFLData } from "./interfaces/nfl-api.interface";
import GameDB from "./modules/game-db";
import NFLAPI from "./modules/nfl-api";
import PickDB from "./modules/pick-db";

import fs from "fs";
import path from "path";

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
export const io = Websocket.getInstance(httpServer);
const PORT: any = process.env.PORT ?? 3000;
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`),
);

io.on("connection", (socket) => {
  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
});

async function main(): Promise<void> {
  const gdb = GameDB.getInstance();

  const nfldata: Array<NFLData[]> = [];
  let counter = 0;

  setInterval(() => {
    for (const promise of NFLAPI.getAllGamesArr()) {
      promise.then((result) => {
        return result.json();
      }).then((data) => {
        gdb.ingest(data.results);
      }).catch((e) => {
        console.error(`ERROR : Failed nfl api fetch: ${e}`);
      })
    }
  }, 10000);

  //setInterval(() => {
    // try {
      
    //   .subscribe( responses => {
    //     try {
    //       for (const response of responses) {
    //         response.json().then((data) => gdb.ingest(data.results)).catch();
    //       }

    //       const allResponsesPromises: Promise<NFLData>[] = [];
    //       for (const response of responses) {
    //         allResponsesPromises.push(response.json());
    //       }

    //       Promise.all(allResponsesPromises).then((datas) => {
    //         for (const data of datas) {
    //           gdb.ingest(data.results);
    //         }
    //       });
    //     } catch (e) {
    //       console.error(`ERROR (inside): Failed nfl api fetch: ${e}`);    
    //     }
    //   });
    // } catch (e) {
    //   console.error(`ERROR: Failed nfl api fetch: ${e}`);
    // }
  //}, 10000);

  // const pdb = PickDB.getInstance();
  // for (const pick of pdb.allPicks()) {
  //   console.log(pick.toString());
  // }
}

main().catch(console.error);

