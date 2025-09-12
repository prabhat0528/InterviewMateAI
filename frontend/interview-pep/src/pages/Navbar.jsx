import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext"; 

export default function Navbar() {
  const navigate = useNavigate();

  
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-md z-50">
      <div
        onClick={() => navigate("/")}
        className="cursor-pointer max-w-7xl mx-auto flex items-center justify-between px-6 py-4"
      >
        {/* Logo + Name */}
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faRobot} className="text-pink-500 text-2xl" />
          <span className="font-bold text-xl tracking-wide">
            InterviewMate<span className="text-pink-500">Ai</span>
          </span>
        </div>

        
        {user && (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
