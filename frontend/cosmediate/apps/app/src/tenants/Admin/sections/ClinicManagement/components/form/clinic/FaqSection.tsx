import React, { useState, useCallback, useRef, useEffect } from "react";

import {
  useFormError,
  useFormSetValue,
  useCommitRegistry,
} from "@cosmediate/form-core";
import type { JSONContentType, FAQs } from "@cosmediate/type-utils/shared";
import HtmlEditor from "@cosmediate/ui/modules/HtmlRichText/HtmlEditor";
import { Button, Label, Input } from "@cosmediate/ui";
import { FieldError } from "@cosmediate/form-ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { validateFaqs } from "../../../lib/clinic-section-validation";

import { ChevronDown, Plus, X } from "lucide-react";

const MemoHtmlEditor = React.memo(HtmlEditor);

interface FAQSectionProps {
  initialFaqs?: FAQs[];
}

function buildFaqsFromRefs(
  faqCount: number,
  questions: Map<number, string>,
  answers: Map<number, JSONContentType>,
): FAQs[] {
  const faqs: FAQs[] = [];
  for (let i = 0; i < faqCount; i++) {
    const question = questions.get(i) || "";
    const answer = answers.get(i) || { type: "doc", content: [] };
    const hasAnswer = Array.isArray(answer.content) && answer.content.length > 0;
    if (!question.trim() && !hasAnswer) continue;
    faqs.push({ question, answer });
  }
  return faqs;
}

