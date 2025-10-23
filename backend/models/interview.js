const mongoose = require("mongoose");

const perAnswerSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  feedback: String,
  relevanceScore: Number,
  grammarScore: Number,
});

const attemptSchema = new mongoose.Schema({
  overallFeedback: String,
  overallScore: Number,
  perAnswer: [perAnswerSchema],
  createdAt: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  JobTitle: String,
  Topics: String,
  ExperienceYear: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attempts: [attemptSchema],
}, { timestamps: true });

module.exports = mongoose.model("InterviewModel", interviewSchema);
