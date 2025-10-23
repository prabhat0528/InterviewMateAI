// src/pages/AnalysisPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/ai/interviews",
  withCredentials: true,
});

const AnalysisPage = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        console.log("Fetching interview analysis for ID:", interviewId);
        const res = await client.get(`/analysis/${interviewId}`);
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

  console.log(interview);

  return (
    <div className="p-6 mt-16 max-w-6xl mx-auto">
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

      {/* Each Attempt Card */}
      <div className="space-y-8">
        {interview.attempts?.map((attempt, attemptIdx) => {
          const totalQuestions = attempt.Questions?.length || 0;
          const avgScore =
            totalQuestions > 0
              ? (
                  attempt.Questions.reduce(
                    (acc, q) => acc + ((q.relevanceScore || 0) + (q.grammarScore || 0)) / 2,
                    0
                  ) / totalQuestions
                ).toFixed(1)
              : 0;

          return (
            <div key={attemptIdx} className="border rounded-xl p-6 bg-white shadow-lg">
              <h2 className="text-2xl font-semibold mb-3 text-indigo-700">
                Attempt {attemptIdx + 1}
              </h2>
              <p className="text-gray-600 mb-4">
                📅 {new Date(attempt.createdAt || interview.createdAt).toLocaleString("en-IN")}
              </p>

              {/* Questions */}
              <div className="space-y-4">
                {attempt.Questions?.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="border rounded-lg p-5 shadow-sm hover:shadow-md transition bg-gray-50"
                  >
                    <p className="font-semibold text-gray-800 mb-2">
                      Q{qIdx + 1}: {q.question}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <span className="font-medium">Answer:</span>{" "}
                      {q.userAnswer || q.answer || "N/A"}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Relevance: {q.relevanceScore ?? "N/A"}/10
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Grammar: {q.grammarScore ?? "N/A"}/10
                      </span>
                    </div>

                    <p className="italic text-gray-600 mt-3">
                      💡 Feedback: {q.feedback || "No feedback provided"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Attempt Summary */}
              <div className="mt-6 p-5 bg-gray-100 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold mb-2 text-indigo-800">
                  Attempt Summary
                </h3>
                <p className="text-gray-700 mb-2">
                  🧠 <span className="font-medium">Feedback:</span>{" "}
                  {attempt.overallFeedback || "No feedback available"}
                </p>
                <p className="font-bold text-indigo-700 text-lg">
                  ⭐ Average Score: {avgScore}/10
                </p>
                {attempt.overallScore !== undefined && (
                  <p className="font-semibold text-purple-700 mt-1">
                    🏆 Overall Score: {attempt.overallScore}/10
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisPage;
