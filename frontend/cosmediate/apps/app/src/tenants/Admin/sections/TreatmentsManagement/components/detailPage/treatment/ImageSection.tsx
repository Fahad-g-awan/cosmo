import Image from "next/image";
import React from "react";

export const ImageSection = ({
  image,
  alt,
}: {
  image: string;
  alt: string;
}) => {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border">
      <Image src={image} alt={alt} fill className="object-cover" />
    </div>
  );
};
