const { Client, Options } = require("discord.js-selfbot-v13");
const Fs = require("fs");
const Path = require("path");
const Net = require("net");

const [, , ...Tokens] = process.argv;
const AudioPath = Path.join(__dirname, "audio");
const SockPath = process.platform === "win32" ? "\\\\.\\pipe\\bot" : "/tmp/bot.sock";
const Ns = 1_000_000n;
const BusyWindowNs = 1_000n;
const Hr = process.hrtime.bigint;
const Gid = process.env.GID;
const Vid = process.env.VID;

(async () => {
  const VoiceModule = (await import("./dist.js")).default;
  const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType, NoSubscriberBehavior } = VoiceModule;

  const AudioPlayer = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play, maxMissedFrames: 1000 },
  });

  let WallOffsetNs = 0n;

  let AudioFiles = [];
  let PlayHandle = null;

  const LoadAudio = () => {
    if (!Fs.existsSync(AudioPath)) return;
    AudioFiles = Fs.readdirSync(AudioPath)
      .filter(F => F.endsWith(".ogg"))
      .sort((A, B) => A.toLowerCase().localeCompare(B.toLowerCase()))
      .map(F => Path.join(AudioPath, F));
  };

  const Play = (FilePath, TargetMs) => {
    if (PlayHandle) { clearTimeout(PlayHandle); PlayHandle = null; }
    WallOffsetNs = Hr() - BigInt(Date.now()) * Ns;
    const TargetNs = BigInt(TargetMs) * Ns + WallOffsetNs;
    const Fire = () => {
      const Res = createAudioResource(Fs.createReadStream(FilePath), { inputType: StreamType.OggOpus });
      SyncTimestamps(TargetMs);
      while (Hr() < TargetNs) {}
      AudioPlayer.play(Res);
    };
    const DiffNs = TargetNs - Hr() - BusyWindowNs;
    const SleepMs = DiffNs > 0n ? Number((DiffNs + Ns - 1n) / Ns) : 0;
    if (SleepMs > 0) PlayHandle = setTimeout(Fire, SleepMs);
    else Fire();
  };

  const Clients = await Promise.all(Tokens.map(Token => new Promise(Resolve => {
    const C = new Client({
      checkUpdate: false,
      makeCache: Options.cacheWithLimits({
        MessageManager: 0, PresenceManager: 0, UserManager: 0, GuildMemberManager: 0,
        ThreadManager: 0, GuildEmojiManager: 0, ReactionManager: 0, GuildBanManager: 0,
        GuildInviteManager: 0, StageInstanceManager: 0, GuildScheduledEventManager: 0,
        GuildManager: Infinity, ChannelManager: Infinity, VoiceStateManager: Infinity,
      }),
    });
    C.once("ready", () => Resolve(C));
    C.login(Token);
  })));

  let Vcs = [];

  const SyncTimestamps = (TargetMs) => {
    const T0 = TargetMs * 48;
    for (const Vc of Vcs) {
      const Cd = Vc.state?.networking?.state?.connectionData;
      if (Cd) { Cd.timestamp = T0; Cd.sequence = 0; }
    }
  };

  const JoinAll = async () => {
    Vcs = await Promise.all(Clients.map(async (C, I) => {
      const G = await C.guilds.fetch(Gid);
      const Vc = joinVoiceChannel({ channelId: Vid, guildId: Gid, adapterCreator: G.voiceAdapterCreator, selfDeaf: false, group: String(I + 1) });
      await entersState(Vc, VoiceConnectionStatus.Ready, 2e4);
      Vc.subscribe(AudioPlayer);
      return Vc;
    }));
  };

  LoadAudio();

  const HandleMessage = (D) => {
    const B0 = D[0];
    const MsgType = B0 >> 6;
    if (MsgType === 3) {
      const FilePath = AudioFiles[B0 & 0x3f];
      if (FilePath) {
        const Hi = D[1];
        const Lo = ((D[2] << 24) | (D[3] << 16) | (D[4] << 8) | D[5]) >>> 0;
        Play(FilePath, Hi * 0x100000000 + Lo);
      }
    } else if (MsgType === 0) {
      JoinAll().catch(() => {});
    } else if (MsgType === 1) {
      if (PlayHandle) { clearTimeout(PlayHandle); PlayHandle = null; }
      AudioPlayer.stop(true);
    } else if (MsgType === 2) {
      LoadAudio();
    }
  };

  const Connect = () => {
    const Sock = Net.createConnection(SockPath);
    Sock.on("error", () => {});
    let Buf = Buffer.allocUnsafe(0);
    let BufLen = 0;
    Sock.on("data", Chunk => {
      Buf = Buffer.concat([Buf, Chunk]);
      BufLen = Buf.length;
      while (BufLen >= 9) {
        HandleMessage(Buf.subarray(0, 9));
        Buf = Buf.subarray(9);
        BufLen -= 9;
      }
    });
    Sock.on("close", () => setTimeout(Connect, 1000));
  };

  Connect();
})();
