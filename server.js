const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/download", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "missing url" });

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');

  const ytdlp = spawn("yt-dlp", [
    "-f",
    "bestaudio",
    "--extract-audio",
    "--audio-format",
    "mp3",
    "-o",
    "-",
    url,
  ]);

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (data) => console.log("ERROR", data.toString()));
  ytdlp.on("close", () => res.end());
});

app.listen(3000, () => console.log("Server running"));
