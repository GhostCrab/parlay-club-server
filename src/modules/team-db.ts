import { ITeam, Team } from "../interfaces/team.interface";

class TeamDB {
  private static db: TeamDB;
  private static teams: ITeam[] = [
    new Team({ id:  0,    city: "PUSH",          name: "PUSH",       abbr: "PSH", iconURL: "https://api.iconify.design/mdi/equal.svg",                                           active: false}),
    new Team({ id: 22,    city: "ARIZONA",       name: "CARDINALS",  abbr: "ARI", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/5Mh3xcc8uAsxAi3WZvfEyQ_48x48.png", active: true}),
    new Team({ id:  1,    city: "ATLANTA",       name: "FALCONS",    abbr: "ATL", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/QNdwQPxtIRYUhnMBYq-bSA_48x48.png", active: true}),
    new Team({ id: 33,    city: "BALTIMORE",     name: "RAVENS",     abbr: "BAL", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/1vlEqqoyb9uTqBYiBeNH-w_48x48.png", active: true}),
    new Team({ id:  2,    city: "BUFFALO",       name: "BILLS",      abbr: "BUF", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/_RMCkIDTISqCPcSoEvRDhg_48x48.png", active: true}),
    new Team({ id: 29,    city: "CAROLINA",      name: "PANTHERS",   abbr: "CAR", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/HsLg5tW_S7566EbsMPlcVQ_48x48.png", active: true}),
    new Team({ id:  3,    city: "CHICAGO",       name: "BEARS",      abbr: "CHI", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/7uaGv3B13mXyBhHcTysHcA_48x48.png", active: true}),
    new Team({ id:  4,    city: "CINCINNATI",    name: "BENGALS",    abbr: "CIN", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/wDDRqMa40nidAOA5883Vmw_48x48.png", active: true}),
    new Team({ id:  5,    city: "CLEVELAND",     name: "BROWNS",     abbr: "CLE", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/bTzlW33n9s53DxRzmlZXyg_48x48.png", active: true}),
    new Team({ id:  6,    city: "DALLAS",        name: "COWBOYS",    abbr: "DAL", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/-zeHm0cuBjZXc2HRxRAI0g_48x48.png", active: true}),
    new Team({ id:  7,    city: "DENVER",        name: "BRONCOS",    abbr: "DEN", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/ZktET_o_WU6Mm1sJzJLZhQ_48x48.png", active: true}),
    new Team({ id:  8,    city: "DETROIT",       name: "LIONS",      abbr: "DET", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/WE1l856fyyHh6eAbbb8hQQ_48x48.png", active: true}),
    new Team({ id:  9,    city: "GREEN BAY",     name: "PACKERS",    abbr: "GB",  iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/IlA4VGrUHzSVLCOcHsRKgg_48x48.png", active: true}),
    new Team({ id: 34,    city: "HOUSTON",       name: "TEXANS",     abbr: "HOU", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/sSUn9HRpYLQtEFF2aG9T8Q_48x48.png", active: true}),
    new Team({ id: 11,    city: "INDIANAPOLIS",  name: "COLTS",      abbr: "IND", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/zOE7BhKadEjaSrrFjcnR4w_48x48.png", active: true}),
    new Team({ id: 30,    city: "JACKSONVILLE",  name: "JAGUARS",    abbr: "JAX", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/HLfqVCxzVx5CUDQ07GLeWg_48x48.png", active: true}),
    new Team({ id: 12,    city: "KANSAS CITY",   name: "CHIEFS",     abbr: "KC",  iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/5N0l1KbG1BHPyP8_S7SOXg_48x48.png", active: true}),
    new Team({ id: 13,    city: "LAS VEGAS",     name: "RAIDERS",    abbr: "LV",  iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/EAQRZu91bwn1l8brW9HWBQ_48x48.png", active: true}),
    new Team({ id: 14,    city: "LOS ANGELES",   name: "RAMS",       abbr: "LAR", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/CXW68CjwPIaUurbvSUSyJw_48x48.png", active: true}),
    new Team({ id: 24,    city: "LOS ANGELES",   name: "CHARGERS",   abbr: "LAC", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/1ysKnl7VwOQO8g94gbjKdQ_48x48.png", active: true}),
    new Team({ id: 15,    city: "MIAMI",         name: "DOLPHINS",   abbr: "MIA", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/Vmg4u0BSYZ-1Mc-5uyvxHg_48x48.png", active: true}),
    new Team({ id: 16,    city: "MINNESOTA",     name: "VIKINGS",    abbr: "MIN", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/z89hPEH9DZbpIYmF72gSaw_48x48.png", active: true}),
    new Team({ id: 17,    city: "NEW ENGLAND",   name: "PATRIOTS",   abbr: "NE",  iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/AC5-UEeN3V_fjkdFXtHWfQ_48x48.png", active: true}),
    new Team({ id: 18,    city: "NEW ORLEANS",   name: "SAINTS",     abbr: "NO",  iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/q8qdTYh-OWR5uO_QZxFENw_48x48.png", active: true}),
    new Team({ id: 19,    city: "NEW YORK",      name: "GIANTS",     abbr: "NYG", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/T4TxwDGkrCfTrL6Flg9ktQ_48x48.png", active: true}),
    new Team({ id: 20,    city: "NEW YORK",      name: "JETS",       abbr: "NYJ", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/QysqoqJQsTbiJl8sPL12Yg_48x48.png", active: true}),
    new Team({ id: 21,    city: "PHILADELPHIA",  name: "EAGLES",     abbr: "PHI", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/s4ab0JjXpDOespDSf9Z14Q_48x48.png", active: true}),
    new Team({ id: 23,    city: "PITTSBURGH",    name: "STEELERS",   abbr: "PIT", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/mdUFLAswQ4jZ6V7jXqaxig_48x48.png", active: true}),
    new Team({ id: 25,    city: "SAN FRANCISCO", name: "49ERS",      abbr: "SF",  iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/ku3s7M4k5KMagYcFTCie_g_48x48.png", active: true}),
    new Team({ id: 26,    city: "SEATTLE",       name: "SEAHAWKS",   abbr: "SEA", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/iVPY42GLuHmD05DiOvNSVg_48x48.png", active: true}),
    new Team({ id: 27,    city: "TAMPA BAY",     name: "BUCCANEERS", abbr: "TB",  iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/efP_3b5BgkGE-HMCHx4huQ_48x48.png", active: true}),
    new Team({ id: 10,    city: "TENNESSEE",     name: "TITANS",     abbr: "TEN", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/9J9dhhLeSa3syZ1bWXRjaw_48x48.png", active: true}),
    new Team({ id: 28,    city: "WASHINGTON",    name: "COMMANDERS", abbr: "WSH", iconURL: "https://ssl.gstatic.com/onebox/media/sports/logos/o0CCwss-QfFnJaVdGIHFmQ_48x48.png", active: true}),
    new Team({ id: 98,    city: "UNDER",         name: "UNDER",      abbr: "UND", iconURL: "https://api.iconify.design/mdi/chevron-double-down.svg",                             active: false}),
    new Team({ id: 99,    city: "OVER",          name: "OVER",       abbr: "OVR", iconURL: "https://api.iconify.design/mdi/chevron-double-up.svg",                               active: false}),
  ];

  private teamsByID: Record<number, ITeam> = {};
  private teamsByAbbr: Record<string, ITeam> = {};

  constructor() {
    for (const team of TeamDB.teams) {
      this.teamsByID[team.data.id] = team;
      this.teamsByAbbr[team.data.abbr] = team;
    }
  }

  public static getInstance(): TeamDB {
    if (!TeamDB.db) {
      TeamDB.db = new TeamDB();
    }

    return TeamDB.db;
  }

  public fromID(id: number): ITeam {
    if (id in this.teamsByID) return this.teamsByID[id];
  
    throw new Error("Unable to find team with id " + id.toString());
  }

  public fromAbbr(abbr: string): ITeam {
    if (abbr in this.teamsByAbbr) return this.teamsByAbbr[abbr];
  
    throw new Error("Unable to find team with abbr " + abbr);
  }
  
  public allActiveTeams(): ITeam[] {
    return TeamDB.teams.filter((a) => a.isActive());
  }
  
  public allTeams(): ITeam[] {
    return TeamDB.teams;
  }
}

export default TeamDB;
