const { Client, Options } = require("discord.js-selfbot-v13");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType, NoSubscriberBehavior } = require("./voice-index.js");
const Net = require("net");
const Fs = require("fs");
const Path = require("path");
const { Readable } = require("stream");

const [, , Token, Gid, Vid] = process.argv;
const AudioPath = Path.join(__dirname, "audio");
const SockPath = process.platform === "win32" ? "\\\\.\\pipe\\bot" : "/tmp/bot.sock";
const Ns = 1_000_000n;
const BusyWindowNs = 5_000_000n;
const Hr = process.hrtime.bigint;
const SILENCE = Buffer.from([0xF8, 0xFF, 0xFE]);
const PRIME_PACKETS = 250;

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
const AudioPlayer = createAudioPlayer({
  behaviors: { noSubscriber: NoSubscriberBehavior.Play, maxMissedFrames: 1000 },
});

let WallOffsetNs = Hr() - BigInt(Date.now()) * Ns;
setInterval(() => {
  if (AudioPlayer.state.status === "idle") WallOffsetNs = Hr() - BigInt(Date.now()) * Ns;
}, 5000);

let AudioFiles = [];
let PlayHandle = null;

const LoadAudio = () => {
  if (!Fs.existsSync(AudioPath)) return;
  AudioFiles = Fs.readdirSync(AudioPath)
    .filter(F => F.endsWith(".ogg"))
    .sort((A, B) => A.toLowerCase().localeCompare(B.toLowerCase()))
    .map(F => Path.join(AudioPath, F));
};

const MakeSilenceStream = () => {
  const S = new Readable({ objectMode: true, read() {} });
  for (let I = 0; I < PRIME_PACKETS; I++) S.push(SILENCE);
  S.push(null);
  return S;
};

const PrimeJitterBuffer = () => new Promise(Resolve => {
  const Res = createAudioResource(MakeSilenceStream(), { inputType: StreamType.Opus });
  AudioPlayer.play(Res);
  AudioPlayer.once("stateChange", (_, N) => { if (N.status === "idle") Resolve(); });
});

const Play = (FilePath, TargetMs) => {
  if (PlayHandle) { clearTimeout(PlayHandle); clearImmediate(PlayHandle); PlayHandle = null; }
  AudioPlayer.stop(true);

  const TargetNs = BigInt(TargetMs) * Ns + WallOffsetNs;
  const Res = createAudioResource(Fs.createReadStream(FilePath), { inputType: StreamType.OggOpus });

  const Fire = () => {
    while (Hr() < TargetNs) {}
    AudioPlayer.play(Res);
  };

  const SleepMs = Number((TargetNs - Hr() - BusyWindowNs) / Ns);
  if (SleepMs > 1) PlayHandle = setTimeout(Fire, SleepMs);
  else Fire();
};

const Connect = () => {
  const Sock = Net.createConnection(SockPath);
  Sock.setNoDelay(true);
  Sock.on("data", D => {
    const Len = D.length;
    for (let I = 0; I + 9 <= Len; I += 9) {
      const B0 = D[I];
      const MsgType = B0 >> 6;
      if (MsgType === 3) {
        const FilePath = AudioFiles[B0 & 0x3f];
        if (FilePath && Vc) {
          const Hi = D[I + 1];
          const Lo = ((D[I + 2] << 24) | (D[I + 3] << 16) | (D[I + 4] << 8) | D[I + 5]) >>> 0;
          const TargetMs = Hi * 0x100000000 + Lo;
          Play(FilePath, TargetMs);
        }
      } else if (MsgType === 0) {
        C.guilds.fetch(Gid).then(G => {
          Vc = joinVoiceChannel({ channelId: Vid, guildId: Gid, adapterCreator: G.voiceAdapterCreator, selfDeaf: false });
          entersState(Vc, VoiceConnectionStatus.Ready, 2e4).then(() => {
            Vc.subscribe(AudioPlayer);
            PrimeJitterBuffer();
          });
        });
      } else if (MsgType === 1) {
        if (PlayHandle) { clearTimeout(PlayHandle); clearImmediate(PlayHandle); PlayHandle = null; }
        AudioPlayer.stop(true);
      } else if (MsgType === 2) {
        LoadAudio();
      }
    }
  });
  Sock.on("close", () => setTimeout(Connect, 1000));
};

C.once("ready", () => { LoadAudio(); Connect(); });
C.login(Token);
