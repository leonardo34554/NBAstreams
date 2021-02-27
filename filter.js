const request = require("request");
const { parse } = require("fast-html-parser");

const mappings = {
  "wpstream.tv": require("./sources/liveonscore").get_stream,
  "liveonscore.tv": require("./sources/liveonscore").get_stream,
  "givemenbastreams.com": require("./sources/givemenbastreams").get_stream,
  "hockeynews.site": require("./sources/hockeynews").get_stream,
  "fightpass.site": require("./sources/fightpass").get_stream,
  "acezports2.usite.pro": require("./sources/acezports2").get_stream,
  "ertech.work": require("./sources/ertech").get_stream,
};

function get_redirect(turl) {
  return new Promise((resolve) => {
    request(turl, (e, r, b) => {
      const idx = b.indexOf('("a.redirect").attr("href","') + 28;
      const idx2 = b.indexOf('"', idx);
      const provider = b.substring(idx, idx2);
      resolve(provider);
    });
  });
}

function get_sources(id) {
  return new Promise((resolve) => {
    request(
      `https://sportscentral.io/streams-table/${id}/basketball?new-ui=1&origin=nbastreams.to`,
      async (e, r, b) => {
        try {
          const html = parse(b);
          const tbody = html.querySelector("tbody");
          const tr = tbody.querySelectorAll("tr");

          const providers = await Promise.all(
            tr.map((x) => {
              const link = x.rawAttributes["data-stream-link"];
              return link.startsWith("https://tinyurl.is")
                ? get_redirect(link)
                : link;
            })
          );

          const srcs = [];
          providers.forEach((x) => {
            const idx = x.indexOf("//") + 2;
            const idx2 = x.indexOf("/", idx);
            const src = x.substring(idx, idx2);
            if (src in mappings) {
              srcs.push({ url: x, src: src });
            }
            //console.log(src);
          });
          resolve(srcs);
        } catch (error) {
          resolve([]);
        }
      }
    );
  });
}

function get_streams(id) {
  return new Promise(async (resolve) => {
    const sources = await get_sources(id);
    const streams = await Promise.all(
      sources.map((x) => mappings[x.src](x.url))
    );
    console.log(streams);
    resolve(streams);
  });
}

module.exports = { get_streams };
