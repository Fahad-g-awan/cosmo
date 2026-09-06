import React from "react";

const ChatBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-[70%] max-lg:w-full h-full p-6 max-sm:p-3 flex flex-col items-center justify-between">
      {children}
    </div>
  );
};

export default ChatBox;
