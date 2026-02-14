const Discord = require("discord.js-selfbot-v13");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, StreamType } = require("@discordjs/voice");
const net = require("net");
const Fs = require("fs");
const Path = require("path");
const { Readable } = require("stream");
const [, , Token, Gid, Vid] = process.argv;
const AP = Path.join(__dirname, "audio");
const SP = "/tmp/bot.sock";
const C = new Discord.Client({
  checkUpdate: false,
  makeCache: Discord.Options.cacheWithLimits({
    MessageManager: 0, PresenceManager: 0, UserManager: 0, GuildMemberManager: 0,
    ThreadManager: 0, GuildEmojiManager: 0, ReactionManager: 0, GuildBanManager: 0,
    GuildInviteManager: 0, StageInstanceManager: 0, GuildScheduledEventManager: 0,
    GuildManager: Infinity, ChannelManager: Infinity, VoiceStateManager: Infinity,
  }),
});
let VC = null;
const P = createAudioPlayer();
let BM = [];
const L = () => {
  if (!Fs.existsSync(AP)) return;
  BM = Fs.readdirSync(AP).filter((f) => f.endsWith(".ogg")).sort().map((f) => Fs.readFileSync(Path.join(AP, f)));
};
const Conn = () => {
  const s = net.createConnection(SP);
  s.setNoDelay(true);
  s.on("data", (d) => {
    let c = 0;
    while (c + 4 <= d.length) {
      const t = d[c] >> 6;
      const i = d[c] & 0x3f;
      const ms = ((d[c + 1] << 16) | (d[c + 2] << 8) | d[c + 3]);
      if (t === 3) {
        const buf = BM[i];
        if (buf && VC) {
          const res = createAudioResource(Readable.from(buf), { inputType: StreamType.OggOpus });
          const now = Date.now();
          let target = (now & -16777216) | ms;
          if (target < now - 5000000) target += 0x1000000;
          else if (target > now + 5000000) target -= 0x1000000;
          Sync(res, target - (VC.ping.udp || 0));
        }
      } else if (t === 0) {
        C.guilds.fetch(Gid).then((g) => {
          VC = joinVoiceChannel({ channelId: Vid, guildId: Gid, adapterCreator: g.voiceAdapterCreator });
          entersState(VC, VoiceConnectionStatus.Ready, 2e4).then(() => VC.subscribe(P));
        });
      } else if (t === 1) { P.stop(); if (global.gc) global.gc(); }
      else if (t === 2) L();
      c += 4;
    }
  });
  s.on("close", () => setTimeout(Conn, 1000));
  s.on("error", () => {});
};
const Sync = (res, t) => {
  const tn = BigInt(Math.floor(t)) * 1000000n;
  const startHr = process.hrtime.bigint();
  const diff = tn - BigInt(Date.now()) * 1000000n;
  setTimeout(() => {
    while (process.hrtime.bigint() - startHr < diff) {}
    P.play(res);
  }, Math.max(0, Number(diff / 1000000n) - 1));
};
C.once("ready", () => { L(); Conn(); });
C.login(Token);
