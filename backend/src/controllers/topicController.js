const csTopics = require("../../../database/seed/csTopics.json");

function getTopics(req, res) {
  return res.json({ topics: csTopics });
}

module.exports = {
  getTopics,
};
