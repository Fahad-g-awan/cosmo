import React from "react";

const Loader = () => {
  return (
    <div className="bg-ghost-blue z-[10000] fixed inset-0 overflow-hidden w-full h-screen flex items-center justify-center">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
