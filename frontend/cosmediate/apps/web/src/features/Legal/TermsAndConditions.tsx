import React from "react";

import { Accordion, SiteContainer } from "@cosmediate/ui";

import { AccordionItemContent } from "./components/AccordionItemContent";
import SubHeader, { SubHeaderTitle } from "@web/layout/SubHeader";
import { SectionTitle } from "./components/SectionTitle";
import { termsData } from "./content/termsContent";
import { SectionItem } from "./types";

const TermsAndConditions = () => {
  return (
    <div className="w-full">
      <SubHeader className="gap-2">
        <SubHeaderTitle>Terms and Conditions</SubHeaderTitle>
        <div className="w-full text-left text-600 text-xs">
          Last Updated: June 25, 2025
        </div>
        <div className="w-full text-left text-700 text-sm mt-2">
          Please read these terms and conditions carefully before using our
          services. By accessing or using cosmediate, you agree to be bound by
          these terms.
        </div>
      </SubHeader>

      <SiteContainer className="w-full lg:w-[1024px] gap-10 my-10">
        {/* Introduction Card */}
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <SectionTitle title="Welcome to cosmediate" />

          <p className="text-sm text-700">
            These Terms and Conditions constitute a legally binding agreement
            made between you, whether personally or on behalf of an entity
            (&quot;you&quot;) and cosmediate (&quot;we&quot;, &quot;us&quot; or
            &quot;our&quot;), concerning your access to and use of our website
            and services.
          </p>
          <p className="text-sm text-700">
            By using our services, you agree that you have read, understood, and
            agree to be bound by all of these Terms and Conditions. If you do
            not agree with all of these terms, you are prohibited from using our
            services and should discontinue use immediately.
          </p>
        </div>

        {/* Main Content */}
        <div className="w-full bg-ghost-blue rounded-2xl p-5 flex flex-col items-start justify-start gap-2">
          <SectionTitle title="Detailed Terms" />

          <p className="text-muted-foreground mb-6">
            Expand each section to learn more about our specific policies and
            guidelines.
          </p>

          <Accordion
            type="single"
            collapsible
            defaultValue={termsData[0]?.id || ""}
            className="w-full flex flex-col items-start justify-start gap-2"
          >
            {termsData.map((section: SectionItem) => (
              <AccordionItemContent
                key={section.id}
                id={section.id}
                title={section.title}
                content={section.content}
              />
            ))}
          </Accordion>
        </div>

        {/* Agreement Section */}
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <SectionTitle title="Your Agreement" />

          <p className="text-sm text-700">
            By continuing to use the cosmediate service, you acknowledge that
            you have read, understood, and agree to be bound by these Terms and
            Conditions.
          </p>
          <p className="text-sm text-700">
            If you do not agree to these terms, please discontinue use of our
            services immediately.
          </p>
        </div>
      </SiteContainer>
    </div>
  );
};

export default TermsAndConditions;
