import sys
import subprocess
import os

def ProcessAudio(InputFile):
    OutputFile = os.path.splitext(InputFile)[0] + ".ogg"
    Command = [
        "ffmpeg",
        "-i", InputFile,
        "-af", "volume=0.25",
        "-c:a", "libopus",
        "-b:a", "48k",
        "-vbr", "off",
        "-compression_level", "10",
        "-frame_duration", "20",
        "-application", "lowdelay",
        "-ar", "48000",
        "-ac", "1",
        "-map_metadata", "-1",
        "-vn",
        "-y",
        OutputFile
    ]
    subprocess.run(Command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        ProcessAudio(sys.argv[1])
