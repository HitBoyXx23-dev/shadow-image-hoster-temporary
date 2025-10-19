const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// make sure uploads folder exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// serve static front-end files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// set up multer for image uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});
const upload = multer({ storage });

// root route - serve index.html automatically via static middleware
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// handle image upload
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  // return simple HTML so front-end JS can extract the URL
  res.send(`
    <h3>✅ Image Uploaded!</h3>
    <img src="${fileUrl}" width="300"><br>
    <a href="${fileUrl}" target="_blank">${fileUrl}</a>
  `);
});

// fallback for undefined routes
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
