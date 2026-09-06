import React, { useState, useCallback, useRef, useEffect } from "react";

import {
  useCommitRegistry,
  useFormError,
  useFormSetValue,
} from "@cosmediate/form-core";
import type { JSONContentType, FAQs } from "@cosmediate/type-utils/shared";
import { FieldError } from "@cosmediate/form-ui";
import HtmlEditor from "@cosmediate/ui/modules/HtmlRichText/HtmlEditor";
import { Button, Label, Input } from "@cosmediate/ui";
import { FormSection } from "@cosmediate/form-ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { Plus, X } from "lucide-react";

const MemoHtmlEditor = React.memo(HtmlEditor);

interface FAQItemProps {
  index: number;
  questionRef: React.RefObject<Map<number, string>>;
  answerRef: React.RefObject<Map<number, JSONContentType>>;
  onQuestionChange: (index: number, value: string) => void;
  onAnswerChange: (index: number, content: JSONContentType) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

function FAQItem({
  index,
  questionRef,
  answerRef,
  onQuestionChange,
  onAnswerChange,
  onRemove,
  canRemove,
}: FAQItemProps) {
  const questionError = useFormError(`faqs.${index}.question`);
  const answerError = useFormError(`faqs.${index}.answer`);

  return (
    <div className="p-4 border border-gray-200 rounded-xl space-y-4 bg-ghost-blue">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">FAQ {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-danger hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-sm">
          Question <span className="text-red-500">*</span>
        </Label>
        <Input
          defaultValue={questionRef.current.get(index) || ""}
          onChange={(e) => onQuestionChange(index, e.target.value)}
          placeholder="Enter question"
          className={cn("bg-white", questionError ? "border-red-500" : "")}
        />
        <FieldError error={questionError} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm">
          Answer (Rich Text) <span className="text-red-500">*</span>
        </Label>
        <MemoHtmlEditor
          content={answerRef.current.get(index)}
          setContent={(content) => onAnswerChange(index, content)}
          containerClass={cn(
            "max-sm:border-none max-sm:p-0",
            answerError ? "border-red-500" : "",
          )}
        />
        <FieldError error={answerError} />
      </div>
    </div>
  );
}

interface FAQSectionProps {
  initialFaqs?: FAQs[];
}

export const FAQSection = ({ initialFaqs }: FAQSectionProps) => {
  const initialCount = Math.max(initialFaqs?.length ?? 0, 1);
  const [faqCount, setFaqCount] = useState(initialCount);
  const faqQuestionRefs = useRef<Map<number, string>>(new Map());
  const faqAnswerRefs = useRef<Map<number, JSONContentType>>(new Map());
  const registry = useCommitRegistry();
  const setValue = useFormSetValue();
  const faqsError = useFormError("faqs");

  useEffect(() => {
    for (let i = 0; i < initialCount; i++) {
      if (!faqQuestionRefs.current.has(i)) {
        faqQuestionRefs.current.set(i, initialFaqs?.[i]?.question || "");
      }
      if (!faqAnswerRefs.current.has(i)) {
        faqAnswerRefs.current.set(
          i,
          initialFaqs?.[i]?.answer || { type: "doc", content: [] },
        );
      }
    }
  }, [initialFaqs, initialCount]);

  const syncFaqsToForm = useCallback(
    (count: number) => {
      const faqs: FAQs[] = [];
      for (let i = 0; i < count; i++) {
        faqs.push({
          question: faqQuestionRefs.current.get(i) || "",
          answer: faqAnswerRefs.current.get(i) || {
            type: "doc",
            content: [],
          },
        });
      }
      setValue("faqs", faqs);
    },
    [setValue],
  );

  const handleAddFAQ = useCallback(() => {
    const newIndex = faqCount;
    faqQuestionRefs.current.set(newIndex, "");
    faqAnswerRefs.current.set(newIndex, { type: "doc", content: [] });
    setFaqCount((prev) => prev + 1);
  }, [faqCount]);

  const handleRemoveFAQ = useCallback(
    (index: number) => {
      if (faqCount <= 1) return;

      faqQuestionRefs.current.delete(index);
      faqAnswerRefs.current.delete(index);

      const newQuestionRefs = new Map<number, string>();
      const newAnswerRefs = new Map<number, JSONContentType>();
      let newIndex = 0;

      for (let i = 0; i < faqCount; i++) {
        if (i !== index) {
          const question = faqQuestionRefs.current.get(i);
          const answer = faqAnswerRefs.current.get(i);
          if (question !== undefined) newQuestionRefs.set(newIndex, question);
          if (answer !== undefined) newAnswerRefs.set(newIndex, answer);
          newIndex++;
        }
      }

      faqQuestionRefs.current = newQuestionRefs;
      faqAnswerRefs.current = newAnswerRefs;
      const nextCount = faqCount - 1;
      setFaqCount(nextCount);
      syncFaqsToForm(nextCount);
    },
    [faqCount, syncFaqsToForm],
  );

  const handleQuestionChange = useCallback((index: number, value: string) => {
    faqQuestionRefs.current.set(index, value);
  }, []);

  const handleAnswerChange = useCallback(
    (index: number, content: JSONContentType) => {
      faqAnswerRefs.current.set(index, content);
    },
    [],
  );

  useEffect(() => {
    registry.register("faq-section", {
      commit: () => syncFaqsToForm(faqCount),
    });
    return () => registry.unregister("faq-section");
  }, [registry, syncFaqsToForm, faqCount]);

  return (
    <FormSection title="Frequently Asked Questions">
      <div className="space-y-4">
        <div className="flex items-center gap-1 -mt-2 mb-1">
          <span className="text-xs text-500">At least one FAQ is required</span>
          <span className="text-red-400 text-xs">*</span>
        </div>
        {Array.from({ length: faqCount }, (_, index) => (
          <FAQItem
            key={index}
            index={index}
            questionRef={faqQuestionRefs}
            answerRef={faqAnswerRefs}
            onQuestionChange={handleQuestionChange}
            onAnswerChange={handleAnswerChange}
            onRemove={handleRemoveFAQ}
            canRemove={faqCount > 1}
          />
        ))}
        <Button type="button" variant="outline" onClick={handleAddFAQ}>
          <Plus
            className="size-4.5 shrink-0 text-primary-accent"
            strokeWidth={2.5}
          />
          <span className="text-600 font-semibold!">Add FAQs</span>
        </Button>
        <FieldError error={faqsError} />
      </div>
    </FormSection>
  );
};
