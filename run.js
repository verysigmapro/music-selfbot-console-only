"use strict";

if (typeof Bun === "undefined") {
  console.error("Error: Please run this script using Bun instead of Node.js (e.g. `bun run.js`)");
  process.exit(1);
}

const { spawn } = require("child_process");
const Readline = require("readline");
const Net = require("net");
const { SockPath, ListAudio, TrackName } = require("./shared");

const { TOKENS: Tokens, GID: Gid, VID: Vid } = process.env;
if (!Tokens || !Gid || !Vid) {
  console.error("Missing TOKENS, GID or VID. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const HostUrl = `http://127.0.0.1:${process.env.PORT || 3000}`;
const HelpText = "join | stop | list | reload | play <number|name> | quit";
const Sleep = Ms => new Promise(Resolve => setTimeout(Resolve, Ms));

const Children = [];

const Start = (Script, Env = {}) => {
  const Child = spawn(process.execPath, [Script], { stdio: "inherit", env: { ...process.env, ...Env } });
  Child.on("exit", Code => { if (Code) console.error(`[${Script}] exited with code ${Code}`); });
  Children.push(Child);
  return Child;
};

const KillAll = () => Children.forEach(C => C.kill());
process.on("exit", KillAll);
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

const WaitForHost = async (Tries = 100) => {
  for (let I = 0; I < Tries; I++) {
    const Up = await new Promise(Resolve => {
      const Sock = Net.connect(SockPath);
      Sock.once("connect", () => { Sock.destroy(); Resolve(true); });
      Sock.once("error", () => Resolve(false));
    });
    if (Up) return;
    await Sleep(50);
  }
  throw new Error("host.js did not start");
};

const Post = Path => fetch(HostUrl + Path, { method: "POST" }).catch(() => {});

const FindTrack = (Query, Files) => {
  const Names = Files.map(TrackName);
  let Idx = Names.indexOf(Query);
  if (Idx === -1) Idx = Names.findIndex(N => N.toLowerCase() === Query.toLowerCase());
  if (Idx === -1 && /^\d+$/.test(Query)) Idx = Number(Query) - 1;
  return Idx >= 0 && Idx < Files.length ? Idx : -1;
};

(async () => {
  console.clear();
  Start("host.js");
  await WaitForHost();
  Start("bothandler.js");

  const Rl = Readline.createInterface({ input: process.stdin, output: process.stdout });
  Rl.setPrompt("> ");
  console.log(HelpText);
  Rl.prompt();

  Rl.on("line", Line => {
    const Input = Line.trim().replace(/"/g, "").replace(/\.ogg$/i, "");
    const [Cmd, ...Rest] = Input.split(/\s+/);
    const Arg = Rest.join(" ");

    switch (Cmd) {
      case "":       break;
      case "join":   Post("/join"); break;
      case "stop":   Post("/stop"); break;
      case "reload": Post("/update"); break;
      case "help":   console.log(HelpText); break;
      case "quit":
      case "exit":   process.exit(0);
      case "list":
        ListAudio().forEach((F, I) => console.log(` ${I + 1}: ${TrackName(F)}`));
        break;
      default: {
        const Query = Cmd === "play" ? Arg : Input;
        const Idx = FindTrack(Query, ListAudio());
        if (Idx >= 0) Post(`/play/${Idx}`);
        else console.log(`no such track: ${Query}`);
      }
    }
    Rl.prompt();
  });
  Rl.on("close", () => process.exit(0));
})().catch(Err => { console.error(Err.message); process.exit(1); });
