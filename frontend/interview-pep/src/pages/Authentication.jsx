import React, { useContext, useState } from "react";
import { AuthContext } from "../context/Authcontext";
import { FlashContext } from "../context/FlashContext";
import { useNavigate } from "react-router-dom";

export default function Authentication() {
  const { signup, login, user } = useContext(AuthContext);
  const { showFlash } = useContext(FlashContext);
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false); // ✅ new loading state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // ✅ Start loading before async call

    try {
      if (isSignup) {
        const result = await signup(form.name, form.email, form.password);
        if (result.success) {
          showFlash(`Signup successful 🎉, Welcome ${result.response.data.user.name}`, "success");
          navigate("/");
        } else {
          showFlash(result.message || "Signup failed ❌", "error");
        }
      } else {
        const result = await login(form.email, form.password);
        if (result.success) {
          showFlash(`Login successful 🎉, Welcome ${result.response.data.user.name}`, "success");
          navigate("/");
        } else {
          showFlash(result.message || "Login failed ❌", "error");
        }
      }
    } catch (error) {
      console.error(error);
      showFlash("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false); // ✅ Stop loading after async call
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold mb-4">
          {isSignup ? "Sign Up" : "Login"}
        </h2>

        {isSignup && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mb-3"
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-3"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-3"
          required
        />

        <button
          type="submit"
          disabled={loading} // ✅ Disable button when loading
          className={`w-full text-white p-2 rounded-lg transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading
            ? isSignup
              ? "Signing Up..."
              : "Logging In..."
            : isSignup
            ? "Sign Up"
            : "Login"}
        </button>

        <p className="mt-4 text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 cursor-pointer"
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
}
