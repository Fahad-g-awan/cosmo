import Image from "next/image";
import React from "react";

export const ImageSection = ({
  image,
  title,
}: {
  image: string;
  title: string;
}) => {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border">
      <Image src={image} alt={title} fill className="object-cover" />
    </div>
  );
};
