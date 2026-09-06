"use client";

import Image from "next/image";

export const UserImage = ({ image, name }: { image: string; name: string }) => {
  return (
    <div className="flex items-center justify-start gap-2">
      {image ? (
        <Image
          src={image}
          alt={name}
          width={40}
          height={40}
          className="w-7 aspect-square rounded-full"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-200 flex items-center justify-center">
          <span className="text-600">{name?.charAt(0) || "U"}</span>
        </div>
      )}
    </div>
  );
};
