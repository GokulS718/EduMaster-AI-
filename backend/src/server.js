require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API router middleware
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "EduMaster AI Backend Service is Running", docs: "/api/health" });
});

app.listen(PORT, () => {
  console.log(`[EduMaster AI Backend] Server listening on http://localhost:${PORT}`);
});
