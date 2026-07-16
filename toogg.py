import sys
import subprocess
import os

def ProcessAudio(InputFile):
    OutputFile = os.path.splitext(InputFile)[0] + ".ogg"
    Command = [
        "ffmpeg",
        "-i", InputFile,
        "-c:a", "libopus",
        OutputFile
    ]
    subprocess.run(Command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        ProcessAudio(sys.argv[1])
