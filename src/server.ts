import http from "http";
import express, { Express, response } from "express";
import morgan from "morgan";
import routes from "./routes/posts";
import Websocket from "./modules/websocket";
import { ScoreboardData } from "./interfaces/nfl-api.interface";
import GameDB from "./modules/game-db";
import NFLAPI from "./modules/nfl-api";
import PickDB, { PickSetUpdate } from "./modules/pick-db";
import TeamDB from "./modules/team-db";
import { Pick, PickData } from "./interfaces/pick.interface";
import { ServerData } from "./controllers/posts";
import UserDB from "./modules/user-db";
import { GameData, fixID } from "./interfaces/game.interface";

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

export let msgId = 0;
function emit(topic: string, msg: WSMessage): void {
  msg.msgId = ++msgId;
  io.emit(topic, JSON.stringify(msg));
}

async function main(): Promise<void> {
  const gdb = GameDB.getInstance();
  const pdb = PickDB.getInstance();
  const tdb = TeamDB.getInstance();

  const newPicks: PickData[] = [
    {user: 6, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 6, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 6, game: gdb.fromWeekTeam(1, 'CLE').data.gameID, team: tdb.fromAbbr('CIN').data.id},
    {user: 6, game: gdb.fromWeekTeam(1, 'ATL').data.gameID, team: tdb.fromAbbr('ATL').data.id},
    {user: 6, game: gdb.fromWeekTeam(1, 'LAC').data.gameID, team: tdb.fromAbbr('LAC').data.id},
    {user: 6, game: gdb.fromWeekTeam(1, 'CHI').data.gameID, team: tdb.fromAbbr('GB').data.id},
    {user: 6, game: gdb.fromWeekTeam(2, 'TEN').data.gameID, team: tdb.fromAbbr('LAC').data.id},
    {user: 6, game: gdb.fromWeekTeam(2, 'JAC').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 6, game: gdb.fromWeekTeam(2, 'NE').data.gameID, team: tdb.fromAbbr('MIA').data.id},
    {user: 6, game: gdb.fromWeekTeam(3, 'WAS').data.gameID, team: tdb.fromAbbr('BUF').data.id},
    {user: 6, game: gdb.fromWeekTeam(3, 'MIN').data.gameID, team: tdb.fromAbbr('LAC').data.id},
    {user: 6, game: gdb.fromWeekTeam(3, 'NYJ').data.gameID, team: tdb.fromAbbr('NE').data.id},
    {user: 6, game: gdb.fromWeekTeam(3, 'ARI').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 6, game: gdb.fromWeekTeam(3, 'CIN').data.gameID, team: tdb.fromAbbr('LAR').data.id},
    {user: 6, game: gdb.fromWeekTeam(4, 'GB').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 6, game: gdb.fromWeekTeam(4, 'SF').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 6, game: gdb.fromWeekTeam(5, 'SF').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 6, game: gdb.fromWeekTeam(5, 'BUF').data.gameID, team: tdb.fromAbbr('BUF').data.id},
    {user: 6, game: gdb.fromWeekTeam(5, 'MIN').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 6, game: gdb.fromWeekTeam(6, 'KC').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 6, game: gdb.fromWeekTeam(6, 'CLE').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 6, game: gdb.fromWeekTeam(6, 'NYJ').data.gameID, team: tdb.fromAbbr('PHI').data.id},
    {user: 6, game: gdb.fromWeekTeam(7, 'NO').data.gameID, team: tdb.fromAbbr('JAC').data.id},
    {user: 6, game: gdb.fromWeekTeam(7, 'NE').data.gameID, team: tdb.fromAbbr('BUF').data.id},
    {user: 6, game: gdb.fromWeekTeam(7, 'BAL').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 6, game: gdb.fromWeekTeam(7, 'PHI').data.gameID, team: tdb.fromAbbr('MIA').data.id},
    {user: 5, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 5, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 5, game: gdb.fromWeekTeam(1, 'NE').data.gameID, team: tdb.fromAbbr('PHI').data.id},
    {user: 5, game: gdb.fromWeekTeam(1, 'CHI').data.gameID, team: tdb.fromAbbr('CHI').data.id},
    {user: 5, game: gdb.fromWeekTeam(2, 'ATL').data.gameID, team: tdb.fromAbbr('GB').data.id},
    {user: 5, game: gdb.fromWeekTeam(2, 'LAR').data.gameID, team: tdb.fromAbbr('LAR').data.id},
    {user: 5, game: gdb.fromWeekTeam(3, 'SF').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 5, game: gdb.fromWeekTeam(3, 'DET').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 5, game: gdb.fromWeekTeam(4, 'LAC').data.gameID, team: tdb.fromAbbr('LAC').data.id},
    {user: 5, game: gdb.fromWeekTeam(4, 'LAC').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 5, game: gdb.fromWeekTeam(5, 'WAS').data.gameID, team: tdb.fromAbbr('WAS').data.id},
    {user: 5, game: gdb.fromWeekTeam(5, 'BUF').data.gameID, team: tdb.fromAbbr('BUF').data.id},
    {user: 5, game: gdb.fromWeekTeam(5, 'IND').data.gameID, team: tdb.fromAbbr('IND').data.id},
    {user: 5, game: gdb.fromWeekTeam(6, 'LV').data.gameID, team: tdb.fromAbbr('LV').data.id},
    {user: 5, game: gdb.fromWeekTeam(6, 'LAR').data.gameID, team: tdb.fromAbbr('LAR').data.id},
    {user: 5, game: gdb.fromWeekTeam(6, 'TB').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 5, game: gdb.fromWeekTeam(7, 'NYG').data.gameID, team: tdb.fromAbbr('NYG').data.id},
    {user: 5, game: gdb.fromWeekTeam(7, 'TB').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 5, game: gdb.fromWeekTeam(7, 'LAR').data.gameID, team: tdb.fromAbbr('LAR').data.id},
    {user: 4, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 4, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 4, game: gdb.fromWeekTeam(1, 'BAL').data.gameID, team: tdb.fromAbbr('HOU').data.id},
    {user: 4, game: gdb.fromWeekTeam(1, 'LAC').data.gameID, team: tdb.fromAbbr('LAC').data.id},
    {user: 4, game: gdb.fromWeekTeam(2, 'CAR').data.gameID, team: tdb.fromAbbr('CAR').data.id},
    {user: 4, game: gdb.fromWeekTeam(2, 'PIT').data.gameID, team: tdb.fromAbbr('CLE').data.id},
    {user: 4, game: gdb.fromWeekTeam(3, 'NYJ').data.gameID, team: tdb.fromAbbr('NYJ').data.id},
    {user: 4, game: gdb.fromWeekTeam(3, 'CIN').data.gameID, team: tdb.fromAbbr('LAR').data.id},
    {user: 4, game: gdb.fromWeekTeam(4, 'JAC').data.gameID, team: tdb.fromAbbr('ATL').data.id},
    {user: 4, game: gdb.fromWeekTeam(4, 'TEN').data.gameID, team: tdb.fromAbbr('CIN').data.id},
    {user: 4, game: gdb.fromWeekTeam(5, 'WAS').data.gameID, team: tdb.fromAbbr('WAS').data.id},
    {user: 4, game: gdb.fromWeekTeam(5, 'BUF').data.gameID, team: tdb.fromAbbr('JAC').data.id},
    {user: 4, game: gdb.fromWeekTeam(6, 'CIN').data.gameID, team: tdb.fromAbbr('SEA').data.id},
    {user: 4, game: gdb.fromWeekTeam(6, 'NYJ').data.gameID, team: tdb.fromAbbr('NYJ').data.id},
    {user: 4, game: gdb.fromWeekTeam(7, 'NO').data.gameID, team: tdb.fromAbbr('JAC').data.id},
    {user: 4, game: gdb.fromWeekTeam(7, 'BAL').data.gameID, team: tdb.fromAbbr('BAL').data.id},
    {user: 4, game: gdb.fromWeekTeam(7, 'MIN').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 3, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 3, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 3, game: gdb.fromWeekTeam(1, 'IND').data.gameID, team: tdb.fromAbbr('IND').data.id},
    {user: 3, game: gdb.fromWeekTeam(1, 'ATL').data.gameID, team: tdb.fromAbbr('ATL').data.id},
    {user: 3, game: gdb.fromWeekTeam(1, 'LAC').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 3, game: gdb.fromWeekTeam(2, 'ATL').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 3, game: gdb.fromWeekTeam(2, 'CIN').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 3, game: gdb.fromWeekTeam(3, 'BAL').data.gameID, team: tdb.fromAbbr('IND').data.id},
    {user: 3, game: gdb.fromWeekTeam(3, 'NYJ').data.gameID, team: tdb.fromAbbr('NE').data.id},
    {user: 3, game: gdb.fromWeekTeam(3, 'SEA').data.gameID, team: tdb.fromAbbr('CAR').data.id},
    {user: 3, game: gdb.fromWeekTeam(4, 'BUF').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 3, game: gdb.fromWeekTeam(4, 'CLE').data.gameID, team: tdb.fromAbbr('BAL').data.id},
    {user: 3, game: gdb.fromWeekTeam(4, 'LAC').data.gameID, team: tdb.fromAbbr('LAC').data.id},
    {user: 3, game: gdb.fromWeekTeam(5, 'MIA').data.gameID, team: tdb.fromAbbr('MIA').data.id},
    {user: 3, game: gdb.fromWeekTeam(5, 'NE').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 3, game: gdb.fromWeekTeam(5, 'LAR').data.gameID, team: tdb.fromAbbr('LAR').data.id},
    {user: 3, game: gdb.fromWeekTeam(6, 'KC').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 3, game: gdb.fromWeekTeam(6, 'CLE').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 3, game: gdb.fromWeekTeam(7, 'NO').data.gameID, team: tdb.fromAbbr('NO').data.id},
    {user: 3, game: gdb.fromWeekTeam(7, 'BAL').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 3, game: gdb.fromWeekTeam(7, 'LAR').data.gameID, team: tdb.fromAbbr('LAR').data.id},
    {user: 3, game: gdb.fromWeekTeam(7, 'DEN').data.gameID, team: tdb.fromAbbr('GB').data.id},
    {user: 2, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 2, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 2, game: gdb.fromWeekTeam(1, 'CLE').data.gameID, team: tdb.fromAbbr('CIN').data.id},
    {user: 2, game: gdb.fromWeekTeam(1, 'NE').data.gameID, team: tdb.fromAbbr('PHI').data.id},
    {user: 2, game: gdb.fromWeekTeam(2, 'JAC').data.gameID, team: tdb.fromAbbr('JAC').data.id},
    {user: 2, game: gdb.fromWeekTeam(2, 'JAC').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 2, game: gdb.fromWeekTeam(2, 'CIN').data.gameID, team: tdb.fromAbbr('CIN').data.id},
    {user: 2, game: gdb.fromWeekTeam(3, 'SF').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 2, game: gdb.fromWeekTeam(3, 'TB').data.gameID, team: tdb.fromAbbr('PHI').data.id},
    {user: 2, game: gdb.fromWeekTeam(4, 'GB').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 2, game: gdb.fromWeekTeam(4, 'CLE').data.gameID, team: tdb.fromAbbr('BAL').data.id},
    {user: 2, game: gdb.fromWeekTeam(5, 'WAS').data.gameID, team: tdb.fromAbbr('CHI').data.id},
    {user: 2, game: gdb.fromWeekTeam(5, 'PIT').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 2, game: gdb.fromWeekTeam(6, 'KC').data.gameID, team: tdb.fromAbbr('DEN').data.id},
    {user: 2, game: gdb.fromWeekTeam(6, 'CIN').data.gameID, team: tdb.fromAbbr('CIN').data.id},
    {user: 2, game: gdb.fromWeekTeam(6, 'CIN').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 2, game: gdb.fromWeekTeam(7, 'NO').data.gameID, team: tdb.fromAbbr('JAC').data.id},
    {user: 2, game: gdb.fromWeekTeam(7, 'TB').data.gameID, team: tdb.fromAbbr('ATL').data.id},
    {user: 2, game: gdb.fromWeekTeam(7, 'KC').data.gameID, team: tdb.fromAbbr('LAC').data.id},
    {user: 1, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 1, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 1, game: gdb.fromWeekTeam(1, 'ATL').data.gameID, team: tdb.fromAbbr('ATL').data.id},
    {user: 1, game: gdb.fromWeekTeam(1, 'SEA').data.gameID, team: tdb.fromAbbr('SEA').data.id},
    {user: 1, game: gdb.fromWeekTeam(2, 'DET').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 1, game: gdb.fromWeekTeam(2, 'NE').data.gameID, team: tdb.fromAbbr('MIA').data.id},
    {user: 1, game: gdb.fromWeekTeam(3, 'MIA').data.gameID, team: tdb.fromAbbr('MIA').data.id},
    {user: 1, game: gdb.fromWeekTeam(3, 'MIN').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 1, game: gdb.fromWeekTeam(4, 'PHI').data.gameID, team: tdb.fromAbbr('PHI').data.id},
    {user: 1, game: gdb.fromWeekTeam(4, 'BUF').data.gameID, team: tdb.fromAbbr('MIA').data.id},
    {user: 1, game: gdb.fromWeekTeam(5, 'SF').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 1, game: gdb.fromWeekTeam(5, 'BUF').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 1, game: gdb.fromWeekTeam(5, 'NE').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 1, game: gdb.fromWeekTeam(6, 'CIN').data.gameID, team: tdb.fromAbbr('CIN').data.id},
    {user: 1, game: gdb.fromWeekTeam(6, 'CHI').data.gameID, team: tdb.fromAbbr('OVR').data.id},
    {user: 1, game: gdb.fromWeekTeam(7, 'IND').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 1, game: gdb.fromWeekTeam(7, 'NYG').data.gameID, team: tdb.fromAbbr('WAS').data.id},
    {user: 0, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('DET').data.id},
    {user: 0, game: gdb.fromWeekTeam(1, 'KC').data.gameID, team: tdb.fromAbbr('UND').data.id},
    {user: 0, game: gdb.fromWeekTeam(1, 'PIT').data.gameID, team: tdb.fromAbbr('PIT').data.id},
    {user: 0, game: gdb.fromWeekTeam(1, 'NO').data.gameID, team: tdb.fromAbbr('NO').data.id},
    {user: 0, game: gdb.fromWeekTeam(2, 'LAR').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 0, game: gdb.fromWeekTeam(2, 'DAL').data.gameID, team: tdb.fromAbbr('DAL').data.id},
    {user: 0, game: gdb.fromWeekTeam(3, 'WAS').data.gameID, team: tdb.fromAbbr('BUF').data.id},
    {user: 0, game: gdb.fromWeekTeam(3, 'KC').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 0, game: gdb.fromWeekTeam(3, 'CIN').data.gameID, team: tdb.fromAbbr('CIN').data.id},
    {user: 0, game: gdb.fromWeekTeam(4, 'NO').data.gameID, team: tdb.fromAbbr('NO').data.id},
    {user: 0, game: gdb.fromWeekTeam(4, 'HOU').data.gameID, team: tdb.fromAbbr('PIT').data.id},
    {user: 0, game: gdb.fromWeekTeam(5, 'SF').data.gameID, team: tdb.fromAbbr('SF').data.id},
    {user: 0, game: gdb.fromWeekTeam(5, 'LAR').data.gameID, team: tdb.fromAbbr('PHI').data.id},
    {user: 0, game: gdb.fromWeekTeam(5, 'MIN').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 0, game: gdb.fromWeekTeam(6, 'KC').data.gameID, team: tdb.fromAbbr('KC').data.id},
    {user: 0, game: gdb.fromWeekTeam(6, 'CHI').data.gameID, team: tdb.fromAbbr('MIN').data.id},
    {user: 0, game: gdb.fromWeekTeam(6, 'LAC').data.gameID, team: tdb.fromAbbr('DAL').data.id},
    {user: 0, game: gdb.fromWeekTeam(7, 'NE').data.gameID, team: tdb.fromAbbr('BUF').data.id},
    {user: 0, game: gdb.fromWeekTeam(7, 'MIN').data.gameID, team: tdb.fromAbbr('MIN').data.id}
  ];

  pdb.clear();
  for (const pick of newPicks) {
    pdb.addPick(pick);
  }

  gdb.fromWeekTeam(1, 'KC').updateOdds(-4, 52.5);
  gdb.fromWeekTeam(1, 'PIT').updateOdds(2, 41.5);
  gdb.fromWeekTeam(1, 'CLE').updateOdds(2, 47.5);
  gdb.fromWeekTeam(1, 'MIN').updateOdds(-5.5, 45.5);
  gdb.fromWeekTeam(1, 'WAS').updateOdds(-7, 38);
  gdb.fromWeekTeam(1, 'IND').updateOdds(5, 46.5);
  gdb.fromWeekTeam(1, 'ATL').updateOdds(-3.5, 39.5);
  gdb.fromWeekTeam(1, 'BAL').updateOdds(-9.5, 43.5);
  gdb.fromWeekTeam(1, 'NO').updateOdds(-3, 41.5);
  gdb.fromWeekTeam(1, 'LAC').updateOdds(-3, 51);
  gdb.fromWeekTeam(1, 'NE').updateOdds(4, 45);
  gdb.fromWeekTeam(1, 'CHI').updateOdds(-1, 42);
  gdb.fromWeekTeam(1, 'DEN').updateOdds(-3.5, 44);
  gdb.fromWeekTeam(1, 'SEA').updateOdds(-5, 46.5);
  gdb.fromWeekTeam(1, 'NYG').updateOdds(3.5, 45.5);
  gdb.fromWeekTeam(1, 'NYJ').updateOdds(2.5, 45.5);
  gdb.fromWeekTeam(2, 'PHI').updateOdds(-6, 49);
  gdb.fromWeekTeam(2, 'TB').updateOdds(-2.5, 40.5);
  gdb.fromWeekTeam(2, 'TEN').updateOdds(3, 45);
  gdb.fromWeekTeam(2, 'JAC').updateOdds(3.5, 51);
  gdb.fromWeekTeam(2, 'HOU').updateOdds(1, 39);
  gdb.fromWeekTeam(2, 'ATL').updateOdds(1, 40.5);
  gdb.fromWeekTeam(2, 'BUF').updateOdds(-9, 47);
  gdb.fromWeekTeam(2, 'CIN').updateOdds(-3.5, 46);
  gdb.fromWeekTeam(2, 'DET').updateOdds(-5, 47);
  gdb.fromWeekTeam(2, 'LAR').updateOdds(8, 45);
  gdb.fromWeekTeam(2, 'ARI').updateOdds(5.5, 39.5);
  gdb.fromWeekTeam(2, 'DEN').updateOdds(-3.5, 39);
  gdb.fromWeekTeam(2, 'DAL').updateOdds(-9, 38.5);
  gdb.fromWeekTeam(2, 'NE').updateOdds(3, 46.5);
  gdb.fromWeekTeam(2, 'CAR').updateOdds(3, 40);
  gdb.fromWeekTeam(2, 'PIT').updateOdds(2.5, 38.5);
  gdb.fromWeekTeam(3, 'SF').updateOdds(-10, 44);
  gdb.fromWeekTeam(3, 'WAS').updateOdds(6.5, 43.5);
  gdb.fromWeekTeam(3, 'MIA').updateOdds(-6.5, 48.5);
  gdb.fromWeekTeam(3, 'MIN').updateOdds(0, 54);
  gdb.fromWeekTeam(3, 'BAL').updateOdds(-7.5, 45.5);
  gdb.fromWeekTeam(3, 'DET').updateOdds(-3, 46);
  gdb.fromWeekTeam(3, 'NYJ').updateOdds(2.5, 37);
  gdb.fromWeekTeam(3, 'GB').updateOdds(-2, 42.5);
  gdb.fromWeekTeam(3, 'JAC').updateOdds(-9, 44);
  gdb.fromWeekTeam(3, 'CLE').updateOdds(-3.5, 39.5);
  gdb.fromWeekTeam(3, 'SEA').updateOdds(-6, 42);
  gdb.fromWeekTeam(3, 'KC').updateOdds(-12.5, 47);
  gdb.fromWeekTeam(3, 'ARI').updateOdds(12.5, 43);
  gdb.fromWeekTeam(3, 'LV').updateOdds(-2.5, 43);
  gdb.fromWeekTeam(3, 'TB').updateOdds(5, 46);
  gdb.fromWeekTeam(3, 'CIN').updateOdds(-2.5, 43.5);
  gdb.fromWeekTeam(4, 'GB').updateOdds(1.5, 46);
  gdb.fromWeekTeam(4, 'JAC').updateOdds(-3, 43.5);
  gdb.fromWeekTeam(4, 'TEN').updateOdds(2.5, 41);
  gdb.fromWeekTeam(4, 'CHI').updateOdds(3.5, 46);
  gdb.fromWeekTeam(4, 'NO').updateOdds(-3.5, 40.5);
  gdb.fromWeekTeam(4, 'PHI').updateOdds(-8, 43.5);
  gdb.fromWeekTeam(4, 'BUF').updateOdds(-3, 54);
  gdb.fromWeekTeam(4, 'IND').updateOdds(-0.5, 47);
  gdb.fromWeekTeam(4, 'CLE').updateOdds(-2.5, 40);
  gdb.fromWeekTeam(4, 'HOU').updateOdds(3, 42.5);
  gdb.fromWeekTeam(4, 'CAR').updateOdds(4, 45);
  gdb.fromWeekTeam(4, 'LAC').updateOdds(-5, 48.5);
  gdb.fromWeekTeam(4, 'SF').updateOdds(-14, 44);
  gdb.fromWeekTeam(4, 'DAL').updateOdds(-7, 43);
  gdb.fromWeekTeam(4, 'NYJ').updateOdds(9.5, 42);
  gdb.fromWeekTeam(4, 'NYG').updateOdds(-1, 47);
  gdb.fromWeekTeam(5, 'WAS').updateOdds(-6, 44.5);
  gdb.fromWeekTeam(5, 'SF').updateOdds(-3.5, 45);
  gdb.fromWeekTeam(5, 'BUF').updateOdds(-5.5, 48.5);
  gdb.fromWeekTeam(5, 'MIA').updateOdds(-11, 48.5);
  gdb.fromWeekTeam(5, 'DET').updateOdds(-10, 44.5);
  gdb.fromWeekTeam(5, 'PIT').updateOdds(4, 38);
  gdb.fromWeekTeam(5, 'NE').updateOdds(-1, 40);
  gdb.fromWeekTeam(5, 'ATL').updateOdds(-2, 41.5);
  gdb.fromWeekTeam(5, 'IND').updateOdds(2, 43);
  gdb.fromWeekTeam(5, 'ARI').updateOdds(3, 44.5);
  gdb.fromWeekTeam(5, 'LAR').updateOdds(4.5, 50.5);
  gdb.fromWeekTeam(5, 'MIN').updateOdds(4, 52.5);
  gdb.fromWeekTeam(5, 'DEN').updateOdds(-1.5, 43);
  gdb.fromWeekTeam(5, 'LV').updateOdds(1, 44.5);
  gdb.fromWeekTeam(6, 'KC').updateOdds(-10.5, 47);
  gdb.fromWeekTeam(6, 'BUF').updateOdds(-14, 45);
  gdb.fromWeekTeam(6, 'TEN').updateOdds(4, 41);
  gdb.fromWeekTeam(6, 'CLE').updateOdds(7, 37);
  gdb.fromWeekTeam(6, 'JAC').updateOdds(-4, 45.5);
  gdb.fromWeekTeam(6, 'ATL').updateOdds(-2.5, 42);
  gdb.fromWeekTeam(6, 'MIA').updateOdds(-13.5, 48.5);
  gdb.fromWeekTeam(6, 'HOU').updateOdds(1.5, 42.5);
  gdb.fromWeekTeam(6, 'CIN').updateOdds(-3, 45);
  gdb.fromWeekTeam(6, 'CHI').updateOdds(2.5, 44.5);
  gdb.fromWeekTeam(6, 'LV').updateOdds(-3, 41);
  gdb.fromWeekTeam(6, 'LAR').updateOdds(-7, 48);
  gdb.fromWeekTeam(6, 'NYJ').updateOdds(7, 41);
  gdb.fromWeekTeam(6, 'TB').updateOdds(3.5, 43.5);
  gdb.fromWeekTeam(6, 'LAC').updateOdds(2.5, 50.5);
  gdb.fromWeekTeam(7, 'NO').updateOdds(-1, 39.5);
  gdb.fromWeekTeam(7, 'NE').updateOdds(8.5, 41);
  gdb.fromWeekTeam(7, 'IND').updateOdds(2.5, 40);
  gdb.fromWeekTeam(7, 'NYG').updateOdds(2.5, 39);
  gdb.fromWeekTeam(7, 'TB').updateOdds(-2.5, 37);
  gdb.fromWeekTeam(7, 'BAL').updateOdds(-3, 42.5);
  gdb.fromWeekTeam(7, 'CHI').updateOdds(3, 37.5);
  gdb.fromWeekTeam(7, 'SEA').updateOdds(-7.5, 44.5);
  gdb.fromWeekTeam(7, 'LAR').updateOdds(-3, 44);
  gdb.fromWeekTeam(7, 'KC').updateOdds(-5.5, 48);
  gdb.fromWeekTeam(7, 'DEN').updateOdds(1, 45);
  gdb.fromWeekTeam(7, 'PHI').updateOdds(-2.5, 51.5);
  gdb.fromWeekTeam(7, 'MIN').updateOdds(7, 44);
  gdb.fromWeekTeam(8, 'BUF').updateOdds(-9.5, 0);
  gdb.fromWeekTeam(8, 'WAS').updateOdds(4.5, 0);
  gdb.fromWeekTeam(8, 'TEN').updateOdds(-2, 0);
  gdb.fromWeekTeam(8, 'PIT').updateOdds(-0.5, 0);
  gdb.fromWeekTeam(8, 'NYG').updateOdds(-0.5, 0);
  gdb.fromWeekTeam(8, 'MIA').updateOdds(-4, 0);
  gdb.fromWeekTeam(8, 'DAL').updateOdds(-7, 0);
  gdb.fromWeekTeam(8, 'IND').updateOdds(2, 0);
  gdb.fromWeekTeam(8, 'CAR').updateOdds(-3, 0);
  gdb.fromWeekTeam(8, 'GB').updateOdds(-0.5, 0);
  gdb.fromWeekTeam(8, 'SEA').updateOdds(-1, 0);
  gdb.fromWeekTeam(8, 'SF').updateOdds(-1.5, 0);
  gdb.fromWeekTeam(8, 'DEN').updateOdds(4, 0);
  gdb.fromWeekTeam(8, 'ARI').updateOdds(6.5, 0);
  gdb.fromWeekTeam(8, 'LAC').updateOdds(-6, 0);
  gdb.fromWeekTeam(8, 'DET').updateOdds(-5, 0);

  setInterval(() => {
    for (const promise of NFLAPI.getAllGamesArr()) {
      promise.then((result) => {
        return result.json();
      }).then((data: ScoreboardData) => {
        const updatedGames = gdb.ingest(data.events);

        if (updatedGames.length) {
          gdb.writeDB();

          const message: ServerData = {games: updatedGames.map(game => game.data)}
          emit('game-update', {data: message});
        }
      }).catch((e) => {
        console.error(`ERROR : Failed nfl api fetch: ${e}`);
      })
    }
  }, 10000);

  setInterval(() => {
    emit('heartbeat', {heartbeat: 'alive'});
  }, 10000);
}

main().catch(console.error);

