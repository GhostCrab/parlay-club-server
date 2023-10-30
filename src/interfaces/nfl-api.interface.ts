export interface ScoreboardData {
  // leagues: League[];
  events:  NFLAPIEvent[];
}

export interface NFLAPIEvent {
  id:           string;
  uid:          string;
  date:         string;
  name:         string;
  shortName:    string;
  season:       EventSeason;
  week:         Week;
  competitions: NFLAPICompetition[];
  // links:        EventLink[];
  status:       NFLAPIStatus;
  // weather?:     Weather;
}

export interface EventSeason {
  slug: string;
  type: number;
  year: number;
}

export interface NFLAPICompetition {
  id:                    string;
  uid:                   string;
  date:                  string;
  attendance:            number;
  // type:                  CompetitionType;
  timeValid:             boolean;
  neutralSite:           boolean;
  conferenceCompetition: boolean;
  playByPlayAvailable:   boolean;
  recent:                boolean;
  // venue:                 CompetitionVenue;
  competitors:           NFLAPICompetitor[];
  // notes:                 Note[];
  status:                NFLAPIStatus;
  // broadcasts:            Broadcast[];
  // leaders?:              CompetitorLeader[];
  format:                Format;
  startDate:             string;
  // geoBroadcasts:         GeoBroadcast[];
  // headlines?:            Headline[];
  situation?:            NFLAPISituation;
  // tickets?:              Ticket[];
  odds?:                 Odds[];
}

export interface NFLAPICompetitor {
  id:          string;
  uid:         string;
  type:        string;
  order:       number;
  homeAway:    HomeAway;
  winner?:     boolean;
  team:        NFLAPITeam;
  score:       string;
  linescores?: Linescore[];
  statistics:  any[];
  // records?:    Record[];
  // leaders?:    CompetitorLeader[];
}

export enum HomeAway {
  Away = "away",
  Home = "home",
}

export interface Linescore {
  value: number;
}

export interface NFLAPITeam {
  id:               string;
  uid:              string;
  location:         string;
  name:            string;
  abbreviation:     string;
  displayName:      string;
  shortDisplayName: string;
  color?:           string;
  alternateColor?:  string;
  isActive:         boolean;
  // venue?:           TeamClass;
  // links:            TeamLink[];
  logo:             string;
}

export interface Format {
  regulation: Regulation;
}

export interface Regulation {
  periods: number;
}

export interface Odds {
  provider:  Provider;
  details:   string;
  overUnder?: number;
}

export interface NFLAPIStatus {
  clock:        number;
  displayClock: string;
  period:       number;
  type:         NFLAPIStatusType;
}

export interface NFLAPIStatusType {
  id:          string;
  name:        StatusName;
  state:       StatusState;
  completed:   boolean;
  description: StatusDescription;
  detail:      string;
  shortDetail: string;
  altDetail?:  StatusDetail;
}

export enum StatusDetail {
  Ot = "OT",
}

export enum StatusDescription {
  Final = "Final",
  InProgress = "In Progress",
  Scheduled = "Scheduled",
}

export enum StatusName {
  Final = "STATUS_FINAL",
  Scheduled = "STATUS_SCHEDULED",
  InProgress = "STATUS_IN_PROGRESS",
  EndPeriod = "STATUS_END_PERIOD",
  Halftime = "STATUS_HALFTIME",
}

export enum StatusState {
  Post = "post",
  Pre = "pre",
  In = "in"
}

export interface Week {
  number: number;
}

// Live Games
export interface NFLAPISituation {
  $ref:                   string;
  lastPlay:               LastPlay;
  down:                   number;
  yardLine:               number;
  distance:               number;
  isRedZone:              boolean;
  homeTimeouts:           number;
  awayTimeouts:           number;
  downDistanceText?:      string;
  shortDownDistanceText?: string;
  possessionText?:        string;
  possession?:            string;
}

export interface LastPlay {
  id:                string;
  type:              LastPlayType;
  text:              string;
  scoreValue:        number;
  team:              {id: string;};
  // probability:       Probability;
  drive:             Drive;
  start:             LastPlayEnd;
  end:               LastPlayEnd;
  statYardage:       number;
  // athletesInvolved?: AthletesInvolved[];
}

export interface Drive {
  description: string;
  start:       DriveEnd;
  end?:        DriveEnd;
  timeElapsed: TimeElapsed;
  result?:     string;
}

export interface DriveEnd {
  yardLine: number;
  text:     string;
}

export interface TimeElapsed {
  displayValue: string;
}

export interface LastPlayEnd {
  yardLine: number;
  team: {id: string;};
}

export interface LastPlayType {
  id:            string;
  text:          string;
  abbreviation?: string;
}

// Odds Query
export interface ESPNOdds {
  count:     number;
  pageIndex: number;
  pageSize:  number;
  pageCount: number;
  items:     Item[];
}

export interface Item {
  $ref:            string;
  provider:        Provider;
  details?:        string;
  overUnder?:      number;
  spread?:         number;
  overOdds?:       number;
  underOdds?:      number;
  awayTeamOdds?:   TeamOdds;
  homeTeamOdds?:   TeamOdds;
  links?:          any[];
  moneylineWinner: boolean;
  spreadWinner:    boolean;
  bettingOdds?:    BettingOdds;
}

export interface TeamOdds {
  favorite:   boolean;
  underdog:   boolean;
  moneyLine?: number;
  spreadOdds: number;
  team:       Team;
}

export interface Team {
  $ref: string;
}

export interface BettingOdds {
  homeTeam: Team;
  awayTeam: Team;
  teamOdds: { [key: string]: TeamOdd };
}

export interface TeamOdd {
  oddId:      string;
  value:      string;
  betSlipUrl: string;
}

export interface Provider {
  $ref:     string;
  id:       string;
  name:     string;
  priority: number;
}