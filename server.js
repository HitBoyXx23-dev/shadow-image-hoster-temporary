const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|mp4|webm|mov|avi|mkv|mp3|wav|ogg)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error("Only image, GIF, video, or audio files allowed"));
  },
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const type = req.file.mimetype;

  let preview = "";
  if (type.startsWith("image/")) preview = `<img src="${fileUrl}" width="400">`;
  else if (type.startsWith("video/")) preview = `<video controls width="400" src="${fileUrl}"></video>`;
  else if (type.startsWith("audio/")) preview = `<audio controls src="${fileUrl}"></audio>`;

  res.send(`
    <h3>✅ Uploaded Successfully!</h3>
    ${preview}<br>
    <a href="${fileUrl}" target="_blank">${fileUrl}</a>
  `);
});

app.use((req, res) => res.status(404).send("404 Not Found"));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
