import React, { useContext } from "react";
import { FlashContext } from "../context/FlashContext";

export default function FlashMessage() {
  const { flash } = useContext(FlashContext);

  if (!flash) return null;

  return (
    <div
      className={`fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg font-medium text-sm sm:text-base transition-all duration-500 ${
        flash.type === "success"
          ? "bg-green-500 text-white border border-green-300"
          : "bg-red-500 text-white border border-red-300"
      }`}
      style={{ zIndex: 10000 }}
    >
      {flash.message}
    </div>
  );
}
