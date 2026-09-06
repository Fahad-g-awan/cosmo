"use client";

import React, { useMemo } from "react";

import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { useTranslations } from "@cosmediate/i18n/client";
import { Specialist } from "@cosmediate/type-utils";
import { NoDataFound } from "@cosmediate/ui";

import TabsContainer from "@web/components/profile/TabsContainer";

const AboutTab = ({ specialist }: { specialist: Specialist }) => {
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const tags = useMemo(() => specialist?.tags || [], [specialist]);

  if (!specialist?.overview && !specialist?.htmlAbout) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <NoDataFound
          message={profile.empty.specialist}
          description={common.pleaseTryAgainLater}
        />
      </div>
    );
  }

  return (
    <TabsContainer>
      {specialist?.overview && <Overview overview={specialist?.overview} />}
      {specialist?.htmlAbout && (
        <HtmlViewer html={tiptapJsonToHtml(specialist.htmlAbout)} />
      )}
      {tags && tags?.length > 0 && <Tags tags={tags} />}
    </TabsContainer>
  );
};

const Overview = ({ overview }: { overview: string }) => {
  return (
    <div className="w-full flex items-start justify-start text-400 text-sm">
      {overview}
    </div>
  );
};

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="w-full inline-flex flex-wrap items-start justify-start gap-2 text-400 text-xs">
      {tags?.map((tag: string) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  );
};

export default AboutTab;
