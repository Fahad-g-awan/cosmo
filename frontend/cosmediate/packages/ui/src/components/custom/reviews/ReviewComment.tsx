"use client";

export const ReviewComment = ({ comment }: { comment: string }) => {
  return (
    <div className="text-sm leading-[18px] text-900 text-wrap">{comment}</div>
  );
};
