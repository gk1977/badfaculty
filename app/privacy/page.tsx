import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Cookies — BadFaculty.com",
  description:
    "How BadFaculty.com uses cookies and privacy analytics, and how to control them.",
};

export default function PrivacyPage() {
  return (
    <>
      <style>{`
  .bf-legal {
    max-width: 760px;
    margin: 0 auto;
    padding: 48px 24px 96px;
    color: #1f2430;
    line-height: 1.6;
    font-size: 16px;
  }
  .bf-legal a { color: #b3151b; }
  .bf-legal-back {
    display: inline-block;
    margin-bottom: 28px;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .bf-legal h1 {
    font-size: 30px;
    margin: 0 0 8px;
    line-height: 1.15;
  }
  .bf-legal-updated {
    color: #6b7280;
    font-size: 13px;
    margin: 0 0 32px;
  }
  .bf-legal h2 {
    font-size: 18px;
    margin: 32px 0 10px;
    border-left: 3px solid #b3151b;
    padding-left: 10px;
  }
  .bf-legal p { margin: 0 0 14px; }
  .bf-legal ul { margin: 0 0 14px; padding-left: 22px; }
  .bf-legal li { margin: 0 0 6px; }
      `}</style>
      <main className="bf-legal">
        <Link href="/" className="bf-legal-back">
          ← Back to the record
        </Link>
        <h1>Privacy &amp; Cookie Notice</h1>
        <p className="bf-legal-updated">Last updated: July 10, 2026</p>

        <p>
          BadFaculty.com is a searchable directory of resolved, publicly
          documented K-12 educator misconduct cases. This notice explains what
          limited data the site collects and how you can control it.
        </p>

        <h2>What we collect</h2>
        <p>
          We do not ask you to create an account, and we do not request personal
          information to use the site. We use one analytics tool, Microsoft
          Clarity, to understand how visitors navigate the pages so we can improve
          them.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          Microsoft Clarity may set cookies and collect anonymized usage data such
          as pages viewed, clicks, scrolling, and general device and browser type.
          Clarity is a product of Microsoft; its handling of data is governed by
          Microsoft&apos;s own privacy terms. We do not sell this data.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>
            Analytics is on by default. You can decline at any time using the
            cookie notice or the &ldquo;Cookie settings&rdquo; control at the
            bottom of the page.
          </li>
          <li>
            When you decline, we instruct Clarity to stop tracking and remember
            your choice on this device.
          </li>
          <li>
            Most browsers also let you block or delete cookies in their settings.
          </li>
        </ul>

        <h2>About the records</h2>
        <p>
          Records shown here are drawn from public sources such as news reports,
          court records, and licensing actions, and each entry should link back to
          its source. The directory is limited to resolved outcomes.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this notice or a specific record can be directed to the
          site operator.
        </p>
      </main>
    </>
  );
}
