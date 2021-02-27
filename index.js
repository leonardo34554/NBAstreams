const express = require("express");
const addon = express();

const NodeCache = require("node-cache");
const cache = new NodeCache();

const { nbastreamsto } = require("./nbastreams");
const { get_streams } = require("./filter");

const TTL_GAMES = 60 * 60 * 6;
const TTL_STREAM = 60 * 30;

const MANIFEST = require("./manifest.json");
const META = require("./meta.json");

function respond(res, data) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(data);
}

addon.get("/manifest.json", (req, res) => {
  respond(res, MANIFEST);
});

addon.get("/catalog/:type/:id.json", async (req, res, next) => {
  if (!cache.get("games")) {
    cache.set("games", await nbastreamsto(), TTL_GAMES);
  }

  const games = cache.get("games");
  const metas = games.map((x) => {
    return {
      id: x.id,
      type: req.params.type,
      name: x.name,
    };
  });

  respond(res, { metas: metas });
});

addon.get("/stream/tv/:id.json", async (req, res) => {

  const id = req.params.id;
  const arr = id.substring(3).split(":");
  const game = arr[0];
  const title = arr[1];

  if (!cache.get(id)) {
    cache.set(id, await get_streams(game), TTL_STREAM);
  }

  const streams = cache.get(id);

  respond(res, {
    streams: streams.map((x) => ({ name: "NBAstreams", title: title, url: x })),
  });
});

addon.get("/meta/tv/:id.json", (req, res) => {
  respond(res, META);
});

addon.listen(process.env.PORT || 7000, () => {
  console.log("Add-on Repository URL: http://127.0.0.1:7000/manifest.json");
});