export const FAQSection = ({ initialFaqs }: FAQSectionProps) => {
  const [faqCount, setFaqCount] = useState(initialFaqs?.length || 0);
  const [expanded, setExpanded] = useState(true);
  const faqQuestionRefs = useRef<Map<number, string>>(new Map());
  const faqAnswerRefs = useRef<Map<number, JSONContentType>>(new Map());
  const registry = useCommitRegistry();
  const setValue = useFormSetValue();
  const faqsRootError = useFormError("faqs");

  const syncFaqsToForm = useCallback(
    (count: number) => {
      setValue(
        "faqs",
        buildFaqsFromRefs(
          count,
          faqQuestionRefs.current,
          faqAnswerRefs.current,
        ),
      );
    },
    [setValue],
  );

  useEffect(() => {
    if (initialFaqs && initialFaqs.length > 0) {
      initialFaqs.forEach((faq, index) => {
        if (!faqQuestionRefs.current.has(index)) {
          faqQuestionRefs.current.set(index, faq.question || "");
        }
        if (!faqAnswerRefs.current.has(index)) {
          faqAnswerRefs.current.set(
            index,
            faq.answer || { type: "doc", content: [] },
          );
        }
      });
      setFaqCount(initialFaqs.length);
    }
  }, [initialFaqs]);

  const handleAddFAQ = useCallback(() => {
    const newIndex = faqCount;
    faqQuestionRefs.current.set(newIndex, "");
    faqAnswerRefs.current.set(newIndex, { type: "doc", content: [] });
    const nextCount = faqCount + 1;
    setFaqCount(nextCount);
    setExpanded(true);
    // Empty row still changes structure vs initial — mark dirty via a placeholder row
    // so Update enables immediately; empty rows are filtered out on commit/submit.
    setValue("faqs", [
      ...buildFaqsFromRefs(
        faqCount,
        faqQuestionRefs.current,
        faqAnswerRefs.current,
      ),
      { question: "", answer: { type: "doc", content: [] } },
    ]);
  }, [faqCount, setValue]);

  const handleRemoveFAQ = useCallback(
    (index: number) => {
      const newQuestionRefs = new Map<number, string>();
      const newAnswerRefs = new Map<number, JSONContentType>();
      let newIndex = 0;

      for (let i = 0; i < faqCount; i++) {
        if (i === index) continue;
        const question = faqQuestionRefs.current.get(i);
        const answer = faqAnswerRefs.current.get(i);
        if (question !== undefined) newQuestionRefs.set(newIndex, question);
        if (answer !== undefined) newAnswerRefs.set(newIndex, answer);
        newIndex++;
      }

      faqQuestionRefs.current = newQuestionRefs;
      faqAnswerRefs.current = newAnswerRefs;
      const nextCount = Math.max(0, faqCount - 1);
      setFaqCount(nextCount);
      syncFaqsToForm(nextCount);
    },
    [faqCount, syncFaqsToForm],
  );

  const handleQuestionChange = useCallback(
    (index: number, value: string) => {
      faqQuestionRefs.current.set(index, value);
      syncFaqsToForm(faqCount);
    },
    [faqCount, syncFaqsToForm],
  );

  const handleAnswerChange = useCallback(
    (index: number, content: JSONContentType) => {
      faqAnswerRefs.current.set(index, content);
      syncFaqsToForm(faqCount);
    },
    [faqCount, syncFaqsToForm],
  );

  useEffect(() => {
    registry.register("faq-section", {
      commit: () => {
        if (faqCount === 0) {
          setValue("faqs", []);
          return true;
        }

        const faqs = buildFaqsFromRefs(
          faqCount,
          faqQuestionRefs.current,
          faqAnswerRefs.current,
        );

        const errors = validateFaqs(faqs);
        setValue("faqs", faqs);

        return errors.length === 0;
      },
    });
    return () => registry.unregister("faq-section");
  }, [registry, setValue, faqCount]);

  const showCollapse = faqCount > 1;

  return (
    <div className="w-full space-y-4">
      <button
        type="button"
        className={cn(
          "w-full pb-2 border-b flex items-center justify-between gap-3 text-left",
          showCollapse && "cursor-pointer",
        )}
        onClick={() => {
          if (showCollapse) setExpanded((prev) => !prev);
        }}
        disabled={!showCollapse}
        aria-expanded={expanded}
      >
        <div className="text-sm font-semibold text-gray-700">
          Frequently Asked Questions
        </div>
        {showCollapse && (
          <ChevronDown
            className={cn(
              "size-4 text-500 shrink-0 transition-transform duration-200",
              expanded ? "rotate-0" : "-rotate-90",
            )}
          />
        )}
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          expanded || !showCollapse ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4">
            {faqCount > 0 &&
              Array.from({ length: faqCount }, (_, index) => (
                <FaqRow
                  key={index}
                  index={index}
                  canRemove={faqCount > 0}
                  defaultQuestion={faqQuestionRefs.current.get(index) || ""}
                  answerContent={faqAnswerRefs.current.get(index)}
                  onQuestionChange={handleQuestionChange}
                  onAnswerChange={handleAnswerChange}
                  onRemove={handleRemoveFAQ}
                />
              ))}

            {faqCount === 0 && (
              <p className="text-xs text-500">
                No FAQs yet. Click add to create the first one.
              </p>
            )}

            <FieldError error={faqsRootError} />

            <Button type="button" variant="outline" onClick={handleAddFAQ}>
              <Plus
                className="size-4.5 shrink-0 text-primary-accent"
                strokeWidth={2.5}
              />
              <span className="text-600 font-semibold!">Add FAQ</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function FaqRow({
  index,
  canRemove,
  defaultQuestion,
  answerContent,
  onQuestionChange,
  onAnswerChange,
  onRemove,
}: {
  index: number;
  canRemove: boolean;
  defaultQuestion: string;
  answerContent?: JSONContentType;
  onQuestionChange: (index: number, value: string) => void;
  onAnswerChange: (index: number, content: JSONContentType) => void;
  onRemove: (index: number) => void;
}) {
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
        <Label className="text-sm">Question</Label>
        <Input
          defaultValue={defaultQuestion}
          onChange={(e) => onQuestionChange(index, e.target.value)}
          placeholder="Enter question"
          className={cn("bg-white", questionError ? "border-red-500" : "")}
        />
        <FieldError error={questionError} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm">Answer (Rich Text)</Label>
        <MemoHtmlEditor
          content={answerContent}
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
