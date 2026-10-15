"use strict";

const Fs = require("fs");
const Path = require("path");

const AudioDir = Path.join(__dirname, "audio");
const SockPath = process.env.BOT_SOCK || (process.platform === "win32" ? "\\\\.\\pipe\\bot" : "/tmp/bot.sock");

const FrameSize = 9;
const Msg = Object.freeze({ Join: 0, Stop: 1, Update: 2, Play: 3 });
const MaxTracks = 64;

const Collator = new Intl.Collator();

const ListAudio = () => {
  try {
    return Fs.readdirSync(AudioDir)
      .filter(F => F.endsWith(".ogg"))
      .map(F => [F, F.toLowerCase()])
      .sort((A, B) => Collator.compare(A[1], B[1]))
      .map(P => P[0]);
  } catch {
    return [];
  }
};

const TrackName = File => File.slice(0, -4);

const EncodeFrame = (Type, TrackIdx = 0, TargetTime = 0) => {
  const Buf = Buffer.allocUnsafe(FrameSize);
  Buf[0] = (Type << 6) | (TrackIdx & 0x3f);
  Buf.writeDoubleLE(TargetTime, 1);
  return Buf;
};

class FrameReader {
  constructor(OnFrame) {
    this.OnFrame = OnFrame;
    this.Rest = null;
  }

  Push(Chunk) {
    let Buf = Chunk;
    if (this.Rest) {
      Buf = Buffer.concat([this.Rest, Chunk]);
      this.Rest = null;
    }
    let Off = 0;
    for (; Off + FrameSize <= Buf.length; Off += FrameSize) this.OnFrame(Buf, Off);
    if (Off < Buf.length) this.Rest = Buffer.from(Buf.subarray(Off));
  }
}

const NowMs = () => performance.timeOrigin + performance.now();

module.exports = { AudioDir, SockPath, FrameSize, Msg, MaxTracks, ListAudio, TrackName, EncodeFrame, FrameReader, NowMs };
