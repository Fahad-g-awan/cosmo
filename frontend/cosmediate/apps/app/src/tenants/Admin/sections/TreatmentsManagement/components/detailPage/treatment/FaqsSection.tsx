import React, { useMemo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cosmediate/ui/components/accordion";
import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { FAQs } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { InfoMessage } from "@cosmediate/ui";

import { FaQuestion } from "react-icons/fa6";
import { Minus, Plus } from "lucide-react";

type FAQWithId = FAQs & { id: string };

const FaqsSection = ({ faqs: faqsProp }: { faqs: FAQs[] }) => {
  const faqs = useMemo<FAQWithId[]>(() => {
    if (!faqsProp || faqsProp?.length < 1) return [];

    return faqsProp?.map((faq, index) => ({
      ...faq,
      id: String(index),
    }));
  }, [faqsProp]);

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-2">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <FaQuestion className="h-5 w-5" />
        Frequently Asked Questions
      </div>

      {faqs && faqs?.length < 1 && (
        <InfoMessage
          message="FAQs not available"
          variant="info"
          size="sm"
          className="my-5"
        />
      )}

      {faqs?.length > 0 && (
        <Accordion
          type="single"
          collapsible
          defaultValue={faqs?.[0]?.id}
          className="w-full bg-gray-card rounded-lg"
        >
          {faqs?.map((faq: FAQWithId, index) => {
            return (
              <AccordionItem
                key={index}
                value={faq?.id}
                className="w-full group border-none"
              >
                <AccordionTrigger
                  className={cn(
                    "cursor-pointer w-full flex justify-between items-center gap-3 p-6 transition-all duration-300",
                    "group-data-[state=open]:bg-white group-data-[state=open]:font-semibold group-data-[state=open]:rounded-t-lg [&>svg]:hidden hover:no-underline"
                  )}
                >
                  <div className="w-full capitalize text-lg max-sm:text-base font-medium text-700 hover:text-800 transition-all leading-6 group-data-[state=open]:font-bold group-data-[state=open]:text-700">
                    {faq.question}
                  </div>

                  <div className="transition-all w-5 h-5 text-primary-accent hover:text-900">
                    <Plus className="group-data-[state=open]:hidden transition-all duration-200" />
                    <Minus className="hidden group-data-[state=open]:block transition-all duration-200" />
                  </div>
                </AccordionTrigger>

                <AccordionContent className="w-full bg-white group-data-[state=open]:rounded-b-lg px-6 py-4">
                  <HtmlViewer html={tiptapJsonToHtml(faq.answer)} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default FaqsSection;
