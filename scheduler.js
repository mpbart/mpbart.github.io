import { RingBuffer } from "./ring_buffer.js";

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const combinations = (arr, k) => {
    const result = [];
    const comb = (start, chosen) => {
        if (chosen.length === k) {
            result.push(chosen.slice());
            return;
        }
        for (let i = start; i < arr.length; i++) {
            chosen.push(arr[i]);
            comb(i + 1, chosen);
            chosen.pop();
        }
    };
    comb(0, []);
    return result;
};

// Conference 1
const XENU = ['Harsha', 'Pepoy', 'Johan'];
const SHIVA = ['Jack', 'Duhaime', 'Peter'];

// Conference 2
const YAHWEH = ['Pomeroy', 'Holbrook', 'Ali'];
const ALLAH = ['Varano', 'Nezich', 'Barton'];
const TEAMS = [...YAHWEH, ...XENU, ...SHIVA, ...ALLAH];

export class Scheduler {
    constructor() {
        this.numTeams = TEAMS.length;
        this.numMatchupWeeks = 14;
        this.teamsPerDivision = 3;
        this.conferenceMatchups = 1;
        this.conferenceMatchupWeek = randomInt(1, this.numMatchupWeeks - 2);
        this.teams = {};
        TEAMS.forEach(team => {
            this.teams[team] = this.blankSchedule();
        });
        this.divisionMap = this.createDivisionMap();
        this.conferenceMap = { 'YAHWEH': 'ALLAH', 'ALLAH': 'YAHWEH', 'XENU': 'SHIVA', 'SHIVA': 'XENU' };
        
        XENU.sort(() => Math.random() - 0.5);
        SHIVA.sort(() => Math.random() - 0.5);
        YAHWEH.sort(() => Math.random() - 0.5);
        ALLAH.sort(() => Math.random() - 0.5);
    }

    blankSchedule() {
        const schedule = {};
        for (let i = 0; i < this.numMatchupWeeks; i++) {
            schedule[i] = null;
        }
        return schedule;
    }

    createDivisionMap() {
        const d = {};
        XENU.forEach(team => d[team] = 'XENU');
        SHIVA.forEach(team => d[team] = 'SHIVA');
        YAHWEH.forEach(team => d[team] = 'YAHWEH');
        ALLAH.forEach(team => d[team] = 'ALLAH');
        return d;
    }

    generateSchedule() {
        this.generateAllMatchups(0);
        this.generateDivisionMatchups(11);
        this.generateConferenceMatchups(11);
        this.shuffleWeeks();
        return this.teams;
    }

    generateAllMatchups(startWeek) {
        const c = new RingBuffer(Object.keys(this.teams));
        let week = startWeek;
        for (let i = 0; i < this.numTeams - 1; i++) {
            c.getOpposites().forEach(([homeTeam, awayTeam]) => {
                this.teams[homeTeam][week] = awayTeam;
                this.teams[awayTeam][week] = homeTeam;
            });
            c.shift();
            week += 1;
        }
    }

    generateDivisionMatchups(startWeek) {
        [YAHWEH, ALLAH, SHIVA, XENU].forEach(teams => {
            combinations(teams, 2).forEach(matchup => {
                for (let i = startWeek; i < startWeek + 3; i++) {
                    if (this.teams[matchup[0]][i] === null && this.teams[matchup[1]][i] === null) {
                        this.teams[matchup[0]][i] = matchup[1];
                        this.teams[matchup[1]][i] = matchup[0];
                        break;
                    }
                }
            });
        });
    }

    generateConferenceMatchups(startWeek) {
        const matchups = [];
        for (let week = startWeek; week < startWeek + 3; week++) {
            const candidates = {};
            Object.keys(this.teams).forEach(team => {
                if (this.teams[team][week] === null) {
                    candidates[this.divisionMap[team]] = team;
                }
            });
            matchups.push([candidates['YAHWEH'], candidates['ALLAH'], week]);
            matchups.push([candidates['XENU'], candidates['SHIVA'], week]);
        }

        matchups.forEach(([team1, team2, week]) => {
            this.teams[team1][week] = team2;
            this.teams[team2][week] = team1;
        });
    }

    shuffleWeeks() {
        const weeks = Array.from({ length: this.numMatchupWeeks }, (_, i) => i);
        weeks.sort(() => Math.random() - 0.5);
        weeks.forEach((week, idx) => {
            Object.keys(this.teams).forEach(team => {
                const temp = this.teams[team][idx];
                this.teams[team][idx] = this.teams[team][week];
                this.teams[team][week] = temp;
            });
        });
    }

    display(numWeeks) {
        console.log("Team");
        for (let week = 0; week < numWeeks; week++) {
            process.stdout.write(`   ${week + 1}`);
            if (week === numWeeks - 1) console.log("");
        }
        Object.keys(this.teams).sort().forEach(team => {
            process.stdout.write(`  ${team}`);
            for (let week = 0; week < numWeeks; week++) {
                const matchup = this.teams[team][week];
                process.stdout.write(`   ${matchup}`);
                if (week === numWeeks - 1) console.log("");
            }
        });
    }
}
