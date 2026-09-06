"use client";

import { Button, ButtonLoader, Textarea } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { LucideSendHorizontal } from "lucide-react";

export const ReplyForm = ({
  handleReplySubmit,
  setReplyText,
  activeReplyId,
  reviewId,
  replyText,
  isSubmitting,
}: {
  handleReplySubmit: (reviewId: string) => void;
  setReplyText: (text: string) => void;
  activeReplyId: string | null;
  reviewId: string;
  replyText: string;
  isSubmitting: boolean;
}) => {
  if (activeReplyId !== reviewId) return null;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-stroke focus-within:border-primary-accent p-4",
        "flex flex-col items-center justify-start gap-2",
      )}
    >
      <Textarea
        className="w-full h-[40px] text-sm placeholder:text-500 text-700 border-none rounded-md focus:outline-none outline-none"
        placeholder="Write your reply"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />

      <div className="w-full flex items-center justify-end">
        <Button
          type="button"
          onClick={() => handleReplySubmit(reviewId)}
          disabled={isSubmitting}
          className="w-12 px-6 py-2 bg-900 text-white rounded-lg hover:bg-900/90 disabled:opacity-50"
        >
          {isSubmitting && <ButtonLoader />}
          {!isSubmitting && (
            <LucideSendHorizontal className="size-4 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};
