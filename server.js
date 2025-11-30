// server.js
const express = require("express");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/download", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ success: false, error: "Missing URL" });
  }

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ success: false, error: "Invalid YouTube URL" });
  }

  try {
    const info = await ytdl.getBasicInfo(url);
    const title =
      info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 80) +
      ".mp3";

    res.setHeader("Content-Disposition", `attachment; filename="${title}"`);
    res.setHeader("Content-Type", "audio/mpeg");

    const audio = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });

    const ff = ffmpeg(audio)
      .audioBitrate(192)
      .format("mp3")
      .on("error", (error) => {
        console.log("FFMPEG ERROR:", error);
        try {
          res.end();
        } catch {}
      });

    const stream = new PassThrough();
    ff.pipe(stream);
    stream.pipe(res);

  } catch (e) {
    console.log("SERVER ERROR", e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log("Server running on port", PORT));
