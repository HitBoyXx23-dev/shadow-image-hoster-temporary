const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Ensure uploads folder exists
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

// ✅ Serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB max
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|mp4|webm|mov|avi|mkv|mp3|wav|ogg)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error("Only image, video, or audio files are allowed"));
  },
});

// ✅ Upload route (returns JSON)
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const type = req.file.mimetype;

  res.json({
    success: true,
    url: fileUrl,
    type,
  });
});

// ✅ Optional: clean up old uploads (older than 7 days)
setInterval(() => {
  const dir = "./uploads";
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  fs.readdir(dir, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (now - stats.mtimeMs > sevenDays) fs.unlink(filePath, () => {});
      });
    });
  });
}, 12 * 60 * 60 * 1000); // runs every 12 hours

// ✅ 404 handler
app.use((req, res) => res.status(404).send("404 Not Found"));

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
