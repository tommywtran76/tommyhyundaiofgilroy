import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "SMS Terms — Aileen’s Beauty" };

export default function SmsTermsPage() {
  return (
    <LegalPage title="SMS Terms" updated="July 30, 2026">
      <p>
        These terms govern text messages from Aileen’s Beauty (Campbell / San Jose, California) sent
        from or on behalf of 650-305-8036.
      </p>

      <h2>Program description</h2>
      <p>
        If you opt in at check-in, we may send you appointment reminders, follow-up messages about
        services you asked about, and occasional promotional messages.
      </p>

      <h2>Consent</h2>
      <ul>
        <li>Marketing texts are sent only if you checked the optional SMS consent box at check-in (or otherwise gave us clear permission).</li>
        <li>Consent is not a condition of purchasing any service.</li>
        <li>We record the date, time, and exact wording of your consent.</li>
      </ul>

      <h2>Frequency, rates, and opt-out</h2>
      <ul>
        <li>Message frequency varies.</li>
        <li>Message and data rates may apply, depending on your mobile plan.</li>
        <li>Reply <strong>STOP</strong> at any time to unsubscribe. You will receive one final confirmation message.</li>
        <li>Reply <strong>HELP</strong> for help, or call/text 650-305-8036.</li>
        <li>Replying STOP stops marketing messages; we may still send non-marketing messages you request, such as responses to your questions.</li>
      </ul>

      <h2>Carriers</h2>
      <p>Carriers are not liable for delayed or undelivered messages.</p>

      <h2>Privacy</h2>
      <p>
        Your phone number is used as described in our{" "}
        <a href="/privacy" className="text-gold-deep underline">Privacy Policy</a>. We do not sell
        your number or share it with third parties for their own marketing.
      </p>
    </LegalPage>
  );
}
