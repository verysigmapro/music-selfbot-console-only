"use strict";

const Net = require("net");
const Fs = require("fs");
const { AudioDir, SockPath, Msg, MaxTracks, ListAudio, EncodeFrame, NowMs } = require("./shared");

const LeadMs = 250;
const HttpHost = process.env.BIND || "127.0.0.1";
const HttpPort = Number(process.env.PORT) || 3000;
const IsPipe = process.platform === "win32";
const Ok = '{"s":1}';
const Fail = '{"s":0}';

if (!IsPipe) {
  try { Fs.unlinkSync(SockPath); } catch {}
}

const Clients = new Set();
let TrackCount = ListAudio().length;

const Broadcast = (Type, TrackIdx = 0, TargetTime = 0) => {
  const Frame = EncodeFrame(Type, TrackIdx, TargetTime);
  for (const Sock of Clients) Sock.write(Frame);
};

const RefreshIndex = () => {
  TrackCount = ListAudio().length;
  Broadcast(Msg.Update);
};

let WatchTimer = null;
try {
  Fs.watch(AudioDir, () => {
    clearTimeout(WatchTimer);
    WatchTimer = setTimeout(RefreshIndex, 100);
  });
} catch {}

const SockServer = Net.createServer(Sock => {
  Clients.add(Sock);
  Sock.on("close", () => Clients.delete(Sock));
  Sock.on("error", () => {});
});
SockServer.listen(SockPath);

const Json = (Body, Status = 200) =>
  new Response(Body, { status: Status, headers: { "Content-Type": "application/json" } });

const Server = Bun.serve({
  hostname: HttpHost,
  port: HttpPort,
  async fetch(Req) {
    if (Req.headers.has("origin")) return Json(Fail, 403);

    const Url = Req.url;
    const Start = Url.indexOf("/", 8);
    const Path = Start === -1 ? "/" : Url.slice(Start).split("?", 1)[0];

    switch (Path) {
      case "/join":   Broadcast(Msg.Join); return Json(Ok);
      case "/stop":   Broadcast(Msg.Stop); return Json(Ok);
      case "/update": RefreshIndex(); return Json(Ok);
    }

    if (Path === "/play" || Path.startsWith("/play/")) {
      const Idx = Path.length > 5
        ? Number(Path.slice(6))
        : new Uint8Array(await Req.arrayBuffer())[0];
      if (Number.isInteger(Idx) && Idx >= 0 && Idx < TrackCount && Idx < MaxTracks) {
        Broadcast(Msg.Play, Idx, NowMs() + LeadMs);
      }
      return Json(Ok);
    }
    return Json(Fail, 404);
  },
});

const Shutdown = () => {
  Server.stop(true);
  SockServer.close();
  if (!IsPipe) {
    try { Fs.unlinkSync(SockPath); } catch {}
  }
  process.exit(0);
};
process.on("SIGINT", Shutdown);
process.on("SIGTERM", Shutdown);
