const { spawn } = require("child_process");
const Net = require("net");
const Http = require("http");
const Fs = require("fs");

const [, , Dir, Label, ClientsArg = "1", IterArg = "5000"] = process.argv;
const NClients = Number(ClientsArg);
const Iter = Number(IterArg);
const Sock = process.env.BOT_SOCK || "/tmp/bot.sock";

const Pct = (Arr, P) => Arr[Math.min(Arr.length - 1, Math.floor(Arr.length * P))];
const Sleep = Ms => new Promise(Resolve => setTimeout(Resolve, Ms));
const Fmt = N => N.toFixed(3).padStart(8);

(async () => {
  if (Fs.existsSync(Sock)) Fs.unlinkSync(Sock);
  const Host = spawn("bun", ["host.js"], { cwd: Dir, stdio: "ignore" });
  for (let I = 0; I < 100 && !Fs.existsSync(Sock); I++) await Sleep(50);
  await Sleep(200);

  let Pending = 0;
  let ResolveRound = null;

  for (let C = 0; C < NClients; C++) {
    const Conn = Net.createConnection(Sock);
    let Acc = Buffer.allocUnsafe(0);
    Conn.on("data", Chunk => {
      Acc = Buffer.concat([Acc, Chunk]);
      while (Acc.length >= 9) {
        Acc = Acc.subarray(9);
        if (--Pending === 0 && ResolveRound) ResolveRound();
      }
    });
    await new Promise(Resolve => Conn.once("connect", Resolve));
  }

  const Run = async KeepAlive => {
    const Agent = new Http.Agent({ keepAlive: KeepAlive });
    const Lat = [];

    const One = () => new Promise(Resolve => {
      Pending = NClients;
      const T0 = performance.now();
      ResolveRound = () => { Lat.push(performance.now() - T0); Resolve(); };
      const Req = Http.request({
        hostname: "127.0.0.1", port: 3000, path: "/play", method: "POST", agent: Agent,
        headers: { "Content-Type": "application/octet-stream", "Content-Length": 1 },
      });
      Req.on("error", () => {});
      Req.end(Buffer.from([2]));
    });

    for (let I = 0; I < 300; I++) await One();
    Lat.length = 0;
    const Begin = performance.now();
    for (let I = 0; I < Iter; I++) await One();
    const Total = performance.now() - Begin;
    Lat.sort((A, B) => A - B);
    return { P50: Pct(Lat, 0.5), P95: Pct(Lat, 0.95), P99: Pct(Lat, 0.99), Rps: Iter / (Total / 1000) };
  };

  const Cold = await Run(false);
  const Warm = await Run(true);
  console.log(`${Label.padEnd(10)} clients=${NClients}  cold-conn: p50 ${Fmt(Cold.P50)}ms p95 ${Fmt(Cold.P95)}ms p99 ${Fmt(Cold.P99)}ms ${Cold.Rps.toFixed(0).padStart(6)} req/s | keepalive: p50 ${Fmt(Warm.P50)}ms p99 ${Fmt(Warm.P99)}ms ${Warm.Rps.toFixed(0).padStart(6)} req/s`);
  Host.kill();
  process.exit(0);
})();
