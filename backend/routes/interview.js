const express = require("express");
const router = express.Router();
const InterviewModel = require("../models/interview");
const mongoose = require("mongoose");
const User = require("../models/user");

// *************************** Create New Interview ***************************
router.post("/create/:userId", async (req, res) => {
  try {
    const { JobTitle, Topics, ExperienceYear, Questions } = req.body;
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
      Questions: Questions || [],
      user: userId,
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

// *************************** Fetch Single Interview (Past Analysis) ***************************
router.get("/analysis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching interview analysis for ID:", id);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const interview = await InterviewModel.findById(id).populate("user");

    console.log(interview);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (err) {
    console.error("Error fetching interview analysis:", err.message);
    res.status(500).json({ message: "Server error while fetching analysis", error: err.message });
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

    res.json({ interviews: user.Interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// *************************** Update Interview ***************************
router.put("/update/:id", async (req, res) => {
  try {
    const interviewId = req.params.id;
    const updateData = req.body;

    const updatedInterview = await InterviewModel.findByIdAndUpdate(
      interviewId,
      updateData,
      { new: true }
    );

    res.json(updatedInterview);
  } catch (err) {
    res.status(500).json({ error: "Failed to update interview" });
  }
});

// *************************** Delete Interview ***************************
router.delete("/delete/:userId/:interviewId", async (req, res) => {
  try {
    const { userId, interviewId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.Interview = user.Interview.filter(
      (i) => i.toString() !== interviewId
    );

    await user.save();
    await InterviewModel.findByIdAndDelete(interviewId);

    res.json({ message: "Interview deleted", interviews: user.Interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
