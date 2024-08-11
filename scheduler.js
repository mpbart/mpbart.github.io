function zip(...arrays) {
  // Find the length of the shortest array
  const minLength = Math.min(...arrays.map(arr => arr.length));

  // Create an array of arrays where each sub-array contains elements at corresponding positions
  return Array.from({ length: minLength }, (_, i) => {
    return arrays.map(arr => arr[i]);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create a schedule where each team plays 14 games and does not play the same team back to back
function constructValidSchedule(schedule, pairs) {
  let count = 0;
  while (Object.values(schedule).some(games => games.includes(null))) {
    Object.keys(schedule).forEach(team => {
      schedule[team] = Array(14).fill(null);
    });

    shuffle(pairs).forEach(pair => {
      const [team1, team2] = pair;
      for (let i = 0; i < 14; i++) {
        if (schedule[team1][i] === null && schedule[team2][i] === null && schedule[team1][Math.max(i - 1, 0)] !== team2) {
          schedule[team1][i] = team2;
          schedule[team2][i] = team1;
          return;
        }
      }
    });

    count += 1;
  }
  console.log(`Took ${count} iterations to generate a valid schedule`);
  return schedule;
}

function validateSchedule(schedule) {
  Object.entries(schedule).forEach(([team, games]) => {
    games.slice(0, -1).forEach((game, i) => {
      if (games[i] === games[i + 1]) {
        console.log(`Team plays back to back games! ${team} plays ${games[i + 1]} on game ${i + 1} and ${games[i]} on game ${i}`);
      }
    });
  });
}

export function createSchedule(divisions) {
  const schedule = {};
  const teams = divisions.flat();

  teams.forEach(t => {
    schedule[t] = Array(14).fill(null);
  });

  let pairs = combinations_rb(teams, 2);
  pairs = pairs.concat(divisions).flatMap(div => combinations_rb(div, 2));
  pairs = pairs.concat(zip(shuffle(divisions[0]), shuffle(divisions[1])));
  pairs = pairs.concat(zip(shuffle(divisions[2]), shuffle(divisions[3])));

  const finalSchedule = constructValidSchedule(schedule, pairs);
  validateSchedule(finalSchedule);

  return finalSchedule;
}

function combinations_rb(array, r) {
  const result = [];
  function combine(arr, data, start, end, index) {
    if (index === r) {
      result.push([...data]);
      return;
    }
    for (let i = start; i <= end && end - i + 1 >= r - index; i++) {
      data[index] = arr[i];
      combine(arr, data, i + 1, end, index + 1);
    }
  }
  combine(array, Array(r), 0, array.length - 1, 0);
  return result;
}

export function generateOutput(numWeeks, schedule) {
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
    Object.keys(schedule).sort().forEach(team => {
        const row = document.createElement('tr');
        const teamCell = document.createElement('td');
        const boldText = document.createElement('b');
        boldText.textContent = team;
        teamCell.appendChild(boldText);
        row.appendChild(teamCell);

        for (let week = 0; week < numWeeks; week++) {
            const matchup = schedule[team][week];
            const cell = document.createElement('td');
            cell.innerText = matchup || '';
            row.appendChild(cell);
        }
        table.appendChild(row);
    });

    return table;
}
