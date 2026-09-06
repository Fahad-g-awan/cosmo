import React from "react";

import { User } from "lucide-react";

interface AuthorInfoSectionProps {
  authorName: string;
  authorEmail: string;
  authorId?: string;
}

export const AuthorInfoSection = ({
  authorName,
  authorEmail,
  authorId,
}: AuthorInfoSectionProps) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <User className="h-5 w-5" />
        Author
      </div>

      <div className="w-full flex flex-col items-center justify-start">
        <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-4">
          <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <p className="text-sm font-medium">{authorName || "N/A"}</p>
          </div>
          <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium break-all">
              {authorEmail || "N/A"}
            </p>
          </div>
          {authorId && (
            <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg col-span-2 max-sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Author ID</p>
              <p className="text-sm font-medium font-mono break-all">
                {authorId}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
