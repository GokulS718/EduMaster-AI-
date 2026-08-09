const { generateStep1Lesson, evaluateStep2Answer } = require("../services/geminiService");

async function handleStep1Teach(req, res) {
  try {
    const { topic, level } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const data = await generateStep1Lesson(topic, level || "Intermediate");
    return res.json(data);
  } catch (err) {
    console.error("Error in handleStep1Teach:", err);
    return res.status(500).json({ error: "Failed to process Step 1 teaching" });
  }
}

async function handleStep2Evaluate(req, res) {
  try {
    const { topic, studentAnswer, level } = req.body;
    if (!topic || studentAnswer === undefined) {
      return res.status(400).json({ error: "Topic and studentAnswer are required" });
    }

    const evalResult = await evaluateStep2Answer(topic, studentAnswer, level || "Intermediate");
    return res.json(evalResult);
  } catch (err) {
    console.error("Error in handleStep2Evaluate:", err);
    return res.status(500).json({ error: "Failed to process evaluation" });
  }
}

module.exports = {
  handleStep1Teach,
  handleStep2Evaluate,
};
