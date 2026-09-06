import React from "react";

import { Badge } from "@cosmediate/ui/index";
import { Tag } from "lucide-react";

export const TagsSection = ({ tags }: { tags: string[] }) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <Tag className="h-5 w-5" />
        Tags
      </div>

      <div className="w-full flex flex-col items-center justify-start">
        <div className="w-full flex flex-wrap gap-2">
          {tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}

          {tags?.length < 1 && (
            <p className="text-center text-sm text-muted-foreground italic py-10">
              No tags available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
