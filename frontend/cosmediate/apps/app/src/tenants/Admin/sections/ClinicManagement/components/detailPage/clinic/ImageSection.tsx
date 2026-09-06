import { ScrollArea } from "@cosmediate/ui/index";
import { cn } from "@cosmediate/ui/lib/utils";
import Image from "next/image";
import React from "react";

export const ImageSection = ({
  logo,
  images,
  alt,
}: {
  logo: string;
  images: string[];
  alt: string;
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-3">
      <ImageCard className="w-full h-full" image={logo} alt={alt} />
      <ScrollArea orientation="horizontal" className="w-full">
        <div className="w-full flex items-center justify-start gap-2">
          {images?.length &&
            images.map((img, index) => (
              <ImageCard key={index} image={img} alt={alt} />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const ImageCard = ({
  image,
  alt,
  className,
}: {
  image: string;
  alt: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative w-[150px] h-[150px] aspect-video rounded-xl overflow-hidden border",
        className
      )}
    >
      <Image
        src={image}
        alt={alt}
        height={200}
        width={200}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
