const Net = require("net");
const Express = require("express");
const Fs = require("fs");
const Path = require("path");

const App = Express();
const SockPath = "/tmp/bot.sock";
const AudioPath = Path.join(__dirname, "audio");
const Cmd = Buffer.allocUnsafe(4);

if (Fs.existsSync(SockPath)) Fs.unlinkSync(SockPath);

const Clients = new Set();

const Server = Net.createServer((Sock) => {
  Sock.setNoDelay(true);
  Clients.add(Sock);
  Sock.on("close", () => Clients.delete(Sock));
  Sock.on("error", () => {});
});

const Send = (Type, Ms, Index) => {
  Cmd[0] = (Type << 6) | (Index & 0x3f);
  Cmd[1] = Ms >> 16;
  Cmd[2] = Ms >> 8;
  Cmd[3] = Ms;
  for (const C of Clients) C.write(Cmd);
};

let FileList = [];

const LoadFiles = () => {
  if (!Fs.existsSync(AudioPath)) { FileList = []; return; }
  FileList = Fs.readdirSync(AudioPath).filter((F) => F.endsWith(".ogg")).sort();
};

LoadFiles();

App.use(Express.json());
App.post("/join",   (Req, Res) => { Send(0, 0, 0); Res.json({ S: 1 }); });
App.post("/stop",   (Req, Res) => { Send(1, 0, 0); Res.json({ S: 1 }); });
App.post("/update", (Req, Res) => { LoadFiles(); Send(2, 0, 0); Res.json({ S: 1 }); });
App.post("/play",   (Req, Res) => {
  const I = FileList.indexOf(Req.body.AudioKey + ".ogg");
  if (I !== -1) Send(3, Date.now() + 150, I);
  Res.json({ S: 1 });
});

Server.listen(SockPath);
App.listen(3000, "0.0.0.0");
