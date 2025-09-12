import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";

export default function Landing() {
  const { user } = useContext(AuthContext); // ✅ correctly extract user
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* Full-width Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1950&q=80')", // ✅ better unsplash direct link
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-3xl px-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Ace Your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-600 text-transparent bg-clip-text">
              Next Interview
            </span>{" "}
            with AI
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-8">
            Simulate real interviews with instant AI feedback. Sharpen your
            communication, problem-solving, and confidence — anytime, anywhere.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <button
                onClick={() => navigate("/arena")} // ✅ take logged-in users to "My Arena"
                className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 transition-transform transform hover:scale-105"
              >
                My Arena
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")} // ✅ take not-logged-in users to Auth
                className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 transition-transform transform hover:scale-105"
              >
                Let's Start
              </button>
            )}

            <button
              onClick={() => navigate("/Learn-More")}
              className="px-8 py-3 rounded-full font-semibold text-indigo-200 border border-indigo-200 hover:bg-indigo-200 hover:text-gray-900 transition-colors transform hover:scale-105"
            >
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-white text-gray-900 py-16 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose <span className="text-indigo-600">InterviewMate AI</span>?
          </h2>
          <p className="text-gray-600">
            Everything you need to prepare smarter, faster, and more effectively.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Generated Questions",
              desc: "Adaptive questions for your role and experience level.",
            },
            {
              title: "Instant Feedback",
              desc: "Receive detailed insights on answers, tone, and pacing.",
            },
            {
              title: "Role Templates",
              desc: "Practice for SDE, Data Science, Product, and more.",
            },
            {
              title: "Webcam & Mic Analysis",
              desc: "Analyze your expressions, clarity, and communication.",
            },
            {
              title: "Progress Tracking",
              desc: "View reports, scores, and track improvement over time.",
            },
            {
              title: "Privacy First",
              desc: "Your practice sessions are secure and private.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 p-6 shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">
                {f.title}
              </h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        &copy; 2025 InterviewMate AI. All rights reserved.
      </footer>
    </div>
  );
}
