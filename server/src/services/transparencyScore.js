const calculateTransparencyScore = (findings) => {
  let score = 100;

  findings.forEach((finding) => {
    switch (finding.severity) {
      case "high":
        score -= 20;
        break;

      case "medium":
        score -= 10;
        break;

      case "low":
        score -= 5;
        break;

      default:
        break;
    }
  });

  // Score should always stay between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return score;
};

module.exports = calculateTransparencyScore;
