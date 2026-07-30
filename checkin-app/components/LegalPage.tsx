import Link from "next/link";

// Shared shell for the privacy / terms / SMS-terms pages, matching the kiosk's
// look. Content is intentionally plain HTML for screen-reader friendliness.
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-ivory px-6 py-12">
      <article className="mx-auto max-w-2xl">
        <p className="uppercase tracking-[0.3em] text-gold text-xs mb-4">Aileen’s Beauty</p>
        <h1 className="font-serif text-4xl text-charcoal">{title}</h1>
        <p className="text-sm text-charcoal-soft mt-2 mb-8">Last updated: {updated}</p>
        <div className="prose-sm text-charcoal leading-relaxed space-y-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
          {children}
        </div>
        <footer className="mt-12 pt-6 border-t border-blush text-sm text-charcoal-soft">
          <p>
            Aileen’s Beauty · Campbell / San Jose, California ·{" "}
            <a href="tel:+16503058036" className="text-gold-deep underline">650-305-8036</a> ·{" "}
            <a href="https://www.aileennbeauty.com" className="text-gold-deep underline">
              www.aileennbeauty.com
            </a>
          </p>
          <p className="mt-3 space-x-4">
            <Link href="/privacy" className="underline">Privacy Policy</Link>
            <Link href="/terms" className="underline">Terms &amp; Conditions</Link>
            <Link href="/sms-terms" className="underline">SMS Terms</Link>
            <Link href="/kiosk" className="underline">Back to Check-In</Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
