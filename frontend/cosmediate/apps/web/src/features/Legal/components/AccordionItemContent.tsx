"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cosmediate/ui";

export const AccordionItemContent = ({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: React.ReactNode;
}) => {
  return (
    <AccordionItem
      value={id}
      className="w-full bg-white rounded-xl border overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent rounded-md cursor-pointer">
        <span className="text-lg font-semibold">{title}</span>
      </AccordionTrigger>

      <AccordionContent className="w-full px-4 pt-2 pb-4">
        {content}
      </AccordionContent>
    </AccordionItem>
  );
};
