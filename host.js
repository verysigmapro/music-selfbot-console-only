const Net = require("net");
const Http = require("http");
const Fs = require("fs");
const Path = require("path");

const SockPath = process.platform === "win32" ? "\\\\.\\pipe\\bot" : "/tmp/bot.sock";
const AudioDir = Path.join(__dirname, "audio");
const LeadMs = 200;

if (process.platform !== "win32" && Fs.existsSync(SockPath)) Fs.unlinkSync(SockPath);

const Clients = new Set();
let AudioIndex = [];

const RebuildIndex = () => {
  AudioIndex = Fs.existsSync(AudioDir)
    ? Fs.readdirSync(AudioDir).filter(X => X.endsWith(".ogg")).sort()
    : [];
};

const BroadcastBuf = Buffer.allocUnsafe(4);

const Broadcast = (MsgType, Ms, TrackIdx) => {
  BroadcastBuf[0] = (MsgType << 6) | (TrackIdx & 0x3f);
  BroadcastBuf[1] = Ms >> 16; BroadcastBuf[2] = Ms >> 8; BroadcastBuf[3] = Ms;
  for (const Sock of Clients) Sock.write(BroadcastBuf);
};

const TcpServer = Net.createServer(Sock => {
  Sock.setNoDelay(true);
  Clients.add(Sock);
  Sock.on("close", () => Clients.delete(Sock));
  Sock.on("error", () => {});
});

const Routes = {
  "/join":   () => { Broadcast(0, 0, 0); },
  "/stop":   () => { Broadcast(1, 0, 0); },
  "/update": () => { RebuildIndex(); Broadcast(2, 0, 0); },
};

Http.createServer((Req, Res) => {
  let Body = "";
  Req.on("data", C => { Body += C; });
  Req.on("end", () => {
    Res.setHeader("Content-Type", "application/json");
    if (Routes[Req.url]) {
      Routes[Req.url]();
    } else if (Req.url === "/play") {
      const Key = JSON.parse(Body).AudioKey;
      const TrackIdx = AudioIndex.indexOf(Key + ".ogg");
      if (TrackIdx !== -1) Broadcast(3, (Date.now() + LeadMs) & 0xffffff, TrackIdx);
    }
    Res.end('{"s":1}');
  });
}).listen(3000, "0.0.0.0");

RebuildIndex();
TcpServer.listen(SockPath);
