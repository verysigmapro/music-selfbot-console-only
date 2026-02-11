const Discord = require("discord.js-selfbot-v13");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require("@discordjs/voice");
const WebSocket = require("ws");
const Fs = require("fs");
const Path = require("path");
const { Readable } = require("stream");

const [, , Token, GuildId, VoiceChannelId] = process.argv;
const WsUrl = "ws://localhost:3000";
const AudioPath = Path.join(__dirname, "audio");

const Client = new Discord.Client({
  checkUpdate: false,
  makeCache: Discord.Options.cacheWithLimits({
    MessageManager: 0,
    PresenceManager: 0,
    UserManager: 0,
    GuildMemberManager: 0,
    ThreadManager: 0,
    GuildEmojiManager: 0,
    ReactionManager: 0,
    GuildBanManager: 0,
    GuildInviteManager: 0,
    StageInstanceManager: 0,
    GuildScheduledEventManager: 0,
    GuildManager: Infinity,
    ChannelManager: Infinity,
    VoiceStateManager: Infinity,
  }),
});

let VoiceConnection = null;
const BotPlayer = createAudioPlayer();
const AudioBufferMap = new Map();
let WsSocket = null;

const LoadAllAudio = () => {
  AudioBufferMap.clear();
  if (!Fs.existsSync(AudioPath)) return;
  Fs.readdirSync(AudioPath).forEach((File) => {
    if (File.endsWith(".ogg")) {
      AudioBufferMap.set(
        File.replace(".ogg", ""),
        Fs.readFileSync(Path.join(AudioPath, File))
      );
    }
  });
};

const InitializeWebSocket = () => {
  WsSocket = new WebSocket(WsUrl);
  WsSocket.on("open", () =>
    WsSocket.send(
      JSON.stringify({
        Type: "Init",
        Id: Client.user.id,
        Username: Client.user.username,
      })
    )
  );
  WsSocket.on("message", async (Data) => {
    const Message = JSON.parse(Data);
    if (Message.Type === "Play") {
      const Buffer = AudioBufferMap.get(Message.AudioKey);
      if (Buffer && VoiceConnection)
        ExecuteSyncPlay(
          Buffer,
          Message.PlayTime - (VoiceConnection.ping.udp || 0)
        );
    } else if (Message.Type === "Join") {
      try {
        const TargetGuild = await Client.guilds.fetch(GuildId);
        VoiceConnection = joinVoiceChannel({
          channelId: VoiceChannelId,
          guildId: GuildId,
          adapterCreator: TargetGuild.voiceAdapterCreator,
        });
        await entersState(VoiceConnection, VoiceConnectionStatus.Ready, 20000);
        VoiceConnection.subscribe(BotPlayer);
      } catch (Err) {}
    } else if (Message.Type === "Stop") {
      BotPlayer.stop();
    } else if (Message.Type === "Update") {
      LoadAllAudio();
    }
  });
  WsSocket.on("close", () => setTimeout(InitializeWebSocket, 1000));
};

const ExecuteSyncPlay = (Buffer, TargetTimeMs) => {
  const Resource = createAudioResource(Readable.from(Buffer), {
    inputType: StreamType.OggOpus,
    inlineVolume: false,
  });
  const TargetNano = BigInt(TargetTimeMs) * 1000000n;
  const StartHrTime = process.hrtime.bigint();
  const TimeDiffNano = TargetNano - BigInt(Date.now()) * 1000000n;

  setTimeout(() => {
    while (process.hrtime.bigint() - StartHrTime < TimeDiffNano) {}
    BotPlayer.play(Resource);
  }, Math.max(0, Number(TimeDiffNano / 1000000n) - 5));
};

Client.once("ready", () => { 
    LoadAllAudio(); 
    InitializeWebSocket(); 
    //console.log(`LOADED ${Client.user.username}`);
});
Client.login(Token);
