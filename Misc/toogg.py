import sys
import subprocess
import os

def ProcessAudio(InputFile):
    OutputFolder = "OpusAudio"
    os.makedirs(OutputFolder, exist_ok=True)
    BaseName = os.path.splitext(os.path.basename(InputFile))[0]
    OutputFile = os.path.join(OutputFolder, BaseName + ".ogg")
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
