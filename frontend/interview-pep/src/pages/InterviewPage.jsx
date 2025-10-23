import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get interview data from location.state
  
  const state = location.state || {};
  console.log(state);

  const JobTitle = state.JobTitle || state.job_title || "Unknown Job";
  const Topics = state.Topics || state.topics || "General";
  const ExperienceYear = state.ExperienceYear ?? state.experience_year ?? 0;
  const Questions = state.questions || state.Questions || [];
  const InterviewId =
    state.interview_id || state.interviewId || state.interview?._id ||  state._id || null;

  const [transcriptions, setTranscriptions] = useState(
    () => Array(Questions.length).fill("")
  );
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackReady, setFeedbackReady] = useState(false); // track if AI feedback is ready
  const recognitionRef = useRef(null);

  const startRecording = (idx) => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscriptions((prev) => {
        const newTrans = [...prev];
        newTrans[idx] = text;
        return newTrans;
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      alert("Speech recognition error: " + event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    alert("🎤 Recording started...");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      alert("Recording stopped.");
    }
  };

  // Only get AI feedback without saving
  const handleGetFeedback = async () => {
    if (Questions.length === 0) {
      alert("No questions available to evaluate.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/evaluate_answers",
        { questions: Questions, answers: transcriptions },
        { withCredentials: true }
      );

      const evaluation = res.data;

      const attempt = {
        overallFeedback: evaluation.overall_feedback ?? evaluation.overallFeedback ?? "",
        overallScore: Number(evaluation.overall_score ?? evaluation.overallScore ?? 0),
        perAnswer: Questions.map((q, idx) => ({
          question: q.question ?? q.text ?? `Question ${idx + 1}`,
          userAnswer: transcriptions[idx] || "",
          feedback: evaluation.per_answer?.[idx]?.feedback || "",
          relevanceScore: Number(evaluation.per_answer?.[idx]?.relevance_score ?? 0),
          grammarScore: Number(evaluation.per_answer?.[idx]?.grammar_score ?? 0),
        })),
        createdAt: new Date().toISOString(),
      };

      setLatestAttempt(attempt);
      setFeedbackReady(true); // show save/back buttons
    } catch (err) {
      console.error("Error getting feedback:", err);
      alert("Error evaluating answers. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttempt = async () => {
    if (!InterviewId || !latestAttempt) {
      alert("Interview ID or attempt missing. Cannot save attempt.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/ai/interviews/addAttempt/${InterviewId}`,
        { attempt: latestAttempt },
        { withCredentials: true }
      );
      alert("✅ Attempt saved successfully!");
      setFeedbackReady(false);
      setTranscriptions(Array(Questions.length).fill(""));
      setLatestAttempt(null);
      navigate("/arena");
    } catch (err) {
      console.error("Error saving attempt:", err);
      alert("Error saving attempt. Check console for details.");
    }
  };

  if (!location.state) return <p>No interview data found.</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{JobTitle} Interview</h1>
      <p className="text-gray-600 mb-6">
        Topics: {Topics} | Experience: {ExperienceYear} years
      </p>

      {Questions.map((q, idx) => (
        <div key={idx} className="mb-6">
          <p className="font-semibold">
            {idx + 1}. {q.question ?? q.text ?? `Question ${idx + 1}`}
          </p>

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => startRecording(idx)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              🎤 Start
            </button>
            <button
              onClick={stopRecording}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              ⏹ Stop
            </button>
          </div>

          {transcriptions[idx] && (
            <p className="mt-3 text-gray-700 italic">
              <b>Answer:</b> {transcriptions[idx]}
            </p>
          )}
        </div>
      ))}

      {/* Get AI Feedback button */}
      <button
        onClick={handleGetFeedback}
        className={`bg-green-600 text-white px-6 py-2 rounded-lg mt-6 ${
          loading ? "cursor-not-allowed opacity-70" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Evaluating..." : "Get Feedback"}
      </button>

      {/* Show feedback */}
      {latestAttempt && (
        <div className="mt-8 p-6 bg-gray-50 border rounded-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Latest Attempt Feedback</h3>

          {latestAttempt.perAnswer.map((item, idx) => (
            <div key={idx} className="mb-3 p-3 bg-white rounded-lg border">
              <p><b>Q{idx + 1}: {item.question}</b></p>
              <p className="italic text-gray-700">Your Answer: {item.userAnswer}</p>
              <p className="mt-1 text-gray-800">Feedback: {item.feedback}</p>
              <p className="text-gray-600 text-sm">
                Relevance: {item.relevanceScore}/10 | Grammar: {item.grammarScore}/10
              </p>
            </div>
          ))}

          <p className="mt-4 font-semibold text-gray-800">Overall Feedback: {latestAttempt.overallFeedback}</p>
          <p className="mt-1 font-bold text-blue-600">Score: {latestAttempt.overallScore}/10</p>

          {/* Save / Back buttons */}
          {feedbackReady && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSaveAttempt}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Save Attempt
              </button>
              <button
                onClick={() => navigate("/arena")}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
