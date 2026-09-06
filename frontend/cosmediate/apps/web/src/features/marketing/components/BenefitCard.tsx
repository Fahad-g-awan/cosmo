import Image from "next/image";
import { cn } from "@cosmediate/ui/lib/utils";

export interface BenefitItem {
  image: string;
  title: string;
  description: string;
}

export const BenefitCard = ({ benefit }: { benefit: BenefitItem }) => {
  return (
    <div className={cn("w-full flex flex-col justify-center items-center")}>
      <div
        className={cn(
          "lg:max-w-[325px] max-lg:w-full flex flex-col justify-center items-center gap-4"
        )}
      >
        <Image
          src={benefit?.image}
          alt={benefit.title}
          width={80}
          height={80}
          quality={100}
        />

        <div className="text-xl leading-[26px] text-primary-accent font-semibold text-center">
          <h1>{benefit.title}</h1>
        </div>

        <div className={cn("text-sm text-900 text-center break-words")}>
          <p>{benefit.description}</p>
        </div>
      </div>
    </div>
  );
};
