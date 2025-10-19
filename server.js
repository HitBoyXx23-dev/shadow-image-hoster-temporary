const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ensure uploads folder exists
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

// serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// multer config for any media file (image or video)
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|webm|mov|avi|mkv/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files allowed."));
    }
  },
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.send(`
    <h3>✅ Uploaded Successfully!</h3>
    <a href="${fileUrl}" target="_blank">${fileUrl}</a><br><br>
    ${
      req.file.mimetype.startsWith("video/")
        ? `<video controls width="400" src="${fileUrl}"></video>`
        : `<img src="${fileUrl}" width="400">`
    }
  `);
});

// fallback
app.use((req, res) => res.status(404).send("404 Not Found"));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
