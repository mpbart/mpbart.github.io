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

export class Scheduler {
    constructor(divisions) {
        this.divisions = divisions
        console.log(divisions);
        this.teams = divisions.flat();
        this.numTeams = this.teams.length;
        this.schedule = {};
        this.numMatchupWeeks = 14;
        this.teamsPerDivision = 3;
        this.conferenceMatchups = 1;
        this.teams.forEach(team => {
          this.schedule[team] = this.blankSchedule();
        });
        this.divisionMap = this.createDivisionMap();
        this.conferenceMap = this.createConferenceMap();
    }

    blankSchedule() {
      return Array.from({ length: this.numMatchupWeeks }, () => null);
    }

    createDivisionMap() {
        const map = {};
        this.divisions.forEach((teams, index) => {
          teams.forEach(team => {
            map[team] = `Division ${index + 1}`;
          });
        });
        return map;
    }

    generateSchedule() {
        this.generateAllMatchups(0);
        this.generateDivisionMatchups(11);
        this.generateConferenceMatchups(11);
        console.log(this.schedule);
        this.shuffleWeeks();
        return this.schedule;
    }

    createConferenceMap() {
      return {
        'Division 1': 'Division 2',
        'Division 2': 'Division 1',
        'Division 3': 'Division 4',
        'Division 4': 'Division 3'
      };
    }

    generateAllMatchups(startWeek) {
        const c = new RingBuffer(Object.keys(this.schedule));
        let week = startWeek;
        for (let i = 0; i < this.numTeams - 1; i++) {
            c.getOpposites().forEach(([homeTeam, awayTeam]) => {
                this.schedule[homeTeam][week] = awayTeam;
                this.schedule[awayTeam][week] = homeTeam;
            });
            c.shift();
            week += 1;
        }
    }

    generateDivisionMatchups(startWeek) {
        this.divisions.forEach(teams => {
            combinations(teams, 2).forEach(matchup => {
                for (let i = startWeek; i < startWeek + 3; i++) {
                    if (this.schedule[matchup[0]][i] === null && this.schedule[matchup[1]][i] === null) {
                        this.schedule[matchup[0]][i] = matchup[1];
                        this.schedule[matchup[1]][i] = matchup[0];
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
            Object.keys(this.schedule).forEach(team => {
                if (this.schedule[team][week] === null) {
                    candidates[this.divisionMap[team]] = team;
                }
            });
            matchups.push([candidates['Division 1'], candidates['Division 2'], week]);
            matchups.push([candidates['Division 3'], candidates['Division 4'], week]);
        }

        console.log(matchups);
        matchups.forEach(([team1, team2, week]) => {
            this.schedule[team1][week] = team2;
            this.schedule[team2][week] = team1;
        });
    }

    shuffleWeeks() {
        const weeks = Array.from({ length: this.numMatchupWeeks }, (_, i) => i);
        weeks.sort(() => Math.random() - 0.5);
        weeks.forEach((week, idx) => {
            Object.keys(this.schedule).forEach(team => {
                const temp = this.schedule[team][idx];
                this.schedule[team][idx] = this.schedule[team][week];
                this.schedule[team][week] = temp;
            });
        });
    }

    generateOutput(numWeeks) {
      const table = document.createElement('table');
        table.className = 'schedule-table';

        // Create the header row
        const headerRow = document.createElement('tr');
        let headerCell = document.createElement('th');
        headerCell.innerText = 'Team';
        headerRow.appendChild(headerCell);

        for (let week = 0; week < numWeeks; week++) {
            headerCell = document.createElement('th');
            headerCell.innerText = `Week ${week + 1}`;
            headerRow.appendChild(headerCell);
        }
        table.appendChild(headerRow);

        // Create the rows for each team
        Object.keys(this.schedule).sort().forEach(team => {
            const row = document.createElement('tr');
            const teamCell = document.createElement('td');
            teamCell.innerText = team;
            row.appendChild(teamCell);

            for (let week = 0; week < numWeeks; week++) {
                const matchup = this.schedule[team][week];
                const cell = document.createElement('td');
                cell.innerText = matchup || '';
                row.appendChild(cell);
            }
            table.appendChild(row);
        });

        return table;
    }
}
