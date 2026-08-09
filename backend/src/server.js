require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/edumaster_ai";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://edu-master-ai-roan.vercel.app";
const BACKEND_URL = process.env.BACKEND_URL || "https://edumaster-ai-1.onrender.com";

// Configure CORS for Vercel deployment & local development
const allowedOrigins = [
  FRONTEND_URL,
  "https://edu-master-ai-roan.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

// MongoDB Connection Setup
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[EduMaster AI Backend] Connected to MongoDB at ${MONGO_URI.split("@").pop()}`);
  })
  .catch((err) => {
    console.warn(`[EduMaster AI Backend] Operating in local persistence mode (${err.message})`);
  });

// API router middleware
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "EduMaster AI Backend Service is Running", 
    frontendUrl: FRONTEND_URL,
    backendUrl: BACKEND_URL,
    dbStatus: mongoose.connection.readyState === 1 ? "Connected to MongoDB" : "Local Storage Mode",
    docs: `${BACKEND_URL}/api/health` 
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` EduMaster AI Backend Service Listening on http://localhost:${PORT}`);
  console.log(` Backend Production URL: ${BACKEND_URL}`);
  console.log(` Frontend Production URL: ${FRONTEND_URL}`);
  console.log(`=================================================`);
});
