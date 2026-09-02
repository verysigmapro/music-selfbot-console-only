const { spawn } = require("child_process");
const Readline = require("readline");
const Http = require("http");
const Fs = require("fs");
const Path = require("path");

const BotTokens = [
  "MTMxOTEzMDQwNTkyMzk3OTI4NA.GQrpfJ.AdN1E5vBM8LWAmKua4cGaOBxRVvPtufvCEZFTE",
  "MTM1OTYxODE5ODg3NzYzNDY4MQ.GYByHz.4ftOY5IF2HQoNaZXwlfDKiP1bQ-JQ4tm2l1cCU",
  "MTQxODI0MDc2NDU1ODk3MDg5MQ.GOtqFQ.l7btkBpTRpvnz4jduOzJszswp0qdlZxag3oqX8",
];
const TargetGuildId = "1238452317838377035";
const TargetVoiceId = "1519697303080796303";
const AudioPath = Path.join(__dirname, "audio");

const StartProcess = (Script, Args, Env = {}) =>
  spawn("bun", [Script, ...Args], {
    stdio: "inherit",
    env: { ...process.env, ...Env },
  });

const PostCommand = (Endpoint, TrackIdx = 0) => {
  const Request = Http.request({
    hostname: "localhost",
    port: 3000,
    path: Endpoint,
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", "Content-Length": 1 },
  });
  Request.on("error", () => {});
  Request.write(Buffer.from([TrackIdx]));
  Request.end();
};

const GetFileList = () => {
  if (!Fs.existsSync(AudioPath)) return [];
  return Fs.readdirSync(AudioPath)
    .filter(F => F.endsWith(".ogg"))
    .sort((A, B) => A.toLowerCase().localeCompare(B.toLowerCase()))
    .map(F => F.replace(".ogg", ""));
};

console.clear();
StartProcess("host.js", []);

setTimeout(() => {
  StartProcess("bothandler.js", BotTokens, { GID: TargetGuildId, VID: TargetVoiceId });
}, 2000);

const Interface = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
Interface.setPrompt("> ");

console.log("join | stop | list | play <number>");

Interface.on("line", Line => {
  const Input = Line.trim();
  if (!Input) return Interface.prompt();
  const FileArray = GetFileList();
  const CleanInput = Input.replace(/"/g, "").replace(".ogg", "");
  if (CleanInput === "join") {
    PostCommand("/join");
  } else if (CleanInput === "stop") {
    PostCommand("/stop");
  } else if (CleanInput === "list") {
    FileArray.forEach((File, Index) => console.log(` ${Index + 1}: ${File}`));
  } else if (CleanInput.startsWith("play ")) {
    const Query = CleanInput.replace("play ", "").trim();
    const Index = parseInt(Query) - 1;
    const TrackIdx = isNaN(Index) ? FileArray.indexOf(Query) : Index;
    if (TrackIdx >= 0 && TrackIdx < FileArray.length) PostCommand("/play", TrackIdx);
  } else {
    const TrackIdx = FileArray.indexOf(CleanInput);
    if (TrackIdx >= 0) PostCommand("/play", TrackIdx);
  }
  Interface.prompt();
});
