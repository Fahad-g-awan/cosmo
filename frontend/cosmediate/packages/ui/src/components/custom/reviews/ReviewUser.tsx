"use client";

import { UserImage } from "./UserImage";

export const ReviewUser = ({
  image,
  name,
  date,
  showImage,
}: {
  image: string;
  name: string;
  date: string;
  showImage: boolean;
}) => {
  return (
    <div className="w-full max-sm:w-[70%] flex flex-col items-start justify-start gap-2">
      <div className="w-full flex items-center justify-start gap-2">
        {showImage && <UserImage image={image} name={name} />}

        <div className="text-sm max-xl:text-xs max-lg:text-sm text-700 font-bold leading-[17px] text-wrap">
          {name}
        </div>
      </div>

      <div className="text-[11px] text-400 font-medium leading-4 tracking-[0.22px]">
        {date}
      </div>
    </div>
  );
};
