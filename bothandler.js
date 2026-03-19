const { Client, Options } = require("discord.js-selfbot-v13");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType } = require("@discordjs/voice");
const Net = require("net");
const Fs = require("fs");
const Path = require("path");
const { Readable } = require("stream");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

if (!isMainThread) {
  const HRN = process.hrtime.bigint.bind(process.hrtime);
  const Sab = new Int32Array(workerData.Sab);
  parentPort.on("message", ({ Hi, Lo, WaitMs }) => {
    if (WaitMs > 0) Atomics.wait(Sab, 0, 0, WaitMs);
    const TargetHr = (BigInt(Hi) << 32n) | BigInt(Lo >>> 0);
    while (HRN() < TargetHr) {}
    parentPort.postMessage(1);
  });
} else {
  const [, , Token, Gid, Vid] = process.argv;
  const AudioPath = Path.join(__dirname, "audio");
  const SockPath = "/tmp/bot.sock";
  const Ns = 1000000n;
  const HRN = process.hrtime.bigint.bind(process.hrtime);
  const Sab = new SharedArrayBuffer(4);
  const SyncWorker = new Worker(__filename, { workerData: { Sab } });

  const Discord = new Client({
    checkUpdate: false,
    makeCache: Options.cacheWithLimits({
      MessageManager: 0, PresenceManager: 0, UserManager: 0, GuildMemberManager: 0,
      ThreadManager: 0, GuildEmojiManager: 0, ReactionManager: 0, GuildBanManager: 0,
      GuildInviteManager: 0, StageInstanceManager: 0, GuildScheduledEventManager: 0,
      GuildManager: Infinity, ChannelManager: Infinity, VoiceStateManager: Infinity,
    }),
  });

  let VC = null;
  const Player = createAudioPlayer();
  const Play = Player.play.bind(Player);
  let Buffers = [];
  let PendingRes = null;

  SyncWorker.on("message", () => {
    if (PendingRes) { Play(PendingRes); PendingRes = null; }
  });

  const LoadBuffers = () => {
    if (!Fs.existsSync(AudioPath)) return;
    Buffers = Fs.readdirSync(AudioPath)
      .filter((F) => F.endsWith(".ogg"))
      .sort()
      .map((F) => Fs.readFileSync(Path.join(AudioPath, F)));
  };

  const Sync = (Res, T) => {
    const WallNow = BigInt(Date.now()) * Ns;
    const HrNow = HRN();
    const Tn = BigInt(Math.floor(T)) * Ns;
    const Delta = Tn - WallNow;
    const TargetHr = HrNow + Delta;
    const WaitMs = Number(Delta / Ns) - 3;
    PendingRes = Res;
    SyncWorker.postMessage({
      Hi: Number(TargetHr >> 32n),
      Lo: Number(TargetHr & 0xFFFFFFFFn),
      WaitMs: WaitMs > 0 ? WaitMs : 0,
    });
  };

  const Connect = () => {
    const Sock = Net.createConnection(SockPath);
    Sock.setNoDelay(true);
    Sock.on("data", (Data) => {
      const Len = Data.length;
      for (let I = 0; I + 4 <= Len; I += 4) {
        const B0 = Data[I];
        const Type = B0 >> 6;
        if (Type === 3) {
          const Buf = Buffers[B0 & 0x3f];
          if (Buf && VC) {
            const Res = createAudioResource(Readable.from(Buf), { inputType: StreamType.OggOpus });
            const Ms = (Data[I + 1] << 16) | (Data[I + 2] << 8) | Data[I + 3];
            const Now = Date.now();
            let Target = (Now & -16777216) | Ms;
            if (Target < Now - 1000000) Target += 0x1000000;
            else if (Target > Now + 1000000) Target -= 0x1000000;
            Sync(Res, Target - Math.min(VC.ping.udp || 0, 80));
          }
        } else if (Type === 0) {
          Discord.guilds.fetch(Gid).then((G) => {
            VC = joinVoiceChannel({ channelId: Vid, guildId: Gid, adapterCreator: G.voiceAdapterCreator });
            entersState(VC, VoiceConnectionStatus.Ready, 2e4).then(() => VC.subscribe(Player));
          });
        } else if (Type === 1) {
          Player.stop();
          if (global.gc) global.gc();
        } else if (Type === 2) {
          LoadBuffers();
        }
      }
    });
    Sock.on("close", () => setTimeout(Connect, 1000));
  };

  Discord.once("ready", () => { LoadBuffers(); Connect(); });
  Discord.login(Token);
}
