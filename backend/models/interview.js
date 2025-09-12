const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  description: { type: String }, // why this question is asked
  userAnswer: { type: String },  // transcribed answer
  feedback: { type: String },    // AI feedback for this answer
  relevanceScore: { type: Number, min: 0, max: 10 },
  grammarScore: { type: Number, min: 0, max: 10 },
});

const interviewSchema = new mongoose.Schema(
  {
    JobTitle: {
      type: String,
      required: true,
    },
    Topics: {
      type: String,
      required: true,
    },
    ExperienceYear: {
      type: Number,
      required: true,
    },
    Questions: [answerSchema], // list of Q&A with AI feedback
    overallFeedback: { type: String },
    overallScore: { type: Number, min: 0, max: 10 },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const InterviewModel = mongoose.model("InterviewModel", interviewSchema);

module.exports = InterviewModel;
