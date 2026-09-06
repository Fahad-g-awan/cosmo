"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@cosmediate/ui/components/button";
import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

const RejectStatus = ({
  setStatus,
}: {
  setStatus: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  const auth = useTranslations("auth");

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4")}>
      <div
        className={cn("w-full flex flex-col items-center justify-center gap-3")}
      >
        <Image
          height={100}
          width={100}
          src="/reject-icon.svg"
          alt="check"
          className={cn("h-[128px] w-[128px]", "h-[90px] w-[90px]")}
        />

        <h1
          className={cn(
            "text-xl text-900 font-medium text-center",
            "max-sm:text-[18px]",
          )}
        >
          {auth.resetPassword.rejectTitle}
        </h1>
        <p className={cn("text-sm text-center text-800")}>
          {auth.resetPassword.rejectMessage}
        </p>
      </div>

      <Button className="w-full" onClick={() => setStatus(undefined)}>
        {auth.buttons.tryAgain}
      </Button>

      <Button variant={"outline"} className="w-full p-0">
        <Link href={"/signin"} className="w-full py-2">
          {auth.buttons.backToLogin}
        </Link>
      </Button>
    </div>
  );
};
export default RejectStatus;
