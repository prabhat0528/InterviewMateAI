import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function InterviewPage() {
  const location = useLocation();

  const {
    job_title: JobTitle = "Unknown Job",
    topics: Topics = "General",
    experience_year: ExperienceYear = 0,
    questions: Questions = [],
  } = location.state || {};

  const [transcriptions, setTranscriptions] = useState(Array(Questions.length).fill(""));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // 🔹 loading state
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
      console.log(`Q${idx + 1} Transcription:`, text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    alert("🎤 Recording started...");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      alert("Recording stopped.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // 🔹 start loading
    setResult(null);  // reset previous result
    try {
      const res = await axios.post("http://127.0.0.1:5000/evaluate_answers", {
        questions: Questions,
        answers: transcriptions,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error evaluating answers");
    } finally {
      setLoading(false); // 🔹 stop loading
    }
  };

  if (!location.state) return <p>No interview data found.</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{JobTitle} Interview</h1>

      {Questions.map((q, idx) => (
        <div key={idx} className="mb-6">
          <p className="font-semibold">{idx + 1}. {q.question}</p>

          <div className="flex gap-4 mt-2">
            <button onClick={() => startRecording(idx)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
              🎤 Start
            </button>
            <button onClick={stopRecording} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
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

      <button
        onClick={handleSubmit}
        className={`bg-green-600 text-white px-6 py-2 rounded-lg mt-6 flex items-center gap-2 ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        disabled={loading}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        {loading ? "Evaluating..." : "Submit Interview"}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-gray-50 border rounded-xl">
          <h3 className="text-lg font-bold text-gray-800">Feedback</h3>
          <p className="text-gray-700 mt-2">{result.overall_feedback}</p>
          <p className="mt-4 text-lg font-semibold">
            Score: <span className="text-blue-600">{result.overall_score}/10</span>
          </p>

          {result.per_answer?.map((item, idx) => (
            <div key={idx} className="mb-3 p-3 bg-white rounded-lg border">
              <p><b>Q{item.question_index + 1} Feedback:</b> {item.feedback}</p>
              <p>Relevance: {item.relevance_score}/10, Grammar: {item.grammar_score}/10</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
