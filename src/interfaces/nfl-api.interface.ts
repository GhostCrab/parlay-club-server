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
  // season:       EventSeason;
  week:         Week;
  competitions: NFLAPICompetition[];
  // links:        EventLink[];
  status:       Status;
  // weather?:     Weather;
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
  status:                Status;
  // broadcasts:            Broadcast[];
  // leaders?:              CompetitorLeader[];
  format:                Format;
  startDate:             string;
  // geoBroadcasts:         GeoBroadcast[];
  // headlines?:            Headline[];
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
  name?:            string;
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
  // provider:  Provider;
  details:   string;
  overUnder: number;
}

export interface Status {
  clock:        number;
  displayClock: string;
  period:       number;
  type:         StatusType;
}

export interface StatusType {
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
  Scheduled = "Scheduled",
}

export enum StatusName {
  StatusFinal = "STATUS_FINAL",
  StatusScheduled = "STATUS_SCHEDULED",
}

export enum StatusState {
  Post = "post",
  Pre = "pre",
}

export interface Week {
  number: number;
}