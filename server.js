// server.js
const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 8080;

app.get("/download", (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", `attachment; filename="audio.mp3"`);

  // yt-dlp command that ALWAYS outputs MP3 to stdout
  const process = spawn("yt-dlp", [
    "-f", "bestaudio",
    "--extract-audio",
    "--audio-format", "mp3",
    "--audio-quality", "0",
    "-o", "-",
    url
  ]);

  // pipe mp3 to response 
  process.stdout.pipe(res);

  process.stderr.on("data", (data) => {
    console.log("yt-dlp ERROR:", data.toString());
  });

  process.on("close", (code) => {
    console.log("yt-dlp finished with code", code);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log("SERVER RUNNING on port", PORT);
});
