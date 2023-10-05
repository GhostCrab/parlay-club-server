export interface ITeam {
  id: number;
  name: string;
  city: string;
  abbr: string;
  iconURL: string;
  active: boolean;

  isActive(): boolean;
  isPush(): boolean;
  isOU(): boolean;
  toString(): string;
}

export class Team implements ITeam {
  public id: number;
  public name: string;
  public city: string;
  public abbr: string;
  public iconURL: string;
  public active: boolean;

  constructor(
    id: number,
    city: string,
    name: string,
    abbr: string,
    iconURL: string,
    active: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.city = city;
    this.abbr = abbr;
    this.iconURL = iconURL;
    this.active = active;
  }

  isActive(): boolean {
    return this.active;
  }

  isPush(): boolean {
    return this.name === "PUSH";
  }

  isOU(): boolean {
    return this.name === "OVER" || this.name === "UNDER";
  }

  toString(): string {
    return `${this.id}: ${this.city} ${this.name} [${this.abbr}]`;
  }
}

export const teams: Record<number, ITeam> = {
  0: new Team(
    0,
    "PUSH",
    "PUSH",
    "PSH",
    "https://api.iconify.design/mdi/equal.svg",
    false,
  ),
  1: new Team(
    1,
    "UNDER",
    "UNDER",
    "UND",
    "https://api.iconify.design/mdi/chevron-double-down.svg",
    false,
  ),
  2: new Team(
    2,
    "OVER",
    "OVER",
    "OVR",
    "https://api.iconify.design/mdi/chevron-double-up.svg",
    false,
  ),
  13307: new Team(
    13307,
    "ARIZONA",
    "CARDINALS",
    "ARI",
    "https://ssl.gstatic.com/onebox/media/sports/logos/5Mh3xcc8uAsxAi3WZvfEyQ_48x48.png",
    true,
  ),
  13308: new Team(
    13308,
    "ATLANTA",
    "FALCONS",
    "ATL",
    "https://ssl.gstatic.com/onebox/media/sports/logos/QNdwQPxtIRYUhnMBYq-bSA_48x48.png",
    true,
  ),
  13309: new Team(
    13309,
    "BALTIMORE",
    "RAVENS",
    "BAL",
    "https://ssl.gstatic.com/onebox/media/sports/logos/1vlEqqoyb9uTqBYiBeNH-w_48x48.png",
    true,
  ),
  13310: new Team(
    13310,
    "BUFFALO",
    "BILLS",
    "BUF",
    "https://ssl.gstatic.com/onebox/media/sports/logos/_RMCkIDTISqCPcSoEvRDhg_48x48.png",
    true,
  ),
  13311: new Team(
    13311,
    "CAROLINA",
    "PANTHERS",
    "CAR",
    "https://ssl.gstatic.com/onebox/media/sports/logos/HsLg5tW_S7566EbsMPlcVQ_48x48.png",
    true,
  ),
  13312: new Team(
    13312,
    "CHICAGO",
    "BEARS",
    "CHI",
    "https://ssl.gstatic.com/onebox/media/sports/logos/7uaGv3B13mXyBhHcTysHcA_48x48.png",
    true,
  ),
  13313: new Team(
    13313,
    "CINCINNATI",
    "BENGALS",
    "CIN",
    "https://ssl.gstatic.com/onebox/media/sports/logos/wDDRqMa40nidAOA5883Vmw_48x48.png",
    true,
  ),
  13314: new Team(
    13314,
    "CLEVELAND",
    "BROWNS",
    "CLE",
    "https://ssl.gstatic.com/onebox/media/sports/logos/bTzlW33n9s53DxRzmlZXyg_48x48.png",
    true,
  ),
  13315: new Team(
    13315,
    "DALLAS",
    "COWBOYS",
    "DAL",
    "https://ssl.gstatic.com/onebox/media/sports/logos/-zeHm0cuBjZXc2HRxRAI0g_48x48.png",
    true,
  ),
  13316: new Team(
    13316,
    "DENVER",
    "BRONCOS",
    "DEN",
    "https://ssl.gstatic.com/onebox/media/sports/logos/ZktET_o_WU6Mm1sJzJLZhQ_48x48.png",
    true,
  ),
  13317: new Team(
    13317,
    "DETROIT",
    "LIONS",
    "DET",
    "https://ssl.gstatic.com/onebox/media/sports/logos/WE1l856fyyHh6eAbbb8hQQ_48x48.png",
    true,
  ),
  13318: new Team(
    13318,
    "GREEN BAY",
    "PACKERS",
    "GB",
    "https://ssl.gstatic.com/onebox/media/sports/logos/IlA4VGrUHzSVLCOcHsRKgg_48x48.png",
    true,
  ),
  13319: new Team(
    13319,
    "HOUSTON",
    "TEXANS",
    "HOU",
    "https://ssl.gstatic.com/onebox/media/sports/logos/sSUn9HRpYLQtEFF2aG9T8Q_48x48.png",
    true,
  ),
  13320: new Team(
    13320,
    "INDIANAPOLIS",
    "COLTS",
    "IND",
    "https://ssl.gstatic.com/onebox/media/sports/logos/zOE7BhKadEjaSrrFjcnR4w_48x48.png",
    true,
  ),
  13321: new Team(
    13321,
    "JACKSONVILLE",
    "JAGUARS",
    "JAC",
    "https://ssl.gstatic.com/onebox/media/sports/logos/HLfqVCxzVx5CUDQ07GLeWg_48x48.png",
    true,
  ),
  13322: new Team(
    13322,
    "KANSAS CITY",
    "CHIEFS",
    "KC",
    "https://ssl.gstatic.com/onebox/media/sports/logos/5N0l1KbG1BHPyP8_S7SOXg_48x48.png",
    true,
  ),
  13323: new Team(
    13323,
    "LOS ANGELES",
    "CHARGERS",
    "LAC",
    "https://ssl.gstatic.com/onebox/media/sports/logos/EAQRZu91bwn1l8brW9HWBQ_48x48.png",
    true,
  ),
  13324: new Team(
    13324,
    "LOS ANGLES",
    "RAMS",
    "LAR",
    "https://ssl.gstatic.com/onebox/media/sports/logos/CXW68CjwPIaUurbvSUSyJw_48x48.png",
    true,
  ),
  13325: new Team(
    13325,
    "MIAMI",
    "DOLPHINS",
    "MIA",
    "https://ssl.gstatic.com/onebox/media/sports/logos/1ysKnl7VwOQO8g94gbjKdQ_48x48.png",
    true,
  ),
  13326: new Team(
    13326,
    "MINNESOTA",
    "VIKINGS",
    "MIN",
    "https://ssl.gstatic.com/onebox/media/sports/logos/Vmg4u0BSYZ-1Mc-5uyvxHg_48x48.png",
    true,
  ),
  13327: new Team(
    13327,
    "NEW ENGLAND",
    "PATRIOTS",
    "NE",
    "https://ssl.gstatic.com/onebox/media/sports/logos/z89hPEH9DZbpIYmF72gSaw_48x48.png",
    true,
  ),
  13328: new Team(
    13328,
    "NEW ORLEANS",
    "SAINTS",
    "NO",
    "https://ssl.gstatic.com/onebox/media/sports/logos/AC5-UEeN3V_fjkdFXtHWfQ_48x48.png",
    true,
  ),
  13329: new Team(
    13329,
    "NEW YORK",
    "GIANTS",
    "NYG",
    "https://ssl.gstatic.com/onebox/media/sports/logos/q8qdTYh-OWR5uO_QZxFENw_48x48.png",
    true,
  ),
  13330: new Team(
    13330,
    "NEW YORK",
    "JETS",
    "NYJ",
    "https://ssl.gstatic.com/onebox/media/sports/logos/T4TxwDGkrCfTrL6Flg9ktQ_48x48.png",
    true,
  ),
  13331: new Team(
    13331,
    "LAS VEGAS",
    "RAIDERS",
    "LV",
    "https://ssl.gstatic.com/onebox/media/sports/logos/QysqoqJQsTbiJl8sPL12Yg_48x48.png",
    true,
  ),
  13332: new Team(
    13332,
    "PHILADELPHIA",
    "EAGLES",
    "PHI",
    "https://ssl.gstatic.com/onebox/media/sports/logos/s4ab0JjXpDOespDSf9Z14Q_48x48.png",
    true,
  ),
  13333: new Team(
    13333,
    "PITTSBURGH",
    "STEELERS",
    "PIT",
    "https://ssl.gstatic.com/onebox/media/sports/logos/mdUFLAswQ4jZ6V7jXqaxig_48x48.png",
    true,
  ),
  13334: new Team(
    13334,
    "SAN FRANCISCO",
    "49ERS",
    "SF",
    "https://ssl.gstatic.com/onebox/media/sports/logos/ku3s7M4k5KMagYcFTCie_g_48x48.png",
    true,
  ),
  13335: new Team(
    13335,
    "SEATTLE",
    "SEAHAWKS",
    "SEA",
    "https://ssl.gstatic.com/onebox/media/sports/logos/iVPY42GLuHmD05DiOvNSVg_48x48.png",
    true,
  ),
  13336: new Team(
    13336,
    "TAMPA BAY",
    "BUCCANEERS",
    "TB",
    "https://ssl.gstatic.com/onebox/media/sports/logos/efP_3b5BgkGE-HMCHx4huQ_48x48.png",
    true,
  ),
  13337: new Team(
    13337,
    "TENNESSEE",
    "TITANS",
    "TEN",
    "https://ssl.gstatic.com/onebox/media/sports/logos/9J9dhhLeSa3syZ1bWXRjaw_48x48.png",
    true,
  ),
  13338: new Team(
    13338,
    "WASHINGTON",
    "COMMANDERS",
    "WAS",
    "https://ssl.gstatic.com/onebox/media/sports/logos/o0CCwss-QfFnJaVdGIHFmQ_48x48.png",
    true,
  ),
};

export const teamsByAbbr: Record<string, ITeam> = {};
for (const team of Object.values(teams)) {
  teamsByAbbr[team.abbr] = team;
}

export function fromName(name: string) {
  const capName = name.toUpperCase();
  for (const team of Object.values(teams)) {
    if (team.name === capName) return team;
  }

  throw new Error("Unable to find team with name " + name);
}

export function fromID(id: number) {
  if (id in teams) return teams[id];

  throw new Error("Unable to find team with id " + id.toString());
}

export function fromAmbig(input: ITeam | number | string) {
  switch (typeof input) {
    case "number":
      return fromID(input);
    case "string":
      return fromName(input);
  }

  return input;
}

export function allActiveTeams() {
  return Object.values(teams).filter((a) => a.isActive());
}

export function allTeams(includeOthers = false, abbrOnly = false) {
  const result = [];

  for (const team of Object.values(teams)) {
    if (includeOthers || !(team.isOU() || team.isPush())) {
      if (abbrOnly) {
        result.push(team.abbr);
      } else {
        result.push(team);
      }
    }
  }

  return result;
}
