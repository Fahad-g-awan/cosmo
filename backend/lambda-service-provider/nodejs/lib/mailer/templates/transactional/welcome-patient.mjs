import { ctaSignIn, transactionalEmail } from "./_transactional-utils.mjs";

/**
 * @param {{
 *   variant?: "self" | "staff_created",
 *   patientName?: string,
 *   patientEmail?: string,
 *   inviterRole?: string,
 *   inviterName?: string,
 *   clinicName?: string,
 *   specialistName?: string,
 *   signInUrl?: string,
 * }} data
 */
export const welcomePatientEmail = (data) => {
  const name = data.patientName || data.patientEmail || "there";
  const signInUrl = data.signInUrl ?? "";

  if (data.variant === "staff_created") {
    const inviter = data.inviterName || "Your care team";
    const clinicLine = data.clinicName
      ? `<p style="margin:0 0 12px;">You have been added at <strong>${data.clinicName}</strong> on Cosmediate.</p>`
      : "";
    const specialistLine =
      data.inviterRole === "SPECIALIST" && data.specialistName
        ? `<p style="margin:0 0 12px;"><strong>${data.specialistName}</strong> invited you to join their patient list.</p>`
        : `<p style="margin:0 0 12px;"><strong>${inviter}</strong> created your patient account on Cosmediate.</p>`;

    const body = `
      <p style="margin:0 0 16px;">Hi ${name}, welcome to Cosmediate.</p>
      ${specialistLine}
      ${clinicLine}
      <p style="margin:0 0 16px;">Sign in to view appointments, leave reviews, and manage your care journey. Your sign-in details were sent in a separate email.</p>
      ${signInUrl ? ctaSignIn({ href: signInUrl }) : ""}
    `;

    return transactionalEmail({
      title: "Welcome to Cosmediate",
      subject: "Welcome to Cosmediate",
      previewText: "Your Cosmediate patient account is ready.",
      body,
    });
  }

  const body = `
    <p style="margin:0 0 16px;">Hi ${name}, welcome to Cosmediate.</p>
    <p style="margin:0 0 16px;">Discover trusted clinics and specialists, book care, and share reviews — all in one place.</p>
    <p style="margin:0 0 16px;">Sign in anytime to manage your profile and stay connected with your care providers.</p>
    ${signInUrl ? ctaSignIn({ href: signInUrl }) : ""}
  `;

  return transactionalEmail({
    title: "Welcome to Cosmediate",
    subject: "Welcome to Cosmediate",
    previewText: "Your Cosmediate account is ready.",
    body,
  });
};
