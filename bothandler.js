const { Client, Options } = require("discord.js-selfbot-v13");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType } = require("@discordjs/voice");
const net = require("net");
const Fs = require("fs");
const Path = require("path");
const { Readable } = require("stream");

const [, , Token, Gid, Vid] = process.argv;
const AudioPath = Path.join(__dirname, "audio");
const SockPath = "/tmp/bot.sock";
const Ns = 1_000_000n;
const BusyWindowNs = 8_000_000n;
const Hr = process.hrtime.bigint;
const NowMs = () => Number((Hr() - HrEpochOffset) / Ns);

const CalibOffset = () => {
  let BestJitter = BigInt(2e6);
  let BestOffset = 0n;
  for (let I = 0; I < 32; I++) {
    const T0 = Hr();
    const Wall = BigInt(Date.now());
    const T1 = Hr();
    const Jitter = T1 - T0;
    if (Jitter < BestJitter) { BestJitter = Jitter; BestOffset = T0 - Wall * Ns; }
  }
  return BestOffset;
};

let HrEpochOffset = CalibOffset();
setInterval(() => {
  if (AudioPlayer.state.status === "idle") HrEpochOffset = CalibOffset();
}, 30_000);

const C = new Client({
  checkUpdate: false,
  makeCache: Options.cacheWithLimits({
    MessageManager: 0, PresenceManager: 0, UserManager: 0, GuildMemberManager: 0,
    ThreadManager: 0, GuildEmojiManager: 0, ReactionManager: 0, GuildBanManager: 0,
    GuildInviteManager: 0, StageInstanceManager: 0, GuildScheduledEventManager: 0,
    GuildManager: Infinity, ChannelManager: Infinity, VoiceStateManager: Infinity,
  }),
});

let Vc = null;
const AudioPlayer = createAudioPlayer();
const PlayFn = AudioPlayer.play.bind(AudioPlayer);
let AudioStreams = [];

const LoadAudio = () => {
  if (!Fs.existsSync(AudioPath)) return;
  AudioStreams = Fs.readdirSync(AudioPath)
    .filter(F => F.endsWith(".ogg"))
    .sort()
    .map(F => {
      const Buf = Fs.readFileSync(Path.join(AudioPath, F));
      return () => createAudioResource(Readable.from(Buf), { inputType: StreamType.OggOpus });
    });
};

const Connect = () => {
  const Sock = net.createConnection(SockPath);
  Sock.setNoDelay(true);
  Sock.on("data", D => {
    const Len = D.length;
    for (let I = 0; I + 4 <= Len; I += 4) {
      const B0 = D[I];
      const MsgType = B0 >> 6;
      if (MsgType === 3) {
        const MakeRes = AudioStreams[B0 & 0x3f];
        if (MakeRes && Vc) {
          const EncodedMs = (D[I + 1] << 16) | (D[I + 2] << 8) | D[I + 3];
          const Now = NowMs();
          let TargetMs = (Math.floor(Now) & -16777216) | EncodedMs;
          if (TargetMs < Now - 1000000) TargetMs += 0x1000000;
          else if (TargetMs > Now + 1000000) TargetMs -= 0x1000000;
          Sched(MakeRes, TargetMs);
        }
      } else if (MsgType === 0) {
        C.guilds.fetch(Gid).then(G => {
          Vc = joinVoiceChannel({ channelId: Vid, guildId: Gid, adapterCreator: G.voiceAdapterCreator });
          entersState(Vc, VoiceConnectionStatus.Ready, 2e4).then(() => Vc.subscribe(AudioPlayer));
        });
      } else if (MsgType === 1) { AudioPlayer.stop(); if (global.gc) global.gc(); }
      else if (MsgType === 2) LoadAudio();
    }
  });
  Sock.on("close", () => setTimeout(Connect, 1000));
};

const Sched = (MakeRes, TargetMs) => {
  const TargetNs = BigInt(TargetMs) * Ns + HrEpochOffset;
  const SleepMs = Number((TargetNs - Hr() - BusyWindowNs) / Ns);
  const Fire = () => { while (Hr() < TargetNs) {} PlayFn(MakeRes()); };
  if (SleepMs > 0) setTimeout(Fire, SleepMs);
  else setImmediate(Fire);
};

C.once("ready", () => { LoadAudio(); Connect(); });
C.login(Token);
