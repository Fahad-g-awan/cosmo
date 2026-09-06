"use client";

import "./loader.css";

export const FullScreenLoader = () => {
  return (
    <div className="absolute inset-0 h-screen w-screen flex items-center justify-center z-[1000] bg-gray-400/10 bg-clip-padding backdrop-filter backdrop-blur-sm">
      <div className="loader" />
    </div>
  );
};
