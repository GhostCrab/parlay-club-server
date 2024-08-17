import http from "http";
import express, { Express, response } from "express";
import morgan from "morgan";
import routes from "./routes/posts";
import Websocket from "./modules/websocket";
import { ESPNOdds, ScoreboardData } from "./interfaces/nfl-api.interface";
import GameDB from "./modules/game-db";
import NFLAPI from "./modules/nfl-api";
import PickDB, { PickSetUpdate } from "./modules/pick-db";
import TeamDB from "./modules/team-db";
import { Pick, PickData } from "./interfaces/pick.interface";
import { ServerData } from "./controllers/posts";
import UserDB from "./modules/user-db";
import { Game, GameState, fromNFLAIPEvent } from "./interfaces/game.interface";

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
  socket.on("pick-update", (msg) => {
    const udb = UserDB.getInstance();
    const pdb = PickDB.getInstance();
    const tdb = TeamDB.getInstance();

    const data: PickSetUpdate = JSON.parse(msg);

    console.log(`Updating picks for ${udb.fromID(data.userID).data.name} Week ${data.week}:`);
    for (const pickData of data.picks) {
      const pick = new Pick(pickData);
      console.log(`  ${pick.game.toString()}: ${pick.team.data.abbr}`);
    }

    pdb.ingest(data);

    pdb.writeDB();

    emit('pick-update', {pickUpdate: data});
  });
});

interface WSMessage {
  msgId?: number;
  heartbeat?: string;
  pickUpdate?: PickSetUpdate;
  data?: ServerData;
}

export var msgId = 0;
function emit(topic: string, msg: WSMessage): void {
  msg.msgId = ++msgId;
  io.emit(topic, JSON.stringify(msg));
}

async function main(): Promise<void> {
  //populateDBs();

  const gdb = GameDB.getInstance();
  
  let timeSincePreviousUpdate = 0,
      timeSinceCurrentUpdate = 0,
      timeSinceFutureUpdate = 0;

  const updateWeeks: number[] = [];
  setInterval(() => {
    const currentWeek = GameDB.getCurrentWeek();
    const previousWeeks = Array.from({length:currentWeek-1},(v,k)=>k+1);
    const futureWeeks = Array.from({length:18-currentWeek},(v,k)=>k+currentWeek+1);
    const now = Date.now();

    // Update Previous Weeks Every 24 Hours
    if (now - timeSincePreviousUpdate > 24 * 60 * 60 * 1000) {
      timeSincePreviousUpdate = now;
      updateWeeks.push(...previousWeeks);
    }

    // Update Current Week Every 10 Seconds
    if (now - timeSinceCurrentUpdate > 10 * 1000) {
      timeSinceCurrentUpdate = now;
      updateWeeks.push(currentWeek);
    }

    // Update Future Weeks Every Hour
    if (now - timeSinceFutureUpdate > 60 * 60 * 1000) {
      timeSinceFutureUpdate = now;
      updateWeeks.push(...futureWeeks);
    }

    if (updateWeeks.length > 0) {
      var week: number | undefined;
      while (typeof (week = updateWeeks.shift()) !== "undefined") {
        let internalWeek = week;
        NFLAPI.getGamesForWeek(week).then((result) => {
          return result.json();
        }).then((data: ScoreboardData) => {
          const updatedGames = gdb.ingest(data.events.filter(data => data.season.year === 2024).map(data => fromNFLAIPEvent(data)));

          if (updatedGames.length) {
            gdb.writeDB();
  
            const message: ServerData = {games: updatedGames.map(game => game.data)}
            emit('game-update', {data: message});
          }
        }).catch((e) => {
          console.error(`ERROR : Failed nfl api fetch Week ${internalWeek}: ${e}`);
          updateWeeks.push(internalWeek);
        })
      }
    }
  }, 500);

  setInterval(() => {
    emit('heartbeat', {heartbeat: 'alive'});
  }, 10000);
}

main().catch(console.error);

function updateCurrentWeekOdds() {
  const db = GameDB.getInstance();

  const currentGames = db.allGames().filter(game => game.data.state === GameState.LOCKED);

  NFLAPI.getOdds(currentGames[0]).then((result) => {
    return result.json();
  }).then((data: ESPNOdds) => {
    for (const odds of data.items) {
      console.log(`${odds.provider.name}; ${odds.provider.priority}`);
    }
  }).catch((e) => {
    console.error(`ERROR : Failed nfl api fetch: ${e}`);
  })
}

function populateDBs() {
  const gdb = GameDB.getInstance();
  const pdb = PickDB.getInstance();
  const tdb = TeamDB.getInstance();

  const newPicks: PickData[] = [
    // {user: 6, game: gdb.fromWeekTeam(1, 'KC').data.id, team: tdb.fromAbbr('DET').data.id},
    // {user: 6, game: gdb.fromWeekTeam(1, 'KC').data.id, team: tdb.fromAbbr('UND').data.id},
  ];

  pdb.clear();
  for (const pick of newPicks) {
    pdb.addPick(pick);
  }

  pdb.writeDB();

  // gdb.fromWeekTeam(1, 'KC').updateOdds(-4, 52.5);
  // gdb.fromWeekTeam(1, 'PIT').updateOdds(2, 41.5);
  

  gdb.writeDB();
}