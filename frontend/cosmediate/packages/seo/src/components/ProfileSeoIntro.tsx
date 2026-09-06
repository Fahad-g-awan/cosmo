import type { Clinic, Specialist, Treatment } from "@cosmediate/type-utils";

import type { SeoMessages } from "@cosmediate/i18n";
import { jsonContentToPlainText } from "../jsonld/content";

type ProfileSeoIntroProps = {
  messages: SeoMessages;
} & (
  | { type: "clinic"; entity: Clinic }
  | { type: "specialist"; entity: Specialist }
  | { type: "treatment"; entity: Treatment }
);

function truncate(text: string, max = 320): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

function FaqSummary({
  entity,
}: {
  entity: { faqs?: { question: string; answer: unknown }[] };
}) {
  const faqs = entity.faqs?.slice(0, 3) ?? [];
  if (!faqs.length) {
    return null;
  }

  return (
    <dl>
      {faqs.map((faq) => (
        <div key={faq.question}>
          <dt>{faq.question}</dt>
          <dd>{truncate(jsonContentToPlainText(faq.answer as never), 200)}</dd>
        </div>
      ))}
    </dl>
  );
}

function RelatedLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  if (!links.length) {
    return null;
  }

  return (
    <nav aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ProfileSeoIntro(props: ProfileSeoIntroProps) {
  const { messages } = props;

  if (props.type === "clinic") {
    const { entity } = props;
    const specialistLinks =
      entity.specialists
        ?.filter((specialist): specialist is NonNullable<typeof specialist> =>
          Boolean(specialist?.id),
        )
        .map((specialist) => ({
          href: `/specialists/${specialist.id}`,
          label:
            specialist.fullName ||
            specialist.name ||
            messages.profileSeo.specialistFallback,
        })) ?? [];
    const treatmentLinks =
      entity.treatments?.map((treatment) => ({
        href: `/treatments/${treatment.treatmentId}`,
        label: treatment.treatmentName,
      })) ?? [];

    return (
      <section aria-label={messages.profileSeo.clinicSummary(entity.name)}>
        <h1>{entity.name}</h1>
        {entity.completeAddress ? <p>{entity.completeAddress}</p> : null}
        {entity.overview ? <p>{truncate(entity.overview)}</p> : null}
        <FaqSummary entity={entity} />
        <RelatedLinks
          title={messages.profileSeo.specialistsAtClinic}
          links={specialistLinks}
        />
        <RelatedLinks
          title={messages.profileSeo.treatmentsAtClinic}
          links={treatmentLinks}
        />
        <nav aria-label={messages.nav.browseCosmediate}>
          <ul>
            <li>
              <a href="/home/clinics">{messages.nav.allClinics}</a>
            </li>
            <li>
              <a href="/home/specialists">{messages.nav.allSpecialists}</a>
            </li>
            <li>
              <a href="/home/treatments">{messages.nav.allTreatments}</a>
            </li>
          </ul>
        </nav>
      </section>
    );
  }

  if (props.type === "specialist") {
    const { entity } = props;
    const clinicLinks =
      entity.clinics?.map((clinic) => ({
        href: `/clinics/${clinic.id}`,
        label: clinic.name,
      })) ?? [];
    const treatmentLinks =
      entity.treatments?.map((treatment) => ({
        href: `/treatments/${treatment.treatmentId}`,
        label: treatment.treatmentName,
      })) ?? [];

    return (
      <section
        aria-label={messages.profileSeo.specialistSummary(entity.fullName)}
      >
        <h1>{entity.fullName}</h1>
        {entity.completeAddress ? <p>{entity.completeAddress}</p> : null}
        {entity.overview ? <p>{truncate(entity.overview)}</p> : null}
        <FaqSummary entity={entity} />
        <RelatedLinks
          title={messages.profileSeo.clinicsForSpecialist}
          links={clinicLinks}
        />
        <RelatedLinks
          title={messages.profileSeo.treatmentsBySpecialist}
          links={treatmentLinks}
        />
        <nav aria-label={messages.nav.browseCosmediate}>
          <ul>
            <li>
              <a href="/home/specialists">{messages.nav.allSpecialists}</a>
            </li>
            <li>
              <a href="/home/clinics">{messages.nav.allClinics}</a>
            </li>
            <li>
              <a href="/home/treatments">{messages.nav.allTreatments}</a>
            </li>
          </ul>
        </nav>
      </section>
    );
  }

  const { entity } = props;
  const clinicLinks =
    entity.clinics?.map((clinic) => ({
      href: `/clinics/${clinic.id}`,
      label: clinic.name,
    })) ?? [];
  const specialistLinks =
    entity.specialists?.map((specialist) => ({
      href: `/specialists/${specialist.id}`,
      label: specialist.fullName || specialist.name,
    })) ?? [];

  return (
    <section aria-label={messages.profileSeo.treatmentSummary(entity.name)}>
      <h1>{entity.name}</h1>
      {entity.overview ? <p>{truncate(entity.overview)}</p> : null}
      <FaqSummary entity={entity} />
      <RelatedLinks
        title={messages.profileSeo.clinicsOfferingTreatment}
        links={clinicLinks}
      />
      <RelatedLinks
        title={messages.profileSeo.specialistsOfferingTreatment}
        links={specialistLinks}
      />
      <nav aria-label={messages.nav.browseCosmediate}>
        <ul>
          <li>
            <a href="/home/treatments">{messages.nav.allTreatments}</a>
          </li>
          <li>
            <a href="/home/clinics">{messages.nav.allClinics}</a>
          </li>
          <li>
            <a href="/home/specialists">{messages.nav.allSpecialists}</a>
          </li>
        </ul>
      </nav>
    </section>
  );
}
