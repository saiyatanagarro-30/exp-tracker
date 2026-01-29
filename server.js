require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/upload", require("./routes/upload"));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
