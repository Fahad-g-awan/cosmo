"use client";

import { Button, ButtonLoader } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { Save } from "lucide-react";

export const UpdateReply = ({
  handleSaveReplyEdit,
  setEditReplyText,
  activeReplyEditId,
  editReplyText,
  replyId,
  isSubmitting,
}: {
  handleSaveReplyEdit: (replyId: string) => void;
  setEditReplyText: (text: string) => void;
  activeReplyEditId: string | null;
  editReplyText: string;
  replyId: string;
  isSubmitting: boolean;
}) => {
  if (activeReplyEditId !== replyId) return null;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-stroke p-4 bg-white",
        "flex flex-col items-center justify-start gap-2",
      )}
    >
      <textarea
        className="w-full h-[40px] text-sm placeholder:text-500 text-700 border-none rounded-md focus:outline-none outline-none"
        value={editReplyText}
        onChange={(e) => setEditReplyText(e.target.value)}
      />

      <div className="w-full flex items-center justify-end">
        <Button
          type="button"
          onClick={() => handleSaveReplyEdit(replyId)}
          disabled={isSubmitting}
          className="w-12 px-6 py-2 bg-900 text-white rounded-lg hover:bg-900/90 disabled:opacity-50"
        >
          {isSubmitting && <ButtonLoader />}
          {!isSubmitting && <Save className="size-4 text-white" />}
        </Button>
      </div>
    </div>
  );
};
