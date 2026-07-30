import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions — Aileen’s Beauty" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="July 30, 2026">
      <p>
        These terms apply to your use of the Aileen’s Beauty guest check-in system and our services.
        By checking in, you agree to them.
      </p>

      <h2>Check-in</h2>
      <ul>
        <li>Checking in records your arrival and interest in services. It does not guarantee service availability, pricing, or a specific appointment time.</li>
        <li>You confirm that the information you provide is accurate to the best of your knowledge.</li>
        <li>Checking in does not replace any service-specific consent or intake form that a treatment may require.</li>
      </ul>

      <h2>Services</h2>
      <ul>
        <li>All services are provided by appointment or availability. Some services have specific eligibility requirements — for example, our body scrub service is available for women only.</li>
        <li>Safety questions in the check-in flow exist so we can provide services safely. They are not medical advice, and our staff are not providing medical diagnoses. Consult your physician for medical concerns.</li>
        <li>Results vary by individual. Photos and descriptions of services are illustrative.</li>
      </ul>

      <h2>Communications</h2>
      <p>
        We may contact you about your visit or services you asked about. Promotional texts and emails
        are sent only with your separate, optional consent — see our{" "}
        <a href="/sms-terms" className="text-gold-deep underline">SMS Terms</a> and{" "}
        <a href="/privacy" className="text-gold-deep underline">Privacy Policy</a>.
      </p>

      <h2>Gift cards</h2>
      <p>
        Gift cards are redeemable for services at Aileen’s Beauty and are not redeemable for cash
        except where required by law.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, Aileen’s Beauty is not liable for indirect or
        consequential damages arising from use of the check-in system. Nothing in these terms limits
        rights you have under applicable law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The “last updated” date above reflects the
        current version.
      </p>
    </LegalPage>
  );
}
