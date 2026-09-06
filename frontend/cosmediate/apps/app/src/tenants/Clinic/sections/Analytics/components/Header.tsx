import Image from "next/image";
import React from "react";

interface HeaderProps {
  userName: string;
  clinic: {
    logo: string;
    name: string;
  };
}

export const Header = ({ userName, clinic }: HeaderProps) => {
  return (
    <div className="w-full flex items-center justify-between max-sm:flex-col gap-4">
      <div className="w-full flex flex-col items-start justify-center">
        <p className="font-medium text-[24px] leading-9 text-500 max-sm:text-[20px]">
          Welcome back,
        </p>
        <p className="capitalize font-bold text-[30px] leading-9 text-800 max-sm:text-[28px]">
          {userName}
        </p>
      </div>

      <div className="w-full flex items-center justify-end max-sm:justify-between sm:gap-4">
        <div className="w-full flex flex-col items-end justify-center max-sm:items-start ">
          <div className="text-[11px] text-500 font-medium leading-4 tracking-tight">
            Clinic:
          </div>
          <div className="capitalize text-sm text-900 font-medium leading-[21px]">
            {clinic?.name}
          </div>
        </div>
        <div className="w-[95px] max-sm:w-[60px] h-[60px] max-sm:h-[45px] flex items-center justify-center rounded-[8px] border border-stroke overflow-hidden">
          <Image
            src={clinic?.logo || "/placeholder.jpg"}
            height={100}
            width={100}
            alt={clinic?.name || "clinic logo"}
            className="w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
