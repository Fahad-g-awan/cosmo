import { cn } from "@cosmediate/ui/lib/utils";

export const SmallLoader = ({
  className,
  spinnerClassName,
  text,
  showText = true,
}: {
  className?: string;
  spinnerClassName?: string;
  text?: string;
  showText?: boolean;
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 border-4 border-primary-accent-lite border-t-primary-accent-dark rounded-full animate-spin",
          spinnerClassName
        )}
      ></div>
      {showText && <p className="text-xs text-600">{text ?? "Loading"}</p>}
    </div>
  );
};
