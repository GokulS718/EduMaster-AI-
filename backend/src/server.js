require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/edumaster_ai";

app.use(cors());
app.use(express.json());

// MongoDB Connection Setup
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[EduMaster AI Backend] Connected to MongoDB at ${MONGO_URI.split("@").pop()}`);
  })
  .catch((err) => {
    console.warn(`[EduMaster AI Backend] MongoDB connection warning: ${err.message}. Operating with local persistence.`);
  });

// API router middleware
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "EduMaster AI Backend Service is Running", 
    dbStatus: mongoose.connection.readyState === 1 ? "Connected to MongoDB" : "Local Storage Mode",
    docs: "/api/health" 
  });
});

app.listen(PORT, () => {
  console.log(`[EduMaster AI Backend] Server listening on http://localhost:${PORT}`);
});
