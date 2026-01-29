const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../blobService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = await uploadImage(req.file);
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
