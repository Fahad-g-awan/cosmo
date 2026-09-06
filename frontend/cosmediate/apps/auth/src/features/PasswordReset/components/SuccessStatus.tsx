"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@cosmediate/ui/components/button";
import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

const SuccessStatus = () => {
  const auth = useTranslations("auth");

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4")}>
      <div className={cn("flex flex-col items-center justify-center gap-3")}>
        <Image
          height={100}
          width={100}
          src="/check-icon.svg"
          alt="check"
          className={cn("h-[128px] w-[128px]", "h-[90px] w-[90px]")}
        />
        <h1
          className={cn(
            "text-xl text-900 font-medium text-center",
            "max-sm:text-[18px]",
          )}
        >
          {auth.resetPassword.successTitle}
        </h1>
        <p className={cn("text-sm text-center text-800")}>
          {auth.resetPassword.successMessage}
        </p>
      </div>

      <Button className="w-full p-0">
        <Link href={"/signin"} className="w-full py-2">
          {auth.buttons.backToLogin}
        </Link>
      </Button>
    </div>
  );
};
export default SuccessStatus;
