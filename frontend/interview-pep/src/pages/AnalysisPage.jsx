// src/pages/AnalysisPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/ai/interviews",
  withCredentials: true,
});

const AnalysisPage = () => {
  const { interviewId } = useParams(); // ✅ match route param
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        console.log("Fetching interview analysis for ID:", interviewId);
        const res = await client.get(`/analysis/${interviewId}`); // ✅ corrected
        setInterview(res.data);
      } catch (err) {
        console.error("Error fetching interview analysis:", err);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) fetchInterview();
  }, [interviewId]);

  if (loading) return <p className="text-center mt-10">Loading analysis...</p>;
  if (!interview) return <p className="text-center mt-10 text-red-500">No analysis found.</p>;

  console.log(interview)
;
  // calculate average score
  const totalQuestions = interview.Questions?.length || 0;
  const avgScore =
    totalQuestions > 0
      ? (
          interview.Questions.reduce(
            (acc, q) => acc + (q.relevanceScore + q.grammarScore) / 2,
            0
          ) / totalQuestions
        ).toFixed(1)
      : 0;

  return (
    <div className="p-6 mt-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 rounded-xl shadow-md mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Analysis</h1>
        <p className="text-lg">👤 User: {interview.user?.name || "N/A"}</p>
        <p className="text-sm opacity-90">
          📅{" "}
          {new Date(interview.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Questions Section */}
      <h2 className="text-2xl font-semibold mb-4">Questions & Answers</h2>
      <div className="space-y-5">
        {interview.Questions?.map((q, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-5 shadow-sm hover:shadow-md transition bg-white"
          >
            <p className="font-semibold text-gray-800 mb-2">
              Q{idx + 1}: {q.question}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Answer:</span> {q.userAnswer || q.answer || "N/A"}
            </p>

            <div className="flex flex-wrap gap-3 mt-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Relevance: {q.relevanceScore ?? "N/A"}/10
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Grammar: {q.grammarScore ?? "N/A"}/10
              </span>
              {q.score && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Overall: {q.score}/10
                </span>
              )}
            </div>

            <p className="italic text-gray-600 mt-3">
              💡 Feedback: {q.feedback || "No feedback provided"}
            </p>
          </div>
        ))}
      </div>

      {/* Overall Feedback */}
      <div className="mt-10 p-6 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Overall Feedback</h2>
        <p className="text-gray-700 mb-3">
          {interview.overallFeedback || "No overall feedback available."}
        </p>
        <p className="font-bold text-indigo-700 text-lg">
          ⭐ Average Score: {avgScore}/10
        </p>
      </div>
    </div>
  );
};

export default AnalysisPage;
