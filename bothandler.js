const { Client, Options } = require("discord.js-selfbot-v13");
const Dgram = require("dgram");
const Fs = require("fs");
const Path = require("path");
const { Readable } = require("stream");

const [, , Token, Gid, Vid] = process.argv;
const AudioPath = Path.join(__dirname, "audio");
const McAddr = "239.0.0.1";
const McPort = 41234;
const Ns = 1_000_000n;
const BusyWindowNs = 5_000_000n;
const Hr = process.hrtime.bigint;
const SILENCE = Buffer.from([0xF8, 0xFF, 0xFE]);
const PRIME_PACKETS = 250;

(async () => {
  const VoiceModule = (await import("./dist.js")).default;
  const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType, NoSubscriberBehavior, setCycleEpoch } = VoiceModule;

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

  const FrameNs = 20_000_000n;

  const Play = (FilePath, TargetMs) => {
    if (PlayHandle) { clearTimeout(PlayHandle); clearImmediate(PlayHandle); PlayHandle = null; }
    AudioPlayer.stop(true);

    WallOffsetNs = Hr() - BigInt(Date.now()) * Ns;

    const RawTargetNs = BigInt(TargetMs) * Ns + WallOffsetNs;
    const Remainder = RawTargetNs % FrameNs;
    const TargetNs = Remainder === 0n ? RawTargetNs : RawTargetNs + (FrameNs - Remainder);

    const Res = createAudioResource(Fs.createReadStream(FilePath), { inputType: StreamType.OggOpus });

    const Fire = () => {
      while (Hr() < TargetNs) {}
      AudioPlayer.play(Res);
    };

    const SleepMs = Number((TargetNs - Hr() - BusyWindowNs) / Ns);
    if (SleepMs > 50) PlayHandle = setTimeout(Fire, SleepMs - 20);
    else Fire();
  };

  const Connect = () => {
    const Sock = Dgram.createSocket({ type: "udp4", reuseAddr: true });
    Sock.bind(McPort, () => {
      Sock.addMembership(McAddr);
    });

    Sock.on("message", D => {
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
        } else if (MsgType === 4) {
          const Hi = D[I + 1];
          const Lo = ((D[I + 2] << 24) | (D[I + 3] << 16) | (D[I + 4] << 8) | D[I + 5]) >>> 0;
          const EpochMs = Hi * 0x100000000 + Lo;
          setCycleEpoch(EpochMs);
        }
      }
    });

    Sock.on("error", () => {});
  };

  C.once("ready", () => { LoadAudio(); Connect(); });
  C.login(Token);
})();
