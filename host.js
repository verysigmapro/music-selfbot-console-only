const net = require("net");
const Express = require("express");
const Fs = require("fs");
const Path = require("path");
const ExpressApp = Express();
const SP = "/tmp/bot.sock";
const B4 = Buffer.allocUnsafe(4);
if (Fs.existsSync(SP)) Fs.unlinkSync(SP);
const Clients = new Set();
const Tcp = net.createServer((s) => {
  s.setNoDelay(true);
  Clients.add(s);
  s.on("close", () => Clients.delete(s));
  s.on("error", () => {});
});
const S = (t, ms, i) => {
  B4[0] = (t << 6) | (i & 0x3f);
  B4[1] = ms >> 16; B4[2] = ms >> 8; B4[3] = ms;
  for (const c of Clients) c.write(B4);
};
ExpressApp.use(Express.json());
ExpressApp.post("/join", (req, res) => { S(0, 0, 0); res.json({ s: 1 }); });
ExpressApp.post("/stop", (req, res) => { S(1, 0, 0); res.json({ s: 1 }); });
ExpressApp.post("/update", (req, res) => { S(2, 0, 0); res.json({ s: 1 }); });
ExpressApp.post("/play", (req, res) => {
  const f = Fs.readdirSync(Path.join(__dirname, "audio")).filter((x) => x.endsWith(".ogg")).sort();
  const i = f.indexOf(req.body.AudioKey + ".ogg");
  if (i !== -1) S(3, Date.now() + 350, i);
  res.json({ s: 1 });
});
Tcp.listen(SP);
ExpressApp.listen(3000, "0.0.0.0");
