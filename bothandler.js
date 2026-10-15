"use strict";

const { Client, Options } = require("discord.js-selfbot-v13");
const Fs = require("fs");
const Path = require("path");
const Net = require("net");
const { AudioDir, SockPath, Msg, ListAudio, FrameReader, NowMs } = require("./shared");

const SpinThresholdMs = 1.5;
const JoinTimeoutMs = 20000;
const ReconnectMs = 1000;

const Tokens = (process.env.TOKENS || "").split(/[\s,]+/).filter(Boolean);
const { GID: Gid, VID: Vid } = process.env;

if (!Tokens.length || !Gid || !Vid) {
  console.error("bothandler: TOKENS, GID and VID must be set (see .env.example)");
  process.exit(1);
}

const LogError = Err => console.error(`[bot] ${Err?.message ?? Err}`);

const MakeCache = Options.cacheWithLimits({
  MessageManager: 0, PresenceManager: 0, UserManager: 0, GuildMemberManager: 0,
  ThreadManager: 0, GuildEmojiManager: 0, ReactionManager: 0, GuildBanManager: 0,
  GuildInviteManager: 0, StageInstanceManager: 0, GuildScheduledEventManager: 0,
  GuildManager: Infinity, ChannelManager: Infinity, VoiceStateManager: Infinity,
});

const Login = Token => new Promise(Resolve => {
  const C = new Client({ checkUpdate: false, makeCache: MakeCache });
  C.once("ready", () => Resolve(C));
  C.login(Token).catch(Err => {
    console.error(`[bot] login failed for token ending ...${Token.slice(-4)}: ${Err.message}`);
    Resolve(null);
  });
});

(async () => {
  const Voice = (await import("./dist.js")).default;
  const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType, NoSubscriberBehavior } = Voice;

  const Clients = (await Promise.all(Tokens.map(Login))).filter(Boolean);
  if (!Clients.length) {
    console.error("[bot] no account could log in");
    process.exit(1);
  }

  const Player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play, maxMissedFrames: 1000 },
  });

  let AudioFiles = [];
  const LoadAudio = () => { AudioFiles = ListAudio().map(F => Path.join(AudioDir, F)); };
  LoadAudio();

  let Connections = [];
  let JoinPromise = null;
  let PlayTimer = null;
  let Pending = null;

  const CancelPending = () => {
    if (PlayTimer) { clearTimeout(PlayTimer); PlayTimer = null; }
    if (Pending) { Pending.playStream.destroy(); Pending = null; }
  };

  const SyncTimestamps = TargetMs => {
    const Timestamp = (TargetMs * 48) >>> 0;
    for (const Vc of Connections) {
      const ConnectionData = Vc.state?.networking?.state?.connectionData;
      if (ConnectionData) ConnectionData.timestamp = Timestamp;
    }
  };

  const Play = (FilePath, TargetTime) => {
    CancelPending();
    const Res = createAudioResource(Fs.createReadStream(FilePath), { inputType: StreamType.OggOpus });
    Pending = Res;

    const Fire = () => {
      if (Pending !== Res) return;
      while (NowMs() < TargetTime) {}
      PlayTimer = null;
      Pending = null;
      SyncTimestamps(TargetTime);
      Player.play(Res);
    };

    const DiffMs = TargetTime - NowMs();
    if (DiffMs > SpinThresholdMs) PlayTimer = setTimeout(Fire, DiffMs - SpinThresholdMs);
    else Fire();
  };

  const AllReady = () =>
    Connections.length === Clients.length &&
    Connections.every(Vc => Vc.state.status === VoiceConnectionStatus.Ready);

  const JoinAll = () => {
    if (JoinPromise) return JoinPromise;
    if (AllReady()) return Promise.resolve(Connections);
    JoinPromise = Promise.all(Clients.map(async (C, I) => {
      const G = await C.guilds.fetch(Gid);
      const Vc = joinVoiceChannel({
        channelId: Vid, guildId: Gid, adapterCreator: G.voiceAdapterCreator,
        selfDeaf: true, group: String(I + 1),
      });
      await entersState(Vc, VoiceConnectionStatus.Ready, JoinTimeoutMs);
      Vc.subscribe(Player);
      return Vc;
    }))
      .then(Vcs => (Connections = Vcs))
      .finally(() => { JoinPromise = null; });
    return JoinPromise;
  };

  const OnFrame = (Buf, Off) => {
    const Head = Buf[Off];
    switch (Head >> 6) {
      case Msg.Play: {
        const FilePath = AudioFiles[Head & 0x3f];
        if (FilePath) Play(FilePath, Buf.readDoubleLE(Off + 1));
        break;
      }
      case Msg.Join:   JoinAll().catch(LogError); break;
      case Msg.Stop:   CancelPending(); Player.stop(true); break;
      case Msg.Update: LoadAudio(); break;
    }
  };

  const Connect = () => {
    const Sock = Net.createConnection(SockPath);
    const Reader = new FrameReader(OnFrame);
    Sock.on("data", Chunk => Reader.Push(Chunk));
    Sock.on("error", () => {});
    Sock.on("close", () => setTimeout(Connect, ReconnectMs));
  };
  Connect();
})().catch(Err => { LogError(Err); process.exit(1); });
