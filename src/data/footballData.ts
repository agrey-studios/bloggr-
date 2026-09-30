export interface FootballMatch {
  id: string;
  league: string;
  leagueFlag: string;
  homeTeam: {
    name: string;
    shortName: string;
    logo: string;
    score: number;
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo: string;
    score: number;
  };
  status: 'LIVE' | 'FT' | 'UPCOMING';
  minute?: string; // e.g. "78'", "HT", "90+3'"
  startTime?: string; // e.g. "Today 20:45"
  stats?: {
    possession: [number, number]; // [home, away]
    shotsOnTarget: [number, number];
    totalShots: [number, number];
    corners: [number, number];
    fouls: [number, number];
    yellowCards: [number, number];
    redCards: [number, number];
  };
  events?: {
    minute: string;
    player: string;
    team: 'home' | 'away';
    type: 'goal' | 'yellow' | 'red' | 'sub';
  }[];
}

export interface FootballPrediction {
  id: string;
  matchId: string;
  fixture: string;
  league: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeProb: number; // e.g. 52
  drawProb: number; // e.g. 26
  awayProb: number; // e.g. 22
  expertVerdict: string;
  predictedScore: string;
  confidence: 'High' | 'Medium' | 'Speculative';
  keyInsight: string;
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  userVotes?: {
    home: number;
    draw: number;
    away: number;
  };
}

export const LIVE_FOOTBALL_MATCHES: FootballMatch[] = [
  {
    id: 'm-1',
    league: 'Premier League',
    leagueFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: {
      name: 'Arsenal',
      shortName: 'ARS',
      logo: '🔴',
      score: 2,
    },
    awayTeam: {
      name: 'Chelsea',
      shortName: 'CHE',
      logo: '🔵',
      score: 1,
    },
    status: 'LIVE',
    minute: "76'",
    stats: {
      possession: [58, 42],
      shotsOnTarget: [7, 3],
      totalShots: [15, 8],
      corners: [6, 2],
      fouls: [9, 12],
      yellowCards: [1, 3],
      redCards: [0, 0],
    },
    events: [
      { minute: "24'", player: 'B. Saka', team: 'home', type: 'goal' },
      { minute: "41'", player: 'C. Palmer', team: 'away', type: 'goal' },
      { minute: "68'", player: 'K. Havertz', team: 'home', type: 'goal' },
    ],
  },
  {
    id: 'm-2',
    league: 'FKF Premier League',
    leagueFlag: '🇰🇪',
    homeTeam: {
      name: 'Gor Mahia',
      shortName: 'GOR',
      logo: '🟢',
      score: 1,
    },
    awayTeam: {
      name: 'AFC Leopards',
      shortName: 'LEO',
      logo: '⚪',
      score: 0,
    },
    status: 'LIVE',
    minute: "84'",
    stats: {
      possession: [54, 46],
      shotsOnTarget: [5, 4],
      totalShots: [11, 9],
      corners: [5, 4],
      fouls: [14, 16],
      yellowCards: [2, 3],
      redCards: [0, 0],
    },
    events: [
      { minute: "53'", player: 'B. Omala', team: 'home', type: 'goal' },
    ],
  },
  {
    id: 'm-3',
    league: 'UEFA Champions League',
    leagueFlag: '🇪🇺',
    homeTeam: {
      name: 'Real Madrid',
      shortName: 'RMA',
      logo: '⚪',
      score: 3,
    },
    awayTeam: {
      name: 'Bayern Munich',
      shortName: 'BAY',
      logo: '🔴',
      score: 2,
    },
    status: 'FT',
    minute: 'FT',
    stats: {
      possession: [51, 49],
      shotsOnTarget: [9, 8],
      totalShots: [18, 16],
      corners: [7, 6],
      fouls: [11, 10],
      yellowCards: [2, 2],
      redCards: [0, 0],
    },
    events: [
      { minute: "12'", player: 'H. Kane', team: 'away', type: 'goal' },
      { minute: "35'", player: 'Vinicius Jr.', team: 'home', type: 'goal' },
      { minute: "62'", player: 'J. Bellingham', team: 'home', type: 'goal' },
      { minute: "74'", player: 'J. Musiala', team: 'away', type: 'goal' },
      { minute: "88'", player: 'Joselu', team: 'home', type: 'goal' },
    ],
  },
  {
    id: 'm-4',
    league: 'Premier League',
    leagueFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: {
      name: 'Manchester City',
      shortName: 'MCI',
      logo: '🩵',
      score: 0,
    },
    awayTeam: {
      name: 'Liverpool',
      shortName: 'LIV',
      logo: '🔴',
      score: 0,
    },
    status: 'UPCOMING',
    startTime: 'Today 20:30',
  },
  {
    id: 'm-5',
    league: 'FKF Premier League',
    leagueFlag: '🇰🇪',
    homeTeam: {
      name: 'Tusker FC',
      shortName: 'TUS',
      logo: '🟡',
      score: 2,
    },
    awayTeam: {
      name: 'Shabana FC',
      shortName: 'SHB',
      logo: '🔴',
      score: 2,
    },
    status: 'FT',
    minute: 'FT',
    stats: {
      possession: [50, 50],
      shotsOnTarget: [6, 6],
      totalShots: [13, 14],
      corners: [4, 5],
      fouls: [12, 13],
      yellowCards: [1, 2],
      redCards: [0, 0],
    },
  },
  {
    id: 'm-6',
    league: 'La Liga',
    leagueFlag: '🇪🇸',
    homeTeam: {
      name: 'Barcelona',
      shortName: 'BAR',
      logo: '🔵',
      score: 1,
    },
    awayTeam: {
      name: 'Atletico Madrid',
      shortName: 'ATM',
      logo: '🔴',
      score: 1,
    },
    status: 'LIVE',
    minute: "58'",
    stats: {
      possession: [64, 36],
      shotsOnTarget: [6, 2],
      totalShots: [14, 5],
      corners: [8, 1],
      fouls: [8, 15],
      yellowCards: [1, 4],
      redCards: [0, 0],
    },
    events: [
      { minute: "19'", player: 'L. Yamal', team: 'home', type: 'goal' },
      { minute: "44'", player: 'A. Griezmann', team: 'away', type: 'goal' },
    ],
  },
];

