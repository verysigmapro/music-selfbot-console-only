const { Client, Options } = require("discord.js-selfbot-v13");
const Fs = require("fs");
const Path = require("path");
const Net = require("net");
const { Readable } = require("stream");

const [, , ...Tokens] = process.argv;
const AudioPath = Path.join(__dirname, "audio");
const SockPath = process.platform === "win32" ? "\\\\.\\pipe\\bot" : "/tmp/bot.sock";
const Ns = 1_000_000n;
const BusyWindowNs = 1_500_000n;
const Hr = process.hrtime.bigint;
const Gid = process.env.GID;
const Vid = process.env.VID;

(async () => {
  const VoiceModule = (await import("./dist.js")).default;
  const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType, NoSubscriberBehavior } = VoiceModule;

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

  const Play = (FilePath, TargetMs) => {
    if (PlayHandle) { clearTimeout(PlayHandle); PlayHandle = null; }
    WallOffsetNs = Hr() - BigInt(Date.now()) * Ns;
    const TargetNs = BigInt(TargetMs) * Ns + WallOffsetNs;
    const Res = createAudioResource(Fs.createReadStream(FilePath), { inputType: StreamType.OggOpus });
    const Fire = () => {
      while (Hr() < TargetNs) {}
      AudioPlayer.play(Res);
    };
    const SleepMs = Number((TargetNs - Hr() - BusyWindowNs) / Ns);
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

  const JoinAll = async () => {
    for (let I = 0; I < Clients.length; I++) {
      const G = await Clients[I].guilds.fetch(Gid);
      const Vc = joinVoiceChannel({ channelId: Vid, guildId: Gid, adapterCreator: G.voiceAdapterCreator, selfDeaf: false, group: String(I + 1) });
      await entersState(Vc, VoiceConnectionStatus.Ready, 2e4);
      Vc.subscribe(AudioPlayer);
    }
  };

  LoadAudio();

  const HandleMessage = (D) => {
    const Len = D.length;
    for (let I = 0; I + 9 <= Len; I += 9) {
      const B0 = D[I];
      const MsgType = B0 >> 6;
      if (MsgType === 3) {
        const FilePath = AudioFiles[B0 & 0x3f];
        if (FilePath) {
          const Hi = D[I + 1];
          const Lo = ((D[I + 2] << 24) | (D[I + 3] << 16) | (D[I + 4] << 8) | D[I + 5]) >>> 0;
          Play(FilePath, Hi * 0x100000000 + Lo);
        }
      } else if (MsgType === 0) {
        JoinAll().catch(() => {});
      } else if (MsgType === 1) {
        if (PlayHandle) { clearTimeout(PlayHandle); clearImmediate(PlayHandle); PlayHandle = null; }
        AudioPlayer.stop(true);
      } else if (MsgType === 2) {
        LoadAudio();
      }
    }
  };

  const Connect = () => {
    const Sock = Net.createConnection(SockPath);
    Sock.on("error", () => {});
    let Buf = Buffer.alloc(0);
    Sock.on("data", Chunk => {
      Buf = Buffer.concat([Buf, Chunk]);
      while (Buf.length >= 9) {
        HandleMessage(Buf.slice(0, 9));
        Buf = Buf.slice(9);
      }
    });
    Sock.on("close", () => setTimeout(Connect, 1000));
  };

  Connect();
})();
