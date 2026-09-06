"use client";

import { Button } from "@cosmediate/ui";

import { ReviewActionMenu } from "./ReviewActionMenu";

export const ReplyActions = ({
  handleEditReply,
  handleDeleteReply,
  activeReplyEditId,
  isAuthor,
  replyId,
}: {
  handleEditReply: (replyId: string) => void;
  handleDeleteReply: (replyId: string) => void;
  activeReplyEditId: string | null;
  isAuthor: boolean;
  replyId: string;
}) => {
  return (
    <div className="w-full flex items-center justify-end gap-2">
      {activeReplyEditId === replyId && (
        <Button
          type="button"
          variant={"ghost"}
          className="text-xs text-primary-accent hover:text-primary-accent-dark !bg-transparent !hover:bg-transparent !p-0"
          onClick={() => handleEditReply(replyId)}
        >
          Cancel
        </Button>
      )}

      {isAuthor && (
        <ReviewActionMenu
          handleDelete={() => handleDeleteReply(replyId)}
          handleEdit={() => handleEditReply(replyId)}
          buttonClassName="hover:bg-primary-accent/10"
        />
      )}
    </div>
  );
};
