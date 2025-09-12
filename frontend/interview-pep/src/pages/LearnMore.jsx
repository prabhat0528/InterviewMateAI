import React from "react";
import { useNavigate } from "react-router-dom";

export default function LearnMore() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 flex flex-col mt-5 p-100">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-500 to-pink-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Learn More About <span className="text-yellow-300">InterviewMate AI</span>
        </h1>
        <p className="text-lg max-w-3xl mx-auto">
          Discover how InterviewMate AI helps you practice smarter and gain
          confidence to crack your next interview.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Personalized Mock Interviews
          </h2>
          <p className="text-gray-700 mb-6">
            Our platform generates adaptive interview questions based on your role,
            skills, and experience level. Whether you are preparing for
            software engineering, product management, or data science, we have
            you covered.
          </p>

          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Real-Time Feedback
          </h2>
          <p className="text-gray-700 mb-6">
            Using AI-powered analysis, InterviewMate provides instant feedback
            on your tone, confidence, clarity, and content. Get detailed reports
            to identify areas for improvement.
          </p>
        </div>

        <div>
          {/* <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Performance Tracking
          </h2>
          <p className="text-gray-700 mb-6">
            Track your progress over time with visual reports, scores, and
            insights. Build confidence with each practice session and move one
            step closer to landing your dream job.
          </p> */}

          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Privacy & Security
          </h2>
          <p className="text-gray-700 mb-6">
            Your mock interviews are fully private and secure. We ensure that
            your data stays confidential while you focus on improving your
            skills.
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mb-20">
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 transition-transform transform hover:scale-105"
        >
          Back to Home
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm mt-auto">
        &copy; 2025 InterviewMate AI. All rights reserved.
      </footer>
    </div>
  );
}
