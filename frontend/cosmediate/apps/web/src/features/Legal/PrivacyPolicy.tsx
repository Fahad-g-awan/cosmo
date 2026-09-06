import React from "react";

import { Accordion, SiteContainer } from "@cosmediate/ui";

import { AccordionItemContent } from "./components/AccordionItemContent";
import SubHeader, { SubHeaderTitle } from "@web/layout/SubHeader";
import { SectionTitle } from "./components/SectionTitle";
import { policyData } from "./content/policyContent";
import { SectionItem } from "./types";

const PrivacyPolicy = () => {
  return (
    <div className="w-full">
      <SubHeader className="gap-2">
        <SubHeaderTitle>Privacy Policy</SubHeaderTitle>
        <div className="w-full text-left text-600 text-xs">
          Last Updated: June 25, 2025
        </div>
        <div className="w-full text-left text-700 text-sm mt-2">
          This Privacy Policy describes how cosmediate (&quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;) collects, uses, and discloses your
          information when you use our service.
        </div>
      </SubHeader>

      <SiteContainer className="w-full lg:w-[1024px] gap-10 my-10">
        {/* Introduction */}
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <SectionTitle title="Your Privacy Matters" />

          <p className="text-sm text-700">
            At cosmediate, we value your privacy and are committed to protecting
            your personal data. This Privacy Policy is designed to help you
            understand what information we collect, why we collect it, and how
            you can update, manage, and delete your information.
          </p>
          <p className="text-sm text-700">
            By using our services, you agree to the collection and use of
            information in accordance with this policy. We will not use or share
            your information with anyone except as described in this Privacy
            Policy.
          </p>
        </div>

        {/* Main Content */}
        <div className="w-full bg-ghost-blue rounded-2xl p-5 flex flex-col items-start justify-start gap-2">
          <SectionTitle title="Privacy Policy Details" />

          <p className="text-muted-foreground mb-6">
            Expand each section to learn more about how we handle your data.
          </p>

          <Accordion
            type="single"
            collapsible
            defaultValue={policyData[0]?.id || ""}
            className="w-full flex flex-col items-start justify-start gap-2"
          >
            {policyData.map((section: SectionItem) => (
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
          <SectionTitle title="Your Privacy Choices" />

          <p className="text-sm text-700">
            By using cosmediate services, you consent to our privacy practices
            as described in this Privacy Policy. You can withdraw your consent
            at any time by discontinuing use of our services and closing your
            account.
          </p>
          <p className="text-sm text-700">
            If you have any concerns about how we handle your data, please
            don&apos;t hesitate to contact us. Your trust is our top priority.
          </p>
        </div>
      </SiteContainer>
    </div>
  );
};

export default PrivacyPolicy;
