import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/Authcontext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Arena() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    JobTitle: "",
    Topics: "",
    ExperienceYear: "",
  });
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const userId = user?.id;

  const client = axios.create({
    baseURL: "http://localhost:8080/ai/interviews",
    withCredentials: true,
  });

  useEffect(() => {
    if (userId) fetchInterviews();
  }, [userId]);

  const fetchInterviews = async () => {
    try {
      const res = await client.get(`/${userId}`);
      setInterviews(res.data.interviews || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError("Failed to fetch interviews. Please try again.");
    }
  };

  const toggleForm = () => setShowForm(!showForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("You must be logged in to create an interview.");
      return;
    }

    try {
      // Call Flask backend for structured questions
      const flaskRes = await axios.post("http://127.0.0.1:5000/generate_questions", {
        job_title: formData.JobTitle,
        topics: formData.Topics,
        experience_year: formData.ExperienceYear,
      });

      const questions = flaskRes.data.questions;

      // Save interview in Node backend
      const saveRes = await client.post(`/create/${userId}`, {
        ...formData,
        Questions: questions,
      });

      navigate("/interview", {
        state: {
          ...formData,
          questions: questions,
          interview_id: saveRes.data.interview._id,
        },
      });
    } catch (err) {
      console.error("Error generating interview questions:", err);
      const errorMsg = err.response?.data?.message || "Error generating interview questions. Please try again.";
      setError(errorMsg);
    }
  };

  const handleRetake = async (interview) => {
    try {
      console.log(`This is Interview 'id: ${interview._id}`)
      const flaskRes = await axios.post("http://127.0.0.1:5000/generate_questions", {
        job_title: interview.JobTitle,
        topics: interview.Topics,
        experience_year: interview.ExperienceYear,
      });

      const questions = flaskRes.data.questions;

      navigate("/interview", {
        state: {
          ...interview,
          questions: questions,
        },
      });
    } catch (err) {
      console.error("Error regenerating questions:", err);
      alert("Failed to fetch questions");
    }
  };

  const handleDelete = async (interviewId) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;
    try {
      await client.delete(`/delete/${userId}/${interviewId}`);
      setInterviews(interviews.filter((i) => i._id !== interviewId));
      setError(null);
    } catch (err) {
      console.error("Error deleting interview:", err);
      setError("Error deleting interview. Please try again.");
    }
  };

  const handlePastAnalysis = (interviewId) => {
    navigate(`/analysis/${interviewId}`);
  };

  const handleGraphicalAnalysis = (interviewId) => {
    navigate(`/graphical-analysis/${interviewId}`);
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-100 p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition text-lg"
        >
          <span className="text-2xl">+</span> Create New Interview
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md mx-auto bg-white mb-8 p-6 rounded-2xl shadow-xl space-y-4"
        >
          <h2 className="text-xl font-semibold text-center">New Interview</h2>

          <input
            type="text"
            name="JobTitle"
            value={formData.JobTitle}
            onChange={handleChange}
            placeholder="Job Title"
            required
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="Topics"
            value={formData.Topics}
            onChange={handleChange}
            placeholder="Topics to be Covered"
            required
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            name="ExperienceYear"
            value={formData.ExperienceYear}
            onChange={handleChange}
            placeholder="Years of Experience"
            required
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Go
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviews.length > 0 ? (
          interviews.map((interview) => (
            <div
              key={interview._id}
              className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold">{interview.JobTitle}</h3>
                <p className="text-gray-600 mt-2 line-clamp-3">
                  <b>Topics: </b> {interview.Topics}
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  Experience: {interview.ExperienceYear} years
                </p>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => handleRetake(interview)}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                >
                  Retake
                </button>
                <button
                  onClick={() => handleDelete(interview._id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => handlePastAnalysis(interview._id)}
                  className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition"
                >
                  Past Analysis
                </button>
                <button
                  onClick={() => handleGraphicalAnalysis(interview._id)}
                  className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition"
                >
                  View Graphical Analysis
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-full">
            No interviews yet. Click + to create one.
          </p>
        )}
      </div>
    </div>
  );
}
