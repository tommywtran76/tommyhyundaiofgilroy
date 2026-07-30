import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy — Aileen’s Beauty" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 30, 2026">
      <p>
        Aileen’s Beauty (“we,” “us”) respects your privacy. This policy explains what information we
        collect through our guest check-in system, how we use it, and the choices you have.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Contact details: name, mobile phone number, email address, and optionally your birthday and preferred language.</li>
        <li>Visit details: the services you are interested in, appointment information, and how you heard about us.</li>
        <li>Service-safety information you choose to share, such as allergies, sensitivities, medications, or prior treatments.</li>
        <li>Optional photos you upload (for example, a photo of an existing brow tattoo).</li>
        <li>Your signature confirming your check-in, and your marketing consent choices with the date, time, and exact wording shown.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To manage your visit, appointments, and consultations.</li>
        <li>To contact you about services you asked about.</li>
        <li>To send marketing messages <strong>only if you separately opted in</strong>. Marketing consent is optional and never required to check in or receive services.</li>
        <li>To understand our business (for example, which services are most requested).</li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell your personal information.</li>
        <li>We do not share health-related notes, photos, or signatures with marketing platforms.</li>
        <li>We do not provide medical advice. Our check-in system is not a medical diagnostic system; safety questions exist only so we can provide services safely.</li>
      </ul>

      <h2>Storage and security</h2>
      <p>
        Your information is stored in a secured database, transmitted over encrypted connections, and
        accessible only to authorized staff through password-protected, role-restricted accounts.
        Kiosk screens clear automatically after each check-in and after periods of inactivity.
      </p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>Update your information at any time — tell our front desk or call/text 650-305-8036.</li>
        <li>Withdraw marketing consent at any time: reply STOP to any text, use the unsubscribe link in any email, or simply tell us.</li>
        <li>Request a copy of the information we hold about you.</li>
        <li>Request deletion of your information. We will remove your profile, visit history, photos, and signatures, keeping only records we are legally required to retain.</li>
      </ul>
      <p>
        California residents: the rights above are how we honor requests to know, correct, and delete
        under the California Consumer Privacy Act (CCPA/CPRA).
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests: call or text 650-305-8036, or visit us in Campbell / San Jose,
        California.
      </p>
    </LegalPage>
  );
}
