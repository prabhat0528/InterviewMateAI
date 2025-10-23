import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/Authcontext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const client = axios.create({
  baseURL: "https://interviewmateai-backend.onrender.com/ai/interviews",
  withCredentials: true,
});

const GraphicalAnalysisPage = () => {
  const { interviewId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    const fetchGraphData = async () => {
      if (!user?.id) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        //  Fetch current interview (and its attempts)
        const { data: currentInterview } = await client.get(`/analysis/${interviewId}`);

        if (!currentInterview) {
          setError("Interview not found.");
          setLoading(false);
          return;
        }

        const currentJobTitle = currentInterview.JobTitle || "Unknown Job";
        setJobTitle(currentJobTitle);

        //  Fetch all interviews of the current user
        const { data: allInterviewsRes } = await client.get(`/${user.id}`);
        const allInterviews = allInterviewsRes.interviews || [];

        //  Flatten all attempts across interviews of the same JobTitle
        const allAttempts = allInterviews
          .filter((i) => i.JobTitle === currentJobTitle)
          .flatMap((i) =>
            (i.attempts || []).map((a) => ({
              createdAt: a.createdAt,
              overallScore: a.overallScore,
            }))
          )
          .filter((a) => a.overallScore != null)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (allAttempts.length === 0) {
          setError(`No scored attempts found for ${currentJobTitle}.`);
          setChartData(null);
          setLoading(false);
          return;
        }

        //  Prepare chart labels and data points
        const labels = allAttempts.map((a) =>
          new Date(a.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })
        );
        const dataPoints = allAttempts.map((a) => a.overallScore);

        setChartData({
          labels,
          datasets: [
            {
              label: `${currentJobTitle} Score History`,
              data: dataPoints,
              borderColor: "rgb(79, 70, 229)",
              backgroundColor: "rgba(79, 70, 229, 0.3)",
              tension: 0.3,
              fill: true,
              pointRadius: 5,
            },
          ],
        });

       
        const average =
          allAttempts.reduce((acc, a) => acc + a.overallScore, 0) /
          allAttempts.length;
        setAvgScore(average.toFixed(1));
        setError(null);
      } catch (err) {
        console.error("Error fetching data for graphical analysis:", err);
        setError("Failed to load graphical analysis data.");
      } finally {
        setLoading(false);
      }
    };

    if (interviewId && user?.id) fetchGraphData();
  }, [interviewId, user?.id]);

  // ---------- UI Section ----------
  if (loading)
    return <p className="text-center mt-10">Loading graphical analysis...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!chartData)
    return (
      <p className="text-center mt-10 text-gray-600">
        Insufficient data to generate a graph.
      </p>
    );

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Performance Trend for: ${jobTitle}`,
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Overall Score (0–10)" },
        min: 0,
        max: 10,
      },
      x: {
        title: { display: true, text: "Attempt Date" },
      },
    },
  };

  return (
    <div className="p-6 mt-16 max-w-4xl mx-auto bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Graphical Analysis
      </h1>

      <div className="mb-6 text-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          &larr; Back to Interviews
        </button>
      </div>

      <div className="relative h-96">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-700 text-lg">
          ⭐ Average Score for <strong>{jobTitle}</strong>:{" "}
          <span className="text-blue-600">{avgScore}/10</span>
        </p>
      </div>

      <div className="mt-8 text-center p-4 border-t">
        <p className="text-gray-600">
          This chart tracks your overall score (out of 10) over time for the
          role of <strong>{jobTitle}</strong>.
        </p>
      </div>
    </div>
  );
};

export default GraphicalAnalysisPage;
