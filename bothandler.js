const { Client, Options } = require("discord.js-selfbot-v13");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType } = require("@discordjs/voice");
const net = require("net");
const Fs = require("fs");
const Path = require("path");
const { Readable } = require("stream");
const [, , Token, Gid, Vid] = process.argv;
const AP = Path.join(__dirname, "audio");
const SP = "/tmp/bot.sock";
const N1M = 1000000n;
const HR = process.hrtime;
const C = new Client({
  checkUpdate: false,
  makeCache: Options.cacheWithLimits({
    MessageManager: 0, PresenceManager: 0, UserManager: 0, GuildMemberManager: 0,
    ThreadManager: 0, GuildEmojiManager: 0, ReactionManager: 0, GuildBanManager: 0,
    GuildInviteManager: 0, StageInstanceManager: 0, GuildScheduledEventManager: 0,
    GuildManager: Infinity, ChannelManager: Infinity, VoiceStateManager: Infinity,
  }),
});
let VC = null;
const P = createAudioPlayer();
const PLAY = P.play.bind(P);
let BM = [];
const L = () => {
  if (!Fs.existsSync(AP)) return;
  BM = Fs.readdirSync(AP).filter((f) => f.endsWith(".ogg")).sort().map((f) => Fs.readFileSync(Path.join(AP, f)));
};
const Conn = () => {
  const s = net.createConnection(SP);
  s.setNoDelay(true);
  s.on("data", (d) => {
    const len = d.length;
    for (let c = 0; c + 4 <= len; c += 4) {
      const b0 = d[c];
      const t = b0 >> 6;
      if (t === 3) {
        const buf = BM[b0 & 0x3f];
        if (buf && VC) {
          const res = createAudioResource(Readable.from(buf), { inputType: StreamType.OggOpus });
          const ms = ((d[c + 1] << 16) | (d[c + 2] << 8) | d[c + 3]);
          const now = Date.now();
          let target = (now & -16777216) | ms;
          if (target < now - 1000000) target += 0x1000000;
          else if (target > now + 1000000) target -= 0x1000000;
          Sync(res, target - (VC.ping.udp || 0));
        }
      } else if (t === 0) {
        C.guilds.fetch(Gid).then((g) => {
          VC = joinVoiceChannel({ channelId: Vid, guildId: Gid, adapterCreator: g.voiceAdapterCreator });
          entersState(VC, VoiceConnectionStatus.Ready, 2e4).then(() => VC.subscribe(P));
        });
      } else if (t === 1) { P.stop(); if (global.gc) global.gc(); }
      else if (t === 2) L();
    }
  });
  s.on("close", () => setTimeout(Conn, 1000));
};
const Sync = (res, t) => {
  const tn = BigInt(Math.floor(t)) * N1M;
  const start = HR.bigint();
  const d = tn - (BigInt(Date.now()) * N1M);
  const wait = Number(d / N1M) - 1;
  setTimeout(() => {
    while (HR.bigint() - start < d) {}
    PLAY(res);
  }, wait > 0 ? wait : 0);
};
C.once("ready", () => { L(); Conn(); });
C.login(Token);
