import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@cosmediate/ui";

import { ChevronLeft } from "lucide-react";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant={"ghost"}
      onClick={() => router.back()}
      className="flex items-center justify-center gap-1 text-400 hover:text-500"
    >
      <ChevronLeft className="size-4" />
      <span className="text-xs max-sm:hidden">Back</span>
    </Button>
  );
};

export default BackButton;
