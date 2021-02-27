const request = require("request");

function get_stream(url) {
  return new Promise((resolve) => {
    request(url, (e, r, b) => {
      try {
        const idx = b.indexOf("source: '") + 9;
        const idx2 = b.indexOf("'", idx);
        const stream = b.substring(idx, idx2);
        resolve(stream);
      } catch (error) {
        resolve();
      }
    });
  });
}

module.exports = { get_stream };
