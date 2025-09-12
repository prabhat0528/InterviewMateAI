const express = require("express");
const router = express.Router();
const InterviewModel = require("../models/interview");
const User = require("../models/user");


//***************************Create New Interview************** */
router.post("/create/:userId", async (req, res) => {
  try {
    const { job_title, topics, experience_year, questions } = req.body;
    const { userId } = req.params;

    console.log("Incoming Data:", { job_title, topics, experience_year, questions });
    console.log("Incoming userId:", userId);

    if (!job_title || !topics || !experience_year) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Create new interview with proper field names
    const newInterview = new InterviewModel({
      JobTitle: job_title,
      Topics: topics,
      ExperienceYear: Number(experience_year), // ensure number type
      Questions: questions || [],
      user: userId, // REQUIRED field
    });

    await newInterview.save();

    // Push interview into user's Interview array
    await User.findByIdAndUpdate(userId, {
      $push: { Interview: newInterview._id },
    });

    res.status(201).json({ success: true, interview: newInterview });
  } catch (err) {
    console.error("Create Interview Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});




//****************************Get the Lists of Interviews****************** */
// GET all interviews for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("Interview"); // populate full interview objects

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ interviews: user.Interview }); // send populated interviews
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


//****************************Update Interview**************** */

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

//*********************Delete interview**************************
router.delete("/delete/:userId/:interviewId", async (req, res) => {
  try {
    const { userId, interviewId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.Interview = user.Interview.filter(
      (i) => i._id.toString() !== interviewId
    );

    await user.save();
    res.json({ message: "Interview deleted", interviews: user.Interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