export const FOOTBALL_PREDICTIONS: FootballPrediction[] = [
  {
    id: 'pred-1',
    matchId: 'm-4',
    fixture: 'Manchester City vs Liverpool',
    league: 'Premier League',
    date: 'Today • 20:30 EAT',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    homeProb: 48,
    drawProb: 28,
    awayProb: 24,
    expertVerdict: 'Man City narrow win or high-scoring draw',
    predictedScore: '2 - 1',
    confidence: 'High',
    keyInsight: 'Pep Guardiola’s tactical control in the middle third usually creates overload opportunities against Liverpool’s high defensive line.',
    homeForm: ['W', 'W', 'D', 'W', 'W'],
    awayForm: ['W', 'D', 'W', 'W', 'L'],
    userVotes: {
      home: 412,
      draw: 180,
      away: 295,
    },
  },
  {
    id: 'pred-2',
    matchId: 'pred-fkf-1',
    fixture: 'Gor Mahia vs AFC Leopards',
    league: 'FKF Premier League',
    date: 'Weekend Derby • Nyayo Stadium',
    homeTeam: 'Gor Mahia',
    awayTeam: 'AFC Leopards',
    homeProb: 55,
    drawProb: 30,
    awayProb: 15,
    expertVerdict: 'Gor Mahia to capitalize on set-piece superiority',
    predictedScore: '1 - 0',
    confidence: 'High',
    keyInsight: 'K’Ogalo have conceded only 8 goals in 18 matches, giving them the defensive fortitude required to navigate high-stakes Mashemeji Derbies.',
    homeForm: ['W', 'W', 'W', 'D', 'W'],
    awayForm: ['D', 'W', 'L', 'W', 'D'],
    userVotes: {
      home: 680,
      draw: 210,
      away: 190,
    },
  },
  {
    id: 'pred-3',
    matchId: 'pred-ucl-2',
    fixture: 'Bayern Munich vs Arsenal',
    league: 'Champions League Quarter-Final 2nd Leg',
    date: 'Next Wednesday • Allianz Arena',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Arsenal',
    homeProb: 42,
    drawProb: 26,
    awayProb: 32,
    expertVerdict: 'High scoring clash with extra time likely',
    predictedScore: '2 - 2',
    confidence: 'Medium',
    keyInsight: 'Arsenal carry a 3-2 aggregate lead, but Harry Kane’s lethal finishing at the Allianz Arena presents a stern test for William Saliba and Gabriel.',
    homeForm: ['L', 'W', 'W', 'L', 'W'],
    awayForm: ['W', 'W', 'W', 'W', 'D'],
    userVotes: {
      home: 340,
      draw: 190,
      away: 410,
    },
  },
  {
    id: 'pred-4',
    matchId: 'pred-laliga-1',
    fixture: 'Real Madrid vs Athletic Bilbao',
    league: 'La Liga',
    date: 'Sunday • 22:00 EAT',
    homeTeam: 'Real Madrid',
    awayTeam: 'Athletic Bilbao',
    homeProb: 65,
    drawProb: 22,
    awayProb: 13,
    expertVerdict: 'Comfortable home victory for Los Blancos',
    predictedScore: '3 - 1',
    confidence: 'High',
    keyInsight: 'Real Madrid remain unbeaten at Santiago Bernabéu across all competitions this season with Vinicius Jr. hitting peak form.',
    homeForm: ['W', 'W', 'D', 'W', 'W'],
    awayForm: ['W', 'L', 'W', 'D', 'W'],
    userVotes: {
      home: 590,
      draw: 110,
      away: 75,
    },
  },
];
