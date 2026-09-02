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

const Broadcast = (MsgType, TargetMs, TrackIdx) => {
  const Buf = Buffer.allocUnsafe(9);
  Buf[0] = (MsgType << 6) | (TrackIdx & 0x3f);
  const Hi = Math.floor(TargetMs / 0x100000000);
  const Lo = TargetMs >>> 0;
  Buf[1] = Hi;
  Buf[2] = (Lo >>> 24) & 0xff;
  Buf[3] = (Lo >>> 16) & 0xff;
  Buf[4] = (Lo >>> 8) & 0xff;
  Buf[5] = Lo & 0xff;
  Buf[6] = 0; Buf[7] = 0; Buf[8] = 0;
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
      if (TrackIdx < AudioIndex.length) Broadcast(3, Date.now() + LeadMs, TrackIdx);
    }
    Res.end('{"s":1}');
  });
}).listen(3000, "0.0.0.0");

RebuildIndex();
TcpServer.listen(SockPath);