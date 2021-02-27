const request = require("request");
const { parse } = require("fast-html-parser");

function get_tunnel(link) {
  return new Promise((resolve) => {
    request(link, (e, r, b) => {
      try {
        const html = parse(b);
        const iframe = html.querySelectorAll(".embed-responsive-item")[1];
        const tunnel = iframe.rawAttributes.src;
        resolve(tunnel);
      } catch (error) {
        resolve();
      }
    });
  });
}

function get_link(tunnel) {
  return new Promise((resolve) => {
    request(tunnel, (e, r, b) => {
      try {
        const idx = b.indexOf("source: '") + 9;
        const idx2 = b.indexOf("'", idx);
        const link = b.substring(idx, idx2);
        resolve(link);
      } catch (error) {
        resolve();
      }
    });
  });
}

function get_stream(url) {
  return new Promise(async (resolve) => {
    const tunnel = await get_tunnel(url);
    const stream = tunnel ? await get_link(tunnel) : undefined;
    resolve(stream);
  });
}

module.exports = { get_stream };
