import { DateTime } from "luxon";
import React from "react";

import { Blog } from "@cosmediate/type-utils/blog";
import { cn } from "@cosmediate/ui/lib/utils";
import { Badge } from "@cosmediate/ui";

import { Calendar, Clock, Eye, FileText } from "lucide-react";

export const BlogInfoSection = ({ blog }: { blog: Blog }) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    const dateStr = typeof date === "string" ? date : date.toISOString();
    return DateTime.fromISO(dateStr).toFormat("dd MMM yyyy, HH:mm");
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "HIDDEN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <FileText className="h-4 w-4" />
        Blog Information
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-4">
        <div className="w-full flex flex-col items-center justify-start gap-3">
          <div className="w-full flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              className={cn("text-xs uppercase", getStatusColor(blog.status))}
            >
              {blog.status}
            </Badge>
          </div>

          <div className="w-full flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge variant="secondary" className="capitalize">
              {blog.categoryName}
            </Badge>
          </div>
        </div>

        {/* <Separator className="bg-100" /> */}

        <div className="w-full flex flex-col items-start justify-start gap-3">
          {blog.publishedAt && (
            <div className="w-full flex items-center gap-3 p-3 bg-primary-accent/5 rounded-lg">
              <Eye className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-sm text-800">
                  {formatDate(blog.publishedAt)}
                </p>
              </div>
            </div>
          )}

          <div className="w-full flex items-center gap-3 p-3 bg-primary-accent/5 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm text-800">{formatDate(blog.createdAt)}</p>
            </div>
          </div>

          <div className="w-full flex items-center gap-3 p-3 bg-primary-accent/5 rounded-lg">
            <Clock className="h-4 w-4 text-gray-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm text-800">{formatDate(blog.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
