const moodScores = {
  Happy: 5,
  Calm: 4,
  Neutral: 3,
  Anxious: 2,
  Sad: 2,
  Stressed: 1,
  Angry: 1,
};

const journalTags = {
  stress: ["stress", "stressed", "pressure", "deadline", "burnout", "overwhelmed"],
  study: ["study", "exam", "assignment", "class", "college", "school", "grade"],
  health: ["sleep", "health", "exercise", "tired", "headache", "diet", "water"],
  relationships: ["friend", "family", "relationship", "partner", "roommate", "parent"],
};

const emotionKeywords = {
  happy: ["happy", "excited", "grateful", "joy", "good", "great", "proud"],
  stressed: ["stress", "stressed", "overwhelmed", "pressure", "deadline", "anxious"],
  sad: ["sad", "down", "lonely", "hurt", "cry", "upset"],
  calm: ["calm", "peaceful", "steady", "relaxed"],
  motivated: ["motivated", "focused", "productive", "energized"],
};

const triggerKeywords = [
  "exam",
  "deadline",
  "sleep",
  "family",
  "friend",
  "money",
  "health",
  "work",
  "study",
  "relationship",
];

const moodEmojiMap = {
  Happy: "😊",
  Calm: "😌",
  Neutral: "😐",
  Anxious: "😟",
  Sad: "😔",
  Stressed: "😣",
  Angry: "😠",
};

function getMoodScore(mood) {
  return moodScores[mood] || 3;
}

function getMoodLevel(score) {
  if (score >= 4.2) return "thriving";
  if (score >= 3.2) return "steady";
  if (score >= 2.2) return "watchful";
  return "support-needed";
}

function normalizeDateKey(date) {
  const value = new Date(date);
  return value.toISOString().slice(0, 10);
}

function getDateLabel(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getLastNDates(days) {
  const dates = [];
  const today = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - offset);
    dates.push(date);
  }

  return dates;
}

function analyzeJournalContent(text = "", explicitTags = []) {
  const normalized = text.toLowerCase();
  const tags = new Set(explicitTags);
  const triggers = [];
  const emotionCounts = {};
  let sentimentScore = 0;

  Object.entries(journalTags).forEach(([tag, words]) => {
    if (words.some((word) => normalized.includes(word))) {
      tags.add(tag);
    }
  });

  Object.entries(emotionKeywords).forEach(([emotion, words]) => {
    const count = words.filter((word) => normalized.includes(word)).length;
    if (count > 0) {
      emotionCounts[emotion] = count;
      if (emotion === "happy" || emotion === "calm" || emotion === "motivated") {
        sentimentScore += count;
      } else {
        sentimentScore -= count;
      }
    }
  });

  triggerKeywords.forEach((keyword) => {
    if (normalized.includes(keyword)) {
      triggers.push(keyword);
    }
  });

  const topEmotion =
    Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "reflective";

  let sentimentLabel = "neutral";
  if (sentimentScore >= 2) sentimentLabel = "positive";
  else if (sentimentScore <= -2) sentimentLabel = "negative";
  else if (sentimentScore < 0) sentimentLabel = "mixed";

  return {
    tags: Array.from(tags),
    triggers,
    emotion: topEmotion,
    sentiment: {
      score: sentimentScore,
      label: sentimentLabel,
    },
  };
}

function getLevel(points = 0) {
  if (points >= 500) return { level: "Advanced", nextLevelPoints: 800, min: 500 };
  if (points >= 250) return { level: "Growing", nextLevelPoints: 500, min: 250 };
  if (points >= 100) return { level: "Consistent", nextLevelPoints: 250, min: 100 };
  return { level: "Beginner", nextLevelPoints: 100, min: 0 };
}

function getBadges(streak = 0, points = 0) {
  return [
    {
      key: "streak-7",
      title: "7-Day Streak",
      earned: streak >= 7,
      description: "Showed up for wellness work a full week in a row.",
    },
    {
      key: "streak-30",
      title: "30-Day Streak",
      earned: streak >= 30,
      description: "Built a month-long wellness rhythm.",
    },
    {
      key: "consistency",
      title: "Consistency Badge",
      earned: points >= 150,
      description: "Stayed active across multiple habits and check-ins.",
    },
  ];
}

module.exports = {
  analyzeJournalContent,
  getBadges,
  getDateLabel,
  getLastNDates,
  getLevel,
  getMoodLevel,
  getMoodScore,
  moodEmojiMap,
  normalizeDateKey,
};
