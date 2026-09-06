"use client";

import React, { useMemo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cosmediate/ui/components/accordion";
import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { useTranslations } from "@cosmediate/i18n/client";
import { Clinic, FAQs } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { NoDataFound } from "@cosmediate/ui";

import TabsContainer from "@web/components/profile/TabsContainer";

import { Minus, Plus } from "lucide-react";

type FAQWithId = FAQs & { id: string };

const FaqsTab = ({ clinic }: { clinic: Clinic }) => {
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const faqs = useMemo<FAQWithId[]>(() => {
    if (!clinic?.faqs) return [];

    return clinic.faqs.map((faq, index) => ({
      ...faq,
      id: String(index),
    }));
  }, [clinic]);

  if (faqs && faqs?.length < 1) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <NoDataFound
          message={common.dataNotFound}
          description={common.pleaseTryAgainLater}
        />
      </div>
    );
  }

  return (
    <TabsContainer>
      <div className="flex flex-col items-start justify-center w-full bg-gray-card rounded-2xl p-2">
        <div className="text-xl text-700 font-bold leading-6 py-4 px-6">
          {profile.sections.faqs}
        </div>

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
                    "group-data-[state=open]:bg-white group-data-[state=open]:font-semibold group-data-[state=open]:rounded-t-lg [&>svg]:hidden hover:no-underline",
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
      </div>
    </TabsContainer>
  );
};

export default FaqsTab;
