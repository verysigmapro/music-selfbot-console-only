const { spawn } = require("child_process");
const Readline = require("readline");
const Http = require("http");
const Fs = require("fs");
const Path = require("path");

const BotTokens = [
  "MTMxOTEzMDQwNTkyMzk3OTI4NA.GFIuVT.ie80xQqVybw0PANRbrFbpdZ8zCSw_9xDa1Tyho",
  "MTE3MzYyMDE5NzQxMjgzOTU1NA.GyuPZh.qOQVKFGqsdqITZMM2FzYzuh030k0ueGlvgCyWE",
  "MTQxNjM4NzkxODM5MzY0MzEzOQ.Gy9Teh.hXPXl7VJxKrTrHAZ7DrsJwIKM9GavNltjegSgQ",
];
const TargetGuildId = "1238452317838377035";
const TargetVoiceId = "1519697303080796303";
const AudioPath = Path.join(__dirname, "audio");

const StartProcess = (Script, Args) =>
  spawn("node", ["--no-warnings", "--expose-gc", Script, ...Args], {
    stdio: ["inherit", "pipe", "inherit"],
  });

const PostCommand = (Endpoint, Body = {}) => {
  const Request = Http.request({
    hostname: "localhost",
    port: 3000,
    path: Endpoint,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  Request.on("error", () => {});
  Request.write(JSON.stringify(Body));
  Request.end();
};

const GetFileList = () => {
  if (!Fs.existsSync(AudioPath)) return [];
  return Fs.readdirSync(AudioPath)
    .filter(F => F.endsWith(".ogg"))
    .map(F => F.replace(".ogg", ""));
};

console.clear();
StartProcess("host.js", []);

setTimeout(() => {
  BotTokens.forEach((Token, Index) => {
    setTimeout(
      () => StartProcess("bothandler.js", [Token, TargetGuildId, TargetVoiceId]),
      Index * 1250
    );
  });
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
    const SelectedFile = FileArray[Index] || Query;
    PostCommand("/play", { AudioKey: SelectedFile });
  } else {
    PostCommand("/play", { AudioKey: CleanInput });
  }
  Interface.prompt();
});
