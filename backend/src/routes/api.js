const express = require("express");
const router = express.Router();
const { handleStep1Teach, handleStep2Evaluate } = require("../controllers/engineController");
const { getTopics } = require("../controllers/topicController");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "OK", service: "EduMaster AI Backend", timestamp: new Date() });
});

// Topics endpoints
router.get("/topics", getTopics);

// Adaptive Engine endpoints
router.post("/step1-teach", handleStep1Teach);
router.post("/step2-evaluate", handleStep2Evaluate);

module.exports = router;
