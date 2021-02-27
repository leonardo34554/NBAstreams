const request = require("request");

function get_date() {
  const d = new Date();
  d.setHours(d.getHours() - 7);
  const date = d.toISOString().split("T")[0];
  return date;
}

function get_time(startTimestamp) {
  const d = new Date((parseInt(startTimestamp) - 18000) * 1000);
  const time = `${d.getUTCHours() % 12}:${
    d.getUTCMinutes() == 0 ? "00" : d.getUTCMinutes()
  }`;
  return time;
}

function nbastreamsto() {
  return new Promise((resolve) => {
    const date = get_date();
    request(
      `https://sportscentral.io/api/nba-tournaments?date=${date}`,
      (e, r, b) => {
        const json = JSON.parse(b);
        const nba = json[0];
        const events = nba.events;

        const live = [];
        events.forEach((x) => {
          live.push({
            name: `${x.name} @ ${get_time(x.startTimestamp)}PM EST`,
            id: `nba${x.id}:${x.name}`,
          });
        });
        console.log(live);
        resolve(live);
      }
    );
  });
}

module.exports = { nbastreamsto };
