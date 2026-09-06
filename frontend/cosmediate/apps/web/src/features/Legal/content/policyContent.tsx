import { SectionItem } from "../types";

export const policyData: SectionItem[] = [
  {
    id: "information-collected",
    title: "Information We Collect",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <p>
          When you create an account, we may ask for personal information such
          as:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Name</li>
          <li>Email address</li>
          <li>Contact information</li>
          <li>Profile information</li>
        </ul>

        <h3 className="text-lg font-medium mt-4">Usage Information</h3>
        <p>We also collect information about how you use our service:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Log data (IP address, browser type, pages visited)</li>
          <li>Device information</li>
          <li>Usage patterns and preferences</li>
        </ul>

        <h3 className="text-lg font-medium mt-4">
          Cookies and Tracking Technologies
        </h3>
        <p>
          We use cookies and similar tracking technologies to track activity on
          our service and hold certain information. Cookies are files with small
          amounts of data that may include an anonymous unique identifier.
        </p>
        <p>
          You can instruct your browser to refuse all cookies or to indicate
          when a cookie is being sent. However, if you do not accept cookies,
          you may not be able to use some portions of our service.
        </p>
      </div>
    ),
  },
  {
    id: "information-use",
    title: "How We Use Your Information",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          We use the information we collect for various purposes, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Provide and maintain our service</strong> - To deliver the
            features you request, improve our offerings, and communicate with
            you.
          </li>
          <li>
            <strong>Personalization</strong> - To customize our service to
            better suit your preferences and interests.
          </li>
          <li>
            <strong>Account management</strong> - To manage your registration
            and provide you with customer support.
          </li>
          <li>
            <strong>Analytics</strong> - To understand how our users interact
            with our service and improve our offerings.
          </li>
          <li>
            <strong>Communications</strong> - To contact you about updates,
            security alerts, administrative messages, and other information
            related to the service.
          </li>
          <li>
            <strong>Legal compliance</strong> - To comply with legal obligations
            and enforce our Terms and Conditions.
          </li>
        </ul>
        <p className="mt-3">
          We will never use your personal information for purposes other than
          those described in this Privacy Policy without providing you with
          notice and, where required, obtaining your consent.
        </p>
      </div>
    ),
  },
  {
    id: "information-sharing",
    title: "How We Share Your Information",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          We may share your personal information in the following situations:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>With service providers</strong> - We may share your
            information with third-party vendors and service providers that
            perform services for us or on our behalf.
          </li>
          <li>
            <strong>For business transfers</strong> - We may share or transfer
            your information in connection with, or during negotiations of, any
            merger, sale of company assets, financing, or acquisition of all or
            a portion of our business to another company.
          </li>
          <li>
            <strong>With your consent</strong> - We may disclose your personal
            information for any other purpose with your consent.
          </li>
          <li>
            <strong>To comply with legal obligations</strong> - We may disclose
            your information where required to do so by law or in response to
            valid requests by public authorities.
          </li>
        </ul>
        <p className="mt-3">
          We do not sell or rent your personal information to third parties for
          their marketing purposes without your explicit consent.
        </p>
      </div>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          The security of your data is important to us, but remember that no
          method of transmission over the Internet or method of electronic
          storage is 100% secure.
        </p>
        <p>
          We strive to use commercially acceptable means to protect your
          personal information, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Using encryption to maintain the confidentiality of data</li>
          <li>
            Implementing industry-standard security practices and procedures
          </li>
          <li>Regular security assessments and audits</li>
          <li>
            Restricting access to personal information to employees on a
            need-to-know basis
          </li>
        </ul>
        <p className="mt-3">
          While we implement safeguards designed to protect your information, no
          security system is impenetrable and due to the inherent nature of the
          Internet, we cannot guarantee that information, during transmission
          through the Internet or while stored on our systems, is absolutely
          safe from intrusion by others.
        </p>
      </div>
    ),
  },
  {
    id: "data-rights",
    title: "Your Data Protection Rights",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          Depending on your location, you may have certain rights regarding your
          personal information, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Right to access</strong> - You have the right to request
            copies of your personal information that we hold.
          </li>
          <li>
            <strong>Right to rectification</strong> - You have the right to
            request that we correct any information you believe is inaccurate or
            complete any information you believe is incomplete.
          </li>
          <li>
            <strong>Right to erasure</strong> - You have the right to request
            that we erase your personal information, under certain conditions.
          </li>
          <li>
            <strong>Right to restrict processing</strong> - You have the right
            to request that we restrict the processing of your personal
            information, under certain conditions.
          </li>
          <li>
            <strong>Right to object to processing</strong> - You have the right
            to object to our processing of your personal information, under
            certain conditions.
          </li>
          <li>
            <strong>Right to data portability</strong> - You have the right to
            request that we transfer the data we have collected to another
            organization, or directly to you, under certain conditions.
          </li>
        </ul>
        <p className="mt-3">
          If you wish to exercise any of these rights, please contact us using
          the contact information provided below. We may need to verify your
          identity before responding to your request.
        </p>
      </div>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          Our service is not directed to anyone under the age of 13. We do not
          knowingly collect personally identifiable information from children
          under 13. If you are a parent or guardian and you are aware that your
          child has provided us with personal information, please contact us
          immediately.
        </p>
        <p>
          If we discover that we have collected personal information from a
          child under 13 without parental consent, we will take steps to remove
          that information from our servers as quickly as possible.
        </p>
      </div>
    ),
  },
  {
    id: "cookies-policy",
    title: "Cookies Policy",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          Cookies are small pieces of text sent to your web browser by a website
          you visit. A cookie file is stored in your web browser and allows the
          service or a third party to recognize you and make your next visit
          easier.
        </p>
        <p>We use the following types of cookies:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Essential cookies</strong> - These cookies are required for
            the operation of our website and enable you to use its features.
          </li>
          <li>
            <strong>Preference cookies</strong> - These cookies allow us to
            remember choices you make and provide enhanced, more personal
            features.
          </li>
          <li>
            <strong>Analytics cookies</strong> - These cookies help us analyze
            how users interact with our website, which helps us improve the way
            our website works.
          </li>
        </ul>
        <p className="mt-3">
          You can control and/or delete cookies as you wish. You can delete all
          cookies that are already on your computer and you can set most
          browsers to prevent them from being placed. If you do this, however,
          you may have to manually adjust some preferences every time you visit
          our website.
        </p>
      </div>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          Our service may contain links to other websites that are not operated
          by us. If you click on a third-party link, you will be directed to
          that third party&apos;s site.
        </p>
        <p>
          We strongly advise you to review the Privacy Policy of every site you
          visit. We have no control over and assume no responsibility for the
          content, privacy policies, or practices of any third-party sites or
          services.
        </p>
      </div>
    ),
  },
  {
    id: "international-transfers",
    title: "International Transfers",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          Your information may be transferred to — and maintained on — computers
          located outside of your state, province, country, or other
          governmental jurisdiction where the data protection laws may differ
          from those of your jurisdiction.
        </p>
        <p>
          If you are located outside the country where our servers are located
          and choose to provide information to us, please note that we transfer
          the information, including personal information, to that country and
          process it there.
        </p>
        <p>
          Your consent to this Privacy Policy followed by your submission of
          such information represents your agreement to that transfer.
        </p>
      </div>
    ),
  },
  {
    id: "policy-changes",
    title: "Changes to This Privacy Policy",
    content: (
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and,
          where appropriate, sending you a notification.
        </p>
        <p>
          You are advised to review this Privacy Policy periodically for any
          changes. Changes to this Privacy Policy are effective when they are
          posted on this page.
        </p>
        <p>
          Your continued use of our service after we post any modifications to
          the Privacy Policy will constitute your acknowledgment of the
          modifications and your consent to abide and be bound by the modified
          Privacy Policy.
        </p>
      </div>
    ),
  },
];
