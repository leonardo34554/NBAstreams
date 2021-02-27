const request = require("request");

function get_key(link) {
  return new Promise((resolve) => {
    request(link, (e, r, b) => {
      try {
        const idx = b.indexOf('var vidgstream = "') + 18;
        const idx2 = b.indexOf('"', idx);
        const cut = b.substring(idx, idx2);
        const key = cut.replace("+", "%2B");
        resolve(key);
      } catch (error) {
        resolve();
      }
    });
  });
}

function get_link(key) {
  return new Promise((resolve) => {
    request(`http://liveonscore.tv/gethls.php?idgstream=${key}`, (e, r, b) => {
      try {
        const json = JSON.parse(b);
        const link = json.rawUrl;
        resolve(link);
      } catch (error) {
        resolve();
      }
    });
  });
}

function get_stream(url) {
  return new Promise(async (resolve) => {
    const key = await get_key(url);
    const stream = key ? await get_link(key) : undefined;
    resolve(stream);
  });
}

module.exports = { get_stream };

// (async () => {
//   const key = await get_key(
//     "http://liveonscore.tv/nba-stream/charlotte-hornets-vs-minnesota-timberwolves"
//   );
//   const stream = await get_stream(key);
//   console.log(stream);
// })();
