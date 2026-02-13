const { spawn } = require("child_process");
const Readline = require("readline");
const Http = require("http");
const Fs = require("fs");
const Path = require("path");

const BotTokens = [
  "MTMxOTEzMDQwNTkyMzk3OTI4NA.GtrL_x.CA274IkV9hTxq6kMnf9zdECJ4iTvvh6mCiHkqo",
  "MTEyNDE4MTUzMjA4NTU5MjA2NA.GOxcms.uysgFfNbj3eGXA6oJzsIG82IqRpTXoiudMFfCE",
  "MTQ2MzU2MjI3MTcxOTY5MDM0Nw.G-Y5Z0.vCqHF9FxJ7mgBNpaQjUTuUPEgqcxdQiUnH6GZc",
  "MTE0MjY1MDY4ODc2NjIzMDY0OA.GerGsT.nZApzxoVQ-usLLtlBOe2TBsZaHyYnMBZNup5Uw",
  "MTI2ODE5MjA3ODg2NTYzMzQyNg.GugQlK.CV0G2BqY1dS4Oz4r1WYGYLuOYfXR451g_Sdcx8",
  "MTE3MzYyMDE5NzQxMjgzOTU1NA.G0yJFZ.oAnR3CzF2f1D-axBoEZikMREG-i5WxZViRJtPU",
  "MTQxNjM4NzkxODM5MzY0MzEzOQ.Gn2Ayg.Dqecp_nQ2h5_D6vQ8gRn7hDyMeseisqjYWxJ6E",
];
const TargetGuildId = "1265979210426613841";
const TargetVoiceId = "1310722034539434014";
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
    .filter((F) => F.endsWith(".ogg"))
    .map((F) => F.replace(".ogg", ""));
};

console.clear();
StartProcess("host.js", []);

setTimeout(() => {
  BotTokens.forEach((Token, Index) => {
    setTimeout(
      () =>
        StartProcess("bothandler.js", [Token, TargetGuildId, TargetVoiceId]),
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

Interface.on("line", (Line) => {
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
