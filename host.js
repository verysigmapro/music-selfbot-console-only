const Net = require("net");
const Http = require("http");
const Fs = require("fs");
const Path = require("path");

const SockPath = process.platform === "win32" ? "\\\\.\\pipe\\bot" : "/tmp/bot.sock";
const AudioDir = Path.join(__dirname, "audio");
const LeadMs = 250;

if (process.platform !== "win32" && Fs.existsSync(SockPath)) Fs.unlinkSync(SockPath);

const Clients = new Set();
let AudioIndex = [];

const RebuildIndex = () => {
  AudioIndex = Fs.existsSync(AudioDir)
    ? Fs.readdirSync(AudioDir).filter(X => X.endsWith(".ogg")).sort((A, B) => A.toLowerCase().localeCompare(B.toLowerCase()))
    : [];
};

const Broadcast = (MsgType, TargetTime, TrackIdx) => {
  const Buf = Buffer.allocUnsafe(9);
  Buf[0] = (MsgType << 6) | (TrackIdx & 0x3f);
  Buf.writeDoubleLE(TargetTime, 1);
  for (const Sock of Clients) {
    Sock.cork();
    Sock.write(Buf);
    Sock.uncork();
  }
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
  const Chunks = [];
  Req.on("data", C => { Chunks.push(C); });
  Req.on("end", () => {
    const D = Buffer.concat(Chunks);
    Res.setHeader("Content-Type", "application/json");
    if (Routes[Req.url]) {
      Routes[Req.url]();
    } else if (Req.url === "/play") {
      const TrackIdx = D[0];
      if (TrackIdx < AudioIndex.length) Broadcast(3, performance.timeOrigin + performance.now() + LeadMs, TrackIdx);
    }
    Res.end('{"s":1}');
  });
}).listen(3000, "0.0.0.0");

RebuildIndex();
TcpServer.listen(SockPath);