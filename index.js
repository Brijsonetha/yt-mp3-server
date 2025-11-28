const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("YT-MP3 Server Running 🔥");
});

app.get("/mp3", (req, res) => {
  const youtubeUrl = req.query.url;

  if (!youtubeUrl) {
    return res.status(400).json({ error: "Missing URL" });
  }

  console.log("Downloading:", youtubeUrl);

  const process = spawn("./yt-dlp", [
    "-f", "bestaudio",
    "--extract-audio",
    "--audio-format", "mp3",
    "-o", "-",
    youtubeUrl
  ]);

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", `attachment; filename="audio.mp3"`);

  process.stdout.pipe(res);

  process.stderr.on("data", (data) => {
    console.log("yt-dlp error:", data.toString());
  });

  process.on("close", () => {
    console.log("Download done");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
