const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const InterviewModel = require("../models/interview");
const User = require("../models/user");

// *************************** Create New Interview ***************************
router.post("/create/:userId", async (req, res) => {
  try {
    const { JobTitle, Topics, ExperienceYear } = req.body;
    const { userId } = req.params;

    if (!JobTitle || !Topics || !ExperienceYear) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newInterview = new InterviewModel({
      JobTitle,
      Topics,
      ExperienceYear: Number(ExperienceYear),
      user: userId,
      attempts: [], // initialize empty attempts array
    });

    await newInterview.save();

    await User.findByIdAndUpdate(userId, {
      $push: { Interview: newInterview._id },
    });

    res.status(201).json({ success: true, interview: newInterview });
  } catch (err) {
    console.error("Create Interview Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// *************************** Add New Attempt ***************************
router.post("/addAttempt/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { attempt } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    if (!attempt) {
      return res.status(400).json({ message: "Attempt data missing" });
    }

    const interview = await InterviewModel.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Push the new attempt into the attempts array
    interview.attempts.push({
      overallFeedback: attempt.overallFeedback,
      overallScore: attempt.overallScore,
      perAnswer: attempt.perAnswer,
      createdAt: attempt.createdAt || new Date(),
    });

    await interview.save();

    res.status(200).json({
      success: true,
      message: "New attempt added successfully",
      latestAttempt: interview.attempts[interview.attempts.length - 1],
    });
  } catch (err) {
    console.error("Error adding attempt:", err);
    res.status(500).json({
      message: "Server error while adding attempt",
      error: err.message,
    });
  }
});

// *************************** Fetch Single Interview (All Attempts) ***************************
router.get("/analysis/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const interview = await InterviewModel.findById(id).populate("user");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({
      success: true,
      JobTitle: interview.JobTitle,
      Topics: interview.Topics,
      ExperienceYear: interview.ExperienceYear,
      attempts: interview.attempts,
      user: interview.user,
    });
  } catch (err) {
    console.error("Error fetching interview analysis:", err.message);
    res.status(500).json({
      message: "Server error while fetching analysis",
      error: err.message,
    });
  }
});

// *************************** Get All Interviews for a User ***************************
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("Interview");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, interviews: user.Interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// *************************** Update Interview (Metadata Only) ***************************
router.put("/update/:id", async (req, res) => {
  try {
    const interviewId = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ error: "Invalid interview id" });
    }

    const setObj = {};
    if (updateData.JobTitle) setObj.JobTitle = updateData.JobTitle;
    if (updateData.Topics) setObj.Topics = updateData.Topics;
    if (updateData.ExperienceYear) setObj.ExperienceYear = updateData.ExperienceYear;

    if (Object.keys(setObj).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const updatedInterview = await InterviewModel.findByIdAndUpdate(
      interviewId,
      { $set: setObj },
      { new: true, runValidators: true }
    );

    if (!updatedInterview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    res.json({ success: true, updatedInterview });
  } catch (err) {
    console.error("Failed to update interview:", err);
    res.status(500).json({ error: "Failed to update interview", details: err.message });
  }
});

// *************************** Delete Interview ***************************
router.delete("/delete/:userId/:interviewId", async (req, res) => {
  try {
    const { userId, interviewId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.Interview = user.Interview.filter((i) => i.toString() !== interviewId);

    await user.save();
    await InterviewModel.findByIdAndDelete(interviewId);

    res.json({ success: true, message: "Interview deleted", interviews: user.Interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
